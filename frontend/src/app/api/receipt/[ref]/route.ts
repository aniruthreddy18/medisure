import { getReceiptData, buildReceiptPdf } from "@medisure/backend/receipt";

// PDFKit needs the Node runtime — it is not edge-compatible.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Download the payment receipt as a PDF.
 *
 * Access matches the confirmation page: knowing the booking reference is
 * enough, because that is what the patient was given. A receipt is only
 * produced once the payment has actually been captured — there is no such
 * thing as a receipt for money that has not arrived.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  const { ref } = await params;
  const data = await getReceiptData(decodeURIComponent(ref).toUpperCase());

  if (!data) {
    return new Response("Booking not found", { status: 404 });
  }
  if (!data.payment) {
    return new Response("No payment has been recorded for this booking yet.", {
      status: 409,
    });
  }

  const pdf = await buildReceiptPdf(data);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // `inline` so the browser previews it; the download attribute on the
      // link still saves it with this filename.
      "Content-Disposition": `inline; filename="MediSure-Receipt-${data.appointment.ref}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
