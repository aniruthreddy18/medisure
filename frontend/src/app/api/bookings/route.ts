import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@medisure/backend/db";
import { createHold, createPackagePurchase, SlotUnavailableError } from "@medisure/backend/booking";
import { consumeVerification, normalisePhone, OtpError } from "@medisure/backend/otp";
import { createPaymentOrder } from "@medisure/backend/payments";
import { db as _db } from "@medisure/backend/db";
import { site } from "@medisure/backend/site";

/**
 * Create a HOLD on a slot.
 *
 * Deliberately does NOT confirm the booking — confirmation happens only when
 * the payment webhook reports captured funds (Phase 4). Until then the slot is
 * reserved for `holdMinutes` and swept by cron if payment never lands.
 */
export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  serviceType: z.enum(["OP", "HOME_PHYSIO"]),
  doctorId: z.string().min(1),
  departmentId: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),

  patientName: z.string().trim().min(2, "Please enter the patient's name").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email().optional().or(z.literal("")).nullable(),
  age: z.coerce.number().int().min(0).max(120).optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),

  // Home visits only
  addressLine: z.string().trim().max(300).optional().nullable(),
  area: z.string().trim().max(120).optional().nullable(),
  pincode: z.string().trim().regex(/^\d{6}$/).optional().nullable(),
  landmark: z.string().trim().max(200).optional().nullable(),

  /** Buying a home-physio package rather than a single paid visit. */
  packageSlug: z.string().optional().nullable(),
  packageBookingId: z.string().optional().nullable(),

  /** Proof the mobile number was verified by OTP. */
  verificationToken: z.string().min(10, "Please verify your mobile number"),

  /** Explicit consent to be contacted — recorded, not assumed (DPDP). */
  consent: z.literal(true, { message: "Please accept the consent statement to continue" }),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const doctor = await db.doctor.findFirst({
    where: { id: data.doctorId, active: true },
    include: { departments: true },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  if (data.serviceType === "HOME_PHYSIO") {
    if (!doctor.offersHomePhysio) {
      return NextResponse.json(
        { error: "This doctor does not offer home visits." },
        { status: 400 },
      );
    }
    if (!data.addressLine || !data.pincode) {
      return NextResponse.json(
        { error: "A home visit needs an address and pincode." },
        { status: 400 },
      );
    }

    // Serviceability gate — off until the client supplies the pincode list.
    const checkEnabled = await db.siteSetting.findUnique({
      where: { key: "home_physio_pincode_check" },
    });
    if (checkEnabled?.value === true) {
      const serviceable = await db.servicePincode.findFirst({
        where: { pincode: data.pincode, active: true },
      });
      if (!serviceable) {
        return NextResponse.json(
          { error: "We do not currently cover this pincode. Please call our booking desk." },
          { status: 400 },
        );
      }
    }
  }

  /**
   * The phone number comes from the verification record, never from the form.
   * Otherwise someone could verify their own number and then book under
   * somebody else's — which would send that person's confirmations and let
   * them cancel a stranger's appointment from /manage.
   */
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

  // --- Package purchase branch -------------------------------------------
  if (data.packageSlug) {
    if (data.serviceType !== "HOME_PHYSIO") {
      return NextResponse.json(
        { error: "Packages apply to home physiotherapy only." },
        { status: 400 },
      );
    }

    const pkg = await db.servicePackage.findFirst({
      where: { slug: data.packageSlug, active: true },
    });
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    try {
      const { booking, appointment } = await createPackagePurchase({
        packageId: pkg.id,
        doctorId: doctor.id,
        dateKey: data.date,
        startTime: data.startTime,
        patientName: data.patientName,
        phone,
        email: data.email || null,
        age: data.age ?? null,
        gender: data.gender ?? null,
        notes: data.notes ?? null,
        addressLine: data.addressLine!,
        area: data.area ?? null,
        pincode: data.pincode!,
        landmark: data.landmark ?? null,
      });

      const order = await createPaymentOrder(
        { kind: "package", id: booking.id },
        booking.amountPaise,
        { packageRef: booking.ref, patientName: data.patientName, phone },
      );

      return NextResponse.json(
        {
          ref: appointment.ref,
          packageRef: booking.ref,
          // The package price is what gets charged, not the per-visit fee.
          amountPaise: booking.amountPaise,
          requiresPayment: booking.amountPaise > 0,
          sessionsTotal: booking.sessionsTotal,
          holdMinutes: site.booking.holdMinutes,
          payment: order,
        },
        { status: 201 },
      );
    } catch (error) {
      if (error instanceof SlotUnavailableError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      console.error("Package purchase failed", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not complete the purchase." },
        { status: 400 },
      );
    }
  }

  /**
   * Price is computed server-side from the doctor's own fee (or the package
   * the patient bought). A client-supplied amount is never trusted — otherwise
   * anyone could book a ₹900 consultation for ₹1 by editing the request.
   */
  let amountPaise: number;
  if (data.packageBookingId) {
    const pkg = await db.packageBooking.findUnique({ where: { id: data.packageBookingId } });
    if (!pkg || pkg.status !== "ACTIVE") {
      return NextResponse.json({ error: "That package is not active." }, { status: 400 });
    }
    if (pkg.sessionsUsed >= pkg.sessionsTotal) {
      return NextResponse.json(
        { error: "All sessions in this package have been used." },
        { status: 400 },
      );
    }
    if (pkg.expiresAt < new Date()) {
      return NextResponse.json({ error: "This package has expired." }, { status: 400 });
    }
    amountPaise = 0; // already paid for at purchase
  } else {
    amountPaise =
      data.serviceType === "HOME_PHYSIO"
        ? (doctor.homeVisitFeePaise ?? 0)
        : doctor.opFeePaise;
  }

  try {
    const appointment = await createHold({
      serviceType: data.serviceType,
      doctorId: doctor.id,
      departmentId: data.departmentId ?? doctor.departments[0]?.departmentId ?? null,
      dateKey: data.date,
      startTime: data.startTime,
      patientName: data.patientName,
      phone,
      email: data.email || null,
      age: data.age ?? null,
      gender: data.gender ?? null,
      notes: data.notes ?? null,
      addressLine: data.addressLine ?? null,
      area: data.area ?? null,
      pincode: data.pincode ?? null,
      landmark: data.landmark ?? null,
      packageBookingId: data.packageBookingId ?? null,
      amountPaise,
    });

    // Zero-cost bookings (a session inside an already-paid package) skip the
    // gateway entirely and are confirmed on the spot.
    if (appointment.amountPaise === 0) {
      await _db.appointment.update({
        where: { id: appointment.id },
        data: { status: "CONFIRMED", holdExpiresAt: null },
      });
      return NextResponse.json(
        {
          ref: appointment.ref,
          tokenNumber: appointment.tokenNumber,
          amountPaise: 0,
          requiresPayment: false,
        },
        { status: 201 },
      );
    }

    const order = await createPaymentOrder(
      { kind: "appointment", id: appointment.id },
      appointment.amountPaise,
      {
        ref: appointment.ref,
        doctorId: doctor.id,
        patientName: data.patientName,
        phone,
      },
    );

    return NextResponse.json(
      {
        ref: appointment.ref,
        tokenNumber: appointment.tokenNumber,
        holdExpiresAt: appointment.holdExpiresAt,
        amountPaise: appointment.amountPaise,
        requiresPayment: true,
        holdMinutes: site.booking.holdMinutes,
        payment: order,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Booking failed", error);
    return NextResponse.json(
      { error: "We could not complete your booking. Please try again." },
      { status: 500 },
    );
  }
}
