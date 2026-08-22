import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TestimonialCard, type TestimonialData } from "@/components/cards/TestimonialCard";

/**
 * Patient stories in a horizontal row, matching the reels above.
 *
 * Every card here is gated on written consent at the query level — a story
 * cannot reach this component unless `approved` and `consentOnFile` are both
 * true.
 */
export function StoriesScroller({ testimonials }: { testimonials: TestimonialData[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-ink-50 py-16 lg:py-24" aria-labelledby="stories">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
              Patient stories
            </p>
            <h2 id="stories" className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">
              Recoveries our patients agreed to share
            </h2>
          </div>
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
          >
            Read all stories
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>

      <div
        className="mt-9 overflow-x-auto pb-4 [scrollbar-width:thin]"
        tabIndex={0}
        role="region"
        aria-label="Patient stories, scroll horizontally"
      >
        <ul className="mx-auto flex w-max gap-5 px-5 sm:px-6 lg:px-8">
          {testimonials.map((t) => (
            <li key={t.id} className="w-[320px] shrink-0 sm:w-[380px]">
              <TestimonialCard testimonial={t} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
