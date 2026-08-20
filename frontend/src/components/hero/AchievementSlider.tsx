"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  title: string;
  caption: string | null;
  image: string | null;
  year: number | null;
};

const AUTOPLAY_MS = 6000;

/**
 * Hospital achievements as a full-bleed hero slider.
 *
 * Accessibility decisions worth keeping:
 *  - autoplay pauses on hover, on keyboard focus, and when the tab is hidden
 *  - an explicit pause/play control exists (WCAG 2.2.2 — any auto-updating
 *    content over 5s needs one)
 *  - slide changes are announced through a polite live region
 *  - arrows and dots are real buttons, reachable and labelled
 *  - honours prefers-reduced-motion by never autoplaying
 *
 * With fewer than two slides it renders a single static panel instead of a
 * carousel — a one-slide carousel is just a broken carousel.
 */
export function AchievementSlider({ slides }: { slides: HeroSlide[] }) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "start",
    duration: 28,
  });
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(!prefersReducedMotion);
  const [interacting, setInteracting] = useState(false);

  const onSelect = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    // Subscribing to "init" rather than calling onSelect() synchronously here:
    // a setState in the effect body triggers a cascading render, and embla
    // emits "init" once it has settled on its starting snap anyway.
    embla.on("init", onSelect);
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    return () => {
      embla.off("init", onSelect);
      embla.off("select", onSelect);
      embla.off("reInit", onSelect);
    };
  }, [embla, onSelect]);

  // Autoplay. Deliberately a plain interval rather than the autoplay plugin so
  // the pause conditions stay readable and testable.
  useEffect(() => {
    if (!embla || !playing || interacting || slides.length < 2) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") embla.scrollNext();
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [embla, playing, interacting, slides.length]);

  if (slides.length === 0) return null;

  const isCarousel = slides.length > 1;

  return (
    <section
      aria-roledescription={isCarousel ? "carousel" : undefined}
      aria-label="Hospital achievements"
      className="relative bg-brand-950"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={() => setInteracting(false)}
    >
      <div className="overflow-hidden" ref={isCarousel ? emblaRef : undefined}>
        <div className={cn("flex", !isCarousel && "block")}>
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="relative min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription={isCarousel ? "slide" : undefined}
              aria-label={isCarousel ? `${i + 1} of ${slides.length}` : undefined}
              aria-hidden={isCarousel && i !== selected}
            >
              <SlideBody slide={slide} priority={i === 0} />
            </div>
          ))}
        </div>
      </div>

      {isCarousel && (
        <>
          {/* Controls */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pb-6 sm:px-6 lg:px-8">
              <div className="pointer-events-auto flex items-center gap-2">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => embla?.scrollTo(i)}
                    aria-label={`Go to achievement ${i + 1}: ${slide.title}`}
                    aria-current={i === selected}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === selected
                        ? "w-8 bg-white"
                        : "w-4 bg-white/40 hover:bg-white/70",
                    )}
                  />
                ))}
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Pause achievement slideshow" : "Play achievement slideshow"}
                  className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                >
                  {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => embla?.scrollPrev()}
                  aria-label="Previous achievement"
                  className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => embla?.scrollNext()}
                  aria-label="Next achievement"
                  className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
          </div>

          <p aria-live="polite" className="sr-only">
            {`Achievement ${selected + 1} of ${slides.length}: ${slides[selected]?.title}`}
          </p>
        </>
      )}
    </section>
  );
}

function SlideBody({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  return (
    <div className="relative h-[26rem] w-full sm:h-[30rem] lg:h-[34rem]">
      {slide.image ? (
        <Image
          src={slide.image}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        // No photograph supplied yet. Rather than a stock image that misleads,
        // show a branded panel — it also shows the client exactly where their
        // photograph will sit.
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_100%_at_15%_0%,var(--color-brand-600)_0%,var(--color-brand-800)_45%,var(--color-brand-950)_100%)]"
        >
          <div className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(135deg,#fff_0_2px,transparent_2px_14px)]" />
        </div>
      )}

      {/* Legibility scrim — text over photos must stay readable at 4.5:1 */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/70 to-brand-950/20" />

      <div className="relative flex h-full items-center">
        <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-100 backdrop-blur">
              <Award className="size-3.5" aria-hidden="true" />
              Our Achievements
              {slide.year && <span className="text-brand-200">· {slide.year}</span>}
            </p>
            <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {slide.title}
            </h2>
            {slide.caption && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg">
                {slide.caption}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
