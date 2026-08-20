"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Container } from "@/components/ui/Container";

export default function ManageIndexPage() {
  const router = useRouter();
  const [ref, setRef] = useState("");

  return (
    <Container className="max-w-lg py-14 lg:py-20">
      <h1 className="text-3xl font-bold text-brand-950">Manage your booking</h1>
      <p className="mt-3 text-ink-600">
        Enter the booking reference from your confirmation message. We will send
        a code to the mobile number on the booking before showing any details.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const clean = ref.trim().toUpperCase();
          if (clean) router.push(`/manage/${encodeURIComponent(clean)}`);
        }}
        className="mt-8"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">
            Booking reference
          </span>
          <input
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            placeholder="MS-XXXXXX"
            className="input font-mono tracking-wider"
            autoComplete="off"
          />
        </label>

        <button
          type="submit"
          disabled={!ref.trim()}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          <Search className="size-4" aria-hidden="true" />
          Find my booking
        </button>
      </form>
    </Container>
  );
}
