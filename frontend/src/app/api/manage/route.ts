import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@medisure/backend/db";
import { sendOtp, verifyOtp, consumeVerification, OtpError } from "@medisure/backend/otp";
import {
  releaseSlot,
  createHold,
  schedulePackageSession,
  SlotUnavailableError,
} from "@medisure/backend/booking";
import { toDateKey } from "@medisure/backend/time";

export const dynamic = "force-dynamic";

/**
 * Self-service booking management.
 *
 * Every action is gated on an OTP sent to the number stored on the booking —
 * not to a number supplied in the request. A booking reference alone must
 * never be enough to cancel somebody's appointment, since references appear in
 * SMS, on printouts and over a patient's shoulder.
 */
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("request-code"), ref: z.string().trim().min(4) }),
  z.object({
    action: z.literal("verify-code"),
    ref: z.string().trim().min(4),
    code: z.string().trim().regex(/^\d{6}$/),
  }),
  z.object({
    action: z.literal("cancel"),
    ref: z.string().trim().min(4),
    token: z.string().min(10),
    reason: z.string().trim().max(300).optional(),
  }),
  z.object({
    action: z.literal("reschedule"),
    ref: z.string().trim().min(4),
    token: z.string().min(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  z.object({
    action: z.literal("schedule-session"),
    ref: z.string().trim().min(4),
    token: z.string().min(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
  }),
]);

/** Look a reference up as either an appointment or a package booking. */
async function findByRef(ref: string) {
  const appointment = await db.appointment.findUnique({
    where: { ref },
    include: { doctor: true, department: true, packageBooking: { include: { package: true } } },
  });
  if (appointment) return { kind: "appointment" as const, appointment };

  const pkg = await db.packageBooking.findUnique({
    where: { ref },
    include: { package: true, doctor: true },
  });
  if (pkg) return { kind: "package" as const, pkg };

  return null;
}

const maskPhone = (p: string) => `${p.slice(0, 3)} ***** ${p.slice(-3)}`;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const data = parsed.data;

  const found = await findByRef(data.ref.toUpperCase());
  if (!found) {
    // Deliberately vague: confirming which references exist would let someone
    // enumerate valid booking codes.
    return NextResponse.json(
      { error: "We could not find a booking with that reference." },
      { status: 404 },
    );
  }

  const phone =
    found.kind === "appointment" ? found.appointment.phone : found.pkg.phone;

  if (data.action === "request-code") {
    try {
      const { devCode } = await sendOtp(phone);
      return NextResponse.json({ sent: true, maskedPhone: maskPhone(phone), devCode });
    } catch (error) {
      if (error instanceof OtpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
  }

  if (data.action === "verify-code") {
    // The code is checked against the number stored on the booking, which the
    // client never sees. Verifying against a client-supplied number would mean
    // masking the phone for display and then trusting it right back.
    try {
      const token = await verifyOtp(phone, data.code);
      return NextResponse.json({ verified: true, token });
    } catch (error) {
      if (error instanceof OtpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
  }

  // Everything below needs a verified token belonging to THIS booking's phone.
  let verifiedPhone: string;
  try {
    verifiedPhone = await consumeVerification(data.token);
  } catch (error) {
    if (error instanceof OtpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
  if (verifiedPhone !== phone) {
    return NextResponse.json({ error: "Verification does not match this booking." }, { status: 403 });
  }

  try {
    if (data.action === "cancel") {
      if (found.kind !== "appointment") {
        return NextResponse.json(
          { error: "Please cancel individual visits, or call us to cancel a package." },
          { status: 400 },
        );
      }
      const appt = found.appointment;
      if (["CANCELLED", "COMPLETED", "EXPIRED"].includes(appt.status)) {
        return NextResponse.json({ error: "This booking cannot be cancelled." }, { status: 400 });
      }

      await releaseSlot(appt.id, "CANCELLED", { cancelledBy: "patient", reason: data.reason });

      // A cancelled package session goes back into the patient's allowance
      // rather than being burnt — they paid for it.
      if (appt.packageBookingId) {
        await db.packageBooking.update({
          where: { id: appt.packageBookingId },
          data: { sessionsUsed: { decrement: 1 }, status: "ACTIVE" },
        });
      }

      return NextResponse.json({ cancelled: true });
    }

    if (data.action === "reschedule") {
      if (found.kind !== "appointment") {
        return NextResponse.json({ error: "Nothing to reschedule." }, { status: 400 });
      }
      const appt = found.appointment;
      if (["CANCELLED", "COMPLETED", "EXPIRED"].includes(appt.status)) {
        return NextResponse.json({ error: "This booking cannot be rescheduled." }, { status: 400 });
      }

      // Take the new slot first; only release the old one once the new one is
      // secured, so a failed reschedule never leaves the patient with nothing.
      const replacement = await createHold({
        serviceType: appt.serviceType,
        doctorId: appt.doctorId,
        departmentId: appt.departmentId,
        dateKey: data.date,
        startTime: data.startTime,
        patientName: appt.patientName,
        phone: appt.phone,
        email: appt.email,
        age: appt.age,
        gender: appt.gender,
        notes: appt.notes,
        addressLine: appt.addressLine,
        area: appt.area,
        pincode: appt.pincode,
        landmark: appt.landmark,
        packageBookingId: appt.packageBookingId,
        amountPaise: appt.amountPaise,
      });

      await db.appointment.update({
        where: { id: replacement.id },
        data: {
          // Carry the paid status across — the patient is not paying twice for
          // moving an appointment.
          status: appt.status === "CONFIRMED" ? "CONFIRMED" : replacement.status,
          holdExpiresAt: appt.status === "CONFIRMED" ? null : replacement.holdExpiresAt,
        },
      });

      await releaseSlot(appt.id, "CANCELLED", {
        cancelledBy: "patient",
        reason: `Rescheduled to ${data.date} ${data.startTime} (${replacement.ref})`,
      });

      return NextResponse.json({ rescheduled: true, ref: replacement.ref });
    }

    if (data.action === "schedule-session") {
      const packageBookingId =
        found.kind === "package" ? found.pkg.id : found.appointment.packageBookingId;

      if (!packageBookingId) {
        return NextResponse.json(
          { error: "This booking is not part of a package." },
          { status: 400 },
        );
      }

      const appointment = await schedulePackageSession(
        packageBookingId,
        data.date,
        data.startTime,
      );
      return NextResponse.json({
        scheduled: true,
        ref: appointment.ref,
        date: toDateKey(appointment.date),
        startTime: appointment.startTime,
      });
    }
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Manage action failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not complete that action." },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
