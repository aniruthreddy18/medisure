import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { getSlots } from "@/lib/slots";
import { createHold, expireStaleHolds } from "@/lib/booking";
import { createPaymentOrder, confirmPaidOrder, failOrder } from "@/lib/payments";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { toDateKey } from "@/lib/time";

/**
 * Payment behaviour, against the real database.
 *
 * The rules being protected here are the ones that cost real money when they
 * break: a booking must not confirm without payment, a retried webhook must
 * not double-confirm or double-write, and a forged signature must never be
 * accepted.
 */

const DOCTOR_SLUG = "test-payments-doctor";
let doctorId: string;
let departmentId: string;

function futureDateKey(daysAhead: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return toDateKey(d);
}

async function cleanup() {
  await db.payment.deleteMany({ where: { appointment: { doctorId } } });
  await db.appointment.deleteMany({ where: { doctorId } });
}

beforeAll(async () => {
  const dept = await db.department.findFirst({ where: { slug: "orthopaedics" } });
  if (!dept) throw new Error("Seed the database first: npm run db:seed");
  departmentId = dept.id;

  const doctor = await db.doctor.upsert({
    where: { slug: DOCTOR_SLUG },
    update: {},
    create: {
      name: "Dr. Payment Fixture",
      slug: DOCTOR_SLUG,
      designation: "Test Fixture",
      qualifications: "N/A",
      opFeePaise: 65000,
      active: false,
    },
  });
  doctorId = doctor.id;

  await db.doctorSchedule.deleteMany({ where: { doctorId } });
  for (let day = 0; day <= 6; day++) {
    await db.doctorSchedule.create({
      data: {
        doctorId, serviceType: "OP", dayOfWeek: day,
        startTime: "09:00", endTime: "12:00", slotMinutes: 60, capacityPerHour: 10,
      },
    });
  }
});

beforeEach(cleanup);

afterAll(async () => {
  await cleanup();
  await db.doctorSchedule.deleteMany({ where: { doctorId } });
  await db.doctor.deleteMany({ where: { slug: DOCTOR_SLUG } });
  await db.$disconnect();
});

async function makeHeldBooking(dateKey: string, startTime = "09:00") {
  const appt = await createHold({
    serviceType: "OP", doctorId, departmentId, dateKey, startTime,
    patientName: "Payment Patient", phone: "+919000009001", amountPaise: 65000,
  });
  const order = await createPaymentOrder(
    { kind: "appointment", id: appt.id },
    appt.amountPaise,
  );
  return { appt, order };
}

describe("webhook signature", () => {
  const secret = "test_webhook_secret";
  const body = JSON.stringify({ event: "payment.captured", payload: {} });

  it("accepts a signature computed over the raw body", () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = secret;
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body, sig)).toBe(true);
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  it("rejects a forged signature", () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = secret;
    expect(verifyWebhookSignature(body, "deadbeef".repeat(8))).toBe(false);
    expect(verifyWebhookSignature(body, null)).toBe(false);
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  it("rejects a body that was altered after signing", () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = secret;
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    // This is exactly what re-serialising a parsed body can do.
    expect(verifyWebhookSignature(body + " ", sig)).toBe(false);
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });
});

