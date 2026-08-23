import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  readSessionToken,
  getAdminById,
  changePassword,
  SESSION_COOKIE,
  AuthError,
} from "@medisure/backend/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  current: z.string().min(1),
  next: z.string().min(1),
});

export async function POST(request: Request) {
  // Checked here, not by the layout — API routes sit outside it.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const admin = await getAdminById(readSessionToken(token));
  if (!admin) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Fill in both fields." }, { status: 400 });
  }

  try {
    // Verifies the current password before allowing the change, so a walked-up-to
    // unattended session cannot be used to lock the real owner out.
    await changePassword(admin.id, parsed.data.current, parsed.data.next);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin password change failed", error);
    return NextResponse.json({ error: "Could not change the password." }, { status: 500 });
  }
}
