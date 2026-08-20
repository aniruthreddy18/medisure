import { Quote, Star } from "lucide-react";

export type TestimonialData = {
  id: string;
  patientName: string;
  condition: string | null;
  treatment: string | null;
  outcome: string | null;
  quote: string;
  rating: number | null;
  department: { name: string } | null;
};

/**
 * Case-study shaped testimonial: condition → treatment → outcome.
 * A specific story ("walking unaided in six weeks") persuades; a bare
 * five-star quote reads as marketing filler.
 */
export function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  const t = testimonial;
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-white p-6">
      <Quote className="size-7 shrink-0 text-brand-300" aria-hidden="true" />

      <blockquote className="mt-4 flex-1 text-[0.975rem] leading-relaxed text-ink-700">
        {t.quote}
      </blockquote>

      {(t.condition || t.treatment || t.outcome) && (
        <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
          {t.condition && (
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-ink-500">Condition</dt>
              <dd className="text-ink-800">{t.condition}</dd>
            </div>
          )}
          {t.treatment && (
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-ink-500">Treatment</dt>
              <dd className="text-ink-800">{t.treatment}</dd>
            </div>
          )}
          {t.outcome && (
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-ink-500">Outcome</dt>
              <dd className="font-medium text-brand-700">{t.outcome}</dd>
            </div>
          )}
        </dl>
      )}

      <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          <span className="block font-semibold text-brand-950">{t.patientName}</span>
          {t.department && (
            <span className="block text-sm text-ink-500">{t.department.name}</span>
          )}
        </div>
        {t.rating && (
          <div className="flex gap-0.5" aria-label={`Rated ${t.rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < t.rating!
                    ? "size-4 fill-accent-400 text-accent-400"
                    : "size-4 text-ink-300"
                }
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </figcaption>
    </figure>
  );
}
