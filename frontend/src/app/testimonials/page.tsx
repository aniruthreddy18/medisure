import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { getTestimonials } from "@medisure/backend/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Patient Stories",
  description: "Recoveries our patients agreed to share, across physiotherapy, orthopaedics and general surgery.",
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <header className="border-b border-border bg-brand-50">
        <Container className="py-12 lg:py-16">
          <h1 className="text-4xl font-bold text-brand-950">Patient stories</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            Every story here is published with the patient&apos;s written
            permission. Outcomes differ from person to person — yours will
            depend on your own condition.
          </p>
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        {testimonials.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-12 text-center text-ink-600">
            No patient stories have been published yet.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
