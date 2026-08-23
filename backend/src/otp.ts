import "server-only";
import crypto from "node:crypto";
import { db } from "./db";

/**
 * Phone verification for bookings (the Yashoda pattern: verify the number
 * before taking any details).
 *
 * Three things this buys us:
 *   - junk bookings from bots and mistyped numbers never reach the calendar
 *   - the reminder SMS is guaranteed to reach a real handset
 *   - the patient gets a passwordless way back into /manage/[ref]
 *
 * The code itself is never stored — only a SHA-256 hash, so a database leak
 * cannot be replayed into somebody's booking.
 *
 * SMS goes out through 2Factor (2factor.in) using their *custom OTP*
 * endpoint rather than AUTOGEN: we keep generating and hashing the code
 * ourselves, so expiry, attempt limits and the verification token all stay
 * under our control and 2Factor is only the delivery channel. AUTOGEN would
 * mean storing their session id and asking them to verify, throwing away the
 * hashed-code design above for no benefit.
 */

const OTP_TTL_MS = 10 * 60 * 1000;
const TOKEN_TTL_MS = 30 * 60 * 1000;

/** Wrong-code entries allowed against a single code before it is burnt. */
const MAX_ATTEMPTS = 3;

/**
 * Send throttle: at most 3 codes per 30 minutes per number, and never two
 * within 30 seconds of each other.
 *
 * Both are enforced HERE rather than only in the UI countdown — a disabled
 * button is a courtesy, not a control, and every one of these sends costs
 * real money on the 2Factor account.
 */
const RESEND_COOLDOWN_MS = 30 * 1000;
const SEND_WINDOW_MS = 30 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 3;

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return `+91${last10}`;
}

export function isValidIndianMobile(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(raw.replace(/\D/g, "").slice(-10));
}

function hash(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export class OtpError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    /** Seconds until the caller may retry — surfaced to the UI countdown. */
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "OtpError";
  }
}

const secondsUntil = (when: Date) =>
  Math.max(1, Math.ceil((when.getTime() - Date.now()) / 1000));

/** Human "30 minutes" / "5 minutes" for throttle messages. */
function humanDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

