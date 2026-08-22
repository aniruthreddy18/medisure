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
  /** How many patients may book this window. */
  capacity: number;
  /** How many have already booked it. */
  booked: number;
  /** Places left. */
  remaining: number;
  available: boolean;
  /** Why an unavailable window is unavailable — used by the admin day view. */
  reason?: "full" | "leave" | "past";
};

export type SlotOptions = {
  minLeadTimeMinutes?: number;
  /** Include unavailable windows (admin views want the whole day). */
  includeUnavailable?: boolean;
};

/**
 * Generate the bookable windows for one doctor, one date, one service type.
 *
 * OPD runs as a token queue: the doctor's working hours are divided into
 * one-hour windows and each window holds `capacityPerHour` patients (10 by
 * default), who are seen in turn. Home physiotherapy uses the same machinery
 * with a capacity of 1, because a physiotherapist can only be in one house at
 * a time.
 *
 * Steps, in order:
 *   1. take the doctor's recurring windows for that weekday + service
 *   2. expand each into fixed-length windows, adding travel buffer for home
 *      visits so a physiotherapist is not booked back-to-back across town
 *   3. subtract any schedule exception (leave, theatre day, conference)
 *   4. count what is already booked in each window
 *   5. drop windows in the past or inside the minimum lead time
 *
 * This is the single source of truth for availability. The booking path
 * re-checks against the database constraint as well, because two requests can
 * pass step 4 simultaneously — see `slotLock` in the schema.
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
      // Only appointments still holding a place. CANCELLED, EXPIRED and
      // NO_SHOW rows have released theirs and must not block rebooking.
      where: { doctorId, date, status: { in: ["HOLD", "CONFIRMED", "COMPLETED"] } },
      select: { startTime: true },
    }),
  ]);

  if (schedules.length === 0) return [];

  const windows = expandAll(schedules, serviceType);

  // A full-day exception clears the day outright.
  if (exceptions.some((e) => e.isFullDayOff)) {
    return includeUnavailable
      ? windows.map((w) => ({
          ...w,
          booked: 0,
          remaining: 0,
          available: false,
          reason: "leave" as const,
        }))
      : [];
  }

  const blockedRanges = exceptions
    .filter((e) => e.startTime && e.endTime)
    .map((e) => [toMinutes(e.startTime!), toMinutes(e.endTime!)] as const);

  const bookedByStart = new Map<string, number>();
  for (const t of taken) {
    bookedByStart.set(t.startTime, (bookedByStart.get(t.startTime) ?? 0) + 1);
  }

  const { dateKey: todayKey, minutes: nowMinutes } = nowInClinicTz();
  const isToday = dateKey === todayKey;
  const earliest = isToday ? nowMinutes + minLeadTimeMinutes : -Infinity;

  const slots: Slot[] = [];

  for (const w of windows) {
    const start = toMinutes(w.startTime);
    const end = toMinutes(w.endTime);
    const booked = bookedByStart.get(w.startTime) ?? 0;
    const remaining = Math.max(0, w.capacity - booked);

    let available = true;
    let reason: Slot["reason"];

    if (blockedRanges.some(([bs, be]) => start < be && end > bs)) {
      available = false;
      reason = "leave";
    } else if (remaining === 0) {
      available = false;
      reason = "full";
    } else if (start < earliest) {
      available = false;
      reason = "past";
    }

    if (available || includeUnavailable) {
      slots.push({ ...w, booked, remaining, available, reason });
    }
  }

  return slots;
}

/** Expand every schedule window into discrete windows, de-duplicated by start. */
function expandAll(
  schedules: {
    startTime: string;
    endTime: string;
    slotMinutes: number;
    travelBufferMinutes: number;
    capacityPerHour: number;
  }[],
  serviceType: ServiceType,
): { startTime: string; endTime: string; capacity: number }[] {
  const seen = new Set<string>();
  const out: { startTime: string; endTime: string; capacity: number }[] = [];

  for (const sched of schedules) {
    const windowStart = toMinutes(sched.startTime);
    const windowEnd = toMinutes(sched.endTime);
    const step = sched.slotMinutes + sched.travelBufferMinutes;

    // Guard against a mis-entered schedule (0-length window) looping forever.
    if (sched.slotMinutes <= 0 || step <= 0) continue;

    for (let start = windowStart; start + sched.slotMinutes <= windowEnd; start += step) {
      const startTime = toHHMM(start);
      if (seen.has(startTime)) continue;
      seen.add(startTime);
      out.push({
        startTime,
        endTime: toHHMM(start + sched.slotMinutes),
        // A home visit is always one-to-one: the physiotherapist physically
        // cannot be in two houses at once. Enforced here rather than trusting
        // the schedule row, because capacityPerHour defaults to 10 for OPD and
        // a mis-entered home schedule would otherwise overbook a real person.
        capacity:
          serviceType === "HOME_PHYSIO" ? 1 : Math.max(1, sched.capacityPerHour),
      });
    }
  }

  return out.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
}

/**
 * Which of the next `days` dates still have places free.
 * Powers the date strip so patients never click into a full day.
 */
export async function getAvailableDates(
  doctorId: string,
  serviceType: ServiceType,
  days = site.booking.bookingWindowDays,
): Promise<{ dateKey: string; slotCount: number; placesLeft: number }[]> {
  const keys = upcomingDateKeys(days);
  return Promise.all(
    keys.map(async (dateKey) => {
      const slots = await getSlots(doctorId, dateKey, serviceType);
      return {
        dateKey,
        slotCount: slots.length,
        placesLeft: slots.reduce((n, s) => n + s.remaining, 0),
      };
    }),
  );
}

/**
 * The composite key that makes over-booking impossible at the database level.
 * Two patients in the same window hold different tokens; two patients racing
 * for the same token collide on the unique index.
 */
export function buildSlotLock(
  doctorId: string,
  dateKey: string,
  startTime: string,
  tokenNumber: number,
): string {
  return `${doctorId}|${dateKey}|${startTime}#${tokenNumber}`;
}
