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
import { getAllDepartments, getPackages } from "@medisure/backend/queries";
import { site } from "@medisure/backend/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Medical Services",
  description:
    "Consultations, surgery, physiotherapy, home visits, diagnostics and emergency care — everything the hospital offers in one place.",
};

const services = [
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
    href: "/home-physiotherapy",
    cta: "See packages",
  },
  {
    icon: Activity,
    title: "Surgery & Procedures",
    body: "Laparoscopic and open surgery, joint replacement, arthroscopy and day-care procedures.",
    href: "/specialities/general-surgery",
    cta: "Explore surgery",
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
    href: "/specialities/diagnostics",
    cta: "About diagnostics",
  },
  {
    icon: Syringe,
    title: "Rehabilitation",
    body: "Structured recovery programmes after surgery, stroke or injury, run with your treating doctor.",
    href: "/specialities/physiotherapy",
    cta: "About rehab",
  },
];

export default async function MedicalServicesPage() {
  const [departments, packages] = await Promise.all([getAllDepartments(), getPackages()]);

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
            return (
              <li key={service.title}>
                <Link
                  href={service.href}
                  className="group flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-7 transition-shadow hover:shadow-md"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 font-display text-xl font-bold text-ink-900">
                    {service.title}
                  </h2>
                  <p className="mt-2 flex-1 leading-relaxed text-ink-600">{service.body}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-700">
                    {service.cta}
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

        {/* Home physio packages */}
        {packages.length > 0 && (
          <section aria-labelledby="hp-packages" className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="hp-packages" className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                Home physiotherapy packages
              </h2>
              <Link
                href="/home-physiotherapy"
                className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
              >
                See all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {packages.slice(0, 4).map((pkg) => (
                <li key={pkg.id}>
                  <Link
                    href="/home-physiotherapy"
                    className="block rounded-xl border border-ink-200 bg-white p-5 transition-colors hover:border-brand-400"
                  >
                    <span className="block font-medium text-ink-900">{pkg.name}</span>
                    <span className="mt-2 block font-display text-xl font-bold text-brand-700">
                      ₹{(pkg.pricePaise / 100).toLocaleString("en-IN")}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-500">
                      {pkg.sessionCount} {pkg.sessionCount === 1 ? "session" : "sessions"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
