import "server-only";
import { z } from "zod";
import { db } from "./db";

/**
 * Patient reviews — read and written by the public.
 *
 * Every rule about what a review may contain lives here rather than in the
 * route handler, so a front-desk tool entering a review taken over the
 * telephone would be held to exactly the same limits.
 *
 * Note what this is NOT: `getTestimonials` in queries.ts returns curated case
 * studies that require written patient consent on file before publication.
 * These are unmoderated opinions, live the moment they are posted. Keeping the
 * two apart is deliberate — see the `Review` model comment in schema.prisma.
 */

/** Shown on the reviews page, newest first. */
export function listReviews(take = 60) {
  return db.review.findMany({
    where: { hidden: false },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      rating: true,
      comment: true,
      speciality: true,
      createdAt: true,
    },
  });
}

export type ReviewData = Awaited<ReturnType<typeof listReviews>>[number];

/** The summary above the list — an average nobody has hand-picked. */
export async function getReviewSummary() {
  const rows = await db.review.groupBy({
    by: ["rating"],
    where: { hidden: false },
    _count: { rating: true },
  });

  const counts = new Map(rows.map((r) => [r.rating, r._count.rating]));
  const total = rows.reduce((sum, r) => sum + r._count.rating, 0);
  const points = rows.reduce((sum, r) => sum + r.rating * r._count.rating, 0);

  return {
    total,
    // One decimal place. An average to three decimals reads as a statistic
    // rather than an opinion, and nobody believes 4.333.
    average: total === 0 ? null : Math.round((points / total) * 10) / 10,
    /** How many gave each score, 5 down to 1, for the bar chart. */
    breakdown: [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: counts.get(rating) ?? 0,
      share: total === 0 ? 0 : Math.round(((counts.get(rating) ?? 0) / total) * 100),
    })),
  };
}

/**
 * What a review may contain.
 *
 * The limits are deliberately generous but finite. This endpoint is public and
 * unauthenticated — the only thing standing between it and a script is what is
 * checked here, so a review that would not fit on the page cannot be stored.
 */
export const reviewInput = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please tell us your name.")
    .max(60, "That name is too long."),
  // One message for every way this can be wrong — missing, not a number,
  // fractional, or out of range. The reviewer only ever needs to be told the
  // same thing, and the raw "expected number, received undefined" that zod
  // produces by default is not it.
  rating: z
    .number({ error: "Choose a rating from 1 to 5 stars." })
    .int({ error: "Choose a rating from 1 to 5 stars." })
    .min(1, "Choose a rating from 1 to 5 stars.")
    .max(5, "Choose a rating from 1 to 5 stars."),
  comment: z
    .string()
    .trim()
    .min(10, "Please write a line or two about your visit.")
    .max(1500, "Please keep it under 1500 characters."),
  speciality: z.string().trim().max(60).optional().nullable(),
});

export type NewReview = z.infer<typeof reviewInput>;

/** Record a review. It is live the moment this returns. */
export function addReview(input: NewReview) {
  return db.review.create({
    data: {
      name: input.name,
      rating: input.rating,
      comment: input.comment,
      speciality: input.speciality || null,
    },
    select: { id: true },
  });
}
