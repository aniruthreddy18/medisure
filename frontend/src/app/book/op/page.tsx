import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { OpBookingFlow } from "@/components/booking/OpBookingFlow";
import { db } from "@medisure/backend/db";

export const metadata: Metadata = {
  title: "Book an OP Consultation",
  description: "Choose a speciality, doctor and time slot, and confirm your appointment online.",
};

// Availability must never be served from a cache.
export const dynamic = "force-dynamic";

export default async function OpBookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const [departments, doctors] = await Promise.all([
    db.department.findMany({ where: { active: true }, orderBy: [{ isCore: "desc" }, { order: "asc" }] }),
    db.doctor.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }],
      include: { departments: { include: { department: true } } },
    }),
  ]);

  return (
    <Container className="py-10 lg:py-14">
      <h1 className="text-3xl font-bold text-brand-950 sm:text-4xl">Book an OP consultation</h1>
      <p className="mt-2 text-ink-600">Takes about two minutes.</p>

      <div className="mt-10">
        <OpBookingFlow
          departments={departments.map((d) => ({ id: d.id, name: d.name, slug: d.slug }))}
          doctors={doctors.map((d) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            designation: d.designation,
            qualifications: d.qualifications,
            experienceYears: d.experienceYears,
            opFeePaise: d.opFeePaise,
            departments: d.departments.map((x) => ({
              department: { id: x.department.id, name: x.department.name, slug: x.department.slug },
            })),
          }))}
          initialDepartment={pick("department")}
          initialDoctor={pick("doctor")}
        />
      </div>
    </Container>
  );
}
