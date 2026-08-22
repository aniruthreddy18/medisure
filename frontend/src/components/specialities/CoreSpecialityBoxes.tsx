import Link from "next/link";
import { Activity, Bone, Stethoscope, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

const icons: Record<string, typeof Activity> = { Activity, Bone, Stethoscope };

export type CoreDept = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  doctorCount: number;
};

/**
 * The three flagship specialities as plain red boxes.
 *
 * No body copy by design — the client wants the three names to register
 * instantly rather than be read. The only supporting detail is the number of
 * specialists, which is a fact rather than marketing prose.
 */
export function CoreSpecialityBoxes({ departments }: { departments: CoreDept[] }) {
  if (departments.length === 0) return null;

  return (
    <section className="bg-white py-16 lg:py-20" aria-labelledby="core-specialities">
      <Container>
        <h2
          id="core-specialities"
          className="text-center font-display text-3xl font-bold text-ink-900 sm:text-4xl"
        >
          Our core specialities
        </h2>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {departments.map((dept) => {
            const Icon = icons[dept.icon ?? "Activity"] ?? Activity;
            return (
              <li key={dept.id}>
                <Link
                  href={`/specialities/${dept.slug}`}
                  className="group flex h-full flex-col items-center justify-center gap-4 rounded-2xl bg-brand-600 px-6 py-12 text-center text-white transition-colors hover:bg-brand-700"
                >
                  <span className="grid size-14 place-items-center rounded-full bg-white/15">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>

                  <h3 className="font-display text-2xl font-bold leading-tight">{dept.name}</h3>

                  <span className="text-sm text-white/75">
                    {dept.doctorCount}{" "}
                    {dept.doctorCount === 1 ? "specialist" : "specialists"}
                  </span>

                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    View department
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
