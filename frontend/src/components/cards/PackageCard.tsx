import Link from "next/link";
import { Check, ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type PackageCardData = {
  id: string;
  name: string;
  slug: string;
  sessionCount: number;
  pricePaise: number;
  validityDays: number;
  badge: "BEST_SELLER" | "MOST_TRUSTED" | "NEW" | null;
  ctaMode: "BUY" | "ENQUIRE";
  description: string;
  includes: string[];
};

const badgeLabels: Record<string, string> = {
  BEST_SELLER: "Best Seller",
  MOST_TRUSTED: "Most Trusted",
  NEW: "New",
};

/**
 * Home-physio package card.
 *
 * The CTA is deliberately two-tier: BUY packages are standardised and can be
 * paid for online; ENQUIRE packages (neuro rehab, geriatric) need a clinical
 * assessment before we can promise to take the case. Taking payment for a case
 * the physiotherapist may have to refuse is worse than a slower funnel.
 */
export function PackageCard({ pkg }: { pkg: PackageCardData }) {
  const price = (pkg.pricePaise / 100).toLocaleString("en-IN");
  const perSession = Math.round(pkg.pricePaise / pkg.sessionCount / 100).toLocaleString("en-IN");
  const isEnquiry = pkg.ctaMode === "ENQUIRE";

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md",
        pkg.badge ? "border-accent-300" : "border-border",
      )}
    >
      {pkg.badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {badgeLabels[pkg.badge]}
        </span>
      )}

      <h3 className="font-display text-lg font-bold text-brand-950">{pkg.name}</h3>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold text-brand-900">₹{price}</span>
        {pkg.sessionCount > 1 && (
          <span className="text-sm text-ink-500">≈ ₹{perSession}/session</span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-500">
        {pkg.sessionCount} {pkg.sessionCount === 1 ? "session" : "sessions"} · valid{" "}
        {pkg.validityDays} days
      </p>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-600">{pkg.description}</p>

      {pkg.includes.length > 0 && (
        <ul className="mt-5 space-y-2">
          {pkg.includes.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-ink-700">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}

      <Link
        href={
          isEnquiry
            ? `/second-opinion?package=${pkg.slug}`
            : `/book/home-physio?package=${pkg.slug}`
        }
        className={cn(
          "mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-semibold transition-colors",
          isEnquiry
            ? "border border-brand-700 text-brand-800 hover:bg-brand-50"
            : "bg-accent-500 text-white hover:bg-accent-600",
        )}
      >
        {isEnquiry ? (
          <>
            <MessageCircle className="size-4" aria-hidden="true" />
            Enquire Now
          </>
        ) : (
          <>
            Book Now
            <ArrowRight className="size-4" aria-hidden="true" />
          </>
        )}
      </Link>

      {isEnquiry && (
        <p className="mt-2.5 text-center text-xs text-ink-500">
          Needs a short assessment call first
        </p>
      )}
    </article>
  );
}
