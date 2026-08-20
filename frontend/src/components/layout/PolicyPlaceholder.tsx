import Link from "next/link";
import { FileWarning } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@medisure/backend/site";

/**
 * Placeholder for a legal page whose text must come from the client.
 *
 * These pages exist so nothing on the site links into a 404, but they
 * deliberately do NOT contain invented policy text. A privacy policy or a
 * refund policy is a legal undertaking by the hospital — drafting one here and
 * letting it go live would create a commitment nobody at the hospital agreed
 * to, and Razorpay checks the refund policy at onboarding.
 */
export function PolicyPlaceholder({
  title,
  needs,
}: {
  title: string;
  needs: string[];
}) {
  return (
    <Container className="max-w-2xl py-14 lg:py-20">
      <h1 className="text-3xl font-bold text-brand-950">{title}</h1>

      <div className="mt-8 rounded-2xl border-2 border-dashed border-accent-300 bg-accent-50 p-7">
        <FileWarning className="size-7 text-accent-600" aria-hidden="true" />
        <h2 className="mt-3 font-display text-lg font-bold text-brand-950">
          Awaiting content from the hospital
        </h2>
        <p className="mt-2 leading-relaxed text-ink-700">
          This page has not been written yet. It needs to be drafted or approved
          by the hospital and its legal advisor before the site goes live — we
          have not filled it with sample text, because a policy page is a
          binding statement and placeholder wording would be worse than none.
        </p>

        <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-wider text-brand-800">
          This page must cover
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-ink-700">
          {needs.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-accent-600">
                ·
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-ink-600">
        In the meantime, please{" "}
        <Link href="/contact" className="font-medium text-brand-700 hover:underline">
          contact us
        </Link>{" "}
        or call {site.phone.main} with any question about how we handle your
        information or your booking.
      </p>
    </Container>
  );
}