export async function sendOtp(
  rawPhone: string,
): Promise<{ devCode?: string; resendAfterSeconds: number }> {
  const phone = normalisePhone(rawPhone);

  const windowStart = new Date(Date.now() - SEND_WINDOW_MS);
  const sends = await db.phoneVerification.findMany({
    where: { phone, createdAt: { gt: windowStart } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  // 30-second cooldown between codes.
  const last = sends[0];
  if (last) {
    const readyAt = new Date(last.createdAt.getTime() + RESEND_COOLDOWN_MS);
    if (readyAt > new Date()) {
      const wait = secondsUntil(readyAt);
      throw new OtpError(
        `Please wait ${wait} more ${wait === 1 ? "second" : "seconds"} before requesting another code.`,
        429,
        wait,
      );
    }
  }

  // 3 codes per 30 minutes. The window is rolling, so the lockout lifts when
  // the oldest of those three ages out — not 30 minutes from the last try.
  if (sends.length >= MAX_SENDS_PER_WINDOW) {
    const oldest = sends[sends.length - 1];
    const readyAt = new Date(oldest.createdAt.getTime() + SEND_WINDOW_MS);
    const wait = secondsUntil(readyAt);
    throw new OtpError(
      `Too many codes requested. Please try again in ${humanDuration(wait)}, or call our booking desk.`,
      429,
      wait,
    );
  }

  // crypto.randomInt, not Math.random — a predictable OTP is not a check.
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

  await db.phoneVerification.create({
    data: {
      phone,
      otpHash: hash(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await deliver(phone, code);

  // In local development there is no SMS gateway, so the code is returned to
  // the caller to keep the flow testable. Guarded on BOTH the provider being
  // the console stub and the build not being production, so a misconfigured
  // production deploy cannot leak codes over the wire.
  const isDevStub =
    resolveProvider() === "console" && process.env.NODE_ENV !== "production";

  return {
    resendAfterSeconds: Math.round(RESEND_COOLDOWN_MS / 1000),
    ...(isDevStub ? { devCode: code } : {}),
  };
}

export async function verifyOtp(rawPhone: string, code: string): Promise<string> {
  const phone = normalisePhone(rawPhone);

  const record = await db.phoneVerification.findFirst({
    where: { phone, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw new OtpError("Request a code first.");
  if (record.expiresAt < new Date()) throw new OtpError("That code has expired. Please request a new one.");
  if (record.attempts >= MAX_ATTEMPTS) {
    throw new OtpError("Too many incorrect attempts. Please request a new code.", 429);
  }

  if (record.otpHash !== hash(code.trim())) {
    const updated = await db.phoneVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    const left = MAX_ATTEMPTS - updated.attempts;
    throw new OtpError(
      left > 0
        ? `That code is not correct. ${left} ${left === 1 ? "try" : "tries"} left.`
        : "That code is not correct. Please request a new code.",
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  await db.phoneVerification.update({
    where: { id: record.id },
    data: {
      verifiedAt: new Date(),
      token,
      tokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return token;
}

/**
 * Confirm a booking request carries a valid verification for the number it
 * claims. Returns the normalised phone, so a caller cannot verify one number
 * and then book under another.
 */
export async function consumeVerification(token: string): Promise<string> {
  const record = await db.phoneVerification.findUnique({ where: { token } });
  if (!record || !record.verifiedAt) throw new OtpError("Please verify your mobile number.");
  if (!record.tokenExpiresAt || record.tokenExpiresAt < new Date()) {
    throw new OtpError("Your verification has expired. Please verify your number again.");
  }
  return record.phone;
}

/**
 * Which provider to use. Falls back to the console stub when 2Factor is
 * selected but unconfigured, so a missing key in local dev doesn't block
 * work — in production an unconfigured key throws instead (see deliver).
 */
function resolveProvider(): "console" | "2factor" {
  const configured = (process.env.SMS_PROVIDER ?? "console").toLowerCase();
  if (configured !== "2factor") return "console";
  return process.env.TWOFACTOR_API_KEY ? "2factor" : "console";
}

/** SMS delivery. Swap the provider here; callers never know the difference. */
async function deliver(phone: string, code: string) {
  const configured = (process.env.SMS_PROVIDER ?? "console").toLowerCase();
  const provider = resolveProvider();

  if (provider === "console") {
    // Selected 2Factor but no key: fine locally, never in production.
    if (configured === "2factor" && process.env.NODE_ENV === "production") {
      throw new OtpError(
        "SMS is not configured. Set TWOFACTOR_API_KEY.",
        500,
      );
    }
    console.info(`[OTP] ${phone} → ${code} (console provider; no SMS sent)`);
    return;
  }

  await sendVia2Factor(phone, code);
}

/**
 * 2Factor custom-OTP send.
 *
 * GET {base}/{api_key}/SMS/{phone}/{otp}[/{template}]
 *
 * The API key sits in the URL path (2Factor's design, not ours), so the URL
 * itself is a secret — it must never reach a log or an error message shown to
 * a patient. Failures below deliberately report the provider's `Details`
 * only, never the request URL.
 */
async function sendVia2Factor(phone: string, code: string) {
  const apiKey = process.env.TWOFACTOR_API_KEY!;
  // 2Factor expects the number with the country code and no "+".
  const to = phone.replace(/\D/g, "");
  const template = process.env.TWOFACTOR_TEMPLATE_NAME?.trim();

  const url =
    `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/${to}/${code}` +
    (template ? `/${encodeURIComponent(template)}` : "");

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      // Serverless functions bill by the second and hold the patient on a
      // spinner meanwhile; fail fast rather than hanging on a stalled API.
      // (No cache option needed — Next 16 does not cache fetch by default.)
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("2Factor request failed", {
      phone,
      cause: error instanceof Error ? error.message : String(error),
    });
    throw new OtpError("Could not send the code right now. Please try again.", 502);
  }

  const raw = await response.text();
  let details = raw;
  let status = "";
  try {
    const json = JSON.parse(raw) as { Status?: string; Details?: string };
    status = (json.Status ?? "").toLowerCase();
    details = json.Details ?? raw;
  } catch {
    // Non-JSON body — keep `raw` for the log below.
  }

  if (!response.ok || status !== "success") {
    // Logged for us (no URL, so no key), generic for the patient.
    console.error("2Factor rejected the send", {
      phone,
      httpStatus: response.status,
      details,
    });
    throw new OtpError("Could not send the code right now. Please try again.", 502);
  }

  // On success 2Factor returns a session id in `Details`. Logged (never the
  // code itself) because it is the only handle for looking a delivery up in
  // the 2Factor dashboard or quoting to their support — without it a report
  // of "it arrived as a voice call" cannot be traced to a specific send.
  console.info("[OTP] 2Factor accepted", { phone, session: details });
}
