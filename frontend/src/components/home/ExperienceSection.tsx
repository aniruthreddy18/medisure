import { Container } from "@/components/ui/Container";

/**
 * Experience, reduced to the figures.
 *
 * The supporting copy and pillar cards were removed at the client's request —
 * the numbers carry the section on their own, and the fuller write-up lives on
 * the About page rather than being repeated here.
 */
export function ExperienceSection({
  stats,
}: {
  stats: { years: number; patientsTreated: number; doctors: number; surgeries: number };
}) {
  const format = (n: number) =>
    n >= 100000 ? `${Math.floor(n / 100000)}L+` : n >= 1000 ? `${Math.floor(n / 1000)},000+` : `${n}`;

  const figures = [
    { value: `${stats.years}+`, label: "Years of care" },
    { value: `${stats.doctors}`, label: "Specialist doctors" },
    { value: format(stats.patientsTreated), label: "Patients treated" },
    { value: format(stats.surgeries), label: "Surgeries performed" },
  ];

  return (
    <section className="bg-ink-50 py-16 lg:py-20" aria-labelledby="experience">
      <Container>
        <h2
          id="experience"
          className="text-center font-display text-3xl font-bold text-ink-900 sm:text-4xl"
        >
          Our experience
        </h2>

        <dl className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {figures.map((f) => (
            <div key={f.label} className="text-center">
              <dt className="sr-only">{f.label}</dt>
              <dd>
                <span className="block font-display text-4xl font-bold text-brand-700 sm:text-5xl">
                  {f.value}
                </span>
                <span className="mt-2 block text-sm text-ink-600">{f.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 text-center font-display text-2xl font-bold text-brand-700 sm:text-3xl">
          &ldquo;Your health is our priority&rdquo;
        </p>
      </Container>
    </section>
  );
}
