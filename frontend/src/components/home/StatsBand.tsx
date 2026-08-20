import { Container } from "@/components/ui/Container";

/**
 * Trust numbers. Kept factual and sourced from admin settings — inflating
 * these on a healthcare site is both a credibility risk and, under the NMC
 * advertising code, a regulatory one.
 */
export function StatsBand({
  stats,
}: {
  stats: { years: number; patientsTreated: number; doctors: number; surgeries: number };
}) {
  const format = (n: number) =>
    n >= 100000
      ? `${Math.floor(n / 100000)}L+`
      : n >= 1000
        ? `${Math.floor(n / 1000)},000+`
        : `${n}`;

  const items = [
    { value: `${stats.years}+`, label: "Years of care" },
    { value: format(stats.patientsTreated), label: "Patients treated" },
    { value: `${stats.doctors}`, label: "Specialist doctors" },
    { value: format(stats.surgeries), label: "Surgeries performed" },
  ];

  return (
    <section className="border-y border-border bg-brand-50" aria-label="Hospital at a glance">
      <Container className="py-10">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block font-display text-3xl font-bold text-brand-800 sm:text-4xl">
                  {item.value}
                </span>
                <span className="mt-1 block text-sm text-ink-600">{item.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
