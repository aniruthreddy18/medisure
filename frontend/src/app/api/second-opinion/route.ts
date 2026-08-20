import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@medisure/backend/db";
import { consumeVerification, normalisePhone, OtpError } from "@medisure/backend/otp";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10),
  email: z.string().trim().email().optional().or(z.literal("")).nullable(),
  departmentSlug: z.string().trim().optional().nullable(),
  description: z.string().trim().min(10, "Please describe the problem briefly").max(2000),
  verificationToken: z.string().min(10, "Please verify your mobile number"),
  consent: z.literal(true, { message: "Please accept the consent statement to continue" }),
});

/**
 * Free second-opinion request.
 *
 * Note there is no file upload here yet. Report uploads are health records and
 * need a private bucket with signed, short-lived URLs — wiring them to the
 * public media bucket used for doctor photos would expose patient documents.
 * Until that storage exists, the team collects reports over a follow-up call.
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
    return NextResponse.json(
      { error: "Please check the form", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;

  let phone: string;
  try {
    phone = await consumeVerification(data.verificationToken);
  } catch (error) {
    if (error instanceof OtpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
  if (phone !== normalisePhone(data.phone)) {
    return NextResponse.json(
      { error: "That mobile number does not match the one you verified." },
      { status: 400 },
    );
  }

  const department = data.departmentSlug
    ? await db.department.findFirst({ where: { slug: data.departmentSlug, active: true } })
    : null;

  await db.secondOpinion.create({
    data: {
      name: data.name,
      phone,
      email: data.email || null,
      departmentId: department?.id ?? null,
      description: data.description,
    },
  });

  return NextResponse.json({ received: true }, { status: 201 });
}
