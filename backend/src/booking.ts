import "server-only";
import { db } from "./db";
import { site } from "./site";
import { getSlots, buildSlotLock } from "./slots";
import { fromDateKey } from "./time";
import type { ServiceType, Gender } from "./generated/prisma/enums";

/** Human-friendly booking reference: MS-7K3F9Q. Unambiguous alphabet only. */
export function generateRef(prefix = "MS"): string {
  const alphabet = "ACDEFGHJKLMNPQRTUVWXY3479"; // no 0/O, 1/I/L, S/5, B/8
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${out}`;
}

export class SlotUnavailableError extends Error {
  constructor(message = "That time slot has just been taken. Please choose another.") {
    super(message);
    this.name = "SlotUnavailableError";
  }
}

export type CreateHoldInput = {
  serviceType: ServiceType;
  doctorId: string;
  departmentId?: string | null;
  dateKey: string;
  startTime: string;
  patientName: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: Gender | null;
  notes?: string | null;
  addressLine?: string | null;
  area?: string | null;
  pincode?: string | null;
  landmark?: string | null;
  packageBookingId?: string | null;
  amountPaise: number;
};

/**
 * Reserve a slot.
 *
 * Creates the appointment in HOLD with a short expiry, so an abandoned
 * checkout cannot occupy a doctor's calendar indefinitely. The hold becomes
 * CONFIRMED only when the payment webhook says the money arrived.
 *
 * Concurrency: two patients can both pass the availability check at the same
 * instant. What stops them both booking is the unique index on `slotLock` —
 * the second INSERT violates it and Postgres rejects the row. We translate
 * that into a friendly error rather than trying to out-clever the race in
 * application code.
 */
export async function createHold(input: CreateHoldInput) {
  const {
    serviceType,
    doctorId,
    dateKey,
    startTime,
    amountPaise,
    packageBookingId,
    ...rest
  } = input;

  // Cheap pre-check: gives a clean error for the common case (slot already
  // gone, doctor on leave, time in the past) without relying on a constraint
  // violation for ordinary flow control.
  const slots = await getSlots(doctorId, dateKey, serviceType);
  const slot = slots.find((s) => s.startTime === startTime && s.available);
  if (!slot) throw new SlotUnavailableError();

  const holdExpiresAt = new Date(Date.now() + site.booking.holdMinutes * 60_000);

  try {
    return await db.appointment.create({
      data: {
        ref: generateRef(),
        serviceType,
        doctorId,
        departmentId: rest.departmentId ?? null,
        packageBookingId: packageBookingId ?? null,
        patientName: rest.patientName,
        phone: rest.phone,
        email: rest.email ?? null,
        age: rest.age ?? null,
        gender: rest.gender ?? null,
        notes: rest.notes ?? null,
        addressLine: rest.addressLine ?? null,
        area: rest.area ?? null,
        pincode: rest.pincode ?? null,
        landmark: rest.landmark ?? null,
        date: fromDateKey(dateKey),
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: "HOLD",
        amountPaise,
        holdExpiresAt,
        slotLock: buildSlotLock(doctorId, dateKey, startTime),
      },
    });
  } catch (error) {
    if (isUniqueViolation(error, "slotLock")) throw new SlotUnavailableError();
    throw error;
  }
}

/**
 * Release a slot without deleting history.
 *
 * Nulling `slotLock` is what frees the time for another patient; the row stays
 * for reporting, refunds and disputes.
 */
export async function releaseSlot(
  appointmentId: string,
  status: "CANCELLED" | "EXPIRED" | "NO_SHOW",
  opts: { cancelledBy?: string; reason?: string } = {},
) {
  return db.appointment.update({
    where: { id: appointmentId },
    data: {
      status,
      slotLock: null,
      holdExpiresAt: null,
      cancelledAt: new Date(),
      cancelledBy: opts.cancelledBy ?? null,
      cancelReason: opts.reason ?? null,
    },
  });
}

/**
 * Sweep holds whose payment never completed. Run by cron every few minutes.
 * Returns how many slots were freed.
 */
export async function expireStaleHolds(now = new Date()) {
  const stale = await db.appointment.findMany({
    where: { status: "HOLD", holdExpiresAt: { lt: now } },
    select: { id: true },
  });

  for (const appt of stale) {
    await releaseSlot(appt.id, "EXPIRED", { cancelledBy: "system", reason: "Payment not completed" });
  }

  return stale.length;
}

export type CreatePackagePurchaseInput = {
  packageId: string;
  doctorId: string;
  dateKey: string;
  startTime: string;
  patientName: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: Gender | null;
  notes?: string | null;
  addressLine: string;
  area?: string | null;
  pincode: string;
  landmark?: string | null;
};

/**
 * Buy a home-physio package and schedule its first session.
 *
 * The PackageBooking and the first Appointment are created in one transaction:
 * if the slot is taken between the availability check and the insert, the
 * whole purchase rolls back rather than leaving the patient with a paid
 * package and no visit — or worse, a package row nobody knows to schedule.
 *
 * Only session 1 is scheduled here. The remaining sessions are booked later
 * from /manage/[ref], which is the whole point of selling a package: pay once,
 * schedule as the recovery goes.
 */
export async function createPackagePurchase(input: CreatePackagePurchaseInput) {
  const { packageId, doctorId, dateKey, startTime, ...patient } = input;

  const pkg = await db.servicePackage.findFirst({
    where: { id: packageId, active: true },
  });
  if (!pkg) throw new Error("Package not found");
  if (pkg.ctaMode === "ENQUIRE") {
    // Assessment-first packages must never reach checkout.
    throw new Error("This programme needs an assessment call before booking.");
  }

  const slots = await getSlots(doctorId, dateKey, "HOME_PHYSIO");
  const slot = slots.find((s) => s.startTime === startTime && s.available);
  if (!slot) throw new SlotUnavailableError();

  const expiresAt = new Date(Date.now() + pkg.validityDays * 24 * 60 * 60 * 1000);
  const packageRef = generateRef("MP");

  try {
    return await db.$transaction(async (tx) => {
      const booking = await tx.packageBooking.create({
        data: {
          ref: packageRef,
          packageId: pkg.id,
          doctorId,
          patientName: patient.patientName,
          phone: patient.phone,
          email: patient.email ?? null,
          age: patient.age ?? null,
          gender: patient.gender ?? null,
          addressLine: patient.addressLine,
          area: patient.area ?? null,
          pincode: patient.pincode,
          landmark: patient.landmark ?? null,
          notes: patient.notes ?? null,
          sessionsTotal: pkg.sessionCount,
          sessionsUsed: 1, // the first visit, created below
          amountPaise: pkg.pricePaise,
          expiresAt,
        },
      });

      const appointment = await tx.appointment.create({
        data: {
          ref: generateRef(),
          serviceType: "HOME_PHYSIO",
          doctorId,
          packageBookingId: booking.id,
          patientName: patient.patientName,
          phone: patient.phone,
          email: patient.email ?? null,
          age: patient.age ?? null,
          gender: patient.gender ?? null,
          notes: patient.notes ?? null,
          addressLine: patient.addressLine,
          area: patient.area ?? null,
          pincode: patient.pincode,
          landmark: patient.landmark ?? null,
          date: fromDateKey(dateKey),
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: "HOLD",
          // The money sits on the package, not the individual visit, so the
          // admin revenue view does not count the same rupees twice.
          amountPaise: 0,
          holdExpiresAt: new Date(Date.now() + site.booking.holdMinutes * 60_000),
          slotLock: buildSlotLock(doctorId, dateKey, startTime),
        },
      });

      return { booking, appointment, pkg };
    });
  } catch (error) {
    if (isUniqueViolation(error, "slotLock")) throw new SlotUnavailableError();
    throw error;
  }
}

/**
 * Schedule one more session against an already-paid package.
 * Refuses once the sessions are used up or the package has expired.
 */
export async function schedulePackageSession(
  packageBookingId: string,
  dateKey: string,
  startTime: string,
) {
  const booking = await db.packageBooking.findUnique({
    where: { id: packageBookingId },
    include: { package: true },
  });
  if (!booking) throw new Error("Package not found");
  if (booking.status !== "ACTIVE") throw new Error("This package is no longer active.");
  if (booking.sessionsUsed >= booking.sessionsTotal) {
    throw new Error("All sessions in this package have been used.");
  }
  if (booking.expiresAt < new Date()) throw new Error("This package has expired.");
  if (!booking.doctorId) throw new Error("No physiotherapist assigned to this package yet.");

  const slots = await getSlots(booking.doctorId, dateKey, "HOME_PHYSIO");
  const slot = slots.find((s) => s.startTime === startTime && s.available);
  if (!slot) throw new SlotUnavailableError();

  try {
    return await db.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          ref: generateRef(),
          serviceType: "HOME_PHYSIO",
          doctorId: booking.doctorId!,
          packageBookingId: booking.id,
          patientName: booking.patientName,
          phone: booking.phone,
          email: booking.email,
          age: booking.age,
          gender: booking.gender,
          addressLine: booking.addressLine,
          area: booking.area,
          pincode: booking.pincode,
          landmark: booking.landmark,
          date: fromDateKey(dateKey),
          startTime: slot.startTime,
          endTime: slot.endTime,
          // Already paid for, so it is confirmed immediately — no payment step.
          status: "CONFIRMED",
          amountPaise: 0,
          slotLock: buildSlotLock(booking.doctorId!, dateKey, startTime),
        },
      });

      const used = booking.sessionsUsed + 1;
      await tx.packageBooking.update({
        where: { id: booking.id },
        data: {
          sessionsUsed: used,
          status: used >= booking.sessionsTotal ? "COMPLETED" : "ACTIVE",
        },
      });

      return appointment;
    });
  } catch (error) {
    if (isUniqueViolation(error, "slotLock")) throw new SlotUnavailableError();
    throw error;
  }
}

function isUniqueViolation(error: unknown, field: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as {
    code?: string;
    meta?: {
      target?: unknown;
      driverAdapterError?: {
        cause?: { constraint?: { fields?: unknown; index?: unknown } };
      };
    };
  };
  if (e.code !== "P2002") return false;

  // Prisma 7 reports the offending columns under the driver-adapter error;
  // older versions used meta.target. Field names arrive quoted ("slotLock"),
  // so compare loosely. Both shapes are handled so a Prisma upgrade cannot
  // silently turn a friendly "slot taken" message into a 500.
  const candidates: unknown[] = [];
  const cause = e.meta?.driverAdapterError?.cause;
  if (cause?.constraint && typeof cause.constraint === "object") {
    const c = cause.constraint as { fields?: unknown; index?: unknown };
    if (Array.isArray(c.fields)) candidates.push(...c.fields);
    if (c.index) candidates.push(c.index);
  }
  if (Array.isArray(e.meta?.target)) candidates.push(...e.meta.target);
  else if (e.meta?.target) candidates.push(e.meta.target);

  return candidates.some((c) => String(c).replace(/"/g, "").includes(field));
}
