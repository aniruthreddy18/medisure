import "server-only";
import PDFDocument from "pdfkit";
import { db } from "./db";
import { site } from "./site";
import { toDateKey, formatDateLabel, formatTimeLabel } from "./time";

/**
 * Payment receipt as a real PDF.
 *
 * Note on currency: the built-in PDF fonts (Helvetica and friends) have no
 * glyph for the rupee sign, so writing "₹" produces a broken character rather
 * than a symbol. "Rs." is used instead — normal on Indian receipts and legible
 * everywhere — which avoids shipping and embedding a whole font file just for
 * one character.
 */

export type ReceiptData = Awaited<ReturnType<typeof getReceiptData>>;

export async function getReceiptData(ref: string) {
  const appointment = await db.appointment.findUnique({
    where: { ref },
    include: {
      doctor: true,
      department: true,
      payments: { where: { status: "PAID" }, orderBy: { createdAt: "desc" }, take: 1 },
      packageBooking: { include: { package: true } },
    },
  });
  if (!appointment) return null;

  const payment = appointment.payments[0] ?? null;
  return { appointment, payment };
}

const rupees = (paise: number) =>
  `Rs. ${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function buildReceiptPdf(data: NonNullable<ReceiptData>): Promise<Buffer> {
  const { appointment: a, payment } = data;

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const BRAND = "#c63630";
  const INK = "#1e1a19";
  const MUTED = "#847975";
  const left = 50;
  const right = 545;

  // ---- Header ----
  doc.rect(0, 0, 595, 110).fill(BRAND);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text(site.name, left, 38);
  doc.font("Helvetica").fontSize(9.5).fillColor("#ffe4e0");
  doc.text(
    `${site.address.street}, ${site.address.locality}, ${site.address.city} ${site.address.postalCode}`,
    left,
    64,
  );
  doc.text(`${site.phone.main}  ·  ${site.email.general}`, left, 78);

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#ffffff")
    .text("PAYMENT RECEIPT", left, 38, { align: "right", width: right - left });

  // ---- Reference band ----
  let y = 140;
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text("Receipt reference", left, y);
  doc.font("Helvetica").fontSize(11).fillColor(BRAND).text(a.ref, left, y + 16);

  doc.fillColor(INK).font("Helvetica-Bold").fontSize(11)
    .text("Issued on", 350, y, { width: 195, align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(
    (payment?.updatedAt ?? new Date()).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }),
    350,
    y + 17,
    { width: 195, align: "right" },
  );

  y += 52;
  doc.moveTo(left, y).lineTo(right, y).lineWidth(1).strokeColor("#e8e2df").stroke();

  // ---- Rows ----
  y += 22;
  const row = (label: string, value: string, bold = false) => {
    doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(label, left, y);
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(11)
      .fillColor(INK)
      .text(value, 250, y, { width: right - 250, align: "right" });
    y += 26;
  };

  row("Patient", a.patientName);
  row("Mobile", a.phone);
  if (a.age !== null) row("Age", String(a.age));
  row(a.serviceType === "OP" ? "Doctor" : "Physiotherapist", a.doctor.name);
  if (a.department) row("Department", a.department.name);

  row(
    "Appointment",
    `${formatDateLabel(toDateKey(a.date))}, ${formatTimeLabel(a.startTime)} - ${formatTimeLabel(a.endTime)}`,
  );
  if (a.tokenNumber !== null) row("Token number", String(a.tokenNumber), true);

  row(
    "Service",
    a.packageBooking
      ? `Home Physiotherapy - ${a.packageBooking.package.name}`
      : a.serviceType === "OP"
        ? "OP Consultation"
        : "Home Physiotherapy",
  );

  // ---- Payment ----
  y += 6;
  doc.moveTo(left, y).lineTo(right, y).strokeColor("#e8e2df").stroke();
  y += 20;

  doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text("Payment", left, y);
  y += 24;

  if (payment) {
    row("Payment ID", payment.paymentId ?? "-");
    row("Order ID", payment.orderId);
    if (payment.method) row("Method", payment.method.toUpperCase());
  }

  // ---- Total ----
  const amount = payment?.amountPaise ?? a.amountPaise;
  y += 6;
  doc.rect(left, y, right - left, 46).fill("#fdf5f4");
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(12).text("Amount paid", left + 16, y + 16);
  doc
    .fillColor(BRAND)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(rupees(amount), left + 16, y + 12, { width: right - left - 32, align: "right" });

  y += 70;

  // ---- Footer ----
  doc.font("Helvetica").fontSize(9).fillColor(MUTED);
  doc.text(
    a.serviceType === "OP"
      ? "Please arrive at the start of your appointment window and wait for your token to be called. Bring any previous prescriptions, scans or reports relating to this problem."
      : "Our physiotherapist will visit you at the address given at the time of booking. Please keep this reference for any queries.",
    left,
    y,
    { width: right - left },
  );

  y += 46;
  doc.fontSize(8).fillColor("#a09792");
  doc.text(
    "This is a computer-generated receipt and does not require a signature. For queries about this payment, quote the receipt reference above.",
    left,
    y,
    { width: right - left },
  );

  doc.end();
  return done;
}
