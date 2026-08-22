import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Hero } from "@/components/hero/Hero";
import { CoreSpecialityBoxes } from "@/components/specialities/CoreSpecialityBoxes";
import { ExperienceSection } from "@/components/home/ExperienceSection";
import { ReelsSection } from "@/components/home/ReelsSection";
import { StoriesScroller } from "@/components/home/StoriesScroller";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import {
  getCoreDepartments,
  getTestimonials,
  getFaqs,
  getInsurers,
  getStats,
} from "@medisure/backend/queries";

// Content is edited by hospital staff, so this regenerates rather than being
// frozen at build time.
export const revalidate = 300;

/**
 * Homepage section order, as specified by the client:
 *   hero → specialities → insurance → experience → reels → patient stories → FAQ
 *
 * Achievements and the doctor panel deliberately do NOT appear here — both
 * live on their own pages, reached from the nav, so the homepage stays short.
 */
export default async function HomePage() {
  const [coreDepts, testimonials, faqs, insurers, stats] = await Promise.all([
    getCoreDepartments(),
    getTestimonials(8),
    getFaqs(),
    getInsurers(),
    getStats(),
  ]);

  return (
    <>
      <Hero />

      <CoreSpecialityBoxes
        departments={coreDepts.map((d) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          icon: d.icon,
          doctorCount: d._count.doctors,
        }))}
      />

      {/* Insurance — sits directly under core specialities */}
      {insurers.length > 0 && (
        <section className="bg-white py-16 lg:py-20" aria-labelledby="insurance">
          <Container>
            <div className="rounded-2xl border border-ink-200 bg-brand-50/50 p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <h2
                    id="insurance"
                    className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900"
                  >
                    <ShieldCheck className="size-6 text-brand-600" aria-hidden="true" />
                    Insurance &amp; cashless treatment
                  </h2>
                  <p className="mt-2 text-ink-600">
                    Seamless insurance support under one roof. Carry your policy
                    details and a photo ID when you visit.
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
                    className="rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm text-ink-700"
                  >
                    {ins.name}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      <ExperienceSection stats={stats} />

      <ReelsSection />

      <StoriesScroller testimonials={testimonials} />

      {/* FAQ last */}
      <FaqAccordion faqs={faqs} />
    </>
  );
}
