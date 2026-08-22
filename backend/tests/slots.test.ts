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

  // OPD: 09:00–12:00 as three one-hour windows, 10 patients each.
  for (let day = 0; day <= 6; day++) {
    await db.doctorSchedule.create({
      data: {
        doctorId, serviceType: "OP", dayOfWeek: day,
        startTime: "09:00", endTime: "12:00", slotMinutes: 60, capacityPerHour: 10,
      },
    });
    // Home physio: 14:00–17:00, 60-minute visits + 30 minutes travel, one
    // patient at a time → starts at 14:00 and 15:30.
    await db.doctorSchedule.create({
      data: {
        doctorId, serviceType: "HOME_PHYSIO", dayOfWeek: day,
        startTime: "14:00", endTime: "17:00", slotMinutes: 60,
        travelBufferMinutes: 30, capacityPerHour: 1,
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
  it("splits working hours into one-hour windows", async () => {
    const slots = await getSlots(doctorId, futureDateKey(), "OP");
    expect(slots.map((s) => s.startTime)).toEqual(["09:00", "10:00", "11:00"]);
    expect(slots[0].endTime).toBe("10:00");
  });

  it("reports 10 places per OPD window", async () => {
    const slots = await getSlots(doctorId, futureDateKey(), "OP");
    expect(slots[0].capacity).toBe(10);
    expect(slots[0].booked).toBe(0);
    expect(slots[0].remaining).toBe(10);
  });

  it("adds travel buffer between home visits and keeps them one-to-one", async () => {
    const slots = await getSlots(doctorId, futureDateKey(), "HOME_PHYSIO");
    // 60-min session + 30-min travel = next start 90 minutes later
    expect(slots.map((s) => s.startTime)).toEqual(["14:00", "15:30"]);
    expect(slots[0].endTime).toBe("15:00");
    // A physiotherapist can only be in one house at a time.
    expect(slots[0].capacity).toBe(1);
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
        startTime: "09:00", endTime: "10:00", reason: "Theatre",
      },
    });

    const slots = await getSlots(doctorId, dateKey, "OP");
    expect(slots.map((s) => s.startTime)).toEqual(["10:00", "11:00"]);

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
    // Any doctor who does not do home visits: asking for HOME_PHYSIO slots
    // must return nothing rather than falling back to their OP schedule.
    // Looked up by capability rather than by name, so the test survives the
    // hospital's doctor list changing.
    const otherDoctor = await db.doctor.findFirst({
      where: { offersHomePhysio: false, active: true, schedules: { some: { serviceType: "OP" } } },
    });
    expect(otherDoctor).not.toBeNull();

    const slots = await getSlots(otherDoctor!.id, futureDateKey(), "HOME_PHYSIO");
    expect(slots).toHaveLength(0);
  });
});

