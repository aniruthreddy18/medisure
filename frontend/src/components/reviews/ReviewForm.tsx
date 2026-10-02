"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Leave a review.
 *
 * It appears on the page the moment it is sent — there is no approval step,
 * which is the point: a wall of reviews the hospital picked one by one is a
 * wall of advertising, and readers know it. Staff can still take an individual
 * review down (the `hidden` column), but nothing is held back by default.
 *
 * No sign-in either. The people most likely to write are the ones who have
 * just had a good visit and will not create a password to say so.
 */
export function ReviewForm({ specialities }: { specialities: string[] }) {
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [speciality, setSpeciality] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rating,
          comment,
          speciality: speciality || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "We could not save that.");
        return;
      }

      setSent(true);
      // The list above this form is rendered on the server, so it has to be
      // asked again — otherwise the reviewer posts a review and does not see
      // it, which reads as the form having failed.
      router.refresh();
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-success/40 bg-success-soft p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden="true" />
        <p className="mt-3 text-lg font-semibold text-brand-950">Thank you.</p>
        <p className="mt-1.5 leading-relaxed text-ink-600">
          Your review is on this page now — scroll up and you will see it.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setRating(0);
            setName("");
            setComment("");
            setSpeciality("");
          }}
          className="mt-4 text-sm font-semibold text-brand-700 underline underline-offset-2"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-2xl border border-border bg-white p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold text-brand-950">Tell us how it went</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
        Your review appears here straight away, for everyone to read. No account
        needed.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Stars first. It is the one field everybody fills in, and starting
          with it makes the rest feel like a smaller ask than opening with a
          name field does. */}
      <fieldset className="mt-6">
        <legend className="mb-1.5 block text-sm font-medium text-ink-700">
          Your rating <span className="text-emergency">*</span>
        </legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              aria-pressed={rating === value}
              className="grid size-11 place-items-center rounded-lg transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  value <= (hovered || rating)
                    ? "fill-accent-400 text-accent-400"
                    : "fill-ink-100 text-ink-300",
                )}
                aria-hidden="true"
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-ink-600">
              {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">
            What happened? <span className="text-emergency">*</span>
          </span>
          <textarea
            required
            rows={4}
            maxLength={1500}
            className="input"
            placeholder="e.g. Dr. Rao explained the scan clearly and the physio team got my mother walking again in six weeks."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <span className="mt-1.5 block text-xs text-ink-500">
            {comment.length} / 1500 — please do not include anyone&rsquo;s medical
            details.
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">
            Your name <span className="text-emergency">*</span>
          </span>
          <input
            type="text"
            required
            maxLength={60}
            className="input"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <span className="mt-1.5 block text-xs text-ink-500">
            Shown with your review.
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">
            Which speciality is this about?{" "}
            <span className="font-normal text-ink-400">(optional)</span>
          </span>
          <select
            className="input"
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
          >
            <option value="">Prefer not to say</option>
            {specialities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Button
        type="submit"
        variant="book"
        size="lg"
        className="mt-6 w-full sm:w-auto"
        disabled={sending || rating === 0}
      >
        {sending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Posting…
          </>
        ) : (
          "Post my review"
        )}
      </Button>
      {rating === 0 && (
        <p className="mt-2.5 text-sm text-ink-500">Choose a rating to continue.</p>
      )}
    </form>
  );
}
