import type { Metadata } from "next";
import { MessageSquareQuote } from "lucide-react";
import { listReviews, getReviewSummary } from "@medisure/backend/reviews";
import { getAllDepartments } from "@medisure/backend/queries";
import { Container } from "@/components/ui/Container";
import { Stars } from "@/components/ui/Stars";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";

// Reviews go live the moment they are posted, so this page cannot be cached
// the way the rest of the site is (revalidate = 300). A reviewer who posts and
// does not immediately see their own words assumes the form broke.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patient Reviews",
  description:
    "Ratings and reviews written by patients and posted straight to this page — nobody approves them first.",
};

export default async function ReviewsPage() {
  const [reviews, summary, departments] = await Promise.all([
    listReviews(),
    getReviewSummary(),
    getAllDepartments(),
  ]);

  return (
    <>
      <header className="border-b border-border bg-brand-50">
        <Container className="py-12 lg:py-16">
          <h1 className="text-4xl font-bold text-brand-950">Patient reviews</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            Written by patients and posted straight to this page. Nobody here
            approves them first, which is the only thing that makes a page like
            this worth reading.
          </p>
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        {/* --------------------------------------------------- summary -- */}
        {summary.total > 0 && (
          <div className="grid gap-8 rounded-2xl border border-border bg-white p-6 sm:grid-cols-[auto_1fr] sm:gap-12 sm:p-8">
            <div className="text-center sm:text-left">
              <p className="text-5xl font-bold tabular-nums text-brand-950">
                {summary.average?.toFixed(1)}
              </p>
              <Stars
                value={Math.round(summary.average ?? 0)}
                className="mt-2 justify-center sm:justify-start"
              />
              <p className="mt-2 text-sm text-ink-500">
                {summary.total} {summary.total === 1 ? "review" : "reviews"}
              </p>
            </div>

            <ul className="flex flex-col justify-center gap-1.5">
              {summary.breakdown.map((row) => (
                <li key={row.rating} className="flex items-center gap-3 text-sm">
                  <span className="w-10 shrink-0 tabular-nums text-ink-600">
                    {row.rating} ★
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <span
                      className="block h-full rounded-full bg-accent-400"
                      style={{ width: `${row.share}%` }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right tabular-nums text-ink-500">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --------------------------------------------------- reviews -- */}
        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          // Honest rather than empty. Nobody has written yet, and filling the
          // page with placeholder reviews would be the exact dishonesty this
          // page exists to avoid.
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700 mx-auto">
              <MessageSquareQuote className="size-7" aria-hidden="true" />
            </span>
            <p className="mt-5 text-lg font-semibold text-brand-950">
              No reviews yet
            </p>
            <p className="mx-auto mt-2 max-w-md leading-relaxed text-ink-600">
              If you have been treated here, yours would be the first — and the
              one everybody reads.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------ form -- */}
        <div id="write" className="mt-14 max-w-3xl scroll-mt-28">
          <ReviewForm specialities={departments.map((d) => d.name)} />
        </div>
      </Container>
    </>
  );
}
