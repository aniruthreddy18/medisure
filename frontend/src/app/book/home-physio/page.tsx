import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { HomePhysioFlow } from "@/components/booking/HomePhysioFlow";
import { getPackages, getHomePhysioDoctors } from "@medisure/backend/queries";

export const metadata: Metadata = {
  title: "Book Home Physiotherapy",
  description: "Book a physiotherapy session at home — single visit or session package.",
};

export const dynamic = "force-dynamic";

export default async function HomePhysioBookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const [packages, physios] = await Promise.all([getPackages(), getHomePhysioDoctors()]);

  return (
    <Container className="py-10 lg:py-14">
      <h1 className="text-3xl font-bold text-brand-950 sm:text-4xl">Book home physiotherapy</h1>
      <p className="mt-2 text-ink-600">
        Tell us where you are, choose a package and book your first visit.
      </p>

      <div className="mt-10">
        <HomePhysioFlow
          packages={packages.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sessionCount: p.sessionCount,
            pricePaise: p.pricePaise,
            validityDays: p.validityDays,
            ctaMode: p.ctaMode,
          }))}
          physios={physios.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            designation: p.designation,
            experienceYears: p.experienceYears,
            languages: p.languages,
            homeVisitFeePaise: p.homeVisitFeePaise,
          }))}
          initialPackage={pick("package")}
          initialDoctor={pick("doctor")}
        />
      </div>
    </Container>
  );
}
