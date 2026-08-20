import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp, OtpError } from "@medisure/backend/otp";

export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().trim().min(10),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
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
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }

  try {
    const token = await verifyOtp(parsed.data.phone, parsed.data.code);
    return NextResponse.json({ verified: true, token });
  } catch (error) {
    if (error instanceof OtpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("OTP verify failed", error);
    return NextResponse.json({ error: "Could not verify the code." }, { status: 500 });
  }
}
