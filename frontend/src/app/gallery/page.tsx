import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { VideoGrid } from "@/components/video/VideoGrid";
import { getVideos } from "@medisure/backend/queries";
import { db } from "@medisure/backend/db";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gallery & Videos",
  description: "Photographs and videos from inside the hospital.",
};

export default async function GalleryPage() {
  const [videos, images] = await Promise.all([
    getVideos(),
    db.galleryImage.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <header className="border-b border-border bg-brand-50">
        <Container className="py-12 lg:py-16">
          <h1 className="text-4xl font-bold text-brand-950">Gallery &amp; videos</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            A look inside the hospital, and short videos explaining common
            treatments.
          </p>
        </Container>
      </header>

      <Container className="py-12 lg:py-16">
        {videos.length > 0 && (
          <section aria-labelledby="all-videos">
            <h2 id="all-videos" className="font-display text-2xl font-bold text-brand-950">
              Videos
            </h2>
            <div className="mt-6">
              <VideoGrid videos={videos} />
            </div>
          </section>
        )}

        <section aria-labelledby="photos" className="mt-14">
          <h2 id="photos" className="font-display text-2xl font-bold text-brand-950">
            Photographs
          </h2>
          {images.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center text-ink-600">
              Hospital photographs will appear here once uploaded.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img) => (
                <li key={img.id} className="overflow-hidden rounded-2xl border border-border">
                  <div className="relative aspect-[4/3] bg-brand-100">
                    <Image src={img.image} alt={img.caption ?? ""} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
                  </div>
                  {img.caption && <p className="p-4 text-sm text-ink-600">{img.caption}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </>
  );
}
