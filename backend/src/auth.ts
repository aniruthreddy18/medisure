import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";

/**
 * Admin authentication.
 *
 * A hand-rolled signed cookie rather than an auth library: this panel has one
 * job (staff editing content), the user table already exists, and pulling in
 * NextAuth would add a dependency and a set of conventions for a single login
 * form. The same reasoning the OTP and Razorpay signature code already
 * follows.
 *
 * The cookie carries the admin id and an expiry, signed with AUTH_SECRET.
 * Nothing sensitive is stored in it and it is never trusted without the
 * signature checking out — a tampered payload changes the HMAC and is
 * rejected.
 */

export const SESSION_COOKIE = "medisure_admin";

/** 12 hours: long enough for a shift, short enough for a shared front desk. */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export class AuthError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "AuthError";
  }
}

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    // Failing loudly beats signing sessions with an empty key, which would let
    // anyone forge one.
    throw new AuthError("AUTH_SECRET is not set — admin login is disabled.", 500);
  }
  return value;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

/** `<adminId>.<expiresAt>.<signature>` */
export function createSessionToken(adminId: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${adminId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/**
 * Returns the admin id if the token is genuine and unexpired, else null.
 * Callers treat null as "not logged in" — this never throws on a bad token,
 * since a malformed cookie is an ordinary thing to receive.
 */
export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [adminId, expiresAt, signature] = parts;

  const expected = sign(`${adminId}.${expiresAt}`);
  // Constant-time compare — a plain === leaks timing information about the
  // expected signature.
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  if (Number(expiresAt) < Date.now()) return null;
  return adminId;
}

/**
 * Check an email and password against the AdminUser table.
 *
 * Deliberately returns the same error whether the email is unknown or the
 * password is wrong: distinguishing them tells an attacker which accounts
 * exist. A bcrypt comparison still runs for an unknown email so the response
 * time does not give the answer away either.
 */
export async function verifyCredentials(email: string, password: string) {
  const admin = await db.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  const hash = admin?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const ok = await bcrypt.compare(password, hash);

  if (!admin || !admin.active || !ok) {
    throw new AuthError("That email and password do not match.", 401);
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
}

/** The signed-in admin, or null. Used by the admin pages to gate rendering. */
export async function getAdminById(id: string | null) {
  if (!id) return null;
  const admin = await db.adminUser.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return admin?.active ? admin : null;
}

export async function changePassword(adminId: string, current: string, next: string) {
  if (next.length < 10) {
    throw new AuthError("Choose a password of at least 10 characters.", 400);
  }

  const admin = await db.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) throw new AuthError("Not signed in.", 401);

  if (!(await bcrypt.compare(current, admin.passwordHash))) {
    throw new AuthError("Your current password is not correct.", 401);
  }

  await db.adminUser.update({
    where: { id: adminId },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });
}
