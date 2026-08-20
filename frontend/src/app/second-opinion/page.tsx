import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SecondOpinionForm } from "@/components/booking/SecondOpinionForm";
import { getAllDepartments } from "@medisure/backend/queries";

export const metadata: Metadata = {
  title: "Free Second Opinion",
  description:
    "Been told you need surgery? Send us your case and hear from one of our specialists — free of charge.",
};

export const dynamic = "force-dynamic";

export default async function SecondOpinionPage() {
  const departments = await getAllDepartments();

  return (
    <>
      <header className="border-b border-border bg-brand-950 text-white">
        <Container className="py-14 lg:py-20">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-accent-300">
            No charge
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">
            Get a free second opinion
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
            If you have been advised surgery, or a diagnosis does not sit right
            with you, it is entirely reasonable to ask another specialist. Tell
            us about the case and one of our consultants will call you back.
          </p>
        </Container>
      </header>

      <Container className="max-w-2xl py-12 lg:py-16">
        <SecondOpinionForm
          departments={departments.map((d) => ({ slug: d.slug, name: d.name }))}
        />

        <div className="mt-10 rounded-2xl border border-border bg-ink-50 p-6">
          <h2 className="font-display font-semibold text-brand-950">
            About your reports
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Please do not attach scans or reports here. Our team will call you
            and arrange a secure way to share them — medical records need
            handling that a web form cannot give them.
          </p>
        </div>
      </Container>
    </>
  );
}
