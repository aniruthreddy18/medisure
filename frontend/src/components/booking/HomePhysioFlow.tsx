"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ArrowLeft, AlertCircle, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { useRazorpayCheckout } from "@/components/booking/useRazorpayCheckout";
import { OtpStep } from "@/components/booking/OtpStep";
import { formatDateLabel, formatTimeLabel } from "@medisure/backend/time";

type Physio = {
  id: string;
  name: string;
  slug: string;
  designation: string;
  experienceYears: number | null;
  languages: string[];
  homeVisitFeePaise: number | null;
};

type Pkg = {
  id: string;
  name: string;
  slug: string;
  sessionCount: number;
  pricePaise: number;
  validityDays: number;
  ctaMode: "BUY" | "ENQUIRE";
};

const STEPS = ["Where", "Package", "Physiotherapist", "First visit", "Your details"] as const;

/**
 * Home physiotherapy booking.
 *
 * Differs from the OP flow in three ways that matter:
 *  - address comes first, because serviceability decides everything after it
 *  - the patient buys a package, then schedules only the FIRST visit here;
 *    remaining sessions are scheduled later from /manage
 *  - ENQUIRE packages never reach payment — they raise an enquiry instead
 */
export function HomePhysioFlow({
  packages,
  physios,
  initialPackage,
  initialDoctor,
}: {
  packages: Pkg[];
  physios: Physio[];
  initialPackage?: string;
  initialDoctor?: string;
}) {
  const router = useRouter();
  const openCheckout = useRazorpayCheckout();

  const prePkg = packages.find((p) => p.slug === initialPackage) ?? null;
  const prePhysio = physios.find((p) => p.slug === initialDoctor) ?? null;

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    addressLine: "",
    area: "",
    pincode: "",
    landmark: "",
  });
  const [pkg, setPkg] = useState<Pkg | null>(prePkg);
  const [physio, setPhysio] = useState<Physio | null>(prePhysio);
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

  const [verification, setVerification] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const addressValid =
    address.addressLine.trim().length > 4 && /^\d{6}$/.test(address.pincode.trim());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!physio || !slot) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "HOME_PHYSIO",
          doctorId: physio.id,
          date: slot.date,
          startTime: slot.startTime,
          patientName: form.patientName,
          phone: form.phone,
          email: form.email || null,
          age: form.age ? Number(form.age) : null,
          gender: form.gender || null,
          notes: form.notes || null,
          addressLine: address.addressLine,
          area: address.area || null,
          pincode: address.pincode,
          landmark: address.landmark || null,
          consent: form.consent,
          verificationToken: verification,
          // Charges the package price, not the per-visit fee, and creates the
          // PackageBooking the remaining sessions hang off.
          packageSlug: pkg?.slug ?? null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        if (json.fields) setFieldErrors(json.fields);
        if (res.status === 409) {
          setSlot(null);
          setStep(3);
        }
        return;
      }

      // Nothing to pay (a session inside an already-paid package).
      if (!json.requiresPayment || !json.payment) {
        router.push(`/book/success/${json.ref}`);
        return;
      }

      const outcome = await openCheckout({
        order: json.payment,
        patientName: form.patientName,
        phone: form.phone,
        email: form.email || null,
        description: "Home physiotherapy",
      });

      if (outcome.status === "failed") {
        setError(outcome.message);
        return;
      }
      if (outcome.status === "pending" && outcome.reason === "stub") {
        setError(
          "No payment gateway is connected yet, so there is nothing to redirect to. " +
            "Add your Razorpay keys to .env and restart. The booking is held but unpaid.",
        );
        return;
      }
      if (outcome.status === "dismissed") {
        // The place is still held for a few minutes, so let them retry rather
        // than losing it.
        setError(
          "Payment was not completed. Your place is held for a few more minutes — try again.",
        );
        return;
      }

      // Paid, or pending while the gateway settles. Either way the
      // confirmation page reads the real status from the database.
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
        <ol className="mb-8 flex flex-wrap gap-x-2 gap-y-2 text-sm" aria-label="Booking steps">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-semibold",
                  i < step ? "bg-brand-700 text-white" : i === step ? "bg-accent-500 text-white" : "bg-ink-100 text-ink-500",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn(i === step ? "font-semibold text-brand-900" : "text-ink-500")}>{label}</span>
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
          <p role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Step 1 — address */}
        {step === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (addressValid) setStep(1);
            }}
          >
            <h2 className="font-display text-xl font-bold text-brand-950">
              Where should the physiotherapist visit?
            </h2>
            <p className="mt-1.5 text-ink-600">
              We check that your area is covered before you pay for anything.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">
                  Address <span className="text-emergency">*</span>
                </span>
                <textarea
                  required
                  rows={2}
                  value={address.addressLine}
                  onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                  className="input"
                  placeholder="Flat / house number, building, street"
                  autoComplete="street-address"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Area / locality</span>
                <input
                  type="text"
                  value={address.area}
                  onChange={(e) => setAddress({ ...address, area: e.target.value })}
                  className="input"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">
                  Pincode <span className="text-emergency">*</span>
                </span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  pattern="\d{6}"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })}
                  className="input"
                  autoComplete="postal-code"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Landmark (optional)</span>
                <input
                  type="text"
                  value={address.landmark}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  className="input"
                  placeholder="Helps our physiotherapist find you faster"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={!addressValid}
              className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-accent-500 px-7 font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
            >
              Continue
            </button>
          </form>
        )}

        {/* Step 2 — package */}
        {step === 1 && (
          <fieldset>
            <legend className="font-display text-xl font-bold text-brand-950">
              Choose a package
            </legend>
            <p className="mt-1.5 text-ink-600">
              Pay once, then book each session when it suits you.
            </p>
            <div className="mt-5 grid gap-3">
              {packages
                .filter((p) => p.ctaMode === "BUY")
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPkg(p);
                      setStep(2);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-4 rounded-xl border p-5 text-left transition-colors",
                      pkg?.id === p.id
                        ? "border-accent-500 bg-accent-50"
                        : "border-border bg-white hover:border-brand-400 hover:bg-brand-50",
                    )}
                  >
                    <span>
                      <span className="block font-display font-semibold text-brand-900">{p.name}</span>
                      <span className="mt-0.5 block text-sm text-ink-600">
                        {p.sessionCount} {p.sessionCount === 1 ? "session" : "sessions"} · valid {p.validityDays} days
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-display text-lg font-bold text-brand-900">
                        ₹{(p.pricePaise / 100).toLocaleString("en-IN")}
                      </span>
                      {p.sessionCount > 1 && (
                        <span className="text-xs text-ink-500">
                          ≈ ₹{Math.round(p.pricePaise / p.sessionCount / 100).toLocaleString("en-IN")}/session
                        </span>
                      )}
                    </span>
                  </button>
                ))}
            </div>
          </fieldset>
        )}

        {/* Step 3 — physio */}
        {step === 2 && (
          <fieldset>
            <legend className="font-display text-xl font-bold text-brand-950">
              Choose your physiotherapist
            </legend>
            <p className="mt-1.5 text-ink-600">
              The same physiotherapist will see you through the whole package.
            </p>
            <div className="mt-5 grid gap-3">
              {physios.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPhysio(p);
                    setSlot(null);
                    setStep(3);
                  }}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-5 text-left transition-colors hover:border-brand-400 hover:bg-brand-50"
                >
                  <span>
                    <span className="block font-display font-semibold text-brand-900">{p.name}</span>
                    <span className="mt-0.5 block text-sm text-ink-600">{p.designation}</span>
                    <span className="mt-1 block text-sm text-ink-500">
                      {p.experienceYears !== null && `${p.experienceYears}+ years · `}
                      speaks {p.languages.slice(0, 3).join(", ")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 4 — first visit */}
        {step === 3 && physio && (
          <div>
            <h2 className="font-display text-xl font-bold text-brand-950">
              Book your first visit
            </h2>
            <p className="mt-1.5 text-ink-600">
              You only schedule the first session now. The rest you can book as
              you go, from your booking page.
            </p>
            <div className="mt-6">
              <SlotPicker
                doctorId={physio.id}
                serviceType="HOME_PHYSIO"
                value={slot}
                onChange={(v) => {
                  setSlot(v);
                  setStep(4);
                }}
              />
            </div>
          </div>
        )}

        {/* Step 5 — details */}
        {step === 4 && physio && slot && (
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
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">
                  Patient&apos;s full name <span className="text-emergency">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  className="input"
                  autoComplete="name"
                />
                {fieldErrors.patientName?.[0] && (
                  <span className="mt-1 block text-sm text-emergency">{fieldErrors.patientName[0]}</span>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">Age</span>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="input"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">
                  What are we treating? (optional)
                </span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input"
                  placeholder="e.g. knee replacement six weeks ago, difficulty climbing stairs"
                />
              </label>
            </div>

            <label className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-ink-50 p-4">
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-1 size-4 shrink-0 accent-brand-700"
              />
              <span className="text-sm leading-relaxed text-ink-700">
                I agree to be contacted about this booking by SMS, call, email or
                WhatsApp, and I accept the privacy policy.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 font-semibold text-white hover:bg-accent-600 disabled:opacity-60 sm:w-auto"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Reserving your visit…" : "Confirm & continue to payment"}
            </button>
            </>
            )}
          </form>
        )}
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-brand-700">
            <HomeIcon className="size-4" aria-hidden="true" />
            Your home visit
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Pincode" value={address.pincode || undefined} />
            <Row label="Package" value={pkg?.name} />
            <Row label="Physiotherapist" value={physio?.name} />
            <Row
              label="First visit"
              value={slot ? `${formatDateLabel(slot.date)}, ${formatTimeLabel(slot.startTime)}` : undefined}
            />
          </dl>

          {pkg && (
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-600">Package total</span>
                <span className="font-display text-xl font-bold text-brand-900">
                  ₹{(pkg.pricePaise / 100).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-500">
                Covers {pkg.sessionCount} {pkg.sessionCount === 1 ? "session" : "sessions"}.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className={value ? "text-right font-medium text-ink-900" : "text-right text-ink-400"}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
