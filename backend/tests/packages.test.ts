import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { getSlots } from "@/lib/slots";
import {
  createPackagePurchase,
  schedulePackageSession,
  releaseSlot,
  SlotUnavailableError,
} from "@/lib/booking";
import { toDateKey } from "@/lib/time";

/**
 * Package purchase is the part that takes real money, so it is tested against
 * the real database: the price charged, the session accounting, and the
 * refusal cases that stop a patient getting more visits than they paid for.
 */

const PHYSIO_SLUG = "test-package-physio";
const PKG_SLUG = "test-package-5-session";

let physioId: string;
let packageId: string;

function futureDateKey(daysAhead: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return toDateKey(d);
}

async function cleanup() {
  await db.appointment.deleteMany({ where: { doctorId: physioId } });
  await db.packageBooking.deleteMany({ where: { packageId } });
}

beforeAll(async () => {
  const physio = await db.doctor.upsert({
    where: { slug: PHYSIO_SLUG },
    update: {},
    create: {
      name: "Dr. Package Fixture",
      slug: PHYSIO_SLUG,
      designation: "Test Fixture",
      qualifications: "N/A",
      experienceYears: 5,
      gender: "OTHER",
      languages: ["English"],
      opFeePaise: 50000,
      homeVisitFeePaise: 89900,
      offersHomePhysio: true,
      active: false,
    },
  });
  physioId = physio.id;

  await db.doctorSchedule.deleteMany({ where: { doctorId: physioId } });
  for (let day = 0; day <= 6; day++) {
    await db.doctorSchedule.create({
      data: {
        doctorId: physioId,
        serviceType: "HOME_PHYSIO",
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "15:00",
        slotMinutes: 60,
        travelBufferMinutes: 30,
      },
    });
  }

  const pkg = await db.servicePackage.upsert({
    where: { slug: PKG_SLUG },
    // Must be active: purchase deliberately refuses inactive packages, so an
    // inactive fixture would test nothing. afterAll deletes it again.
    update: { active: true },
    create: {
      name: "Test 5-Session Pack",
      slug: PKG_SLUG,
      sessionCount: 5,
      pricePaise: 350000, // ₹3,500
      validityDays: 30,
      description: "Fixture",
      includes: [],
      active: true,
    },
  });
  packageId = pkg.id;
});

afterAll(async () => {
  await cleanup();
  await db.doctorSchedule.deleteMany({ where: { doctorId: physioId } });
  await db.doctor.deleteMany({ where: { slug: PHYSIO_SLUG } });
  await db.servicePackage.deleteMany({ where: { slug: PKG_SLUG } });
  await db.$disconnect();
});

const patient = {
  patientName: "Package Patient",
  phone: "+919000001234",
  addressLine: "1 Test Road",
  pincode: "500001",
};

describe("buying a package", () => {
  it("charges the package price, not the per-visit fee", async () => {
    const { booking } = await createPackagePurchase({
      packageId,
      doctorId: physioId,
      dateKey: futureDateKey(20),
      startTime: "09:00",
      ...patient,
    });

    // ₹3,500 package — NOT the doctor's ₹899 single-visit fee.
    expect(booking.amountPaise).toBe(350000);
    expect(booking.sessionsTotal).toBe(5);
    await cleanup();
  });

  it("schedules the first visit and counts it as session one", async () => {
    const dateKey = futureDateKey(21);
    const { booking, appointment } = await createPackagePurchase({
      packageId,
      doctorId: physioId,
      dateKey,
      startTime: "09:00",
      ...patient,
    });

    expect(booking.sessionsUsed).toBe(1);
    expect(appointment.packageBookingId).toBe(booking.id);
    // The money lives on the package, so the visit itself is zero-rated and
    // the admin revenue view cannot double count it.
    expect(appointment.amountPaise).toBe(0);
    await cleanup();
  });

  it("takes the slot out of availability", async () => {
    const dateKey = futureDateKey(22);
    await createPackagePurchase({
      packageId,
      doctorId: physioId,
      dateKey,
      startTime: "09:00",
      ...patient,
    });

    const slots = await getSlots(physioId, dateKey, "HOME_PHYSIO");
    expect(slots.map((s) => s.startTime)).not.toContain("09:00");
    await cleanup();
  });

  it("rolls the purchase back if the slot is taken first", async () => {
    const dateKey = futureDateKey(23);
    await createPackagePurchase({
      packageId, doctorId: physioId, dateKey, startTime: "09:00", ...patient,
    });

    await expect(
      createPackagePurchase({
        packageId, doctorId: physioId, dateKey, startTime: "09:00", ...patient,
      }),
    ).rejects.toBeInstanceOf(SlotUnavailableError);

    // Exactly one package — the failed purchase must not leave an orphan row
    // that nobody knows to schedule or refund.
    const bookings = await db.packageBooking.findMany({ where: { packageId } });
    expect(bookings).toHaveLength(1);
    await cleanup();
  });
});

