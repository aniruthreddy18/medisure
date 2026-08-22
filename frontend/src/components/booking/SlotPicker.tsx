"use client";

import { useEffect, useState } from "react";
import { Loader2, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateLabel, formatTimeLabel, partOfDay, upcomingDateKeys } from "@medisure/backend/time";

type Slot = {
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  remaining: number;
  available: boolean;
};

/**
 * Date strip + booking windows.
 *
 * OPD runs as a token queue: each window is an hour holding several patients,
 * so the button shows how many places are left rather than pretending the time
 * is exclusive. Home visits use the same component with a capacity of one, and
 * simply show the time.
 *
 * Availability is always fetched fresh from the server — never cached, never
 * derived on the client — so a patient does not pick a window that filled up
 * thirty seconds ago. The final word still belongs to the database constraint
 * at booking time.
 */
export function SlotPicker({
  doctorId,
  serviceType,
  value,
  onChange,
  days = 14,
}: {
  doctorId: string;
  serviceType: "OP" | "HOME_PHYSIO";
  value: { date: string; startTime: string } | null;
  onChange: (v: { date: string; startTime: string; endTime: string }) => void;
  days?: number;
}) {
  const dates = upcomingDateKeys(days);
  const [activeDate, setActiveDate] = useState(value?.date ?? dates[0]);

  // One piece of state tagged with the request it belongs to. "Loading" is
  // then derived — the result simply has not caught up with the key yet —
  // rather than being a separate flag flipped synchronously inside the effect,
  // which causes cascading renders and can show stale slots for a moment.
  const requestKey = `${doctorId}|${activeDate}|${serviceType}`;
  const [result, setResult] = useState<{
    key: string;
    slots: Slot[];
    error: string | null;
  } | null>(null);

  const loading = result?.key !== requestKey;
  const slots = result?.key === requestKey ? result.slots : [];
  const error = result?.key === requestKey ? result.error : null;

  useEffect(() => {
    let cancelled = false;

    fetch(
      `/api/slots?doctorId=${encodeURIComponent(doctorId)}&date=${activeDate}&serviceType=${serviceType}`,
    )
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Could not load times");
        return json;
      })
      .then((json) => {
        if (!cancelled) setResult({ key: requestKey, slots: json.slots ?? [], error: null });
      })
      .catch((e: Error) => {
        if (!cancelled) setResult({ key: requestKey, slots: [], error: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [doctorId, activeDate, serviceType, requestKey]);

  const groups = ["Morning", "Afternoon", "Evening"] as const;

  return (
    <div>
      {/* Date strip */}
      <div
        role="radiogroup"
        aria-label="Choose a date"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
      >
        {dates.map((date) => {
          const selected = date === activeDate;
          return (
            <button
              key={date}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setActiveDate(date)}
              className={cn(
                "min-h-16 shrink-0 rounded-xl border px-4 py-2 text-center transition-colors",
                selected
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-border bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50",
              )}
            >
              <span className="block text-xs uppercase tracking-wide opacity-80">
                {formatDateLabel(date).split(",")[0]}
              </span>
              <span className="mt-0.5 block text-sm font-semibold">
                {formatDateLabel(date).split(", ")[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots */}
      <div className="mt-6" aria-live="polite">
        {loading ? (
          <p className="flex items-center gap-2 py-8 text-ink-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Checking availability…
          </p>
        ) : error ? (
          <p className="rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency">
            {error}
          </p>
        ) : slots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <CalendarX className="mx-auto size-6 text-ink-400" aria-hidden="true" />
            <p className="mt-3 font-medium text-ink-700">No booking windows left on this date</p>
            <p className="mt-1 text-sm text-ink-500">
              Try another date, or call our booking desk for help.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => {
              const inGroup = slots.filter((s) => partOfDay(s.startTime) === group);
              if (inGroup.length === 0) return null;

              return (
                <fieldset key={group}>
                  <legend className="mb-3 text-sm font-semibold text-ink-700">
                    {group}{" "}
                    <span className="font-normal text-ink-400">
                      ({inGroup.length} {inGroup.length === 1 ? "window" : "windows"})
                    </span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {inGroup.map((slot) => {
                      const selected =
                        value?.date === activeDate && value?.startTime === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            onChange({
                              date: activeDate,
                              startTime: slot.startTime,
                              endTime: slot.endTime,
                            })
                          }
                          className={cn(
                            "min-h-14 rounded-xl border px-4 py-2 text-left transition-colors",
                            selected
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50",
                          )}
                        >
                          <span className="block text-sm font-semibold">
                            {slot.capacity > 1
                              ? `${formatTimeLabel(slot.startTime)} – ${formatTimeLabel(slot.endTime)}`
                              : formatTimeLabel(slot.startTime)}
                          </span>
                          {slot.capacity > 1 && (
                            <span
                              className={cn(
                                "mt-0.5 block text-xs",
                                selected
                                  ? "text-white/80"
                                  : slot.remaining <= 2
                                    ? "font-medium text-brand-700"
                                    : "text-ink-500",
                              )}
                            >
                              {slot.remaining} of {slot.capacity} left
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
