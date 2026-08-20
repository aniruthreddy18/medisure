import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "+914012345678" -> "+91 40 1234 5678" for display. */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  const m = digits.match(/^\+91(\d{2,4})(\d{4})(\d{4})$/);
  return m ? `+91 ${m[1]} ${m[2]} ${m[3]}` : raw;
}
