import Link from "next/link";
import Image from "next/image";
import { Phone, CalendarPlus, Languages, HomeIcon } from "lucide-react";
import { site } from "@medisure/backend/site";
import { cn } from "@/lib/utils";

export type DoctorCardData = {
  id: string;
  name: string;
  slug: string;
  photo: string | null;
  designation: string;
  qualifications: string;
  experienceYears: number | null;
  languages: string[];
  offersHomePhysio: boolean;
  opFeePaise: number;
  departments: { department: { name: string; slug: string } }[];
};

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/**
 * Doctor card, following Apollo's ordering: experience is the first thing a
 * patient scans, then qualifications, then the two actions — book, or call.
 * The dual CTA matters: older patients overwhelmingly prefer to phone.
 */
export function DoctorCard({
  doctor,
  className,
}: {
  doctor: DoctorCardData;
  className?: string;
}) {
  const dept = doctor.departments[0]?.department;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex gap-4 p-5">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-brand-100">
          {doctor.photo ? (
            <Image
              src={doctor.photo}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid size-full place-items-center font-display text-xl font-bold text-brand-700"
            >
              {initials(doctor.name)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-snug text-brand-950">
            <Link href={`/doctors/${doctor.slug}`} className="hover:underline">
              {doctor.name}
            </Link>
          </h3>
          {dept && (
            <p className="mt-0.5 text-sm font-medium text-brand-600">{dept.name}</p>
          )}
          {doctor.experienceYears !== null && (
            <p className="mt-1.5 text-sm font-semibold text-ink-800">
              {doctor.experienceYears}+ years experience
            </p>
          )}
          <p className="mt-0.5 line-clamp-1 text-sm text-ink-500" title={doctor.qualifications}>
            {doctor.qualifications}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-3 px-5 pb-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
          {doctor.languages.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Languages className="size-3.5" aria-hidden="true" />
              {doctor.languages.slice(0, 3).join(", ")}
            </span>
          )}
          {doctor.offersHomePhysio && (
            <span className="inline-flex items-center gap-1.5 font-medium text-brand-700">
              <HomeIcon className="size-3.5" aria-hidden="true" />
              Home visits
            </span>
          )}
        </div>

        {doctor.opFeePaise > 0 && (
          <p className="text-sm text-ink-600">
            Consultation{" "}
            <span className="font-semibold text-ink-900">
              ₹{(doctor.opFeePaise / 100).toLocaleString("en-IN")}
            </span>
          </p>
        )}

        {/* One action: book. Calling stays reachable as a compact icon —
            many patients here still prefer the phone, so removing it entirely
            would cost bookings, but it no longer competes with the CTA. */}
        <div className="flex gap-2">
          <Link
            href={`/book/op?doctor=${doctor.slug}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <CalendarPlus className="size-4" aria-hidden="true" />
            Book Appointment
          </Link>
          <a
            href={`tel:${site.phone.booking}`}
            aria-label={`Call to book with ${doctor.name}`}
            title="Call to book"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-ink-200 text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <Phone className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
