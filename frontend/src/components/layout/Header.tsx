"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { site } from "@medisure/backend/site";
import { formatPhone } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

const nav = [
  { label: "About", href: "/about" },
  {
    label: "Specialities",
    href: "/specialities",
    children: [
      { label: "Physiotherapy", href: "/specialities/physiotherapy" },
      { label: "Orthopaedics", href: "/specialities/orthopaedics" },
      { label: "General Surgery", href: "/specialities/general-surgery" },
      { label: "All Specialities", href: "/specialities" },
    ],
  },
  { label: "Doctors", href: "/doctors" },
  { label: "Home Physiotherapy", href: "/home-physiotherapy" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Emergency strip — visible at every scroll position, per plan §3.
          A hospital site's single most important number is the one you
          need when you are panicking. */}
      <div className="bg-brand-900 text-white">
        <Container className="flex h-9 items-center justify-between gap-4 text-xs sm:text-sm">
          <p className="truncate">
            <span className="hidden sm:inline">Emergency &amp; Ambulance </span>
            <span className="sm:hidden">Emergency </span>
            <span aria-hidden="true">·</span> {site.hours.emergency}
          </p>
          <a
            href={`tel:${site.phone.emergency}`}
            className="flex shrink-0 items-center gap-1.5 font-semibold underline-offset-2 hover:underline"
          >
            <Phone className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Call emergency number </span>
            {formatPhone(site.phone.emergency)}
          </a>
        </Container>
      </div>

      <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="flex items-center gap-2.5 font-display">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-lg bg-brand-700 text-base font-bold text-white"
          >
            M
          </span>
          <span className="text-lg font-bold leading-tight text-brand-900 sm:text-xl">
            {site.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className="size-4 text-ink-400" aria-hidden="true" />
                  )}
                </Link>
                {item.children && (
                  <ul className="invisible absolute left-0 top-full w-56 rounded-xl border border-border bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-800"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/book" variant="book" size="sm" className="hidden sm:inline-flex">
            Book Appointment
          </ButtonLink>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-lg text-ink-700 hover:bg-brand-50 lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile nav */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border bg-white lg:hidden"
      >
        <Container className="py-3">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 font-medium text-ink-800 hover:bg-brand-50"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="mb-1 ml-3 border-l border-border pl-3">
                    {item.children.slice(0, 3).map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-lg px-2 py-2.5 text-sm text-ink-600 hover:bg-brand-50"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </header>
  );
}
