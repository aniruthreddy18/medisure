import { NextResponse, type NextRequest } from "next/server";

/**
 * Gate every /admin page behind a session cookie.
 *
 * This only checks that a cookie is PRESENT — middleware runs on the edge
 * runtime, where node:crypto is not available to verify the signature. The
 * real check happens in the admin layout, which verifies the signature
 * server-side and redirects if it fails. So this is a cheap first pass that
 * keeps anonymous visitors off the pages, not the security boundary itself.
 */
export function middleware(request: NextRequest) {
  const hasCookie = request.cookies.has("medisure_admin");

  if (!hasCookie) {
    const url = new URL("/admin/login", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Everything under /admin except the login page itself and the login API,
  // which must stay reachable while signed out.
  matcher: ["/admin/((?!login).*)"],
};
