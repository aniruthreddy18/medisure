import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { StatsBand } from "@/components/home/StatsBand";
import { getStats, getAllDepartments } from "@medisure/backend/queries";
import { site } from "@medisure/backend/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${site.name} — our specialities, our team and how we care for patients.`,
};

export default async function AboutPage() {
  const [stats, departments] = await Promise.all([getStats(), getAllDepartments()]);

  return (
    <>
      <header className="border-b border-border bg-brand-950 text-white">
        <Container className="py-14 lg:py-20">
          <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">
            Care that keeps you moving
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
            {site.description}
          </p>
        </Container>
      </header>

      <StatsBand stats={stats} />

      <Container className="py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5 text-lg leading-relaxed text-ink-700">
            {/* Content supplied by the hospital in writing. Kept close to their
                own wording — no added superlatives or outcome claims. */}
            <h2 className="font-display text-2xl font-bold text-ink-900">
              About MediSure Hospital
            </h2>
            <p>
              Our hospital is a premier multi-speciality healthcare centre,
              dedicated to providing transparent, ethical, structured and
              patient-oriented care under the guidance of advanced and
              experienced medical expertise.
            </p>
            <p>
              Located in the heart of Kukatpally, MediSure provides comprehensive
              and compassionate medical and surgical care to patients belonging
              to all age groups.
            </p>
            <p>
              The hospital is strengthened by well-certified and experienced
              teams of specialists, along with experienced nursing and trained
              medical staff, to provide patient safety and comfort throughout the
              course of treatment.
            </p>
            <p>
              Apart from regular modes of payment, seamless insurance support is
              provided under one roof.
            </p>
            <p>
              We are committed to maintaining hospital safety and the quality of
              care given to our patients, and we dedicate our services to helping
              them achieve better healthcare outcomes.
            </p>

            <p className="border-l-4 border-brand-600 pl-5 font-display text-2xl font-bold text-brand-700">
              &ldquo;Your health is our priority&rdquo;
            </p>
          </div>

          <aside>
            <h2 className="font-display text-lg font-bold text-brand-950">Departments</h2>
            <ul className="mt-4 space-y-2">
              {departments.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/specialities/${d.slug}`}
                    className="block rounded-xl border border-border bg-white px-5 py-3.5 font-medium text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </>
  );
}
