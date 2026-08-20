import type { Metadata } from "next";
import { ShieldCheck, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getInsurers } from "@medisure/backend/queries";
import { site } from "@medisure/backend/site";
import { formatPhone } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Insurance & TPA",
  description: "Insurers and third-party administrators we are empanelled with, and what to bring for cashless treatment.",
};

export default async function InsurancePage() {
  const insurers = await getInsurers();
  const companies = insurers.filter((i) => !i.isTPA);
  const tpas = insurers.filter((i) => i.isTPA);

  return (
    <>
      <header className="border-b border-border bg-brand-50">
        <Container className="py-12 lg:py-16">
          <h1 className="flex items-center gap-3 text-4xl font-bold text-brand-950">
            <ShieldCheck className="size-8 text-brand-600" aria-hidden="true" />
            Insurance &amp; cashless treatment
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            We are empanelled with the insurers and TPAs listed below. Please
            confirm your specific policy with our insurance desk before
            admission.
          </p>
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {companies.length > 0 && (
              <section aria-labelledby="insurers">
                <h2 id="insurers" className="font-display text-2xl font-bold text-brand-950">
                  Insurance companies
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {companies.map((i) => (
                    <li key={i.id} className="rounded-xl border border-border bg-white px-5 py-4 font-medium text-ink-800">
                      {i.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tpas.length > 0 && (
              <section aria-labelledby="tpas" className="mt-10">
                <h2 id="tpas" className="font-display text-2xl font-bold text-brand-950">
                  Third-party administrators
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {tpas.map((i) => (
                    <li key={i.id} className="rounded-xl border border-border bg-white px-5 py-4 font-medium text-ink-800">
                      {i.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-border bg-brand-50 p-6">
              <h2 className="font-display text-lg font-bold text-brand-950">What to bring</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-700">
                <li>· Insurance card or policy number</li>
                <li>· Government photo ID (Aadhaar, PAN or passport)</li>
                <li>· Doctor&apos;s referral or prescription, if you have one</li>
                <li>· Previous reports relating to this problem</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="font-display text-lg font-bold text-brand-950">Insurance desk</h2>
              <p className="mt-2 text-sm text-ink-600">
                For pre-authorisation and cashless queries.
              </p>
              <a
                href={`tel:${site.phone.main}`}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
              >
                <Phone className="size-4" aria-hidden="true" />
                {formatPhone(site.phone.main)}
              </a>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
