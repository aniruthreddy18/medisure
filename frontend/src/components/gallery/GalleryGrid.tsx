"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";

export type GalleryPhoto = {
  id: string;
  image: string;
  caption: string | null;
};

/**
 * The hospital photographs, with a lightbox.
 *
 * Every photo is 9:16 (they came off a phone), so the tiles use that exact
 * ratio — object-cover then crops nothing at all. Forcing a landscape or
 * square tile would throw away a quarter of each image, and several of these
 * have the hospital's signage at the very top, which is the first thing a
 * crop would eat.
 */
export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const isOpen = openAt !== null;

  const close = useCallback(() => setOpenAt(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenAt((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  // Keyboard control, and stop the page behind the lightbox from scrolling.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, step]);

  const active = openAt === null ? null : photos[openAt];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setOpenAt(i)}
              aria-label={photo.caption ? `View: ${photo.caption}` : "View photograph"}
              className="group relative block w-full overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <span className="relative block aspect-[9/16]">
                <Image
                  src={photo.image}
                  alt={photo.caption ?? ""}
                  fill
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </span>

              {/* Caption sits over a gradient rather than below the tile, so
                  every tile stays exactly the same height whatever the
                  caption length. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-3 pt-10"
              >
                {photo.caption && (
                  <span className="block text-left text-xs font-medium leading-snug text-white sm:text-sm">
                    {photo.caption}
                  </span>
                )}
              </span>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
              >
                <Expand className="size-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openAt !== null && active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.caption ?? "Photograph"}
          className="fixed inset-0 z-[60] flex flex-col bg-black/92 backdrop-blur-sm"
          onClick={close}
        >
          <div className="flex items-center justify-between gap-4 p-4 text-white">
            <span className="font-mono text-sm tabular-nums text-white/70">
              {openAt + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* stopPropagation so clicking the photo itself doesn't close it —
              only the backdrop does. */}
          <div
            className="relative flex-1 px-4 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={active.id}
              src={active.image}
              alt={active.caption ?? ""}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <div
            className="flex items-center justify-center gap-4 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photograph"
              className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="size-5" />
            </button>

            {active.caption && (
              <p className="max-w-md text-center text-sm text-white/80">{active.caption}</p>
            )}

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photograph"
              className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
