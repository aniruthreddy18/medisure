import { Container } from "@/components/ui/Container";

export type FaqData = { id: string; question: string; answer: string };

/**
 * Native <details>/<summary> accordion — keyboard accessible, works without
 * JavaScript, and Google reads it for the FAQ rich result. No library needed.
 */
export function FaqAccordion({ faqs }: { faqs: FaqData[] }) {
  if (faqs.length === 0) return null;

  return (
    <section className="bg-white py-16 lg:py-20" aria-labelledby="faqs">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 id="faqs" className="text-3xl font-bold text-brand-950 sm:text-4xl">
              Questions patients ask us
            </h2>
            <p className="mt-3 text-ink-600">
              If your question is not here, call our booking desk — someone will
              answer during OPD hours.
            </p>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details key={faq.id} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-brand-900 marker:content-none">
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
        </div>
      </Container>
    </section>
  );
}
