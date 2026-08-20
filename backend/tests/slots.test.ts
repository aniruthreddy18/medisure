import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { getSlots } from "@/lib/slots";
import { createHold, releaseSlot, expireStaleHolds, SlotUnavailableError } from "@/lib/booking";
import { fromDateKey, toDateKey, nowInClinicTz } from "@/lib/time";

/**
 * These run against the real database. The whole point of the slot lock is
 * that Postgres enforces it, so a mocked client would test nothing.
 */

const TEST_DOCTOR_SLUG = "test-slot-engine-doctor";
let doctorId: string;
let departmentId: string;

/** A date far enough ahead that lead-time filtering never interferes. */
function futureDateKey(daysAhead = 10): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return toDateKey(d);
}

async function cleanupAppointments() {
  await db.appointment.deleteMany({ where: { doctorId } });
}

beforeAll(async () => {
  const dept = await db.department.findFirst({ where: { slug: "physiotherapy" } });
  if (!dept) throw new Error("Seed the database first: npm run db:seed");
  departmentId = dept.id;

  const doctor = await db.doctor.upsert({
    where: { slug: TEST_DOCTOR_SLUG },
    update: {},
    create: {
      name: "Dr. Slot Engine",
      slug: TEST_DOCTOR_SLUG,
      designation: "Test Fixture",
      qualifications: "N/A",
      experienceYears: 1,
      gender: "OTHER",
      languages: ["English"],
      opFeePaise: 50000,
      homeVisitFeePaise: 89900,
      offersHomePhysio: true,
      active: false, // never shows on the public site
    },
  });
  doctorId = doctor.id;

  await db.doctorSchedule.deleteMany({ where: { doctorId } });

  // OP: every weekday 09:00–10:00 in 15-minute slots → 4 slots.
  for (let day = 0; day <= 6; day++) {
    await db.doctorSchedule.create({
      data: { doctorId, serviceType: "OP", dayOfWeek: day, startTime: "09:00", endTime: "10:00", slotMinutes: 15 },
    });
    // Home physio: 10:00–13:00, 60-minute sessions + 30-minute travel buffer
    // → starts at 10:00, 11:30 (13:00 would end past the window) → 2 slots.
    await db.doctorSchedule.create({
      data: {
        doctorId, serviceType: "HOME_PHYSIO", dayOfWeek: day,
        startTime: "10:00", endTime: "13:00", slotMinutes: 60, travelBufferMinutes: 30,
      },
    });
  }
});

afterAll(async () => {
  await cleanupAppointments();
  await db.scheduleException.deleteMany({ where: { doctorId } });
  await db.doctorSchedule.deleteMany({ where: { doctorId } });
  await db.doctor.deleteMany({ where: { slug: TEST_DOCTOR_SLUG } });
  await db.$disconnect();
});

describe("slot generation", () => {
  it("expands a schedule window into fixed-length slots", async () => {
    const slots = await getSlots(doctorId, futureDateKey(), "OP");
    expect(slots.map((s) => s.startTime)).toEqual(["09:00", "09:15", "09:30", "09:45"]);
    expect(slots[0].endTime).toBe("09:15");
  });

  it("adds travel buffer between home visits", async () => {
    const slots = await getSlots(doctorId, futureDateKey(), "HOME_PHYSIO");
    // 60-min session + 30-min travel = next start 90 minutes later
    expect(slots.map((s) => s.startTime)).toEqual(["10:00", "11:30"]);
    expect(slots[0].endTime).toBe("11:00");
  });

  it("returns nothing on a full-day leave", async () => {
    const dateKey = futureDateKey(11);
    await db.scheduleException.create({
      data: { doctorId, date: fromDateKey(dateKey), isFullDayOff: true, reason: "Conference" },
    });

    const slots = await getSlots(doctorId, dateKey, "OP");
    expect(slots).toHaveLength(0);

    await db.scheduleException.deleteMany({ where: { doctorId, date: fromDateKey(dateKey) } });
  });

  it("subtracts only the blocked window of a partial exception", async () => {
    const dateKey = futureDateKey(12);
    await db.scheduleException.create({
      data: {
        doctorId, date: fromDateKey(dateKey), isFullDayOff: false,
        startTime: "09:00", endTime: "09:30", reason: "Theatre",
      },
    });

    const slots = await getSlots(doctorId, dateKey, "OP");
    expect(slots.map((s) => s.startTime)).toEqual(["09:30", "09:45"]);

    await db.scheduleException.deleteMany({ where: { doctorId, date: fromDateKey(dateKey) } });
  });

  it("hides slots inside the minimum lead time on today's date", async () => {
    // "Today" must be today *in the clinic's timezone*, not UTC. Between
    // 18:30 and 00:00 UTC these are different dates in India, which is exactly
    // the window where a naive UTC date would silently break booking.
    const today = nowInClinicTz().dateKey;
    // A 24-hour lead time must remove every slot from today.
    const slots = await getSlots(doctorId, today, "OP", { minLeadTimeMinutes: 24 * 60 });
    expect(slots).toHaveLength(0);
  });

  it("does not generate slots for a day with no schedule", async () => {
    const otherDoctor = await db.doctor.findFirst({ where: { slug: "dr-suresh-reddy" } });
    const slots = await getSlots(otherDoctor!.id, futureDateKey(), "HOME_PHYSIO");
    expect(slots).toHaveLength(0); // this surgeon does not do home visits
  });
});

