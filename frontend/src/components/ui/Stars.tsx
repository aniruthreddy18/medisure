import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A read-only 1–5 star row. Coral (accent) rather than the usual gold, to
 * match the testimonial cards already on the site.
 */
export function Stars({
  value,
  className,
  size = "size-4",
}: {
  value: number;
  className?: string;
  size?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            size,
            n <= value ? "fill-accent-400 text-accent-400" : "fill-ink-100 text-ink-300",
          )}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Rated {value} out of 5</span>
    </div>
  );
}
