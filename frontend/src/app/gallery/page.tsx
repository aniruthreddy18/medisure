import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { GalleryGrid, type GalleryPhoto } from "@/components/gallery/GalleryGrid";
import { db } from "@medisure/backend/db";
import { site } from "@medisure/backend/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photographs from inside ${site.name} — the wards, consulting rooms, reception and facilities.`,
};

/**
 * Section headings, in the order a visitor actually moves through the
 * building. `category` on each photo decides which group it lands in;
 * anything with an unrecognised category falls into a final catch-all rather
 * than disappearing from the page.
 */
const SECTIONS: { key: string; title: string; blurb: string }[] = [
  {
    key: "outside",
    title: "Arriving",
    blurb: "The building, the entrance, and where the ambulance waits.",
  },
  {
    key: "reception",
    title: "Reception & waiting",
    blurb: "Where you check in, and where you wait to be called.",
  },
  {
    key: "consulting",
    title: "Consulting rooms",
    blurb: "Where you see the doctor.",
  },
  {
    key: "wards",
    title: "Wards & intensive care",
    blurb: "Rooms for patients staying with us, and the ICU.",
  },
  {
    key: "facilities",
    title: "Facilities",
    blurb: "The in-house pharmacy.",
  },
];

export default async function GalleryPage() {
  const images = await db.galleryImage.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  const grouped = SECTIONS.map((section) => ({
    ...section,
    photos: images.filter((img) => img.category === section.key) as GalleryPhoto[],
  })).filter((section) => section.photos.length > 0);

  // Anything whose category is not one of the known sections still gets shown.
  const known = new Set(SECTIONS.map((s) => s.key));
  const other = images.filter((img) => !known.has(img.category)) as GalleryPhoto[];

  return (
    <>
      <header className="border-b border-border bg-brand-950 text-white">
        <Container className="py-14 lg:py-20">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-accent-300">
            Gallery
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">
            A look inside the hospital
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
            Photographs of the wards, consulting rooms, reception and facilities
            at {site.address.locality}, so you know what to expect before you
            arrive.
          </p>
          {images.length > 0 && (
            <p className="mt-6 text-sm text-brand-200">
              {images.length} photographs
            </p>
          )}
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        {images.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-12 text-center text-ink-600">
            Photographs will appear here once they are uploaded.
          </p>
        ) : null}

        {grouped.map((section, i) => (
          <section
            key={section.key}
            aria-labelledby={`section-${section.key}`}
            className={i === 0 ? "" : "mt-14 lg:mt-20"}
          >
            <div className="max-w-2xl">
              <h2
                id={`section-${section.key}`}
                className="font-display text-2xl font-bold text-brand-950 sm:text-3xl"
              >
                {section.title}
              </h2>
              <p className="mt-2 text-ink-600">{section.blurb}</p>
            </div>
            <div className="mt-6">
              <GalleryGrid photos={section.photos} />
            </div>
          </section>
        ))}

        {other.length > 0 && (
          <section aria-labelledby="section-other" className="mt-14 lg:mt-20">
            <h2
              id="section-other"
              className="font-display text-2xl font-bold text-brand-950 sm:text-3xl"
            >
              More photographs
            </h2>
            <div className="mt-6">
              <GalleryGrid photos={other} />
            </div>
          </section>
        )}

      </Container>
    </>
  );
}