describe("booking and slot release", () => {
  it("removes a slot once it is held", async () => {
    const dateKey = futureDateKey(13);
    await createHold({
      serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:00",
      patientName: "Test Patient", phone: "+919000000001", amountPaise: 50000,
    });

    const slots = await getSlots(doctorId, dateKey, "OP");
    expect(slots.map((s) => s.startTime)).not.toContain("09:00");
    expect(slots).toHaveLength(3);

    await cleanupAppointments();
  });

  it("frees the slot again when the booking is cancelled", async () => {
    const dateKey = futureDateKey(14);
    const appt = await createHold({
      serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:15",
      patientName: "Test Patient", phone: "+919000000002", amountPaise: 50000,
    });

    await releaseSlot(appt.id, "CANCELLED", { cancelledBy: "patient" });

    const slots = await getSlots(doctorId, dateKey, "OP");
    expect(slots.map((s) => s.startTime)).toContain("09:15");

    // The row survives for reporting even though the slot is free.
    const stored = await db.appointment.findUnique({ where: { id: appt.id } });
    expect(stored?.status).toBe("CANCELLED");
    expect(stored?.slotLock).toBeNull();

    await cleanupAppointments();
  });

  it("lets the same slot be rebooked after a cancellation", async () => {
    const dateKey = futureDateKey(15);
    const first = await createHold({
      serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:30",
      patientName: "First", phone: "+919000000003", amountPaise: 50000,
    });
    await releaseSlot(first.id, "CANCELLED");

    const second = await createHold({
      serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:30",
      patientName: "Second", phone: "+919000000004", amountPaise: 50000,
    });
    expect(second.id).not.toBe(first.id);

    await cleanupAppointments();
  });

  it("expires abandoned holds and returns the slot to the pool", async () => {
    const dateKey = futureDateKey(16);
    const appt = await createHold({
      serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:45",
      patientName: "Abandoner", phone: "+919000000005", amountPaise: 50000,
    });

    // Simulate the hold window elapsing.
    await db.appointment.update({
      where: { id: appt.id },
      data: { holdExpiresAt: new Date(Date.now() - 60_000) },
    });

    const freed = await expireStaleHolds();
    expect(freed).toBeGreaterThanOrEqual(1);

    const slots = await getSlots(doctorId, dateKey, "OP");
    expect(slots.map((s) => s.startTime)).toContain("09:45");

    await cleanupAppointments();
  });
});

describe("concurrency", () => {
  it("allows exactly one booking when 20 requests race for the same slot", async () => {
    const dateKey = futureDateKey(17);

    const attempts = Array.from({ length: 20 }, (_, i) =>
      createHold({
        serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:00",
        patientName: `Racer ${i}`, phone: `+9190000001${String(i).padStart(2, "0")}`,
        amountPaise: 50000,
      }),
    );

    const results = await Promise.allSettled(attempts);
    const won = results.filter((r) => r.status === "fulfilled");
    const lost = results.filter((r) => r.status === "rejected");

    expect(won).toHaveLength(1);
    expect(lost).toHaveLength(19);

    // Every loser must get the friendly domain error, not a raw DB error.
    for (const l of lost) {
      expect((l as PromiseRejectedResult).reason).toBeInstanceOf(SlotUnavailableError);
    }

    // And the database must hold exactly one row for that slot.
    const stored = await db.appointment.findMany({
      where: { doctorId, date: fromDateKey(dateKey), startTime: "09:00" },
    });
    expect(stored).toHaveLength(1);

    await cleanupAppointments();
  });
});
