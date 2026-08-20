import Link from "next/link";
import { Phone, CalendarPlus } from "lucide-react";
import { site } from "@medisure/backend/site";

/**
 * Sticky bottom bar on mobile only. Most hospital traffic is mobile and
 * split between two intents: call now, or book. Everything else can wait.
 * Hidden on the booking routes themselves so it never covers a slot grid
 * or a payment button.
 */
export function MobileBookBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden">
      <div className="grid grid-cols-2 gap-2 p-2.5">
        <a
          href={`tel:${site.phone.booking}`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-700 font-semibold text-brand-800 active:bg-brand-50"
        >
          <Phone className="size-4" aria-hidden="true" />
          Call Us
        </a>
        <Link
          href="/book"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-500 font-semibold text-white active:bg-accent-700"
        >
          <CalendarPlus className="size-4" aria-hidden="true" />
          Book Now
        </Link>
      </div>
    </div>
  );
}
