"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, RotateCcw } from "lucide-react";

/**
 * Verify the patient's mobile before taking any other details.
 *
 * On success the parent receives a short-lived token which the booking
 * endpoint requires. The number is verified server-side, so the booking is
 * always made against the number that actually received the code.
 */
export function OtpStep({
  phone,
  onPhoneChange,
  onVerified,
}: {
  phone: string;
  onPhoneChange: (v: string) => void;
  onVerified: (token: string, phone: string) => void;
}) {
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not send the code.");
        return;
      }
      setDevCode(json.devCode ?? null);
      setStage("code");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not verify the code.");
        return;
      }
      onVerified(json.token, phone);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-brand-950">
        <ShieldCheck className="size-5 text-brand-600" aria-hidden="true" />
        Verify your mobile number
      </h3>
      <p className="mt-1.5 text-sm text-ink-600">
        We send appointment reminders and any changes to this number.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-emergency/30 bg-emergency/5 p-3 text-sm text-emergency">
          {error}
        </p>
      )}

      {stage === "phone" ? (
        <div className="mt-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">
              Mobile number <span className="text-emergency">*</span>
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ""))}
              className="input"
              placeholder="10-digit mobile"
              autoComplete="tel"
            />
          </label>

          <button
            type="button"
            onClick={send}
            disabled={busy || phone.replace(/\D/g, "").length !== 10}
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-700 px-6 font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Send code
          </button>

          <p className="mt-3 text-xs leading-relaxed text-ink-500">
            By requesting a code you agree to receive messages from us about this
            booking by SMS, call or WhatsApp.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          {devCode && (
            <p className="mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-3 text-sm text-brand-800">
              Development mode — no SMS was sent. Your code is{" "}
              <strong className="font-mono tracking-widest">{devCode}</strong>
            </p>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">
              Enter the 6-digit code sent to {phone}
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="input font-mono text-lg tracking-[0.4em]"
              autoComplete="one-time-code"
              autoFocus
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={verify}
              disabled={busy || code.length !== 6}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Verify
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("phone");
                setCode("");
                setDevCode(null);
              }}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-5 font-medium text-ink-700 hover:bg-ink-50"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Change number
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