describe("booking, tokens and capacity", () => {
  it("assigns queue tokens in order", async () => {
    const dateKey = futureDateKey(13);
    const first = await createHold({
      serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:00",
      patientName: "Patient One", phone: "+919000000001", amountPaise: 50000,
    });
    const second = await createHold({
      serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:00",
      patientName: "Patient Two", phone: "+919000000002", amountPaise: 50000,
    });

    expect(first.tokenNumber).toBe(1);
    expect(second.tokenNumber).toBe(2);

    // Both are in the same window — this is a queue, not exclusive slots.
    expect(first.startTime).toBe(second.startTime);

    await cleanupAppointments();
  });

  it("counts bookings against the window without closing it", async () => {
    const dateKey = futureDateKey(14);
    for (let i = 0; i < 3; i++) {
      await createHold({
        serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:00",
        patientName: `Patient ${i}`, phone: `+91900000010${i}`, amountPaise: 50000,
      });
    }

    const slots = await getSlots(doctorId, dateKey, "OP");
    const window = slots.find((s) => s.startTime === "09:00")!;
    expect(window.booked).toBe(3);
    expect(window.remaining).toBe(7);
    expect(window.available).toBe(true);

    await cleanupAppointments();
  });

  it("closes the window once all 10 places are taken", async () => {
    const dateKey = futureDateKey(15);
    for (let i = 0; i < 10; i++) {
      await createHold({
        serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:00",
        patientName: `Patient ${i}`, phone: `+91900000020${i}`, amountPaise: 50000,
      });
    }

    const slots = await getSlots(doctorId, dateKey, "OP");
    expect(slots.map((s) => s.startTime)).not.toContain("09:00");

    // The eleventh patient is refused rather than over-filling the queue.
    await expect(
      createHold({
        serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:00",
        patientName: "Eleventh", phone: "+919000000299", amountPaise: 50000,
      }),
    ).rejects.toBeInstanceOf(SlotUnavailableError);

    await cleanupAppointments();
  });

  it("frees a token when a booking is cancelled", async () => {
    const dateKey = futureDateKey(16);
    const appt = await createHold({
      serviceType: "OP", doctorId, departmentId, dateKey, startTime: "10:00",
      patientName: "Canceller", phone: "+919000000301", amountPaise: 50000,
    });

    await releaseSlot(appt.id, "CANCELLED", { cancelledBy: "patient" });

    const slots = await getSlots(doctorId, dateKey, "OP");
    expect(slots.find((s) => s.startTime === "10:00")!.remaining).toBe(10);

    // The row survives for reporting even though the place is free.
    const stored = await db.appointment.findUnique({ where: { id: appt.id } });
    expect(stored?.status).toBe("CANCELLED");
    expect(stored?.slotLock).toBeNull();

    await cleanupAppointments();
  });

  it("expires abandoned holds and returns the place to the queue", async () => {
    const dateKey = futureDateKey(17);
    const appt = await createHold({
      serviceType: "OP", doctorId, departmentId, dateKey, startTime: "11:00",
      patientName: "Abandoner", phone: "+919000000401", amountPaise: 50000,
    });

    await db.appointment.update({
      where: { id: appt.id },
      data: { holdExpiresAt: new Date(Date.now() - 60_000) },
    });

    const freed = await expireStaleHolds();
    expect(freed).toBeGreaterThanOrEqual(1);

    const slots = await getSlots(doctorId, dateKey, "OP");
    expect(slots.find((s) => s.startTime === "11:00")!.remaining).toBe(10);

    await cleanupAppointments();
  });

  it("allows only one patient per home-physio visit", async () => {
    const dateKey = futureDateKey(18);
    await createHold({
      serviceType: "HOME_PHYSIO", doctorId, dateKey, startTime: "14:00",
      patientName: "Home One", phone: "+919000000501", amountPaise: 89900,
      addressLine: "1 Test Road", pincode: "500001",
    });

    await expect(
      createHold({
        serviceType: "HOME_PHYSIO", doctorId, dateKey, startTime: "14:00",
        patientName: "Home Two", phone: "+919000000502", amountPaise: 89900,
        addressLine: "2 Test Road", pincode: "500001",
      }),
    ).rejects.toBeInstanceOf(SlotUnavailableError);

    await cleanupAppointments();
  });
});

describe("concurrency", () => {
  it("admits exactly 10 when 20 patients race for the same window", async () => {
    const dateKey = futureDateKey(19);

    const attempts = Array.from({ length: 20 }, (_, i) =>
      createHold({
        serviceType: "OP", doctorId, departmentId, dateKey, startTime: "09:00",
        patientName: `Racer ${i}`, phone: `+9190000006${String(i).padStart(2, "0")}`,
        amountPaise: 50000,
      }),
    );

    const results = await Promise.allSettled(attempts);
    const won = results.filter((r) => r.status === "fulfilled");
    const lost = results.filter((r) => r.status === "rejected");

    expect(won).toHaveLength(10);
    expect(lost).toHaveLength(10);

    // Every loser gets the friendly domain error, never a raw database error.
    for (const l of lost) {
      expect((l as PromiseRejectedResult).reason).toBeInstanceOf(SlotUnavailableError);
    }

    // Tokens 1..10, each issued exactly once — no duplicates under the race.
    const stored = await db.appointment.findMany({
      where: { doctorId, date: fromDateKey(dateKey), startTime: "09:00" },
      select: { tokenNumber: true },
    });
    const tokens = stored.map((s) => s.tokenNumber).sort((a, b) => a! - b!);
    expect(tokens).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    await cleanupAppointments();
  });
});
