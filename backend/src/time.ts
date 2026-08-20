/**
 * Wall-clock time helpers.
 *
 * The booking engine works entirely in the hospital's local timezone using
 * "HH:mm" strings and calendar dates. We never convert slot times to UTC
 * instants: a clinic that runs 09:00–13:00 runs at those times regardless of
 * where the server is, and converting invites off-by-one-day bugs that the
 * front desk would have to untangle by hand.
 */
import { TZDate } from "@date-fns/tz";
import { site } from "./site";

const TZ = site.booking.timezone;

/** Minutes since midnight from "HH:mm". */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** "HH:mm" from minutes since midnight. */
export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * "2026-08-18" — the canonical date key used in slot locks and URLs.
 *
 * Reads the UTC components, which is right for a Postgres `@db.Date` value
 * (those round-trip as UTC midnight). Do NOT call this on `new Date()` to mean
 * "today" — use `nowInClinicTz()` for that. In India the UTC date is a day
 * behind the local one between 18:30 and midnight, so the naive version breaks
 * exactly during evening OPD hours.
 */
export function toDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parse "2026-08-18" into a UTC-midnight Date, which is how Postgres `@db.Date`
 * columns round-trip. Using UTC midnight keeps the calendar date stable.
 */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Current date and time as seen in the hospital's timezone. */
export function nowInClinicTz(): { dateKey: string; minutes: number } {
  const now = new TZDate(new Date(), TZ);
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  return { dateKey, minutes: now.getHours() * 60 + now.getMinutes() };
}

/** 0 = Sunday … 6 = Saturday, for a date key. */
export function dayOfWeek(dateKey: string): number {
  return fromDateKey(dateKey).getUTCDay();
}

/** Human label: "Tue, 19 Aug". */
export function formatDateLabel(dateKey: string): string {
  const d = fromDateKey(dateKey);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** "09:30" → "9:30 AM" */
export function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Morning / Afternoon / Evening grouping for the slot grid. */
export function partOfDay(hhmm: string): "Morning" | "Afternoon" | "Evening" {
  const mins = toMinutes(hhmm);
  if (mins < 12 * 60) return "Morning";
  if (mins < 16 * 60) return "Afternoon";
  return "Evening";
}

/** The next `count` date keys starting today, in clinic time. */
export function upcomingDateKeys(count: number): string[] {
  const { dateKey } = nowInClinicTz();
  const start = fromDateKey(dateKey);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return toDateKey(d);
  });
}
