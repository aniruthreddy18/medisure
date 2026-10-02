import { NextResponse } from "next/server";
import { addReview, reviewInput } from "@medisure/backend/reviews";

export const dynamic = "force-dynamic";

/**
 * POST /api/reviews — leave a review.
 *
 * Open to anyone, by design: requiring an account to say thank you loses most
 * of the thank-yous. A thin adapter, like the other routes here — it parses,
 * delegates and translates the error. Every rule about what a review may
 * contain lives in the backend package.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = reviewInput.safeParse(body);
  if (!parsed.success) {
    // Show the reviewer the first thing that is actually wrong, rather than a
    // generic "check the form" they then have to hunt through.
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Please check the form", field: first?.path[0] },
      { status: 400 },
    );
  }

  try {
    const { id } = await addReview(parsed.data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("[reviews] could not save", error);
    return NextResponse.json(
      { error: "We could not save that just now. Please try again." },
      { status: 500 },
    );
  }
}
