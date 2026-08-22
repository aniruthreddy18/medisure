"use client";

import { usePathname } from "next/navigation";

/**
 * The header is fixed so the homepage photograph can run behind it. Every
 * other page therefore needs its own height back, or the first heading sits
 * underneath the nav.
 */
export function HeaderSpacer() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <div aria-hidden="true" className="h-20 lg:h-24" />;
}
