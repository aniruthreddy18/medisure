"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Instagram reels, scrolled horizontally, self-hosted so they can actually
 * autoplay — Instagram's own embed widget always requires a click to start
 * playback, so there is no way to get real autoplay from the Instagram URL
 * alone. Each card plays its own muted, looping video; tapping still opens
 * the original reel on Instagram in a new tab.
 *
 * ⚠️ TODO(client): supply the .mp4 for each reel below (export from
 * Instagram, no watermark) and drop it into `public/media/reels/` under the
 * filename already referenced. A poster image is optional — without one the
 * first frame doubles as the poster once the video loads. Until a video
 * file exists, that card falls back to a static thumbnail (or a branded
 * panel) with a play icon that just links out, so the row still reads
 * correctly with videos missing.
 */
const INSTAGRAM_HANDLE = "medisurehospital"; // TODO(client): confirm handle

type Reel = {
  id: string;
  caption: string;
  url: string;
  /** Local path under /public, e.g. "/media/reels/r1.mp4". */
  video?: string;
  poster?: string;
  thumbnail?: string;
};

const REELS: Reel[] = [
  { id: "r1", caption: "", url: `https://www.instagram.com/reel/DcJEQTQggwg/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==`, video: "/media/reels/r1.mp4" },
  { id: "r2", caption: "", url: `https://www.instagram.com/reel/DcLmdNcA4nZ/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==`, video: "/media/reels/r2.mp4" },
  { id: "r3", caption: "", url: `https://www.instagram.com/reel/DcOMU0ySiuv/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==`, video: "/media/reels/r3.mp4" },
  { id: "r4", caption: "", url: `https://www.instagram.com/reel/DcQvJy0Slpr/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==`, video: "/media/reels/r4.mp4" },
  { id: "r5", caption: "", url: `https://www.instagram.com/reel/Db40yPbiYey/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==`, video: "/media/reels/r5.mp4" },
  { id: "r6", caption: "", url: `https://www.instagram.com/reel/Db-wYZWSM5F/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==`, video: "/media/reels/r6.mp4" },
];

/** Lucide v1 dropped brand marks, so the Instagram glyph is inline. */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/**
 * Muted, looping, self-hosted video that only plays while its card is
 * actually on screen. With 12 cards live at once (the marquee track renders
 * the list twice), autoplaying every one regardless of visibility would keep
 * a dozen decoders running constantly — this pauses whichever are scrolled
 * out of the row. Falls back to the gradient/thumbnail placeholder if the
 * file 404s, which happens until the client supplies the real .mp4s.
 */
function ReelVideo({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {
            /* Autoplay can be blocked before the user has interacted with
               the page at all; the poster frame is shown either way. */
          });
        } else {
          el.pause();
        }
      },
      { rootMargin: "0px 200px", threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (failed) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
      className="absolute inset-0 size-full object-cover"
    />
  );
}

export function ReelsSection() {
  if (REELS.length === 0) return null;

  return (
    <section className="bg-white py-16 lg:py-24" aria-labelledby="reels">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-brand-600">
              <InstagramIcon className="size-4" />
              From our Instagram
            </p>
            <h2 id="reels" className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">
              Reels
            </h2>
          </div>

          <a
            href={`https://www.instagram.com/medisure_hospital?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"
          >
            Follow @{INSTAGRAM_HANDLE}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </Container>

      {/* Auto-scrolling row. The list is rendered twice: the track slides
          exactly half its width, so copy two takes over seamlessly as copy one
          leaves. Duration scales with the number of reels to keep a constant
          speed however many the hospital posts. */}
      <div
        className="marquee mt-9"
        style={{ ["--marquee-duration" as string]: `${REELS.length * 7}s` }}
        role="region"
        aria-label="Instagram reels"
      >
        <ul className="marquee-track gap-4 px-5 sm:px-6 lg:px-8">
          {[...REELS, ...REELS].map((reel, i) => (
            <li
              key={`${reel.id}-${i}`}
              className="w-[220px] shrink-0 sm:w-[240px]"
              // The second copy is decorative duplication; hiding it keeps
              // screen readers from announcing every reel twice.
              aria-hidden={i >= REELS.length}
            >
              <a
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                tabIndex={i >= REELS.length ? -1 : undefined}
              >
                <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-brand-900">
                  {reel.video ? (
                    <ReelVideo src={reel.video} poster={reel.poster ?? reel.thumbnail} />
                  ) : reel.thumbnail ? (
                    <Image
                      src={reel.thumbnail}
                      alt=""
                      fill
                      sizes="240px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[radial-gradient(120%_100%_at_30%_0%,var(--color-brand-600),var(--color-brand-950))]"
                    />
                  )}

                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
                    {reel.video ? (
                      <InstagramIcon className="size-4" />
                    ) : (
                      <Play className="size-4 translate-x-0.5 fill-current" aria-hidden="true" />
                    )}
                  </span>

                  <span className="absolute inset-x-3 bottom-3 text-sm font-medium leading-snug text-white">
                    {reel.caption}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Container>
        <p className="mt-4 text-sm text-ink-500">
          Hover to pause. Opens on Instagram in a new tab.
        </p>
      </Container>
    </section>
  );
}
