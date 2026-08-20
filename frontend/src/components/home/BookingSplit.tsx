import Link from "next/link";
import { Building2, HomeIcon, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * The two booking categories the hospital runs, given equal weight.
 * This is the fork the whole booking portal hangs off, so it gets a full
 * section rather than a menu item.
 */
export function BookingSplit() {
  return (
    <section className="bg-brand-950 py-16 lg:py-20" aria-labelledby="booking-split">
      <Container>
        <div className="max-w-2xl">
          <h2 id="booking-split" className="text-3xl font-bold text-white sm:text-4xl">
            Visit us, or we come to you
          </h2>
          <p className="mt-3 text-lg text-brand-200">
            Book a consultation at the hospital, or have a physiotherapist treat
            you at home.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            href="/book/op"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-7 transition-transform hover:-translate-y-0.5"
          >
            <div>
              <span className="grid size-12 place-items-center rounded-xl bg-brand-700 text-white">
                <Building2 className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-brand-950">
                OP Consultation
              </h3>
              <p className="mt-2 text-ink-600">
                Choose your speciality and doctor, pick a time that suits you and
                confirm in a couple of minutes.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-ink-600">
                <li className="flex items-center gap-2">
                  <Clock className="size-4 text-brand-600" aria-hidden="true" />
                  Live slot availability, no waiting for a call back
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand-600" aria-hidden="true" />
                  Instant confirmation by SMS
                </li>
              </ul>
            </div>
            <span className="mt-7 inline-flex items-center gap-2 font-semibold text-accent-600">
              Book an OP appointment
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>

          <Link
            href="/home-physiotherapy"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-accent-500 p-7 text-white transition-transform hover:-translate-y-0.5"
          >
            <div>
              <span className="grid size-12 place-items-center rounded-xl bg-white/20 backdrop-blur">
                <HomeIcon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold">
                Home Physiotherapy
              </h3>
              <p className="mt-2 text-accent-50">
                A qualified physiotherapist treats you at home — as a single
                visit or as a session package for longer recovery.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-accent-50">
                <li className="flex items-center gap-2">
                  <Clock className="size-4" aria-hidden="true" />
                  60-minute sessions, 7 days a week
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Same physiotherapist through your package
                </li>
              </ul>
            </div>
            <span className="mt-7 inline-flex items-center gap-2 font-semibold">
              See home physio packages
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
