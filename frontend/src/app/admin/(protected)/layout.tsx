import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionToken, getAdminById, SESSION_COOKIE } from "@medisure/backend/auth";
import { AdminBar } from "@/components/admin/AdminBar";

export const metadata: Metadata = {
  title: "Staff",
  robots: { index: false, follow: false }, // never index the admin area
};

// Session state must never be cached or prerendered.
export const dynamic = "force-dynamic";

/**
 * The real auth boundary.
 *
 * middleware.ts only checks a cookie exists — it runs on the edge runtime,
 * where node:crypto is unavailable, so it cannot verify the signature. Here
 * on the server the signature IS verified and the admin re-loaded from the
 * database, so a forged or stale cookie gets nowhere.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const admin = await getAdminById(readSessionToken(token));

  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-ink-50">
      <AdminBar name={admin.name} />
      <main>{children}</main>
    </div>
  );
}