describe("confirming a payment", () => {
  it("leaves the booking unconfirmed until payment arrives", async () => {
    const { appt } = await makeHeldBooking(futureDateKey(40));
    const stored = await db.appointment.findUnique({ where: { id: appt.id } });
    expect(stored?.status).toBe("HOLD");
    expect(stored?.holdExpiresAt).not.toBeNull();
  });

  it("confirms the booking and clears the hold when paid", async () => {
    const { appt, order } = await makeHeldBooking(futureDateKey(41));

    const result = await confirmPaidOrder({
      orderId: order.orderId,
      paymentId: "pay_test_0001",
    });

    expect(result.confirmed).toBe(true);
    expect(result.ref).toBe(appt.ref);

    const stored = await db.appointment.findUnique({ where: { id: appt.id } });
    expect(stored?.status).toBe("CONFIRMED");
    // Cleared so the expiry sweep can never cancel a paid booking.
    expect(stored?.holdExpiresAt).toBeNull();

    const payment = await db.payment.findUnique({ where: { orderId: order.orderId } });
    expect(payment?.status).toBe("PAID");
    expect(payment?.paymentId).toBe("pay_test_0001");
  });

  it("is idempotent when Razorpay retries the same webhook", async () => {
    const { appt, order } = await makeHeldBooking(futureDateKey(42));

    const first = await confirmPaidOrder({ orderId: order.orderId, paymentId: "pay_test_0002" });
    const second = await confirmPaidOrder({ orderId: order.orderId, paymentId: "pay_test_0002" });
    const third = await confirmPaidOrder({ orderId: order.orderId, paymentId: "pay_test_0002" });

    expect(first.alreadyDone).toBe(false);
    expect(second.alreadyDone).toBe(true);
    expect(third.alreadyDone).toBe(true);

    // Exactly one payment row, and the booking confirmed exactly once.
    const payments = await db.payment.findMany({ where: { appointmentId: appt.id } });
    expect(payments).toHaveLength(1);
    expect(payments[0].status).toBe("PAID");
  });

  it("reports nothing to confirm for an unknown order", async () => {
    const result = await confirmPaidOrder({
      orderId: "order_does_not_exist",
      paymentId: "pay_test_0003",
    });
    expect(result.confirmed).toBe(false);
  });
});

describe("failed payments", () => {
  it("keeps the place held so the patient can retry with another card", async () => {
    const dateKey = futureDateKey(43);
    const { appt, order } = await makeHeldBooking(dateKey);

    await failOrder(order.orderId, "Card declined");

    // A declined card is not an abandoned booking — Razorpay keeps the order
    // open for another attempt, so the place must survive.
    const stored = await db.appointment.findUnique({ where: { id: appt.id } });
    expect(stored?.status).toBe("HOLD");
    expect(stored?.slotLock).not.toBeNull();

    const payment = await db.payment.findUnique({ where: { orderId: order.orderId } });
    expect(payment?.status).toBe("FAILED");
    expect(payment?.failReason).toBe("Card declined");

    const after = await getSlots(doctorId, dateKey, "OP");
    expect(after.find((s) => s.startTime === "09:00")!.remaining).toBe(9);
  });

  it("still confirms if the retry succeeds after a failure", async () => {
    const { appt, order } = await makeHeldBooking(futureDateKey(45));
    await failOrder(order.orderId, "Card declined");

    const result = await confirmPaidOrder({
      orderId: order.orderId,
      paymentId: "pay_test_retry",
    });

    expect(result.confirmed).toBe(true);
    const stored = await db.appointment.findUnique({ where: { id: appt.id } });
    expect(stored?.status).toBe("CONFIRMED");
  });

  it("returns the place only when the hold expires unpaid", async () => {
    const dateKey = futureDateKey(46);
    const { appt, order } = await makeHeldBooking(dateKey);
    await failOrder(order.orderId, "Card declined");

    await db.appointment.update({
      where: { id: appt.id },
      data: { holdExpiresAt: new Date(Date.now() - 60_000) },
    });
    await expireStaleHolds();

    const after = await getSlots(doctorId, dateKey, "OP");
    expect(after.find((s) => s.startTime === "09:00")!.remaining).toBe(10);
  });

  it("never un-confirms a booking that was already paid", async () => {
    const { appt, order } = await makeHeldBooking(futureDateKey(44));
    await confirmPaidOrder({ orderId: order.orderId, paymentId: "pay_test_0004" });

    // A late "failed" event must not cancel a paid appointment.
    await failOrder(order.orderId, "Late failure event");

    const stored = await db.appointment.findUnique({ where: { id: appt.id } });
    expect(stored?.status).toBe("CONFIRMED");
  });
});
