import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Phone, CalendarDays, Download } from "lucide-react";
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
    include: {
      doctor: true,
      department: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!appointment) notFound();

  const awaitingPayment = appointment.status === "HOLD" && appointment.amountPaise > 0;
  const payment = appointment.payments[0] ?? null;
  const paid = payment?.status === "PAID";

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

        {appointment.serviceType === "OP" && appointment.tokenNumber !== null && (
          <div className="mt-7 flex items-center gap-5 rounded-xl border border-brand-200 bg-brand-50 p-5">
            <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <span className="font-display text-3xl font-bold tabular-nums">
                {appointment.tokenNumber}
              </span>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-ink-900">
                Your token number
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">
                Patients in this hour are seen in token order. Please arrive at
                the start of your window and wait to be called.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 rounded-xl bg-ink-50 p-5">
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
            {formatDateLabel(toDateKey(appointment.date))},{" "}
            {appointment.serviceType === "OP" ? (
              <>
                {formatTimeLabel(appointment.startTime)} –{" "}
                {formatTimeLabel(appointment.endTime)}
              </>
            ) : (
              formatTimeLabel(appointment.startTime)
            )}
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

        {paid && payment && (
          <section
            aria-labelledby="receipt"
            className="mt-8 overflow-hidden rounded-xl border border-ink-200 print:border-black"
          >
            <div className="flex items-center justify-between gap-3 border-b border-ink-200 bg-ink-50 px-5 py-3">
              <h2 id="receipt" className="font-display font-semibold text-ink-900">
                Payment receipt
              </h2>
              <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[--color-success]">
                Paid
              </span>
            </div>
            <dl className="divide-y divide-ink-100 px-5">
              <ReceiptRow label="Amount paid" value={`₹${(payment.amountPaise / 100).toLocaleString("en-IN")}`} />
              <ReceiptRow label="Payment ID" value={payment.paymentId ?? "—"} mono />
              <ReceiptRow label="Order ID" value={payment.orderId} mono />
              {payment.method && <ReceiptRow label="Method" value={payment.method.toUpperCase()} />}
              <ReceiptRow
                label="Paid on"
                value={payment.updatedAt.toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
            </dl>

            <div className="border-t border-ink-200 px-5 py-4">
              <a
                href={`/api/receipt/${appointment.ref}`}
                download={`MediSure-Receipt-${appointment.ref}.pdf`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <Download className="size-4" aria-hidden="true" />
                Download receipt (PDF)
              </a>
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
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

function ReceiptRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-6 py-3 text-sm">
      <dt className="text-ink-500">{label}</dt>
      <dd className={mono ? "text-right font-mono text-ink-900" : "text-right font-medium text-ink-900"}>
        {value}
      </dd>
    </div>
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
