"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const MIN_LENGTH = 10;

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checked in the browser purely so the user finds out before submitting; the
  // server enforces the length rule regardless.
  const tooShort = next.length > 0 && next.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && next !== confirm;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort || mismatch) return;

    setBusy(true);
    setError(null);
    setDone(false);

    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not change the password.");
        return;
      }
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-ink-200 bg-white p-6">
      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {done && (
        <p className="flex items-center gap-2 rounded-xl border border-brand-300 bg-brand-50 p-4 text-sm text-brand-800">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          Password changed. Use the new one next time you sign in.
        </p>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">
          Current password<span className="text-emergency"> *</span>
        </span>
        <input
          type="password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="input"
          autoComplete="current-password"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">
          New password<span className="text-emergency"> *</span>
        </span>
        <input
          type="password"
          required
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="input"
          autoComplete="new-password"
        />
        <span className={tooShort ? "mt-1 block text-xs text-emergency" : "mt-1 block text-xs text-ink-500"}>
          At least {MIN_LENGTH} characters.
        </span>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">
          Confirm new password<span className="text-emergency"> *</span>
        </span>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input"
          autoComplete="new-password"
        />
        {mismatch && (
          <span className="mt-1 block text-xs text-emergency">
            These two do not match.
          </span>
        )}
      </label>

      <button
        type="submit"
        disabled={busy || tooShort || mismatch || !current || !next || !confirm}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {busy ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
