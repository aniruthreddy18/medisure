"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

/**
 * Directory filters. State lives in the URL, not in React — so a filtered
 * view is shareable, survives a refresh, and the back button behaves.
 */
export function DoctorFilters({
  departments,
  languages,
  total,
}: {
  departments: Option[];
  languages: string[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  const active = {
    department: params.get("department"),
    gender: params.get("gender"),
    language: params.get("language"),
    service: params.get("service"),
  };
  const hasFilters = Object.values(active).some(Boolean) || params.get("q");

  return (
    <div className={cn("space-y-6", pending && "opacity-70")}>
      {/* Search by name */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam("q", query.trim() || null);
        }}
        role="search"
      >
        <label htmlFor="doctor-search" className="mb-1.5 block text-sm font-medium text-ink-700">
          Search by name
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            id="doctor-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Dr. Rao"
            className="min-h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </form>

      <FilterGroup
        legend="Speciality"
        options={departments}
        value={active.department}
        onChange={(v) => setParam("department", v)}
      />

      <FilterGroup
        legend="Service"
        options={[
          { value: "OP", label: "Hospital consultation" },
          { value: "HOME_PHYSIO", label: "Home visits" },
        ]}
        value={active.service}
        onChange={(v) => setParam("service", v)}
      />

      {/* Gender and language are the filters Indian patients actually use —
          especially for a physiotherapist who will enter their home. */}
      <FilterGroup
        legend="Doctor's gender"
        options={[
          { value: "FEMALE", label: "Female" },
          { value: "MALE", label: "Male" },
        ]}
        value={active.gender}
        onChange={(v) => setParam("gender", v)}
      />

      <FilterGroup
        legend="Speaks"
        options={languages.map((l) => ({ value: l, label: l }))}
        value={active.language}
        onChange={(v) => setParam("language", v)}
      />

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p aria-live="polite" className="text-sm text-ink-600">
          {total} {total === 1 ? "doctor" : "doctors"}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-700">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : opt.value)}
              className={cn(
                "min-h-9 rounded-full border px-3.5 text-sm transition-colors",
                selected
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-border bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
