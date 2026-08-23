import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { db } from "@medisure/backend/db";
import { DoctorForm } from "@/components/admin/DoctorForm";

export const dynamic = "force-dynamic";

export default async function EditDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doctor = await db.doctor.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      designation: true,
      qualifications: true,
      experienceYears: true,
      regNumber: true,
      languages: true,
      bio: true,
      opFeePaise: true,
      homeVisitFeePaise: true,
      offersHomePhysio: true,
      active: true,
    },
  });

  if (!doctor) notFound();

  return (
    <Container className="max-w-2xl py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All doctors
      </Link>

      <h1 className="mt-5 font-display text-2xl font-bold text-ink-900">{doctor.name}</h1>

      <DoctorForm doctor={doctor} />
    </Container>
  );
}
