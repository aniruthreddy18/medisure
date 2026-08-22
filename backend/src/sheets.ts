import "server-only";
import { google } from "googleapis";

/**
 * Google Sheets mirror of confirmed bookings.
 *
 * The database is the source of truth; this exists so the front desk keeps the
 * spreadsheet view they already work from. It is deliberately failure-tolerant:
 * if Sheets is down or misconfigured, the booking still succeeds and we log the
 * row instead. Losing a spreadsheet row is an inconvenience; failing a paid
 * booking because Google timed out is not acceptable.
 */

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const CREDENTIALS = process.env.GOOGLE_CREDENTIALS;

export const sheetsEnabled = Boolean(SPREADSHEET_ID && CREDENTIALS);

export type BookingRow = {
  bookedAt: Date;
  reference: string;
  orderId: string | null;
  doctorName: string;
  department: string | null;
  patientName: string;
  phone: string;
  date: string;
  window: string;
  tokenNumber: number | null;
  serviceType: string;
  amountRupees: number;
  status: string;
};

const HEADERS = [
  "Booked At", "Reference", "Order ID", "Doctor", "Department",
  "Patient", "Phone", "Date", "Window", "Token",
  "Service", "Amount (₹)", "Status",
];

function toRow(b: BookingRow): (string | number)[] {
  return [
    b.bookedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    b.reference,
    b.orderId ?? "",
    b.doctorName,
    b.department ?? "",
    b.patientName,
    // Leading apostrophe forces Sheets to keep this as text. Without it,
    // USER_ENTERED reads "+919876512345" as a number and silently drops the
    // "+", leaving the front desk with an unusable number.
    `'${b.phone}`,
    b.date,
    b.window,
    b.tokenNumber ?? "",
    b.serviceType,
    b.amountRupees,
    b.status,
  ];
}

export async function appendBooking(booking: BookingRow): Promise<{ ok: boolean; reason?: string }> {
  const row = toRow(booking);

  if (!sheetsEnabled) {
    console.info("[sheets] not configured — booking row:", row.join(" | "));
    return { ok: false, reason: "not_configured" };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      // Accepts either a path to the service-account file or the JSON itself,
      // since platforms like Vercel cannot hold a file on disk.
      ...(CREDENTIALS!.trim().startsWith("{")
        ? { credentials: JSON.parse(CREDENTIALS!) }
        : { keyFile: CREDENTIALS! }),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID!,
      range: "Bookings!A:M",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return { ok: true };
  } catch (error) {
    // Never rethrow: the booking is already paid for and confirmed.
    console.error("[sheets] append failed, booking is still confirmed:", error);
    return { ok: false, reason: String(error) };
  }
}

/** Column headers, for setting up the sheet the first time. */
export const SHEET_HEADERS = HEADERS;
