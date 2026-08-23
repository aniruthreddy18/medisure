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

/**
 * Turn GOOGLE_CREDENTIALS into something GoogleAuth accepts.
 *
 * Three accepted forms, because each platform makes a different one awkward:
 *   - inline JSON      — what a host with no filesystem (Vercel) needs
 *   - base64 of that   — sidesteps dashboards that mangle newlines on paste
 *   - a file path      — convenient locally; NEVER works on Vercel, since the
 *                        file does not exist there
 *
 * Throws with a diagnosable message rather than letting a raw JSON.parse or
 * OpenSSL decoder error surface, because those are near-impossible to act on
 * when all you can see is a serverless log line.
 */
function buildAuthOptions(): { credentials: object } | { keyFile: string } {
  const raw = CREDENTIALS!.trim();

  // A path: only viable where a filesystem exists.
  if (!raw.startsWith("{") && !looksLikeBase64Json(raw)) {
    if (process.env.VERCEL) {
      throw new Error(
        "GOOGLE_CREDENTIALS looks like a file path, which cannot work on Vercel — " +
          "paste the service-account JSON itself (or its base64) instead.",
      );
    }
    return { keyFile: raw };
  }

  const json = raw.startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json) as Record<string, unknown>;
  } catch {
    throw new Error(
      "GOOGLE_CREDENTIALS is not valid JSON. If it was pasted into a dashboard, " +
        "the private key's newlines were probably mangled — set the base64 of the " +
        "file instead.",
    );
  }

  // The classic env-var failure: the private key arrives with literal "\n"
  // two-character sequences instead of real newlines, and OpenSSL then rejects
  // it with an opaque DECODER error. Normalise rather than make the operator
  // debug it.
  if (typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }

  return { credentials: parsed };
}

function looksLikeBase64Json(value: string): boolean {
  if (!/^[A-Za-z0-9+/=\s]+$/.test(value) || value.length < 100) return false;
  try {
    return Buffer.from(value, "base64").toString("utf8").trimStart().startsWith("{");
  } catch {
    return false;
  }
}

export async function appendBooking(booking: BookingRow): Promise<{ ok: boolean; reason?: string }> {
  const row = toRow(booking);

  if (!sheetsEnabled) {
    // Says which one is missing — "not configured" alone sends people hunting
    // through both.
    console.info(
      `[sheets] not configured (SPREADSHEET_ID=${SPREADSHEET_ID ? "set" : "MISSING"}, ` +
        `GOOGLE_CREDENTIALS=${CREDENTIALS ? "set" : "MISSING"}) — booking row: ${row.join(" | ")}`,
    );
    return { ok: false, reason: "not_configured" };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      ...buildAuthOptions(),
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
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[sheets] append FAILED (booking is still confirmed): ${message}\n` +
        `[sheets] row that did not reach the sheet: ${row.join(" | ")}`,
    );
    return { ok: false, reason: message };
  }
}

/** Column headers, for setting up the sheet the first time. */
export const SHEET_HEADERS = HEADERS;
