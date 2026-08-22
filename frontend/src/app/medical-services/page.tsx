import type { Metadata } from "next";
import Link from "next/link";
import {
  Stethoscope,
  HomeIcon,
  Activity,
  ScanLine,
  Syringe,
  Ambulance,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getAllDepartments } from "@medisure/backend/queries";
import { site } from "@medisure/backend/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Medical Services",
  description:
    "Consultations, surgery, physiotherapy, home visits, diagnostics and emergency care — everything the hospital offers in one place.",
};

/**
 * Each card is either a link somewhere useful (`href` + `cta`) or a plain
 * status card (`available: true`, no click target at all). Home Physio,
 * Diagnostics and Rehab were previously links, but Diagnostics pointed at
 * `/specialities/diagnostics`, a department slug that doesn't exist — a dead
 * link — and the client asked for the other two to stop redirecting as well,
 * so all three became "Available" status cards instead. Surgery & Procedures
 * keeps its info but drops the "Explore surgery" CTA per the same request,
 * without a status badge since none was asked for.
 */
const services: {
  icon: typeof Stethoscope;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  available?: boolean;
}[] = [
  {
    icon: Stethoscope,
    title: "OP Consultations",
    body: "See a specialist at the hospital. Book a slot online and skip the queue at the desk.",
    href: "/book/op",
    cta: "Book a consultation",
  },
  {
    icon: HomeIcon,
    title: "Home Physiotherapy",
    body: "A physiotherapist treats you at home — single visits or session packages for longer recoveries.",
    available: true,
  },
  {
    icon: Activity,
    title: "Surgery & Procedures",
    body: "Laparoscopic and open surgery, joint replacement, arthroscopy and day-care procedures.",
  },
  {
    icon: ClipboardCheck,
    title: "Second Opinion",
    body: "Been advised an operation? Have another specialist review the case, free of charge.",
    href: "/second-opinion",
    cta: "Request an opinion",
  },
  {
    icon: ScanLine,
    title: "Diagnostics & Imaging",
    body: "X-ray, ultrasound and laboratory services on site, so results reach your doctor the same day.",
    available: true,
  },
  {
    icon: Syringe,
    title: "Rehabilitation",
    body: "Structured recovery programmes after surgery, stroke or injury, run with your treating doctor.",
    available: true,
  },
];

export default async function MedicalServicesPage() {
  const departments = await getAllDepartments();

  return (
    <>
      <header className="border-b border-ink-200 bg-ink-50">
        <Container className="py-14 lg:py-20">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
            What we offer
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-ink-900 sm:text-5xl">
            Medical services
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
            Everything available at the hospital and at your home, in one place.
            If you are not sure which service you need, call our desk and we will
            point you to the right department.
          </p>
        </Container>
      </header>

      <Container className="py-14 lg:py-20">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            const body = (
              <>
                <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold text-ink-900">
                  {service.title}
                </h2>
                <p className="mt-2 flex-1 leading-relaxed text-ink-600">{service.body}</p>

                {service.href && service.cta ? (
                  <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-700">
                    {service.cta}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                ) : (
                  service.available && (
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  )
                )}
              </>
            );

            return (
              <li key={service.title}>
                {service.href ? (
                  <Link
                    href={service.href}
                    className="group flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-7 transition-shadow hover:shadow-md"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-7">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Emergency */}
        <div className="mt-8 flex flex-col gap-5 rounded-2xl bg-brand-950 p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-600">
              <Ambulance className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Emergency &amp; ambulance</h2>
              <p className="mt-1 text-white/75">
                Available {site.hours.emergency}. Do not book online in an
                emergency — call us.
              </p>
            </div>
          </div>
          <a
            href={`tel:${site.phone.emergency}`}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-white px-7 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Call now
          </a>
        </div>

        {/* Departments */}
        <section aria-labelledby="departments" className="mt-16">
          <h2 id="departments" className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            Departments
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <li key={dept.id}>
                <Link
                  href={`/specialities/${dept.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white px-5 py-4 transition-colors hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="font-medium text-ink-800">{dept.name}</span>
                  <span className="text-sm text-ink-500">{dept._count.doctors}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
