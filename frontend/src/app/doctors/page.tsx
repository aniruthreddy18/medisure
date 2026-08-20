import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";
import { getDoctors, getAllDepartments, getDoctorLanguages } from "@medisure/backend/queries";

export const metadata: Metadata = {
  title: "Our Doctors",
  description:
    "Meet our specialists in physiotherapy, orthopaedics and general surgery. Filter by speciality, language, gender or home-visit availability.",
};

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const filters = {
    department: pick("department"),
    gender: pick("gender"),
    language: pick("language"),
    service: pick("service"),
    q: pick("q"),
  };

  const [doctors, departments, languages] = await Promise.all([
    getDoctors(filters),
    getAllDepartments(),
    getDoctorLanguages(),
  ]);

  return (
    <>
      <header className="border-b border-border bg-brand-50">
        <Container className="py-12 lg:py-16">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
            Our team
          </p>
          <h1 className="mt-3 text-4xl font-bold text-brand-950">
            Meet Our Doctors ({doctors.length})
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            Every doctor here is a full-time consultant at the hospital. Filter
            by speciality, by the language you are most comfortable in, or by who
            offers home visits.
          </p>
        </Container>
      </header>

      <Container className="py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
          <aside aria-label="Filter doctors" className="lg:sticky lg:top-32 lg:self-start">
            <Suspense fallback={<p className="text-sm text-ink-500">Loading filters…</p>}>
              <DoctorFilters
                departments={departments.map((d) => ({ value: d.slug, label: d.name }))}
                languages={languages}
                total={doctors.length}
              />
            </Suspense>
          </aside>

          <div>
            {doctors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="font-display text-lg font-semibold text-brand-900">
                  No doctors match these filters
                </p>
                <p className="mt-2 text-ink-600">
                  Try clearing a filter, or call our booking desk and we will help
                  you find the right specialist.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {doctors.map((doc) => (
                  <DoctorCard key={doc.id} doctor={doc} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
