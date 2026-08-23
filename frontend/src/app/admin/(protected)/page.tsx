import Link from "next/link";
import { Pencil } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { db } from "@medisure/backend/db";

export const dynamic = "force-dynamic";

export default async function AdminDoctorsPage() {
  const doctors = await db.doctor.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      designation: true,
      opFeePaise: true,
      active: true,
      departments: { select: { department: { select: { name: true } } } },
    },
  });

  return (
    <Container className="max-w-5xl py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900">Doctors</h1>
      <p className="mt-1.5 text-sm text-ink-600">
        {doctors.length} in the system. Changes appear on the website within a
        few minutes.
      </p>

      <ul className="mt-8 divide-y divide-ink-200 overflow-hidden rounded-2xl border border-ink-200 bg-white">
        {doctors.map((doctor) => (
          <li key={doctor.id}>
            <Link
              href={`/admin/doctors/${doctor.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-brand-50"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium text-ink-900">
                  {doctor.name}
                  {!doctor.active && (
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">
                      Hidden
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-500">
                  {doctor.designation}
                  {doctor.departments[0] && ` · ${doctor.departments[0].department.name}`}
                </p>
              </div>

              <span className="shrink-0 text-sm tabular-nums text-ink-600">
                ₹{(doctor.opFeePaise / 100).toLocaleString("en-IN")}
              </span>
              <Pencil className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
