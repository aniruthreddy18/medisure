"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Search, Ambulance, Phone } from "lucide-react";
import { site } from "@medisure/backend/site";
import { formatPhone, cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

const nav = [
  { label: "About", href: "/about" },
  { label: "Doctors", href: "/doctors" },
  { label: "Medical Services", href: "/medical-services" },
  { label: "Achievements", href: "/achievements" },
];

/**
 * Header.
 *
 * On the homepage it floats over the hero photograph so the image runs edge to
 * edge behind it. The hero photo is BRIGHT, so the nav stays dark-on-light
 * there rather than the usual white-on-dark overlay — white text would vanish
 * against a well-lit hospital interior. A soft white wash sits behind it to
 * guarantee contrast wherever the photo happens to be busy.
 *
 * Once you scroll past the hero — and on every other page — it becomes a solid
 * white bar with a border.
 */
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");

  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/doctors?q=${encodeURIComponent(q)}`);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 text-ink-900 transition-colors duration-300",
        overHero
          ? "bg-gradient-to-b from-white/95 via-white/70 to-transparent"
          : "border-b border-ink-200 bg-white shadow-sm",
      )}
    >
      {/* max-w-7xl, not the site's usual max-w-6xl: nav + search + the two
          phone buttons no longer fit in the standard width now that there
          are two phone buttons instead of one — this only widens the
          header's own row, not the page content max-width used elsewhere. */}
      {/* gap-2 on mobile, not gap-5: with the name now shown next to the
          logo at every width, the full gap left the hamburger button
          clipped off the right edge of a 375px screen. */}
      <Container className="flex h-20 max-w-7xl items-center gap-2 sm:gap-5 lg:h-24">
        {/* Logo. Not shrink-0: at the very narrowest phone widths (~320px,
            essentially obsolete now — no current iPhone or mainstream
            Android ships that narrow) there isn't room for the name at full
            width even after trimming everything else. Letting this shrink
            means the name truncates with an ellipsis there instead of
            overflowing the header; at every width anyone actually uses today
            there's enough room and nothing visibly shrinks. */}
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:shrink-0 sm:gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-sm sm:size-11 lg:size-12"
          >
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="size-8 object-contain lg:size-9"
            />
          </span>
          {/* Was hidden below sm — the client wants the name next to the logo
              at every width. Sized down and tracking tightened on mobile so
              "MediSure Hospital" fits without crowding the phone buttons;
              the tagline drops below sm since there's no room for a second
              line's width once it's this small. */}
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-bold leading-none tracking-tight sm:text-lg lg:text-xl">
              {site.name}
            </span>
            <span
              className="mt-1 hidden text-[10px] uppercase tracking-[0.18em] text-ink-500 sm:block"
            >
              Multi-Speciality
            </span>
          </span>
        </Link>

        {/* Nav, search and the phone buttons cluster together as one group so
            they sit flush right — a single ml-auto here, rather than one on
            each child, keeps them from spreading out across the bar. */}
        <div className="ml-auto flex items-center gap-3 xl:gap-4">
          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search — an icon button rather than an inline input. Nav, a full
              search box and two phone buttons don't fit in the header at any
              width: the box has almost no minimum content size, so flexbox
              always squeezed it first, down to an unusable ~70px sliver,
              however much room the row was given. A fixed-size icon has no
              such problem and still reaches the same search (/doctors), plus
              the mobile drawer keeps its own full-width input. */}
          <Link
            href="/doctors"
            aria-label="Search doctors"
            className="hidden size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-brand-50 lg:grid"
          >
            <Search className="size-5" aria-hidden="true" />
          </Link>

          {/* Call — reception, not the emergency line. Sits to the left of
              Emergency as the secondary (outlined) action; Emergency stays
              the filled, more urgent-looking button. */}
          <a
            href={`tel:${site.phone.reception}`}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-full border px-2 py-2 font-semibold shadow-sm transition-colors sm:px-2.5 lg:px-4",
              overHero
                ? "border-ink-200 bg-white/80 text-ink-900 backdrop-blur hover:bg-white"
                : "border-ink-200 bg-white text-ink-900 hover:border-brand-400 hover:bg-brand-50",
            )}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 sm:size-8">
              <Phone className="size-4" aria-hidden="true" />
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-ink-500">
                Call us
              </span>
              <span className="block text-sm tabular-nums">
                {formatPhone(site.phone.reception)}
              </span>
            </span>
            <span className="sr-only lg:hidden">
              Call reception: {formatPhone(site.phone.reception)}
            </span>
          </a>

          {/* Emergency */}
          <a
            href={`tel:${site.phone.emergency}`}
            className="flex shrink-0 items-center gap-2.5 rounded-full bg-brand-600 px-2 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 sm:px-2.5 lg:px-4"
          >
            <span
              className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 sm:size-8"
            >
              <Ambulance className="size-4" aria-hidden="true" />
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-[10px] font-medium uppercase tracking-wider opacity-80">
                Emergency
              </span>
              <span className="block text-sm tabular-nums">
                {formatPhone(site.phone.emergency)}
              </span>
            </span>
            <span className="sr-only lg:hidden">
              Emergency: {formatPhone(site.phone.emergency)}
            </span>
          </a>
        </div>

        {/* Menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-11 shrink-0 place-items-center rounded-lg transition-colors hover:bg-brand-50 xl:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </Container>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-ink-200 bg-white text-ink-900 xl:hidden"
      >
        <Container className="py-4">
          <form onSubmit={submitSearch} role="search" className="mb-3">
            <label htmlFor="mobile-search" className="sr-only">
              Search doctors and specialities
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                aria-hidden="true"
              />
              <input
                id="mobile-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doctors…"
                className="input pl-10"
              />
            </div>
          </form>

          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 font-medium hover:bg-brand-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </header>
  );
}
