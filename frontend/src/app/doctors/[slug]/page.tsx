import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Phone, CalendarPlus, Languages, HomeIcon, BadgeCheck, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getDoctorBySlug } from "@medisure/backend/queries";
import { site } from "@medisure/backend/site";

// Content comes from the database and is edited by hospital staff, so this
// page is regenerated at most every 5 minutes rather than frozen at build
// time. Phase 5 admin mutations will also revalidate affected paths directly.
export const revalidate = 300;


const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) return { title: "Doctor not found" };

  return {
    title: `${doctor.name} — ${doctor.designation}`,
    description: `${doctor.name}, ${doctor.qualifications}, at ${site.name}. Book an appointment online.`,
  };
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) notFound();

  const opSchedules = doctor.schedules.filter((s) => s.serviceType === "OP");
  const homeSchedules = doctor.schedules.filter((s) => s.serviceType === "HOME_PHYSIO");

  // Group OP windows by weekday so the page shows "Mon 9:00–13:00, 17:00–20:00"
  // rather than a wall of rows.
  const byDay = new Map<number, string[]>();
  for (const s of opSchedules) {
    const list = byDay.get(s.dayOfWeek) ?? [];
    list.push(`${s.startTime}–${s.endTime}`);
    byDay.set(s.dayOfWeek, list);
  }

  // Physician structured data — helps the doctor's name rank for local search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    medicalSpecialty: doctor.departments.map((d) => d.department.name),
    workLocation: { "@type": "MedicalClinic", name: site.name },
    knowsLanguage: doctor.languages,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-border bg-brand-50">
        <Container className="py-10 lg:py-14">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-500">
            <Link href="/doctors" className="hover:underline">
              Doctors
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-ink-700">{doctor.name}</span>
          </nav>

          <div className="flex flex-col gap-7 sm:flex-row">
            <div className="relative size-32 shrink-0 overflow-hidden rounded-2xl bg-brand-100 sm:size-40">
              {doctor.photo ? (
                <Image src={doctor.photo} alt="" fill sizes="160px" className="object-cover" />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-full place-items-center font-display text-4xl font-bold text-brand-700"
                >
                  {doctor.name.replace(/^Dr\.?\s+/i, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-brand-950 sm:text-4xl">{doctor.name}</h1>
              <p className="mt-1.5 text-lg font-medium text-brand-700">{doctor.designation}</p>
              <p className="mt-1 text-ink-600">{doctor.qualifications}</p>

              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
                {doctor.experienceYears !== null && (
                  <li className="inline-flex items-center gap-2">
                    <BadgeCheck className="size-4 text-brand-600" aria-hidden="true" />
                    {doctor.experienceYears}+ years experience
                  </li>
                )}
                {doctor.languages.length > 0 && (
                  <li className="inline-flex items-center gap-2">
                    <Languages className="size-4 text-brand-600" aria-hidden="true" />
                    {doctor.languages.join(", ")}
                  </li>
                )}
                {doctor.offersHomePhysio && (
                  <li className="inline-flex items-center gap-2 font-medium text-brand-800">
                    <HomeIcon className="size-4" aria-hidden="true" />
                    Available for home visits
                  </li>
                )}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/book/op?doctor=${doctor.slug}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white transition-colors hover:bg-accent-600"
                >
                  <CalendarPlus className="size-4" aria-hidden="true" />
                  Book Appointment
                </Link>
                {doctor.offersHomePhysio && (
                  <Link
                    href={`/book/home-physio?doctor=${doctor.slug}`}
                    className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-brand-700 bg-white px-6 font-semibold text-brand-800 transition-colors hover:bg-brand-50"
                  >
                    <HomeIcon className="size-4" aria-hidden="true" />
                    Book Home Visit
                  </Link>
                )}
                <a
                  href={`tel:${site.phone.booking}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border bg-white px-6 font-semibold text-ink-700 transition-colors hover:bg-ink-50"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {doctor.bio && (
              <section aria-labelledby="about-doctor">
                <h2 id="about-doctor" className="font-display text-2xl font-bold text-brand-950">
                  About {doctor.name}
                </h2>
                <p className="mt-4 leading-relaxed text-ink-700">{doctor.bio}</p>
              </section>
            )}

            <section aria-labelledby="specialities" className="mt-10">
              <h2 id="specialities" className="font-display text-2xl font-bold text-brand-950">
                Specialities
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {doctor.departments.map(({ department }) => (
                  <li key={department.id}>
                    <Link
                      href={`/specialities/${department.slug}`}
                      className="inline-block rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800 hover:border-brand-400"
                    >
                      {department.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {doctor.regNumber && (
              <p className="mt-10 text-sm text-ink-500">
                Medical council registration: {doctor.regNumber}
              </p>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-950">
                <Clock className="size-5 text-brand-600" aria-hidden="true" />
                OPD timings
              </h2>
              {byDay.size === 0 ? (
                <p className="mt-3 text-sm text-ink-600">
                  Timings not published. Please call the booking desk.
                </p>
              ) : (
                <dl className="mt-4 space-y-2 text-sm">
                  {[1, 2, 3, 4, 5, 6, 0].map((day) =>
                    byDay.has(day) ? (
                      <div key={day} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                        <dt className="font-medium text-ink-700">{DAYS[day]}</dt>
                        <dd className="text-right text-ink-600">{byDay.get(day)!.join(", ")}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              )}
              {opSchedules[0]?.location && (
                <p className="mt-4 text-sm text-ink-500">{opSchedules[0].location}</p>
              )}
            </div>

            {doctor.opFeePaise > 0 && (
              <div className="rounded-2xl border border-border bg-brand-50 p-6">
                <p className="text-sm text-ink-600">Consultation fee</p>
                <p className="mt-1 font-display text-3xl font-bold text-brand-900">
                  ₹{(doctor.opFeePaise / 100).toLocaleString("en-IN")}
                </p>
                {doctor.homeVisitFeePaise && (
                  <p className="mt-3 border-t border-brand-200 pt-3 text-sm text-ink-600">
                    Home visit{" "}
                    <span className="font-semibold text-brand-900">
                      ₹{(doctor.homeVisitFeePaise / 100).toLocaleString("en-IN")}
                    </span>{" "}
                    per session
                  </p>
                )}
              </div>
            )}

            {homeSchedules.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-950">
                  <HomeIcon className="size-5 text-brand-600" aria-hidden="true" />
                  Home visit hours
                </h2>
                <p className="mt-3 text-sm text-ink-600">
                  {homeSchedules[0].startTime}–{homeSchedules[0].endTime}, {homeSchedules.length} days a week
                </p>
                <Link
                  href="/home-physiotherapy"
                  className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
                >
                  See home physiotherapy packages →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
