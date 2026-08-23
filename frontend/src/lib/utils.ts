import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * "+919908256622" -> "+91 99082 56622", "+914012345678" -> "+91 40 1234 5678".
 *
 * Mobiles and landlines are grouped differently in India: a mobile is written
 * as 5+5, while a landline splits off its STD code first. Grouping a mobile
 * like a landline reads as a typo to anyone local.
 */
export function formatPhone(raw: string): string {
  const national = raw.replace(/[^\d+]/g, "").match(/^\+91(\d{10})$/)?.[1];
  if (!national) return raw;

  // Indian mobile numbers start 6-9.
  if (/^[6-9]/.test(national)) {
    return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
  }

  const m = national.match(/^(\d{2,4})(\d{4})(\d{4})$/);
  return m ? `+91 ${m[1]} ${m[2]} ${m[3]}` : `+91 ${national}`;
}
