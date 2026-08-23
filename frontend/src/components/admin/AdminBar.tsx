"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function AdminBar({ name }: { name: string }) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-ink-200 bg-white">
      <Container className="flex h-16 max-w-5xl items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2 font-display font-bold text-brand-900">
          <ShieldCheck className="size-5 text-brand-600" aria-hidden="true" />
          MediSure staff
        </Link>

        <span className="ml-auto hidden text-sm text-ink-600 sm:block">{name}</span>

        <button
          type="button"
          onClick={signOut}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-ink-200 px-3.5 text-sm font-medium text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </button>
      </Container>
    </header>
  );
}
