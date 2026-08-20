"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Bone, Stethoscope, ArrowRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

const icons: Record<string, typeof Activity> = {
  Activity,
  Bone,
  Stethoscope,
};

export type CoreDepartment = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  shortDesc: string;
  longDesc: string | null;
  conditions: { id: string; name: string; slug: string }[];
  doctorCount: number;
};

/**
 * The three flagship specialities, in Apollo's centres-of-excellence pattern:
 * tabs on desktop, stacked cards on mobile, each with the two CTAs that
 * matter — find a doctor, or book straight away.
 *
 * Tabs follow the WAI-ARIA tabs pattern: arrow keys move between tabs, only
 * the active tab is in the tab order.
 */
export function CoreSpecialityTabs({ departments }: { departments: CoreDepartment[] }) {
  const [active, setActive] = useState(0);
  if (departments.length === 0) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      e.key === "ArrowRight"
        ? (active + 1) % departments.length
        : (active - 1 + departments.length) % departments.length;
    setActive(next);
    document.getElementById(`spec-tab-${next}`)?.focus();
  };

  return (
    <section className="bg-white py-16 lg:py-24" aria-labelledby="core-specialities">
      <Container>
        <div className="max-w-3xl">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
            What we do best
          </p>
          <h2
            id="core-specialities"
            className="mt-3 text-3xl font-bold text-brand-950 sm:text-4xl"
          >
            Three specialities at the centre of our hospital
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-600">
            Physiotherapy, orthopaedics and general surgery work as one team
            here — the surgeon who operates and the physiotherapist who gets you
            moving again plan your recovery together.
          </p>
        </div>

        {/* Tabs — desktop */}
        <div className="mt-10 hidden lg:block">
          <div role="tablist" aria-label="Core specialities" className="flex gap-2" onKeyDown={onKeyDown}>
            {departments.map((dept, i) => {
              const Icon = icons[dept.icon ?? "Activity"] ?? Activity;
              return (
                <button
                  key={dept.id}
                  id={`spec-tab-${i}`}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  aria-controls={`spec-panel-${i}`}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-t-xl border-b-4 px-5 py-4 text-left transition-colors",
                    i === active
                      ? "border-accent-500 bg-brand-50 text-brand-900"
                      : "border-transparent text-ink-600 hover:bg-ink-50 hover:text-brand-800",
                  )}
                >
                  <Icon className="size-6 shrink-0" aria-hidden="true" />
                  <span className="font-display text-lg font-semibold">{dept.name}</span>
                </button>
              );
            })}
          </div>

          {departments.map((dept, i) => (
            <div
              key={dept.id}
              id={`spec-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`spec-tab-${i}`}
              hidden={i !== active}
              tabIndex={0}
              className="rounded-b-2xl border border-t-0 border-border bg-brand-50/40 p-8"
            >
              <DepartmentBody dept={dept} />
            </div>
          ))}
        </div>

        {/* Stacked cards — mobile & tablet */}
        <div className="mt-10 grid gap-5 lg:hidden">
          {departments.map((dept) => {
            const Icon = icons[dept.icon ?? "Activity"] ?? Activity;
            return (
              <article
                key={dept.id}
                className="rounded-2xl border border-border bg-brand-50/40 p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-700 text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-xl font-semibold text-brand-900">
                    {dept.name}
                  </h3>
                </div>
                <div className="mt-4">
                  <DepartmentBody dept={dept} />
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function DepartmentBody({ dept }: { dept: CoreDepartment }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="text-base leading-relaxed text-ink-700">
          {dept.longDesc ?? dept.shortDesc}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/doctors?department=${dept.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-700 bg-white px-5 font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            <Users className="size-4" aria-hidden="true" />
            Find a Doctor
          </Link>
          <Link
            href={`/book/op?department=${dept.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-500 px-5 font-semibold text-white transition-colors hover:bg-accent-600"
          >
            Book Appointment
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <p className="mt-4 text-sm text-ink-500">
          {dept.doctorCount} {dept.doctorCount === 1 ? "specialist" : "specialists"} in this department
        </p>
      </div>

      {dept.conditions.length > 0 && (
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-brand-800">
            Conditions &amp; procedures we treat
          </h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {dept.conditions.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/specialities/${dept.slug}#${c.slug}`}
                  className="inline-block rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-sm text-brand-800 transition-colors hover:border-brand-400 hover:bg-brand-50"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
