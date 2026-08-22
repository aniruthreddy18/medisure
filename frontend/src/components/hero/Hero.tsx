import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  HomeIcon,
  MessageSquareHeart,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { site } from "@medisure/backend/site";

/**
 * Full-bleed hero.
 *
 * Built for a BRIGHT photograph with the subjects on the right and open space
 * on the left — so the copy sits in that space in dark ink, over a soft white
 * scrim, rather than white text under a heavy black one. A dark overlay would
 * flatten a clean, well-lit hospital photo.
 *
 * The image is detected on disk rather than behind a flag: drop the file at
 * `public/media/hero.jpg` and it appears, with no code change. Until then a
 * light neutral panel stands in, so the layout reads correctly either way.
 */

const HERO_FILE = "hero.png";
const HERO_SRC = `/media/${HERO_FILE}`;

function heroImageExists(): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "media", HERO_FILE));
  } catch {
    return false;
  }
}

const actions = [
  { href: "/book/op", icon: CalendarDays, title: "OP Booking", featured: true },
  { href: "/home-physiotherapy", icon: HomeIcon, title: "Home Physio", status: "Available" },
  { href: "/second-opinion", icon: MessageSquareHeart, title: "Expert Opinion" },
];

export function Hero() {
  const hasImage = heroImageExists();

  return (
    <section className="relative bg-white" aria-labelledby="hero-heading">
      {/*
        The photograph is scoped to THIS block only — from behind the header
        down to the end of the buttons. The action strip below it sits on plain
        white, which is what the client asked for and also stops the cards
        competing with the picture.

        Wrapping rather than fixing a height means it tracks the copy: if the
        headline wraps to another line the image grows with it.
      */}
      <div className="relative isolate">
      {/* Headline — padded past the fixed header */}
      <Container className="pb-10 pt-32 lg:pb-14 lg:pt-44">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 backdrop-blur">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          {site.address.locality}, {site.address.city}
        </p>

        <h1
          id="hero-heading"
          className="mt-7 max-w-2xl text-4xl font-bold leading-[1.05] text-ink-900 sm:text-5xl lg:text-6xl"
        >
          Care that gets you
          <span className="block text-brand-600">moving again.</span>
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-700">
          Physiotherapy, orthopaedics and general surgery under one roof — with
          the physiotherapist and the surgeon planning your recovery together.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/book"
            className="inline-flex min-h-14 items-center gap-2 rounded-full bg-brand-600 px-8 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Book an appointment
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/doctors"
            className="inline-flex min-h-14 items-center gap-2 rounded-full border border-ink-300 bg-white/80 px-8 font-semibold text-ink-800 backdrop-blur transition-colors hover:border-ink-400 hover:bg-white"
          >
            Find a doctor
          </Link>
        </div>
      </Container>

      {/*
        The photograph — a background behind the copy at every size, scoped to
        this block so it stops at the buttons.

        Mobile needs a much heavier veil than desktop. The photo is landscape
        3:2, so a narrow portrait viewport crops it to a vertical slice and the
        copy inevitably lands over someone's face. A near-solid white wash
        keeps it as atmosphere behind readable text rather than a picture you
        are squinting through; from `sm:` up it clears to the horizontal
        gradient, where there is room for the text and the family side by side.
      */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {hasImage ? (
          <Image
            src={HERO_SRC}
            alt=""
            fill
            preload
            sizes="100vw"
            /*
              Desktop is anchored to the TOP of the frame, not the middle.
              The block is 620px tall while the photo draws at 960px, so 340px
              is cropped vertically. At the old 65% the visible band started at
              221px and the MediSure sign on the wall — which sits around
              96-269px — was almost entirely above it, leaving a sliver.
              Anchoring to the top brings the whole sign into view and lands it
              just under the header, and the faces (roughly 290-480px) are
              still comfortably inside the band. Only the sofa and floor at the
              bottom are lost.

              Mobile favours the right of the frame so the family shows rather
              than an empty stretch of wall. brightness-110 lifts a slightly
              flat photo sitting under a white veil.
            */
            className="object-cover object-[72%_60%] brightness-110 sm:object-[right_top]"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-ink-100">
            <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_80%_30%,#fdf5f4_0%,#f5f1ef_60%,#e8e2df_100%)]" />
          </div>
        )}

        {/*
          Mobile veil. The photo was barely visible at 0.82-0.94 — turned
          down across the board so it actually reads as a photograph behind
          the text rather than a faint ghost. Still heavier toward the
          bottom, where the body paragraph (the smallest, lowest-contrast
          text on the page) needs the most help.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.5)_45%,rgba(255,255,255,0.68)_100%)] sm:hidden"
        />

        {/*
          Desktop scrim. Explicit stops rather than a plain three-point
          gradient: the left third stays solid white so the headline never sits
          on top of a face, then it clears entirely by ~84% so the family and
          the logo on the wall are untouched. Tuned to this photograph —
          revisit the percentages if a differently framed one is supplied.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden sm:block sm:bg-[linear-gradient(to_right,#fff_0%,#fff_30%,rgba(255,255,255,0.92)_44%,rgba(255,255,255,0.45)_60%,rgba(255,255,255,0.05)_74%,transparent_84%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"
        />
      </div>
      </div>

      {/* Compact action strip — on white, below the photograph */}
      <Container className="pb-12 pt-8 lg:pb-16 lg:pt-10">
        <ul className="grid gap-3 sm:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className={
                    action.featured
                      ? "group flex items-center gap-3 rounded-xl border border-brand-600 bg-brand-600 px-5 py-4 text-white shadow-sm transition-colors hover:bg-brand-700"
                      : "group flex items-center gap-3 rounded-xl border border-ink-200 bg-white/90 px-5 py-4 text-ink-900 shadow-sm backdrop-blur transition-colors hover:border-brand-400 hover:bg-white"
                  }
                >
                  <Icon
                    className={action.featured ? "size-5 shrink-0" : "size-5 shrink-0 text-brand-600"}
                    aria-hidden="true"
                  />
                  <span className="font-display text-base font-semibold">{action.title}</span>

                  {action.status && (
                    <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
                      {action.status}
                    </span>
                  )}

                  <ArrowRight
                    className={
                      action.status
                        ? "size-4 shrink-0 transition-transform group-hover:translate-x-1"
                        : "ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-1"
                    }
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
