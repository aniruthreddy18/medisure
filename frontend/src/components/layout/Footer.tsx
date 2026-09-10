import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { site } from "@medisure/backend/site";
import { formatPhone } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

const columns = [
  {
    title: "Specialities",
    // Same six, in the same order, as the homepage core-speciality grid.
    links: [
      { label: "General Medicine", href: "/specialities/general-medicine" },
      { label: "General Surgery", href: "/specialities/general-surgery" },
      { label: "Orthopaedics", href: "/specialities/orthopaedics" },
      { label: "Physiotherapy", href: "/specialities/physiotherapy" },
      { label: "Gynaecology & Obstetrics", href: "/specialities/gynaecology-obstetrics" },
      { label: "Paediatrics", href: "/specialities/paediatrics" },
      { label: "All Specialities", href: "/specialities" },
    ],
  },
  {
    title: "Patients",
    links: [
      { label: "Book an Appointment", href: "/book" },
      { label: "Home Physiotherapy", href: "/home-physiotherapy" },
      { label: "Insurance & TPA", href: "/insurance" },
      { label: "Free Second Opinion", href: "/second-opinion" },
    ],
  },
  {
    title: "Hospital",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Doctors", href: "/doctors" },
      { label: "Patient Stories", href: "/testimonials" },
      { label: "Gallery", href: "/gallery" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  const { address } = site;

  return (
    <footer className="mt-auto border-t border-border bg-brand-950 text-brand-100">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Identity + contact */}
          <div>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-lg bg-white text-base font-bold text-brand-800"
              >
                M
              </span>
              <span className="font-display text-lg font-bold text-white">
                {site.name}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-200">
              {site.description}
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden="true" />
                <address className="not-italic text-brand-100">
                  {address.street}, {address.locality}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </address>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden="true" />
                <a href={`tel:${site.phone.main}`} className="hover:underline">
                  {formatPhone(site.phone.main)}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden="true" />
                <a href={`mailto:${site.email.general}`} className="hover:underline">
                  {site.email.general}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden="true" />
                <span>
                  OPD {site.hours.opd}
                  <br />
                  Emergency {site.hours.emergency}
                </span>
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-labelledby={`footer-${col.title}`}>
              <h2
                id={`footer-${col.title}`}
                className="font-display text-sm font-semibold uppercase tracking-wider text-white"
              >
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-brand-200 hover:text-white hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Accreditation strip — replace placeholders with the client's real
            certificates. Claiming an accreditation the hospital does not hold
            is a regulatory problem, so these render only when configured. */}
        <div className="mt-12 border-t border-brand-800 pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-brand-300">
              © {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-brand-300">
              <li>
                <Link href="/privacy" className="hover:text-white hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:underline">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white hover:underline">
                  Refund &amp; Cancellation
                </Link>
              </li>
            </ul>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-brand-400">
            The information on this website is for general awareness and is not a
            substitute for professional medical advice, diagnosis or treatment.
            Always consult a qualified doctor about your condition.
          </p>
        </div>
      </Container>
    </footer>
  );
}