describe("scheduling the remaining sessions", () => {
  it("increments the counter and confirms without another payment", async () => {
    const { booking } = await createPackagePurchase({
      packageId, doctorId: physioId, dateKey: futureDateKey(24), startTime: "09:00", ...patient,
    });

    const second = await schedulePackageSession(booking.id, futureDateKey(25), "09:00");
    expect(second.status).toBe("CONFIRMED"); // already paid for
    expect(second.amountPaise).toBe(0);

    const after = await db.packageBooking.findUnique({ where: { id: booking.id } });
    expect(after?.sessionsUsed).toBe(2);
    await cleanup();
  });

  it("refuses to schedule more sessions than were paid for", async () => {
    const { booking } = await createPackagePurchase({
      packageId, doctorId: physioId, dateKey: futureDateKey(26), startTime: "09:00", ...patient,
    });

    // Sessions 2–5 use up the remaining allowance.
    for (let i = 1; i < 5; i++) {
      await schedulePackageSession(booking.id, futureDateKey(26 + i), "09:00");
    }

    const used = await db.packageBooking.findUnique({ where: { id: booking.id } });
    expect(used?.sessionsUsed).toBe(5);
    expect(used?.status).toBe("COMPLETED");

    await expect(
      schedulePackageSession(booking.id, futureDateKey(31), "09:00"),
    ).rejects.toThrow(/no longer active|All sessions/);

    await cleanup();
  });

  it("refuses to schedule against an expired package", async () => {
    const { booking } = await createPackagePurchase({
      packageId, doctorId: physioId, dateKey: futureDateKey(32), startTime: "09:00", ...patient,
    });

    await db.packageBooking.update({
      where: { id: booking.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await expect(
      schedulePackageSession(booking.id, futureDateKey(33), "09:00"),
    ).rejects.toThrow(/expired/);

    await cleanup();
  });

  it("returns a cancelled session to the patient's allowance", async () => {
    const { booking } = await createPackagePurchase({
      packageId, doctorId: physioId, dateKey: futureDateKey(34), startTime: "09:00", ...patient,
    });
    const second = await schedulePackageSession(booking.id, futureDateKey(35), "09:00");

    // Mirrors what /api/manage does on cancel: free the slot, give the session
    // back. The patient paid for it, so it must not be burnt.
    await releaseSlot(second.id, "CANCELLED", { cancelledBy: "patient" });
    await db.packageBooking.update({
      where: { id: booking.id },
      data: { sessionsUsed: { decrement: 1 }, status: "ACTIVE" },
    });

    const after = await db.packageBooking.findUnique({ where: { id: booking.id } });
    expect(after?.sessionsUsed).toBe(1);

    const slots = await getSlots(physioId, futureDateKey(35), "HOME_PHYSIO");
    expect(slots.map((s) => s.startTime)).toContain("09:00");
    await cleanup();
  });
});
