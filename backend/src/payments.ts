import "server-only";
import { db } from "./db";
import { createOrder } from "./razorpay";
import { appendBooking } from "./sheets";
import { toDateKey, formatTimeLabel } from "./time";

/**
 * Payment lifecycle.
 *
 * A booking is only ever CONFIRMED here — never by the browser. The browser
 * can lie, close the tab mid-redirect, or replay an old response; the webhook
 * is the money's own account of what happened. `confirmPaidOrder` is written
 * to be safe to call twice, because Razorpay retries deliveries and the
 * browser callback may arrive first.
 */

export type OrderTarget =
  | { kind: "appointment"; id: string }
  | { kind: "package"; id: string };

/** Create a gateway order for an appointment or a package purchase. */
export async function createPaymentOrder(
  target: OrderTarget,
  amountPaise: number,
  notes: Record<string, string> = {},
) {
  const order = await createOrder({
    amountPaise,
    receipt: `${target.kind}_${target.id}`.slice(0, 40),
    notes,
  });

  await db.payment.create({
    data: {
      orderId: order.orderId,
      amountPaise,
      status: "CREATED",
      appointmentId: target.kind === "appointment" ? target.id : null,
      packageBookingId: target.kind === "package" ? target.id : null,
    },
  });

  return order;
}

/**
 * Mark an order paid and confirm whatever it was paying for.
 *
 * Idempotent by design: `paymentId` is unique in the database, and an order
 * already marked PAID short-circuits. Calling this from both the webhook and
 * the browser callback is therefore safe and expected.
 */
export async function confirmPaidOrder(params: {
  orderId: string;
  paymentId: string;
  signature?: string | null;
  method?: string | null;
  rawPayload?: unknown;
}): Promise<{ confirmed: boolean; alreadyDone: boolean; ref?: string }> {
  const payment = await db.payment.findUnique({
    where: { orderId: params.orderId },
    include: {
      appointment: { include: { doctor: true, department: true } },
      packageBooking: { include: { package: true, doctor: true } },
    },
  });

  if (!payment) return { confirmed: false, alreadyDone: false };

  // Second delivery of the same event — do nothing and report success, so
  // Razorpay stops retrying.
  if (payment.status === "PAID") {
    return {
      confirmed: true,
      alreadyDone: true,
      ref: payment.appointment?.ref ?? payment.packageBooking?.ref,
    };
  }

  await db.payment.update({
    where: { id: payment.id },
    data: {
      paymentId: params.paymentId,
      signature: params.signature ?? null,
      method: params.method ?? null,
      status: "PAID",
      // Prisma distinguishes "SQL NULL" from "JSON null"; skip the field
      // entirely when there is no payload to store.
      ...(params.rawPayload ? { rawPayload: params.rawPayload as object } : {}),
    },
  });

  let ref: string | undefined;

  if (payment.appointment) {
    const appt = payment.appointment;
    await db.appointment.update({
      where: { id: appt.id },
      // Clearing holdExpiresAt takes it out of reach of the expiry sweep.
      data: { status: "CONFIRMED", holdExpiresAt: null },
    });
    ref = appt.ref;

    await appendBooking({
      bookedAt: new Date(),
      reference: appt.ref,
      orderId: params.orderId,
      doctorName: appt.doctor.name,
      department: appt.department?.name ?? null,
      patientName: appt.patientName,
      phone: appt.phone,
      date: toDateKey(appt.date),
      window: `${formatTimeLabel(appt.startTime)} – ${formatTimeLabel(appt.endTime)}`,
      tokenNumber: appt.tokenNumber,
      serviceType: appt.serviceType === "OP" ? "OP Consultation" : "Home Physiotherapy",
      amountRupees: payment.amountPaise / 100,
      status: "Paid",
    });
  }

  if (payment.packageBooking) {
    const pkg = payment.packageBooking;
    await db.packageBooking.update({
      where: { id: pkg.id },
      data: { status: "ACTIVE" },
    });

    // The first visit was held pending payment; release it into CONFIRMED.
    const first = await db.appointment.findFirst({
      where: { packageBookingId: pkg.id, status: "HOLD" },
      orderBy: { createdAt: "asc" },
    });
    if (first) {
      await db.appointment.update({
        where: { id: first.id },
        data: { status: "CONFIRMED", holdExpiresAt: null },
      });
      ref = first.ref;
    }

    await appendBooking({
      bookedAt: new Date(),
      reference: pkg.ref,
      orderId: params.orderId,
      doctorName: pkg.doctor?.name ?? "Unassigned",
      department: "Physiotherapy",
      patientName: pkg.patientName,
      phone: pkg.phone,
      date: first ? toDateKey(first.date) : "",
      window: first ? `${formatTimeLabel(first.startTime)} – ${formatTimeLabel(first.endTime)}` : "",
      tokenNumber: null,
      serviceType: `Package — ${pkg.package.name}`,
      amountRupees: payment.amountPaise / 100,
      status: "Paid",
    });
  }

  return { confirmed: true, alreadyDone: false, ref };
}

/**
 * Record a failed payment attempt — WITHOUT giving the place away.
 *
 * A declined card is not an abandoned booking. Razorpay keeps the order open
 * so the patient can try again with another card or UPI app, and cancelling on
 * the first failure would delete their held place in the middle of that retry.
 *
 * The place is released by exactly one thing: the hold expiring because nobody
 * paid within the window. That is handled by the expiry sweep, which also
 * covers patients who simply close the tab.
 */
export async function failOrder(orderId: string, reason?: string) {
  const payment = await db.payment.findUnique({ where: { orderId } });
  if (!payment || payment.status === "PAID") return;

  await db.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED", failReason: reason ?? null },
  });
}
