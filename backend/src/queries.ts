import "server-only";
import { db } from "./db";

/**
 * Read helpers shared by the public pages.
 *
 * Every list here filters on `active` so the admin panel's visibility toggles
 * actually take effect on the site, and orders by the admin-controlled
 * `order` column so staff can arrange sections without a developer.
 */

export function getHeroAchievements() {
  return db.achievement.findMany({
    where: { active: true, showInHero: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: 8,
  });
}

export function getNewsAchievements(take = 5) {
  return db.achievement.findMany({
    where: { active: true, isNews: true },
    orderBy: [{ year: "desc" }, { order: "asc" }],
    take,
  });
}

export function getCoreDepartments() {
  return db.department.findMany({
    where: { active: true, isCore: true },
    orderBy: { order: "asc" },
    include: {
      conditions: { where: { active: true }, orderBy: { order: "asc" }, take: 6 },
      _count: { select: { doctors: true } },
    },
  });
}

export function getAllDepartments() {
  return db.department.findMany({
    where: { active: true },
    orderBy: [{ isCore: "desc" }, { order: "asc" }],
    include: { _count: { select: { doctors: true } } },
  });
}

export function getDepartmentBySlug(slug: string) {
  return db.department.findFirst({
    where: { slug, active: true },
    include: {
      conditions: { where: { active: true }, orderBy: { order: "asc" } },
      doctors: {
        include: {
          doctor: { include: { departments: { include: { department: true } } } },
        },
      },
      testimonials: {
        where: { active: true, approved: true },
        orderBy: { order: "asc" },
        take: 3,
      },
    },
  });
}

export function getFeaturedDoctors(take = 6) {
  return db.doctor.findMany({
    where: { active: true, featured: true },
    orderBy: { order: "asc" },
    include: { departments: { include: { department: true } } },
    take,
  });
}

export type DoctorFilters = {
  department?: string;
  gender?: string;
  language?: string;
  service?: string;
  q?: string;
};

export function getDoctors(filters: DoctorFilters = {}) {
  const { department, gender, language, service, q } = filters;

  return db.doctor.findMany({
    where: {
      active: true,
      ...(department ? { departments: { some: { department: { slug: department } } } } : {}),
      ...(gender === "MALE" || gender === "FEMALE" ? { gender } : {}),
      ...(language ? { languages: { has: language } } : {}),
      ...(service === "HOME_PHYSIO" ? { offersHomePhysio: true } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    },
    orderBy: [{ order: "asc" }, { experienceYears: "desc" }],
    include: { departments: { include: { department: true } } },
  });
}

export function getDoctorBySlug(slug: string) {
  return db.doctor.findFirst({
    where: { slug, active: true },
    include: {
      departments: { include: { department: true } },
      schedules: { where: { active: true }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });
}

/** Distinct language list, for the doctor directory filter. */
export async function getDoctorLanguages() {
  const rows = await db.doctor.findMany({
    where: { active: true },
    select: { languages: true },
  });
  return [...new Set(rows.flatMap((r) => r.languages))].sort();
}

export function getTestimonials(take?: number) {
  return db.testimonial.findMany({
    // approved AND consentOnFile — the site must never publish a testimonial
    // whose consent form is not on file, even if someone ticks "approved".
    where: { active: true, approved: true, consentOnFile: true },
    orderBy: { order: "asc" },
    include: { department: true },
    take,
  });
}

export function getVideos(take?: number) {
  return db.video.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    take,
  });
}

export function getFaqs(category?: string) {
  return db.faq.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
}

export function getInsurers() {
  return db.insurer.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export function getPackages() {
  return db.servicePackage.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export function getPackageBySlug(slug: string) {
  return db.servicePackage.findFirst({ where: { slug, active: true } });
}

export function getHomePhysioDoctors() {
  return db.doctor.findMany({
    where: { active: true, offersHomePhysio: true },
    orderBy: { order: "asc" },
    include: { departments: { include: { department: true } } },
  });
}

/** Site-wide numbers shown in the stats band; falls back to sane defaults. */
export async function getStats() {
  const row = await db.siteSetting.findUnique({ where: { key: "stats" } });
  const fallback = { years: 0, patientsTreated: 0, doctors: 0, surgeries: 0 };
  return { ...fallback, ...((row?.value as object) ?? {}) } as {
    years: number;
    patientsTreated: number;
    doctors: number;
    surgeries: number;
  };
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.siteSetting.findUnique({ where: { key } });
  return (row?.value as T) ?? fallback;
}
