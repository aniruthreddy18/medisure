import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOtp, isValidIndianMobile, OtpError } from "@medisure/backend/otp";

export const dynamic = "force-dynamic";

const schema = z.object({ phone: z.string().trim().min(10) });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success || !isValidIndianMobile(parsed.data.phone)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 },
    );
  }

  try {
    const { devCode } = await sendOtp(parsed.data.phone);
    return NextResponse.json({ sent: true, devCode });
  } catch (error) {
    if (error instanceof OtpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("OTP send failed", error);
    return NextResponse.json({ error: "Could not send the code. Please try again." }, { status: 500 });
  }
}
