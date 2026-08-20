import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { getDepartmentBySlug } from "@medisure/backend/queries";
import { site } from "@medisure/backend/site";

// Content comes from the database and is edited by hospital staff, so this
// page is regenerated at most every 5 minutes rather than frozen at build
// time. Phase 5 admin mutations will also revalidate affected paths directly.
export const revalidate = 300;


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dept = await getDepartmentBySlug(slug);
  if (!dept) return { title: "Speciality not found" };

  return {
    title: dept.metaTitle ?? `${dept.name} in ${site.address.city}`,
    description: dept.metaDesc ?? dept.shortDesc,
  };
}

export default async function SpecialityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dept = await getDepartmentBySlug(slug);
  if (!dept) notFound();

  const doctors = dept.doctors.map((d) => d.doctor);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalSpecialty",
    name: dept.name,
    description: dept.shortDesc,
    provider: { "@type": "MedicalClinic", name: site.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-border bg-brand-950 text-white">
        <Container className="py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-brand-300">
            <Link href="/specialities" className="hover:underline">
              Specialities
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-brand-100">{dept.name}</span>
          </nav>

          <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">
            {dept.name} in {site.address.city}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
            {dept.longDesc ?? dept.shortDesc}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/book/op?department=${dept.slug}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white transition-colors hover:bg-accent-600"
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              Book Appointment
            </Link>
            <Link
              href={`/doctors?department=${dept.slug}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 px-6 font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Users className="size-4" aria-hidden="true" />
              Find a Doctor
            </Link>
          </div>
        </Container>
      </header>

      {dept.conditions.length > 0 && (
        <section className="bg-white py-14" aria-labelledby="conditions">
          <Container>
            <h2 id="conditions" className="font-display text-2xl font-bold text-brand-950 sm:text-3xl">
              Conditions &amp; procedures we treat
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dept.conditions.map((c) => (
                <article
                  key={c.id}
                  id={c.slug}
                  className="scroll-mt-32 rounded-2xl border border-border bg-white p-6"
                >
                  <h3 className="font-display text-lg font-semibold text-brand-900">{c.name}</h3>
                  <p className="mt-2 leading-relaxed text-ink-600">{c.summary}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}

      {doctors.length > 0 && (
        <section className="bg-brand-50 py-14" aria-labelledby="dept-doctors">
          <Container>
            <h2 id="dept-doctors" className="font-display text-2xl font-bold text-brand-950 sm:text-3xl">
              Our {dept.name.toLowerCase()} specialists
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {dept.testimonials.length > 0 && (
        <section className="bg-white py-14" aria-labelledby="dept-stories">
          <Container>
            <h2 id="dept-stories" className="font-display text-2xl font-bold text-brand-950 sm:text-3xl">
              Patient stories from this department
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {dept.testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={{ ...t, department: null }} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
