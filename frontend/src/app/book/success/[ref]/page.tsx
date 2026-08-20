import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Phone, CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { db } from "@medisure/backend/db";
import { site } from "@medisure/backend/site";
import { formatDateLabel, formatTimeLabel, toDateKey } from "@medisure/backend/time";
import { formatPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false, follow: false }, // never index a patient's booking
};

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const appointment = await db.appointment.findUnique({
    where: { ref },
    include: { doctor: true, department: true },
  });

  if (!appointment) notFound();

  const awaitingPayment = appointment.status === "HOLD" && appointment.amountPaise > 0;

  return (
    <Container className="max-w-2xl py-14 lg:py-20">
      <div className="rounded-2xl border border-border bg-white p-8">
        <div className="flex items-start gap-4">
          <span
            className={
              awaitingPayment
                ? "grid size-12 shrink-0 place-items-center rounded-full bg-accent-100 text-accent-600"
                : "grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700"
            }
          >
            {awaitingPayment ? (
              <Clock className="size-6" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-6" aria-hidden="true" />
            )}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-brand-950">
              {awaitingPayment ? "Slot reserved — payment pending" : "Your appointment is confirmed"}
            </h1>
            <p className="mt-2 text-ink-600">
              {awaitingPayment
                ? `We are holding this slot for you. Complete the payment to confirm it — otherwise it will be released automatically.`
                : "We have sent the details to your mobile number."}
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-xl bg-brand-50 p-5">
          <p className="text-sm text-ink-600">Booking reference</p>
          <p className="mt-1 font-display text-2xl font-bold tracking-wide text-brand-900">
            {appointment.ref}
          </p>
          <p className="mt-2 text-sm text-ink-600">
            Keep this to reschedule or cancel later.
          </p>
        </div>

        <dl className="mt-7 space-y-4">
          <Row icon={CalendarDays} label="When">
            {formatDateLabel(toDateKey(appointment.date))} at {formatTimeLabel(appointment.startTime)}
          </Row>
          <Row icon={CheckCircle2} label="Doctor">
            {appointment.doctor.name}
            {appointment.department && ` · ${appointment.department.name}`}
          </Row>
          <Row icon={MapPin} label={appointment.serviceType === "OP" ? "Where" : "Visit address"}>
            {appointment.serviceType === "OP" ? (
              <>
                {site.name}, {site.address.street}, {site.address.locality},{" "}
                {site.address.city} {site.address.postalCode}
              </>
            ) : (
              <>
                {appointment.addressLine}
                {appointment.area && `, ${appointment.area}`} — {appointment.pincode}
              </>
            )}
          </Row>
          {appointment.amountPaise > 0 && (
            <Row icon={Clock} label="Amount">
              ₹{(appointment.amountPaise / 100).toLocaleString("en-IN")}
            </Row>
          )}
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/manage/${appointment.ref}`}
            className="inline-flex min-h-12 items-center rounded-xl border border-brand-700 px-6 font-semibold text-brand-800 hover:bg-brand-50"
          >
            Manage this booking
          </Link>
          <a
            href={`tel:${site.phone.booking}`}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-6 font-semibold text-ink-700 hover:bg-ink-50"
          >
            <Phone className="size-4" aria-hidden="true" />
            {formatPhone(site.phone.booking)}
          </a>
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-ink-500">
        Please arrive 15 minutes early and bring any previous prescriptions,
        scans or reports relating to this problem.
      </p>
    </Container>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
      <div>
        <dt className="text-sm text-ink-500">{label}</dt>
        <dd className="mt-0.5 font-medium text-ink-900">{children}</dd>
      </div>
    </div>
  );
}
