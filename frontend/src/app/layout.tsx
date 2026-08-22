import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { site } from "@medisure/backend/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeaderSpacer } from "@/components/layout/HeaderSpacer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// A high-contrast serif to echo the monogram in the logo. Inter alone
// would lose the classical note the crowned mark sets up.
const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

/**
 * `new URL()` throws on anything that isn't a valid absolute URL — missing,
 * empty, or just a bare domain without "https://" all fail the same way, and
 * any of them will take the entire production build down since this module
 * evaluates at build time. metadataBase is only used to resolve relative
 * URLs for Open Graph/Twitter images — worth falling back safely rather than
 * failing the build over what is ultimately a cosmetic default.
 */
function siteUrl(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    // Staging must not be indexed. Flip NEXT_PUBLIC_ALLOW_INDEXING=true only
    // on the production domain, or Google will index the test site.
    index: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
    follow: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-800 focus:px-4 focus:py-2.5 focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <HeaderSpacer />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
