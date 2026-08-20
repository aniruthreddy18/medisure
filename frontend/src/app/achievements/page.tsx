import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { db } from "@medisure/backend/db";
import { Award } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Achievements & Milestones",
  description: "Awards, accreditations and clinical milestones from our hospital.",
};

export default async function AchievementsPage() {
  const achievements = await db.achievement.findMany({
    where: { active: true },
    orderBy: [{ year: "desc" }, { order: "asc" }],
  });

  return (
    <>
      <header className="border-b border-border bg-brand-950 text-white">
        <Container className="py-12 lg:py-16">
          <h1 className="text-4xl font-bold">Achievements &amp; milestones</h1>
          <p className="mt-3 max-w-2xl text-lg text-brand-100">
            Awards, accreditations and the clinical milestones our teams have
            reached.
          </p>
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        <ol className="relative space-y-8 border-l-2 border-border pl-8">
          {achievements.map((a) => (
            <li key={a.id} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[2.6rem] grid size-8 place-items-center rounded-full border-2 border-border bg-white text-brand-600"
              >
                <Award className="size-4" />
              </span>
              {a.year && (
                <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
                  {a.year}
                </p>
              )}
              <h2 className="mt-1 font-display text-xl font-bold text-brand-950">{a.title}</h2>
              {a.caption && <p className="mt-2 max-w-2xl leading-relaxed text-ink-600">{a.caption}</p>}
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
