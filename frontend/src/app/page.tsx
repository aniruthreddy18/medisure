import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { AchievementSlider } from "@/components/hero/AchievementSlider";
import { ActionRail } from "@/components/hero/ActionRail";
import { CoreSpecialityTabs } from "@/components/specialities/CoreSpecialityTabs";
import { BookingSplit } from "@/components/home/BookingSplit";
import { StatsBand } from "@/components/home/StatsBand";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { VideoGrid } from "@/components/video/VideoGrid";
import {
  getHeroAchievements,
  getCoreDepartments,
  getFeaturedDoctors,
  getTestimonials,
  getVideos,
  getFaqs,
  getInsurers,
  getStats,
  getNewsAchievements,
} from "@medisure/backend/queries";

// Content comes from the database and is edited by hospital staff, so this
// page is regenerated at most every 5 minutes rather than frozen at build
// time. Phase 5 admin mutations will also revalidate affected paths directly.
export const revalidate = 300;


export default async function HomePage() {
  // One round of parallel reads rather than a waterfall of awaits.
  const [slides, coreDepts, doctors, testimonials, videos, faqs, insurers, stats, news] =
    await Promise.all([
      getHeroAchievements(),
      getCoreDepartments(),
      getFeaturedDoctors(6),
      getTestimonials(3),
      getVideos(3),
      getFaqs(),
      getInsurers(),
      getStats(),
      getNewsAchievements(4),
    ]);

  return (
    <>
      <AchievementSlider slides={slides} />
      <ActionRail />

      <CoreSpecialityTabs
        departments={coreDepts.map((d) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          icon: d.icon,
          shortDesc: d.shortDesc,
          longDesc: d.longDesc,
          conditions: d.conditions.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
          doctorCount: d._count.doctors,
        }))}
      />

      <BookingSplit />
      <StatsBand stats={stats} />

      {/* Doctors */}
      {doctors.length > 0 && (
        <section className="bg-white py-16 lg:py-24" aria-labelledby="doctors">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
                  Our team
                </p>
                <h2 id="doctors" className="mt-3 text-3xl font-bold text-brand-950 sm:text-4xl">
                  Meet the specialists who will treat you
                </h2>
              </div>
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
              >
                View all doctors
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Patient stories */}
      {testimonials.length > 0 && (
        <section className="bg-brand-50 py-16 lg:py-24" aria-labelledby="stories">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
                  Patient stories
                </p>
                <h2 id="stories" className="mt-3 text-3xl font-bold text-brand-950 sm:text-4xl">
                  Recoveries our patients agreed to share
                </h2>
              </div>
              <Link
                href="/testimonials"
                className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
              >
                Read more stories
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section className="bg-white py-16 lg:py-24" aria-labelledby="videos">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
                  Watch
                </p>
                <h2 id="videos" className="mt-3 text-3xl font-bold text-brand-950 sm:text-4xl">
                  Inside the hospital
                </h2>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
              >
                All videos &amp; photos
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-9">
              <VideoGrid videos={videos} />
            </div>
          </Container>
        </section>
      )}

      {/* What's new */}
      {news.length > 0 && (
        <section className="border-y border-border bg-ink-50 py-14" aria-labelledby="whats-new">
          <Container>
            <h2 id="whats-new" className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
              What&apos;s new at {"the hospital"}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {news.map((item) => (
                <li key={item.id} className="rounded-xl border border-border bg-white p-5">
                  {item.year && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">
                      {item.year}
                    </span>
                  )}
                  <p className="mt-1.5 font-display font-semibold leading-snug text-brand-900">
                    {item.title}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Insurance */}
      {insurers.length > 0 && (
        <section className="bg-white py-14" aria-labelledby="insurance">
          <Container>
            <div className="rounded-2xl border border-border bg-brand-50/50 p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <h2
                    id="insurance"
                    className="flex items-center gap-2 font-display text-xl font-bold text-brand-950"
                  >
                    <ShieldCheck className="size-5 text-brand-600" aria-hidden="true" />
                    Insurance &amp; cashless treatment
                  </h2>
                  <p className="mt-2 text-ink-600">
                    We are empanelled with leading insurers and TPAs. Carry your
                    policy details and a photo ID when you visit.
                  </p>
                </div>
                <Link
                  href="/insurance"
                  className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
                >
                  See all insurers
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>

              <ul className="mt-6 flex flex-wrap gap-2.5">
                {insurers.slice(0, 8).map((ins) => (
                  <li
                    key={ins.id}
                    className="rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-ink-700"
                  >
                    {ins.name}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      <FaqAccordion faqs={faqs} />
    </>
  );
}
