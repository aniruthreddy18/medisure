import type { Metadata } from "next";
import Link from "next/link";
import { HomeIcon, Phone, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { getHomePhysioDoctors, getFaqs } from "@medisure/backend/queries";
import { site } from "@medisure/backend/site";
import { formatPhone } from "@/lib/utils";

// Content comes from the database and is edited by hospital staff, so this
// page is regenerated at most every 5 minutes rather than frozen at build
// time. Phase 5 admin mutations will also revalidate affected paths directly.
export const revalidate = 300;


export const metadata: Metadata = {
  title: `Home Physiotherapy in ${site.address.city}`,
  description:
    "Qualified physiotherapists treat you at home for post-surgery, stroke, sports injury, back pain and geriatric care.",
};

// There's no self-service booking for home visits — reception arranges
// them by phone, so the steps describe a call, not a form.
const steps = [
  { icon: UserCheck, title: "Browse our team", text: "See who's available for home visits below." },
  { icon: Phone, title: "Call reception", text: "Tell us your address and the condition you need help with." },
  { icon: HomeIcon, title: "We schedule your visit", text: "Reception arranges a physiotherapist and a time that works for you." },
  { icon: ShieldCheck, title: "Recover at home", text: "The same physiotherapist sees you through your recovery." },
];

export default async function HomePhysiotherapyPage() {
  const [physios, faqs] = await Promise.all([
    getHomePhysioDoctors(),
    getFaqs("home-physio"),
  ]);

  return (
    <>
      <header className="border-b border-border bg-brand-950 text-white">
        <Container className="py-14 lg:py-20">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-accent-300">
            Home physiotherapy
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">
            Physiotherapy at home, across {site.address.city}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
            For patients recovering from surgery or a stroke, travelling to a
            clinic is often the hardest part of the treatment. Our
            physiotherapists come to you — with the same assessment, equipment
            and follow-up you would get at the hospital.
          </p>
          <p className="mt-6 text-sm text-brand-200">
            {site.hours.homePhysio}
          </p>
          <a
            href={`tel:${site.phone.reception}`}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white transition-colors hover:bg-accent-600"
          >
            <Phone className="size-4" aria-hidden="true" />
            Call {formatPhone(site.phone.reception)} to book a visit
          </a>
        </Container>
      </header>

      {/* How it works */}
      <section className="bg-white py-14" aria-labelledby="how-it-works">
        <Container>
          <h2 id="how-it-works" className="font-display text-2xl font-bold text-brand-950 sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display font-semibold text-brand-900">
                    <span className="text-accent-600">{i + 1}.</span> {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{step.text}</p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* Physios */}
      {physios.length > 0 && (
        <section className="bg-brand-50 py-14" aria-labelledby="our-physios">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="our-physios" className="font-display text-2xl font-bold text-brand-950 sm:text-3xl">
                Physiotherapists who visit homes
              </h2>
              <Link
                href="/doctors?service=HOME_PHYSIO"
                className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
              >
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {physios.slice(0, 3).map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="bg-white py-14" aria-labelledby="hp-faqs">
          <Container className="max-w-3xl">
            <h2 id="hp-faqs" className="font-display text-2xl font-bold text-brand-950 sm:text-3xl">
              Common questions
            </h2>
            <div className="mt-6 divide-y divide-border border-y border-border">
              {faqs.map((faq) => (
                <details key={faq.id} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold text-brand-900 marker:content-none">
                    {faq.question}
                    <span
                      aria-hidden="true"
                      className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-brand-700 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 pr-11 leading-relaxed text-ink-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
