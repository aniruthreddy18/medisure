"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { OtpStep } from "@/components/booking/OtpStep";
import { formatDateLabel, formatTimeLabel } from "@medisure/backend/time";

type Doctor = {
  id: string;
  name: string;
  slug: string;
  designation: string;
  experienceYears: number;
  opFeePaise: number;
  departments: { department: { id: string; name: string; slug: string } }[];
};

type Department = { id: string; name: string; slug: string };

const STEPS = ["Speciality", "Doctor", "Date & time", "Your details"] as const;

export function OpBookingFlow({
  departments,
  doctors,
  initialDepartment,
  initialDoctor,
}: {
  departments: Department[];
  doctors: Doctor[];
  initialDepartment?: string;
  initialDoctor?: string;
}) {
  const router = useRouter();

  const preDoctor = doctors.find((d) => d.slug === initialDoctor) ?? null;
  const preDept =
    departments.find((d) => d.slug === initialDepartment) ??
    (preDoctor ? preDoctor.departments[0]?.department ?? null : null);

  const [step, setStep] = useState(preDoctor ? 2 : preDept ? 1 : 0);
  const [dept, setDept] = useState<Department | null>(preDept);
  const [doctor, setDoctor] = useState<Doctor | null>(preDoctor);
  const [slot, setSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);

  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    notes: "",
    consent: false,
  });

  // Set once the mobile number is verified; the API refuses bookings without it.
  const [verification, setVerification] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const visibleDoctors = dept
    ? doctors.filter((d) => d.departments.some((x) => x.department.id === dept.id))
    : doctors;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!doctor || !slot) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "OP",
          doctorId: doctor.id,
          departmentId: dept?.id ?? null,
          date: slot.date,
          startTime: slot.startTime,
          patientName: form.patientName,
          phone: form.phone,
          email: form.email || null,
          age: form.age ? Number(form.age) : null,
          gender: form.gender || null,
          notes: form.notes || null,
          consent: form.consent,
          verificationToken: verification,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        if (json.fields) setFieldErrors(json.fields);
        // A 409 means someone else took the slot while this form was open —
        // send the patient back to pick another time rather than leaving them
        // staring at an error on a dead slot.
        if (res.status === 409) {
          setSlot(null);
          setStep(2);
        }
        return;
      }

      router.push(`/book/success/${json.ref}`);
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div>
        {/* Progress */}
        <ol className="mb-8 flex flex-wrap gap-x-2 gap-y-2 text-sm" aria-label="Booking steps">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-semibold",
                  i < step
                    ? "bg-brand-700 text-white"
                    : i === step
                      ? "bg-accent-500 text-white"
                      : "bg-ink-100 text-ink-500",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn(i === step ? "font-semibold text-brand-900" : "text-ink-500")}>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="mx-1 text-ink-300" aria-hidden="true">›</span>}
            </li>
          ))}
        </ol>

        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </button>
        )}

        {error && (
          <p
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Step 1 — speciality */}
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-xl font-bold text-brand-950">
              Which speciality do you need?
            </legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {departments.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDept(d);
                    setDoctor(null);
                    setStep(1);
                  }}
                  className="rounded-xl border border-border bg-white p-5 text-left transition-colors hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="font-display font-semibold text-brand-900">{d.name}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 2 — doctor */}
        {step === 1 && (
          <fieldset>
            <legend className="font-display text-xl font-bold text-brand-950">
              Choose your doctor
            </legend>
            <div className="mt-5 grid gap-3">
              {visibleDoctors.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDoctor(d);
                    setSlot(null);
                    setStep(2);
                  }}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-5 text-left transition-colors hover:border-brand-400 hover:bg-brand-50"
                >
                  <span>
                    <span className="block font-display font-semibold text-brand-900">{d.name}</span>
                    <span className="mt-0.5 block text-sm text-ink-600">{d.designation}</span>
                    <span className="mt-1 block text-sm text-ink-500">
                      {d.experienceYears}+ years experience
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-semibold text-brand-900">
                      ₹{(d.opFeePaise / 100).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-ink-500">consultation</span>
                  </span>
                </button>
              ))}
              {visibleDoctors.length === 0 && (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-ink-600">
                  No doctors listed for this speciality yet.
                </p>
              )}
            </div>
          </fieldset>
        )}

        {/* Step 3 — slot */}
        {step === 2 && doctor && (
          <div>
            <h2 className="font-display text-xl font-bold text-brand-950">
              Pick a date and time
            </h2>
            <p className="mt-1.5 text-ink-600">
              Showing live availability for {doctor.name}.
            </p>
            <div className="mt-6">
              <SlotPicker
                doctorId={doctor.id}
                serviceType="OP"
                value={slot}
                onChange={(v) => {
                  setSlot(v);
                  setStep(3);
                }}
              />
            </div>
          </div>
        )}

        {/* Step 4 — details */}
        {step === 3 && doctor && slot && (
          <form onSubmit={submit} noValidate>
            <h2 className="font-display text-xl font-bold text-brand-950">Patient details</h2>

            {!verification ? (
              <div className="mt-5">
                <OtpStep
                  phone={form.phone}
                  onPhoneChange={(v) => setForm({ ...form, phone: v })}
                  onVerified={(token, phone) => {
                    setVerification(token);
                    setForm((f) => ({ ...f, phone }));
                  }}
                />
              </div>
            ) : (
            <>
            <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
              <Check className="size-4" aria-hidden="true" />
              {form.phone} verified
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Patient's full name"
                required
                error={fieldErrors.patientName?.[0]}
                className="sm:col-span-2"
              >
                <input
                  type="text"
                  required
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  className="input"
                  autoComplete="name"
                />
              </Field>

              <Field label="Email (optional)" error={fieldErrors.email?.[0]} className="sm:col-span-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  autoComplete="email"
                />
              </Field>

              <Field label="Age" error={fieldErrors.age?.[0]}>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="input"
                />
              </Field>

              <Field label="Gender">
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="input"
                >
                  <option value="">Prefer not to say</option>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>

              <Field label="Reason for visit (optional)" className="sm:col-span-2">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input"
                  placeholder="Briefly describe your symptoms or the reason for this appointment."
                />
                <p className="mt-1.5 text-xs text-ink-500">
                  Please do not enter full medical reports here. Bring them to your appointment.
                </p>
              </Field>
            </div>

            {/* Explicit consent — recorded, not assumed. */}
            <label className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-ink-50 p-4">
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-1 size-4 shrink-0 accent-brand-700"
              />
              <span className="text-sm leading-relaxed text-ink-700">
                I agree to be contacted about this appointment by SMS, call, email
                or WhatsApp, and I accept the privacy policy.
                {fieldErrors.consent?.[0] && (
                  <span className="mt-1 block text-emergency">{fieldErrors.consent[0]}</span>
                )}
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-60 sm:w-auto"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Reserving your slot…" : "Confirm & continue to payment"}
            </button>
            </>
            )}
          </form>
        )}
      </div>

      {/* Summary rail */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-brand-700">
            Your appointment
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <SummaryRow label="Speciality" value={dept?.name} />
            <SummaryRow label="Doctor" value={doctor?.name} />
            <SummaryRow
              label="When"
              value={
                slot
                  ? `${formatDateLabel(slot.date)}, ${formatTimeLabel(slot.startTime)}`
                  : undefined
              }
            />
          </dl>

          {doctor && (
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-600">Consultation fee</span>
                <span className="font-display text-xl font-bold text-brand-900">
                  ₹{(doctor.opFeePaise / 100).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          <p className="mt-5 text-xs leading-relaxed text-ink-500">
            Your slot is held for a few minutes while you complete payment. If
            payment is not completed, the slot is released automatically.
          </p>
        </div>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className={value ? "text-right font-medium text-ink-900" : "text-right text-ink-400"}>
        {value ?? "—"}
      </dd>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-emergency"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-emergency">{error}</span>}
    </label>
  );
}
