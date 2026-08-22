import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCheckoutSignature } from "@medisure/backend/razorpay";
import { confirmPaidOrder } from "@medisure/backend/payments";

export const dynamic = "force-dynamic";

const schema = z.object({
  razorpay_order_id: z.string().min(4),
  razorpay_payment_id: z.string().min(4),
  razorpay_signature: z.string().min(4),
});

/**
 * Browser callback after Razorpay Checkout closes.
 *
 * This exists purely so the patient sees "confirmed" immediately instead of
 * waiting on webhook delivery. It is NOT the authority — the signature is
 * still verified server-side, and `confirmPaidOrder` is idempotent, so
 * whichever of this and the webhook arrives second changes nothing.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment response" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  if (
    !verifyCheckoutSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })
  ) {
    return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });
  }

  const result = await confirmPaidOrder({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!result.confirmed) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ confirmed: true, ref: result.ref });
}
