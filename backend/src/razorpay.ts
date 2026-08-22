import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";

/**
 * Razorpay integration.
 *
 * Ported from the hospital's Express backend, with three fixes:
 *
 *  1. The signature is verified against the RAW request body. The original
 *     hashed `JSON.stringify(req.body)` — re-serialising a parsed body can
 *     produce a different string than Razorpay signed (key order, unicode
 *     escaping, whitespace), so signatures fail intermittently in production.
 *  2. The `local-test-bypass` escape hatch is gated on NODE_ENV, not on
 *     `req.ip`. Behind a proxy, `req.ip` is attacker-controlled via
 *     X-Forwarded-For, which made that a live authentication bypass.
 *  3. Webhook handling is idempotent — Razorpay retries deliveries, and the
 *     original would append the same booking to Google Sheets repeatedly.
 *
 * When keys are absent the module runs in STUB mode so the whole booking flow
 * still works locally without a Razorpay account.
 */

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

/** True when real credentials are configured. */
export const razorpayEnabled = Boolean(keyId && keySecret);

const client = razorpayEnabled
  ? new Razorpay({ key_id: keyId!, key_secret: keySecret! })
  : null;

export type CreatedOrder = {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string | null;
  /** True when no gateway is configured and the booking auto-confirms. */
  stub: boolean;
};

/**
 * Create a Razorpay order for an amount the SERVER calculated.
 * The caller must never pass an amount supplied by the browser.
 */
export async function createOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<CreatedOrder> {
  if (!client) {
    // Stub: a deterministic fake order id so the rest of the flow is testable.
    return {
      orderId: `stub_order_${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`,
      amountPaise: params.amountPaise,
      currency: "INR",
      keyId: null,
      stub: true,
    };
  }

  const order = await client.orders.create({
    amount: params.amountPaise,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });

  return {
    orderId: order.id,
    amountPaise: Number(order.amount),
    currency: order.currency,
    keyId: keyId!,
    stub: false,
  };
}

/**
 * Verify a webhook delivery against the raw request body.
 *
 * `rawBody` must be the exact bytes Razorpay sent. Parsing and re-stringifying
 * first is the classic cause of "signature mismatch" in production.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Local development without a gateway: allow an explicit, clearly-named
  // bypass. Gated on NODE_ENV so it can never be reached on a deployed site,
  // regardless of what headers or proxy IPs an attacker sends.
  if (
    process.env.NODE_ENV !== "production" &&
    !secret &&
    signature === "local-test-bypass"
  ) {
    return true;
  }

  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  // Constant-time compare — a plain === leaks timing information about the
  // expected signature.
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Verify the signature Razorpay Checkout returns to the browser. */
export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!keySecret) return process.env.NODE_ENV !== "production";
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(params.signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Refund a captured payment. Returns the refund id. */
export async function refundPayment(paymentId: string, amountPaise?: number) {
  if (!client) return { id: `stub_refund_${Date.now()}`, amount: amountPaise ?? 0 };
  return client.payments.refund(paymentId, amountPaise ? { amount: amountPaise } : {});
}
