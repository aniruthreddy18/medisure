import "server-only";
import { db } from "./db";
import { site } from "./site";
import {
  toMinutes,
  toHHMM,
  fromDateKey,
  dayOfWeek,
  nowInClinicTz,
  upcomingDateKeys,
} from "./time";
import type { ServiceType } from "./generated/prisma/enums";

export type Slot = {
  startTime: string;
  endTime: string;
  available: boolean;
  /** Why an unavailable slot is unavailable — useful in the admin day view. */
  reason?: "booked" | "leave" | "past";
};

export type SlotOptions = {
  minLeadTimeMinutes?: number;
  /** Include unavailable slots (admin views want to see the whole day). */
  includeUnavailable?: boolean;
};

/**
 * Generate the bookable slots for one doctor, one date, one service type.
 *
 * Steps, in order:
 *   1. take the doctor's recurring windows for that weekday + service
 *   2. expand each window into fixed-length slots, adding travel buffer for
 *      home visits so a physiotherapist is not booked back-to-back across town
 *   3. subtract any schedule exception (leave, theatre day, conference)
 *   4. subtract slots already held or confirmed by another patient
 *   5. drop slots that are in the past or inside the minimum lead time
 *
 * This function is the single source of truth for availability. The booking
 * endpoint re-checks against the database constraint as well, because two
 * requests can pass step 4 simultaneously — see `slotLock` in the schema.
 */
export async function getSlots(
  doctorId: string,
  dateKey: string,
  serviceType: ServiceType,
  options: SlotOptions = {},
): Promise<Slot[]> {
  const {
    minLeadTimeMinutes = site.booking.minLeadTimeMinutes,
    includeUnavailable = false,
  } = options;

  const date = fromDateKey(dateKey);
  const dow = dayOfWeek(dateKey);

  const [schedules, exceptions, taken] = await Promise.all([
    db.doctorSchedule.findMany({
      where: { doctorId, serviceType, dayOfWeek: dow, active: true },
      orderBy: { startTime: "asc" },
    }),
    db.scheduleException.findMany({ where: { doctorId, date } }),
    db.appointment.findMany({
      // Only appointments that still hold their slot. CANCELLED, EXPIRED and
      // NO_SHOW rows have released it and must not block rebooking.
      where: {
        doctorId,
        date,
        status: { in: ["HOLD", "CONFIRMED", "COMPLETED"] },
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  if (schedules.length === 0) return [];

  // A full-day exception clears the day outright.
  if (exceptions.some((e) => e.isFullDayOff)) {
    return includeUnavailable
      ? expandAll(schedules).map((s) => ({ ...s, available: false, reason: "leave" as const }))
      : [];
  }

  const blockedRanges = exceptions
    .filter((e) => e.startTime && e.endTime)
    .map((e) => [toMinutes(e.startTime!), toMinutes(e.endTime!)] as const);

  const takenStarts = new Set(taken.map((t) => t.startTime));

  const { dateKey: todayKey, minutes: nowMinutes } = nowInClinicTz();
  const isToday = dateKey === todayKey;
  const earliest = isToday ? nowMinutes + minLeadTimeMinutes : -Infinity;

  const slots: Slot[] = [];

  for (const slot of expandAll(schedules)) {
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);

    let available = true;
    let reason: Slot["reason"];

    if (blockedRanges.some(([bs, be]) => start < be && end > bs)) {
      available = false;
      reason = "leave";
    } else if (takenStarts.has(slot.startTime)) {
      available = false;
      reason = "booked";
    } else if (start < earliest) {
      available = false;
      reason = "past";
    }

    if (available || includeUnavailable) {
      slots.push({ ...slot, available, reason });
    }
  }

  return slots;
}

/** Expand every schedule window into discrete slots, de-duplicated by start. */
function expandAll(
  schedules: {
    startTime: string;
    endTime: string;
    slotMinutes: number;
    travelBufferMinutes: number;
  }[],
): { startTime: string; endTime: string }[] {
  const seen = new Set<string>();
  const out: { startTime: string; endTime: string }[] = [];

  for (const sched of schedules) {
    const windowStart = toMinutes(sched.startTime);
    const windowEnd = toMinutes(sched.endTime);
    const step = sched.slotMinutes + sched.travelBufferMinutes;

    // Guard against a mis-entered schedule (0-length slot) looping forever.
    if (sched.slotMinutes <= 0 || step <= 0) continue;

    for (let start = windowStart; start + sched.slotMinutes <= windowEnd; start += step) {
      const startTime = toHHMM(start);
      if (seen.has(startTime)) continue;
      seen.add(startTime);
      out.push({ startTime, endTime: toHHMM(start + sched.slotMinutes) });
    }
  }

  return out.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
}

/**
 * Which of the next `days` dates have at least one free slot.
 * Powers the date strip so patients never click into an empty day.
 */
export async function getAvailableDates(
  doctorId: string,
  serviceType: ServiceType,
  days = site.booking.bookingWindowDays,
): Promise<{ dateKey: string; slotCount: number }[]> {
  const keys = upcomingDateKeys(days);
  const results = await Promise.all(
    keys.map(async (dateKey) => ({
      dateKey,
      slotCount: (await getSlots(doctorId, dateKey, serviceType)).length,
    })),
  );
  return results;
}

/** The composite key that makes double-booking impossible at the DB level. */
export function buildSlotLock(doctorId: string, dateKey: string, startTime: string): string {
  return `${doctorId}|${dateKey}|${startTime}`;
}
