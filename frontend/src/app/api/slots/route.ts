import { NextResponse } from "next/server";
import { z } from "zod";
import { getSlots } from "@medisure/backend/slots";
import { upcomingDateKeys } from "@medisure/backend/time";
import { site } from "@medisure/backend/site";

const querySchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  serviceType: z.enum(["OP", "HOME_PHYSIO"]),
});

/**
 * Live availability for one doctor on one date.
 * Never cached — a stale slot list is how you get two patients in one chair.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    doctorId: searchParams.get("doctorId"),
    date: searchParams.get("date"),
    serviceType: searchParams.get("serviceType"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { doctorId, date, serviceType } = parsed.data;

  // Refuse dates outside the booking window so the API cannot be walked
  // months into the future.
  const allowed = upcomingDateKeys(site.booking.bookingWindowDays);
  if (!allowed.includes(date)) {
    return NextResponse.json(
      { error: `Bookings open only for the next ${site.booking.bookingWindowDays} days.` },
      { status: 400 },
    );
  }

  const slots = await getSlots(doctorId, date, serviceType);
  return NextResponse.json({ date, slots });
}
