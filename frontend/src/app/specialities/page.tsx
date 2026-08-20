import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getAllDepartments } from "@medisure/backend/queries";

// Content comes from the database and is edited by hospital staff, so this
// page is regenerated at most every 5 minutes rather than frozen at build
// time. Phase 5 admin mutations will also revalidate affected paths directly.
export const revalidate = 300;


export const metadata: Metadata = {
  title: "Specialities",
  description:
    "Physiotherapy, orthopaedics, general surgery and more — the departments and treatments available at our hospital.",
};

export default async function SpecialitiesPage() {
  const departments = await getAllDepartments();
  const core = departments.filter((d) => d.isCore);
  const others = departments.filter((d) => !d.isCore);

  return (
    <>
      <header className="border-b border-border bg-brand-50">
        <Container className="py-12 lg:py-16">
          <h1 className="text-4xl font-bold text-brand-950">Our Specialities</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            We focus on three areas — physiotherapy, orthopaedics and general
            surgery — supported by the departments a hospital needs around them.
          </p>
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
          Centres of excellence
        </h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {core.map((dept) => (
            <Link
              key={dept.id}
              href={`/specialities/${dept.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-white p-7 transition-shadow hover:shadow-md"
            >
              <h3 className="font-display text-xl font-bold text-brand-950">{dept.name}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-ink-600">{dept.shortDesc}</p>
              <span className="mt-5 text-sm text-ink-500">
                {dept._count.doctors} specialists
              </span>
              <span className="mt-4 inline-flex items-center gap-2 font-semibold text-accent-600">
                Explore
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>

        {others.length > 0 && (
          <>
            <h2 className="mt-14 font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
              Other departments
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((dept) => (
                <li key={dept.id}>
                  <Link
                    href={`/specialities/${dept.slug}`}
                    className="block rounded-xl border border-border bg-white p-5 transition-colors hover:border-brand-400 hover:bg-brand-50"
                  >
                    <span className="font-display font-semibold text-brand-900">{dept.name}</span>
                    <span className="mt-1 block text-sm text-ink-600">{dept.shortDesc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </>
  );
}
