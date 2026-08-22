"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  ShieldCheck,
  Phone,
  CheckCircle2,
  CalendarPlus,
  AlertCircle,
} from "lucide-react";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { formatDateLabel, formatTimeLabel } from "@medisure/backend/time";
import { site } from "@medisure/backend/site";
import { formatPhone } from "@/lib/utils";

type PackageInfo = {
  ref: string;
  name: string;
  sessionsTotal: number;
  sessionsUsed: number;
  expiresAt: string;
  status: string;
};

type Details = {
  kind: "appointment" | "package";
  ref: string;
  status: string;
  serviceType?: "OP" | "HOME_PHYSIO";
  patientName: string;
  doctorId: string | null;
  doctorName: string | null;
  departmentName?: string | null;
  date?: string;
  startTime?: string;
  package: PackageInfo | null;
};

type Mode = "idle" | "next-session";

/**
 * Self-service booking management, gated behind an OTP sent to the number on
 * the booking. Nothing is rendered until that check passes — a reference on
 * its own reveals nothing.
 */
export function ManageBooking({ bookingRef }: { bookingRef: string }) {
  const [stage, setStage] = useState<"start" | "code" | "ready">("start");
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [details, setDetails] = useState<Details | null>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [slot, setSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function post(url: string, body: object) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
    return json;
  }

  async function requestCode() {
    setBusy(true);
    setError(null);
    try {
      const json = await post("/api/manage", { action: "request-code", ref: bookingRef });
      setMaskedPhone(json.maskedPhone);
      setDevCode(json.devCode ?? null);
      // See OtpStep: development convenience, absent in production.
      if (json.devCode) setCode(json.devCode);
      setStage("code");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      // Verified by reference, not by phone: the browser only ever holds a
      // masked number, so the server resolves the real one from the booking.
      const v = await post("/api/manage", { action: "verify-code", ref: bookingRef, code });
      setToken(v.token);
      const d = await post("/api/manage/details", { ref: bookingRef, token: v.token });
      setDetails(d);
      setStage("ready");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function refresh(currentToken: string) {
    const d = await post("/api/manage/details", { ref: bookingRef, token: currentToken });
    setDetails(d);
  }

  async function act(action: "schedule-session") {
    if (!token) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (!slot) throw new Error("Choose a time first.");
      const json = await post("/api/manage", {
        action,
        ref: bookingRef,
        token,
        date: slot.date,
        startTime: slot.startTime,
      });

      setNotice(`Session booked for ${formatDateLabel(json.date)} at ${formatTimeLabel(json.startTime)}.`);
      setMode("idle");
      setSlot(null);
      await refresh(token);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // ---------- Gate ----------
  if (stage !== "ready") {
    return (
      <div className="rounded-2xl border border-border bg-white p-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-950">
          <ShieldCheck className="size-6 text-brand-600" aria-hidden="true" />
          Verify it&apos;s you
        </h1>
        <p className="mt-2 text-ink-600">
          Booking <span className="font-mono font-semibold">{bookingRef}</span>
        </p>

        {error && (
          <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {stage === "start" ? (
          <>
            <p className="mt-5 text-ink-600">
              We will send a 6-digit code to the mobile number on this booking.
            </p>
            <button
              type="button"
              onClick={requestCode}
              disabled={busy}
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-700 px-6 font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Send me a code
            </button>
          </>
        ) : (
          <>
            {devCode && (
              <p className="mt-5 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-3 text-sm text-brand-800">
                Test mode — no SMS was sent. Code{" "}
                <strong className="font-mono tracking-widest">{devCode}</strong>{" "}
                has been filled in for you.
              </p>
            )}
            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">
                Code sent to {maskedPhone}
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="input font-mono text-lg tracking-[0.4em]"
                autoComplete="one-time-code"
              />
            </label>
            <button
              type="button"
              onClick={verify}
              disabled={busy || code.length !== 6}
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              View my booking
            </button>
          </>
        )}
      </div>
    );
  }

  // ---------- Booking ----------
  const d = details!;
  const pkg = d.package;
  const sessionsLeft = pkg ? pkg.sessionsTotal - pkg.sessionsUsed : 0;
  // Whether rescheduling still makes sense for this booking. There is no
  // self-service cancel or reschedule any more — without a login, the only
  // identity check available is an OTP re-verification per visit, which
  // isn't a safe enough basis for changing or cancelling a booking on our
  // own system of record. Both go through reception instead, who can pull
  // up the booking directly.
  const reschedulable = d.kind === "appointment" && !["CANCELLED", "COMPLETED", "EXPIRED"].includes(d.status);

  return (
    <div className="space-y-6">
      {notice && (
        <p className="flex items-start gap-2 rounded-xl border border-brand-300 bg-brand-50 p-4 text-sm text-brand-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-border bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-950">Your booking</h1>
            <p className="mt-1 font-mono text-sm text-ink-500">{d.ref}</p>
          </div>
          <span
            className={
              d.status === "CANCELLED" || d.status === "EXPIRED"
                ? "rounded-full bg-ink-100 px-3 py-1 text-sm font-medium text-ink-600"
                : "rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800"
            }
          >
            {d.status.replace("_", " ").toLowerCase()}
          </span>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Patient</dt>
            <dd className="font-medium text-ink-900">{d.patientName}</dd>
          </div>
          {d.doctorName && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500">{d.serviceType === "HOME_PHYSIO" ? "Physiotherapist" : "Doctor"}</dt>
              <dd className="font-medium text-ink-900">{d.doctorName}</dd>
            </div>
          )}
          {d.date && d.startTime && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500">When</dt>
              <dd className="font-medium text-ink-900">
                {formatDateLabel(d.date)}, {formatTimeLabel(d.startTime)}
              </dd>
            </div>
          )}
        </dl>

        {reschedulable && (
          <div className="mt-7 flex items-start gap-4 rounded-xl border-2 border-accent-300 bg-accent-50 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-500 text-white">
              <Phone className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display font-bold text-ink-900">
                To reschedule or cancel, call reception
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">
                We handle changes to an existing booking over the phone, not
                on the website — call and we&apos;ll sort out a new time or
                cancel it for you.
              </p>
              <a
                href={`tel:${site.phone.reception}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-500 px-5 font-semibold text-white transition-colors hover:bg-accent-600"
              >
                <Phone className="size-4" aria-hidden="true" />
                {formatPhone(site.phone.reception)}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Package sessions */}
      {pkg && (
        <div className="rounded-2xl border border-border bg-white p-8">
          <h2 className="font-display text-lg font-bold text-brand-950">{pkg.name}</h2>
          <p className="mt-2 text-ink-600">
            <span className="font-semibold text-brand-800">{sessionsLeft}</span> of{" "}
            {pkg.sessionsTotal} sessions remaining
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Valid until {new Date(pkg.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100"
            role="progressbar"
            aria-valuenow={pkg.sessionsUsed}
            aria-valuemin={0}
            aria-valuemax={pkg.sessionsTotal}
            aria-label="Sessions used"
          >
            <div
              className="h-full rounded-full bg-brand-600"
              style={{ width: `${(pkg.sessionsUsed / pkg.sessionsTotal) * 100}%` }}
            />
          </div>

          {sessionsLeft > 0 && pkg.status === "ACTIVE" && (
            <button
              type="button"
              onClick={() => {
                setMode(mode === "next-session" ? "idle" : "next-session");
                setSlot(null);
              }}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-500 px-5 font-semibold text-white hover:bg-accent-600"
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              Book your next session
            </button>
          )}
        </div>
      )}

      {/* Slot picker for booking the next package session */}
      {mode === "next-session" && d.doctorId && (
        <div className="rounded-2xl border border-border bg-white p-8">
          <h2 className="font-display text-lg font-bold text-brand-950">
            Choose a time for your next session
          </h2>
          <div className="mt-5">
            <SlotPicker
              doctorId={d.doctorId}
              serviceType="HOME_PHYSIO"
              value={slot}
              onChange={setSlot}
            />
          </div>
          <button
            type="button"
            onClick={() => act("schedule-session")}
            disabled={busy || !slot}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Confirm{slot ? ` ${formatDateLabel(slot.date)}, ${formatTimeLabel(slot.startTime)}` : ""}
          </button>
        </div>
      )}

      <p className="text-sm text-ink-500">
        Need help? Call our booking desk on{" "}
        <a href={`tel:${site.phone.booking}`} className="font-medium text-brand-700 hover:underline">
          {site.phone.booking}
        </a>{" "}
        or <Link href="/contact" className="font-medium text-brand-700 hover:underline">contact us</Link>.
      </p>
    </div>
  );
}
