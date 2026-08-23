"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  designation: string;
  qualifications: string;
  experienceYears: number | null;
  regNumber: string | null;
  languages: string[];
  bio: string | null;
  opFeePaise: number;
  homeVisitFeePaise: number | null;
  offersHomePhysio: boolean;
  active: boolean;
};

export function DoctorForm({ doctor }: { doctor: Doctor }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: doctor.name,
    designation: doctor.designation,
    qualifications: doctor.qualifications,
    // Fees are stored in paise; staff think in rupees.
    experienceYears: doctor.experienceYears?.toString() ?? "",
    regNumber: doctor.regNumber ?? "",
    languages: doctor.languages.join(", "),
    bio: doctor.bio ?? "",
    opFee: (doctor.opFeePaise / 100).toString(),
    homeVisitFee: doctor.homeVisitFeePaise ? (doctor.homeVisitFeePaise / 100).toString() : "",
    offersHomePhysio: doctor.offersHomePhysio,
    active: doctor.active,
  });

  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not save.");
        return;
      }
      setSaved(true);
      router.refresh();
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
      {saved && (
        <p className="flex items-center gap-2 rounded-xl border border-brand-300 bg-brand-50 p-4 text-sm text-brand-800">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          Saved. The website updates within a few minutes.
        </p>
      )}

      <Field label="Full name" required>
        <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>

      <Field label="Designation" required hint="e.g. Orthopaedic &amp; Spine Surgeon">
        <input
          className="input"
          required
          value={form.designation}
          onChange={(e) => set("designation", e.target.value)}
        />
      </Field>

      <Field label="Qualifications" required hint="Shown under the name, e.g. MBBS, MS (Ortho)">
        <input
          className="input"
          required
          value={form.qualifications}
          onChange={(e) => set("qualifications", e.target.value)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Years of experience" hint="Leave blank if not known">
          <input
            className="input"
            type="number"
            min={0}
            max={70}
            value={form.experienceYears}
            onChange={(e) => set("experienceYears", e.target.value)}
          />
        </Field>

        <Field label="Registration number">
          <input className="input" value={form.regNumber} onChange={(e) => set("regNumber", e.target.value)} />
        </Field>
      </div>

      <Field label="Languages" hint="Separated by commas, e.g. English, Telugu, Hindi">
        <input className="input" value={form.languages} onChange={(e) => set("languages", e.target.value)} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Consultation fee (₹)" required>
          <input
            className="input"
            type="number"
            min={0}
            required
            value={form.opFee}
            onChange={(e) => set("opFee", e.target.value)}
          />
        </Field>

        <Field label="Home visit fee (₹)" hint="Leave blank if not offered">
          <input
            className="input"
            type="number"
            min={0}
            value={form.homeVisitFee}
            onChange={(e) => set("homeVisitFee", e.target.value)}
          />
        </Field>
      </div>

      <Field label="About this doctor" hint="Optional. Shown on their page.">
        <textarea
          className="input"
          rows={4}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </Field>

      <label className="flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4">
        <input
          type="checkbox"
          checked={form.offersHomePhysio}
          onChange={(e) => set("offersHomePhysio", e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-brand-700"
        />
        <span className="text-sm text-ink-700">
          <span className="font-medium text-ink-900">Available for home visits</span>
          <span className="mt-0.5 block text-ink-600">
            Shows this doctor on the home physiotherapy page.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-brand-700"
        />
        <span className="text-sm text-ink-700">
          <span className="font-medium text-ink-900">Show on the website</span>
          <span className="mt-0.5 block text-ink-600">
            Uncheck to hide this doctor without deleting them — existing
            appointments are not affected.
          </span>
        </span>
      </label>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-emergency"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}
