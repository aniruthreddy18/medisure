import Image from "next/image";
import { Play, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Instagram reels, scrolled horizontally. Tapping one opens that reel on
 * Instagram in a new tab.
 *
 * ⚠️ TODO(client): replace INSTAGRAM_HANDLE and the REELS list with the
 * hospital's real account and reel URLs. Nothing here is fetched from
 * Instagram — embedding their API would need an app review and a token, so
 * each reel is a thumbnail we host plus a link out. That also keeps the page
 * fast and sets no third-party cookies on load.
 *
 * Thumbnails go in `public/media/reels/`. Until they exist each card falls
 * back to a branded panel, so the row still reads correctly.
 */
const INSTAGRAM_HANDLE = "medisurehospital"; // TODO(client): confirm handle

type Reel = { id: string; caption: string; url: string; thumbnail?: string };

const REELS: Reel[] = [
  { id: "r1", caption: "Inside our physiotherapy gym", url: `https://www.instagram.com/${INSTAGRAM_HANDLE}/` },
  { id: "r2", caption: "Knee replacement — what recovery looks like", url: `https://www.instagram.com/${INSTAGRAM_HANDLE}/` },
  { id: "r3", caption: "A home physiotherapy visit, start to finish", url: `https://www.instagram.com/${INSTAGRAM_HANDLE}/` },
  { id: "r4", caption: "Meet our orthopaedic team", url: `https://www.instagram.com/${INSTAGRAM_HANDLE}/` },
  { id: "r5", caption: "Three exercises for everyday back pain", url: `https://www.instagram.com/${INSTAGRAM_HANDLE}/` },
  { id: "r6", caption: "Free health camp at Kukatpally", url: `https://www.instagram.com/${INSTAGRAM_HANDLE}/` },
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
            href={`https://www.instagram.com/${INSTAGRAM_HANDLE}/`}
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
                  {reel.thumbnail ? (
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
                    <Play className="size-4 translate-x-0.5 fill-current" aria-hidden="true" />
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
