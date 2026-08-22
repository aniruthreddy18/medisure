import type { Metadata } from "next";
import Link from "next/link";
import { Building2, HomeIcon, ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@medisure/backend/site";
import { formatPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Book an OP consultation at the hospital.",
};

export default function BookIndexPage() {
  return (
    <Container className="py-14 lg:py-20">
      <h1 className="text-4xl font-bold text-brand-950">Book an appointment</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        See a doctor at the hospital, or arrange home physiotherapy by phone.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Link
          href="/book/op"
          className="group flex flex-col rounded-2xl border border-border bg-white p-8 transition-shadow hover:shadow-md"
        >
          <span className="grid size-12 place-items-center rounded-xl bg-brand-700 text-white">
            <Building2 className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-brand-950">
            OP Consultation
          </h2>
          <p className="mt-2 flex-1 text-ink-600">
            See a doctor at the hospital. Pick your speciality, doctor and a time
            slot that works for you.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-600">
            Continue
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>

        {/* Not a link, on purpose -- there's no self-service booking for
            home physiotherapy, only OP consultations. Reception arranges
            visits by phone. */}
        <div className="flex flex-col rounded-2xl border border-accent-200 bg-accent-50 p-8">
          <span className="grid size-12 place-items-center rounded-xl bg-accent-500 text-white">
            <HomeIcon className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-brand-950">
            Home Physiotherapy
          </h2>
          <p className="mt-2 flex-1 text-ink-600">
            A physiotherapist comes to you. Call reception and we&apos;ll
            arrange your first visit.
          </p>
          <a
            href={`tel:${site.phone.reception}`}
            className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-600 hover:underline"
          >
            <Phone className="size-4" aria-hidden="true" />
            {formatPhone(site.phone.reception)}
          </a>
        </div>
      </div>
    </Container>
  );
}
