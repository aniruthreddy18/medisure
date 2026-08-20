import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@medisure/backend/site";
import { formatPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Address, phone numbers and opening hours for ${site.name}.`,
};

export default function ContactPage() {
  const { address } = site;

  // MedicalClinic structured data — this is what puts the hospital's address,
  // hours and phone number into local search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: site.name,
    description: site.description,
    telephone: site.phone.main,
    email: site.email.general,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    availableService: ["Physiotherapy", "Orthopaedics", "General Surgery"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-border bg-brand-50">
        <Container className="py-12 lg:py-16">
          <h1 className="text-4xl font-bold text-brand-950">Contact us</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            For emergencies, call our 24×7 number. For appointments, booking
            online is usually faster than phoning.
          </p>
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border-2 border-emergency/30 bg-emergency/5 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-emergency">
              <AlertTriangle className="size-5" aria-hidden="true" />
              Emergency &amp; ambulance
            </h2>
            <p className="mt-2 text-sm text-ink-600">Available {site.hours.emergency}</p>
            <a
              href={`tel:${site.phone.emergency}`}
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-emergency px-5 font-semibold text-white"
            >
              <Phone className="size-4" aria-hidden="true" />
              {formatPhone(site.phone.emergency)}
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-950">
              <Phone className="size-5 text-brand-600" aria-hidden="true" />
              Appointments
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={`tel:${site.phone.booking}`} className="font-medium text-ink-900 hover:underline">
                  {formatPhone(site.phone.booking)}
                </a>
                <span className="block text-ink-500">Booking desk</span>
              </li>
              <li>
                <a href={`mailto:${site.email.bookings}`} className="font-medium text-ink-900 hover:underline">
                  {site.email.bookings}
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-950">
              <Clock className="size-5 text-brand-600" aria-hidden="true" />
              Hours
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div>
                <dt className="text-ink-500">OPD</dt>
                <dd className="font-medium text-ink-900">{site.hours.opd}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Home physiotherapy</dt>
                <dd className="font-medium text-ink-900">{site.hours.homePhysio}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Emergency</dt>
                <dd className="font-medium text-ink-900">{site.hours.emergency}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-950">
            <MapPin className="size-5 text-brand-600" aria-hidden="true" />
            Find us
          </h2>
          <address className="mt-3 not-italic leading-relaxed text-ink-700">
            {site.name}
            <br />
            {address.street}, {address.locality}
            <br />
            {address.city}, {address.state} {address.postalCode}
          </address>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${site.geo.lat},${site.geo.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-700 px-5 font-semibold text-brand-800 hover:bg-brand-50"
          >
            Open in Google Maps
          </a>
          <p className="mt-4 text-sm text-ink-500">
            An embedded map will be added once the client confirms the exact pin.
          </p>
        </div>

        <p className="mt-8 flex items-start gap-2 text-sm text-ink-500">
          <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          General enquiries: {site.email.general}
        </p>
      </Container>
    </>
  );
}
