import { NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyCredentials,
  createSessionToken,
  SESSION_COOKIE,
  AuthError,
} from "@medisure/backend/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Same message as a failed login, so a malformed email cannot be used to
    // probe which addresses exist.
    return NextResponse.json({ error: "That email and password do not match." }, { status: 401 });
  }

  try {
    const admin = await verifyCredentials(parsed.data.email, parsed.data.password);
    const token = createSessionToken(admin.id);

    const response = NextResponse.json({ ok: true, name: admin.name });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true, // never readable from JavaScript
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 12 * 60 * 60,
    });
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "Could not sign you in." }, { status: 500 });
  }
}
