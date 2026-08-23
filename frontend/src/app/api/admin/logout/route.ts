import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@medisure/backend/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Expire it rather than just deleting client-side, so the browser drops it
  // even if the page is restored from cache.
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
