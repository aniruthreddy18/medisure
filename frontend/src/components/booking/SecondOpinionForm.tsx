"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Check } from "lucide-react";
import { OtpStep } from "@/components/booking/OtpStep";

export function SecondOpinionForm({
  departments,
}: {
  departments: { slug: string; name: string }[];
}) {
  const [verification, setVerification] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    departmentSlug: "",
    description: "",
    consent: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/second-opinion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, verificationToken: verification }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-300 bg-brand-50 p-8">
        <CheckCircle2 className="size-8 text-brand-700" aria-hidden="true" />
        <h2 className="mt-4 font-display text-xl font-bold text-brand-950">
          We have your request
        </h2>
        <p className="mt-2 text-ink-700">
          One of our consultants will call you on {form.phone} within one working
          day. There is no charge for this.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && (
        <p role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {!verification ? (
        <OtpStep
          phone={form.phone}
          onPhoneChange={(v) => setForm({ ...form, phone: v })}
          onVerified={(token, phone) => {
            setVerification(token);
            setForm((f) => ({ ...f, phone }));
          }}
        />
      ) : (
        <>
          <p className="inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
            <Check className="size-4" aria-hidden="true" />
            {form.phone} verified
          </p>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">
                Your name <span className="text-emergency">*</span>
              </span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                autoComplete="name"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Email (optional)</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">
                Which speciality is this about?
              </span>
              <select
                value={form.departmentSlug}
                onChange={(e) => setForm({ ...form, departmentSlug: e.target.value })}
                className="input"
              >
                <option value="">I&apos;m not sure</option>
                {departments.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">
                What have you been told so far? <span className="text-emergency">*</span>
              </span>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input"
                placeholder="e.g. I was told I need a knee replacement. I am 54 and can still walk short distances without pain."
              />
            </label>
          </div>

          <label className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-ink-50 p-4">
            <input
              type="checkbox"
              required
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-1 size-4 shrink-0 accent-brand-700"
            />
            <span className="text-sm leading-relaxed text-ink-700">
              I agree to be contacted about this request, and I understand this
              is not a diagnosis or a substitute for an in-person consultation.
            </span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 font-semibold text-white hover:bg-accent-600 disabled:opacity-60 sm:w-auto"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Request a second opinion
          </button>
        </>
      )}
    </form>
  );
}
