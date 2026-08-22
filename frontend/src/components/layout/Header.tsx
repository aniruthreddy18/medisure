"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Search, Ambulance } from "lucide-react";
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
      <Container className="flex h-20 items-center gap-5 lg:h-24">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span
            className="grid size-11 place-items-center rounded-full bg-white shadow-sm lg:size-12"
          >
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="size-8 object-contain lg:size-9"
            />
          </span>
          <span className="hidden sm:block">
            <span className="block font-display text-lg font-bold leading-none tracking-tight lg:text-xl">
              {site.name}
            </span>
            <span
              className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-ink-500"
            >
              Multi-Speciality
            </span>
          </span>
        </Link>

        {/* Nav */}
        <nav aria-label="Main" className="ml-auto hidden xl:block">
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

        {/* Search */}
        <form
          onSubmit={submitSearch}
          role="search"
          className={cn("ml-auto hidden lg:block xl:ml-4", "w-52 xl:w-56")}
        >
          <label htmlFor="site-search" className="sr-only">
            Search doctors and specialities
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctors…"
              className={cn(
                "h-11 w-full rounded-full border pl-9 pr-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500",
                overHero
                  ? "border-ink-200 bg-white/80 backdrop-blur focus:bg-white"
                  : "border-ink-200 bg-ink-50 focus:bg-white",
              )}
            />
          </div>
        </form>

        {/* Emergency */}
        <a
          href={`tel:${site.phone.emergency}`}
          className="flex shrink-0 items-center gap-2.5 rounded-full bg-brand-600 px-3 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 lg:px-4"
        >
          <span
            className="grid size-8 shrink-0 place-items-center rounded-full bg-white/20"
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
