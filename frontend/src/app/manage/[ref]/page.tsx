import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ManageBooking } from "@/components/booking/ManageBooking";

export const metadata: Metadata = {
  title: "Manage your booking",
  // A patient's booking page must never be indexed.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;

  // Nothing about the booking is fetched here. Details are served only after
  // the OTP check inside the client component, so simply knowing a reference
  // never reveals a patient's name, number or address.
  return (
    <Container className="max-w-2xl py-14 lg:py-20">
      <ManageBooking bookingRef={decodeURIComponent(ref).toUpperCase()} />
    </Container>
  );
}
