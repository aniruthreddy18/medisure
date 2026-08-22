import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@medisure/backend/razorpay";
import { confirmPaidOrder, failOrder } from "@medisure/backend/payments";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — the only thing that confirms a booking.
 *
 * The browser never gets to say a booking is paid: patients close tabs, lose
 * signal mid-redirect, and can trivially forge a success callback. This
 * endpoint hears it from the money itself.
 *
 * The body is read as RAW TEXT and the signature checked before any parsing.
 * Verifying a re-serialised object is the classic cause of signature
 * mismatches in production.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[razorpay] rejected webhook with invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: Record<string, unknown> } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  const orderId = entity?.order_id as string | undefined;
  const paymentId = entity?.id as string | undefined;

  if (!orderId || !paymentId) {
    // Acknowledge events we do not act on, so Razorpay stops retrying them.
    return NextResponse.json({ ok: true, ignored: event.event ?? "unknown" });
  }

  try {
    if (event.event === "payment.failed") {
      await failOrder(orderId, String(entity?.error_description ?? "Payment failed"));
      return NextResponse.json({ ok: true, outcome: "failed" });
    }

    const result = await confirmPaidOrder({
      orderId,
      paymentId,
      method: (entity?.method as string) ?? null,
      rawPayload: event,
    });

    return NextResponse.json({
      ok: true,
      outcome: result.alreadyDone ? "already_confirmed" : "confirmed",
      ref: result.ref,
    });
  } catch (error) {
    console.error("[razorpay] webhook processing failed", error);
    // 500 makes Razorpay retry, which is what we want for a transient fault.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
