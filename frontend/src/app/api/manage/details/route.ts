import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@medisure/backend/db";
import { consumeVerification, OtpError } from "@medisure/backend/otp";
import { toDateKey } from "@medisure/backend/time";

export const dynamic = "force-dynamic";

const schema = z.object({
  ref: z.string().trim().min(4),
  token: z.string().min(10),
});

/** Booking details, released only against a verified token for that booking. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const ref = parsed.data.ref.toUpperCase();

  let verifiedPhone: string;
  try {
    verifiedPhone = await consumeVerification(parsed.data.token);
  } catch (error) {
    if (error instanceof OtpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const appointment = await db.appointment.findUnique({
    where: { ref },
    include: { doctor: true, department: true, packageBooking: { include: { package: true } } },
  });

  if (appointment) {
    if (appointment.phone !== verifiedPhone) {
      return NextResponse.json({ error: "Verification does not match this booking." }, { status: 403 });
    }

    const pkg = appointment.packageBooking;
    return NextResponse.json({
      kind: "appointment",
      ref: appointment.ref,
      status: appointment.status,
      serviceType: appointment.serviceType,
      patientName: appointment.patientName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor.name,
      departmentName: appointment.department?.name ?? null,
      date: toDateKey(appointment.date),
      startTime: appointment.startTime,
      amountPaise: appointment.amountPaise,
      addressLine: appointment.addressLine,
      pincode: appointment.pincode,
      package: pkg
        ? {
            ref: pkg.ref,
            name: pkg.package.name,
            sessionsTotal: pkg.sessionsTotal,
            sessionsUsed: pkg.sessionsUsed,
            expiresAt: pkg.expiresAt.toISOString(),
            status: pkg.status,
          }
        : null,
    });
  }

  const pkg = await db.packageBooking.findUnique({
    where: { ref },
    include: { package: true, doctor: true },
  });

  if (pkg) {
    if (pkg.phone !== verifiedPhone) {
      return NextResponse.json({ error: "Verification does not match this booking." }, { status: 403 });
    }
    return NextResponse.json({
      kind: "package",
      ref: pkg.ref,
      status: pkg.status,
      patientName: pkg.patientName,
      doctorId: pkg.doctorId,
      doctorName: pkg.doctor?.name ?? null,
      package: {
        ref: pkg.ref,
        name: pkg.package.name,
        sessionsTotal: pkg.sessionsTotal,
        sessionsUsed: pkg.sessionsUsed,
        expiresAt: pkg.expiresAt.toISOString(),
        status: pkg.status,
      },
    });
  }

  return NextResponse.json({ error: "Booking not found." }, { status: 404 });
}
