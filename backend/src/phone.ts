/**
 * Phone number handling.
 *
 * These lived in otp.ts until phone verification was removed. They are still
 * needed — a booking has to store a dialable number even though nothing now
 * proves the caller owns it — so they moved here rather than being deleted
 * along with the OTP flow.
 */

/** "98765 43210", "+91 98765 43210" and "09876543210" all become "+919876543210". */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return `+91${last10}`;
}

/** Indian mobile numbers are ten digits starting 6-9. Shape only — this cannot
 *  tell you the number is real, let alone that it belongs to the caller. */
export function isValidIndianMobile(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(raw.replace(/\D/g, "").slice(-10));
}
