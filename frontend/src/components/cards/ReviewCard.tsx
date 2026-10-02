import { formatInstantDate } from "@medisure/backend/time";
import type { ReviewData } from "@medisure/backend/reviews";
import { Stars } from "@/components/ui/Stars";

/**
 * One public review. Plainer than TestimonialCard on purpose — a testimonial
 * is a curated case study, this is somebody's opinion, and dressing the two
 * up identically would blur a distinction that matters.
 */
export function ReviewCard({ review }: { review: ReviewData }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-white p-6">
      <Stars value={review.rating} />

      <blockquote className="mt-4 flex-1 text-[0.975rem] leading-relaxed text-ink-700">
        {review.comment}
      </blockquote>

      <figcaption className="mt-5 border-t border-border pt-4">
        <span className="block font-semibold text-brand-950">{review.name}</span>
        <span className="block text-sm text-ink-500">
          {review.speciality ?? "Patient"}
        </span>
        <span className="mt-1 block text-xs text-ink-400">
          {formatInstantDate(review.createdAt)}
        </span>
      </figcaption>
    </figure>
  );
}
