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
          <div className="space-y-6 text-lg leading-relaxed text-ink-700">
            {/* TODO(client): replace with the hospital's own story, written by them. */}
            <h2 className="font-display text-2xl font-bold text-brand-950">Who we are</h2>
            <p>
              We are a multi-speciality hospital built around three connected
              strengths: orthopaedics, general surgery, and the physiotherapy
              that turns a successful operation into an actual recovery.
            </p>
            <p>
              Most hospitals treat rehabilitation as an afterthought. Here the
              surgeon who operates and the physiotherapist who gets you walking
              again plan your recovery together, from the first consultation.
              For patients who cannot travel — after major surgery, after a
              stroke, or simply because of age — our physiotherapists continue
              that treatment at home.
            </p>
            <p className="rounded-xl border border-dashed border-border bg-ink-50 p-5 text-base text-ink-600">
              This section is placeholder copy. The hospital&apos;s own history,
              founder&apos;s note, leadership profiles and infrastructure details
              should replace it before launch.
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
