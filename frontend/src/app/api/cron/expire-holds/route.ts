import { NextResponse } from "next/server";
import { expireStaleHolds } from "@medisure/backend/booking";

export const dynamic = "force-dynamic";

/**
 * Sweeps holds whose payment never completed and returns their places to the
 * queue. Runs every few minutes.
 *
 * Protected by a shared secret: without it, anyone could hammer the endpoint,
 * and on a slower database that is a cheap denial of service.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    new URL(request.url).searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const released = await expireStaleHolds();
  return NextResponse.json({ ok: true, released });
}
