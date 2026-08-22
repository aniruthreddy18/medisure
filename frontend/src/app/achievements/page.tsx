import type { Metadata } from "next";
import Image from "next/image";
import { Award } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { db } from "@medisure/backend/db";
import { site } from "@medisure/backend/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Achievements & Milestones",
  description: `Awards, accreditations and clinical milestones at ${site.name}.`,
};

export default async function AchievementsPage() {
  const achievements = await db.achievement.findMany({
    where: { active: true },
    // Latest first. Undated entries sort last rather than jumping to the top,
    // which is what a plain DESC would do with NULLs in Postgres.
    orderBy: [{ year: { sort: "desc", nulls: "last" } }, { order: "asc" }],
  });

  return (
    <>
      <header className="border-b border-ink-200 bg-brand-950 text-white">
        <Container className="py-14 lg:py-20">
          <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-brand-300">
            <Award className="size-4" aria-hidden="true" />
            Milestones
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">
            Achievements &amp; recognition
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
            Awards, accreditations and the clinical milestones our teams have
            reached — most recent first.
          </p>
        </Container>
      </header>

      <Container className="py-14 lg:py-20">
        {achievements.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink-300 p-12 text-center text-ink-600">
            No achievements have been published yet.
          </p>
        ) : (
          <ol className="space-y-14 lg:space-y-20">
            {achievements.map((item, i) => {
              // Alternate the two halves down the page: text left / photo right,
              // then photo left / text right. Reads as a rhythm rather than a
              // stack of identical rows.
              const photoFirst = i % 2 === 1;

              return (
                <li
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-6 lg:gap-12"
                >
                  {/* Photo — 7 of 12 columns */}
                  <div
                    className={[
                      "col-span-12 lg:col-span-7",
                      photoFirst ? "lg:order-1" : "lg:order-2",
                    ].join(" ")}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-900">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 58vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        /* No photograph supplied yet. A branded panel shows the
                           client exactly where their image will sit, rather
                           than a stock photo that misrepresents the hospital. */
                        <div aria-hidden="true" className="absolute inset-0">
                          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_25%_0%,var(--color-brand-600),var(--color-brand-950))]" />
                          <div className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(135deg,#fff_0_2px,transparent_2px_14px)]" />
                          <div className="absolute inset-0 grid place-items-center">
                            <Award className="size-12 text-white/25" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Copy — 5 of 12 columns */}
                  <div
                    className={[
                      "col-span-12 lg:col-span-5",
                      photoFirst ? "lg:order-2" : "lg:order-1",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                        <Award className="size-4" aria-hidden="true" />
                      </span>
                      {item.year && (
                        <span className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
                          {item.year}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
                      {item.title}
                    </h2>

                    {item.caption && (
                      <p className="mt-3 text-lg leading-relaxed text-ink-600">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Container>
    </>
  );
}
