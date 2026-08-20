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
 */

const OTP_TTL_MS = 10 * 60 * 1000;
const TOKEN_TTL_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;
/** Per-phone send throttle: at most 3 codes in 15 minutes. */
const SEND_WINDOW_MS = 15 * 60 * 1000;
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
  ) {
    super(message);
    this.name = "OtpError";
  }
}

export async function sendOtp(rawPhone: string): Promise<{ devCode?: string }> {
  const phone = normalisePhone(rawPhone);

  const recent = await db.phoneVerification.count({
    where: { phone, createdAt: { gt: new Date(Date.now() - SEND_WINDOW_MS) } },
  });
  if (recent >= MAX_SENDS_PER_WINDOW) {
    throw new OtpError(
      "Too many codes requested. Please wait a few minutes or call our booking desk.",
      429,
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
    process.env.SMS_PROVIDER !== "msg91" &&
    process.env.SMS_PROVIDER !== "twilio" &&
    process.env.NODE_ENV !== "production";

  return isDevStub ? { devCode: code } : {};
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
    await db.phoneVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new OtpError("That code is not correct.");
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

/** SMS delivery. Swap the provider here; callers never know the difference. */
async function deliver(phone: string, code: string) {
  const provider = process.env.SMS_PROVIDER ?? "console";

  if (provider === "console") {
    console.info(`[OTP] ${phone} → ${code} (console provider; no SMS sent)`);
    return;
  }

  // TODO(phase 4): MSG91 / Twilio implementation lands with the rest of the
  // notification work. Failing loudly is better than silently not sending.
  throw new OtpError(`SMS provider "${provider}" is not configured yet.`, 500);
}
