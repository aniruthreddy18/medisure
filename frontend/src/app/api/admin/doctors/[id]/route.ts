import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@medisure/backend/db";
import { readSessionToken, getAdminById, SESSION_COOKIE } from "@medisure/backend/auth";

export const dynamic = "force-dynamic";

/**
 * Money arrives as rupees (what staff type) and is stored as integer paise,
 * matching the rest of the system. Blank optional fields come through as ""
 * and become null rather than 0 — an unknown fee is not a free one.
 */
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  designation: z.string().trim().min(1).max(160),
  qualifications: z.string().trim().min(1).max(200),
  experienceYears: z.string().trim(),
  regNumber: z.string().trim().max(60),
  languages: z.string().trim().max(200),
  bio: z.string().trim().max(4000),
  opFee: z.string().trim(),
  homeVisitFee: z.string().trim(),
  offersHomePhysio: z.boolean(),
  active: z.boolean(),
});

/** "" -> null, otherwise a non-negative integer or null if unparseable. */
function optionalInt(value: string): number | null {
  if (value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // API routes sit outside the admin layout, so they must check the session
  // themselves — the layout guard does not protect them.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const admin = await getAdminById(readSessionToken(token));
  if (!admin) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the fields and try again." }, { status: 400 });
  }
  const d = parsed.data;

  const opFee = optionalInt(d.opFee);
  if (opFee === null) {
    return NextResponse.json({ error: "Consultation fee must be a number." }, { status: 400 });
  }

  try {
    await db.doctor.update({
      where: { id },
      data: {
        name: d.name,
        designation: d.designation,
        qualifications: d.qualifications,
        experienceYears: optionalInt(d.experienceYears),
        regNumber: d.regNumber || null,
        languages: d.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        bio: d.bio || null,
        opFeePaise: opFee * 100,
        homeVisitFeePaise: (() => {
          const fee = optionalInt(d.homeVisitFee);
          return fee === null ? null : fee * 100;
        })(),
        offersHomePhysio: d.offersHomePhysio,
        active: d.active,
      },
    });

    // Who changed what — the AuditLog table exists for exactly this.
    await db.auditLog.create({
      data: {
        adminUserId: admin.id,
        action: "update",
        entity: "Doctor",
        entityId: id,
        meta: { name: d.name },
      },
    });

    // The public pages are cached (revalidate = 300), so without this an edit
    // would not show for up to five minutes.
    revalidatePath("/doctors");
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin doctor update failed", error);
    return NextResponse.json({ error: "Could not save the changes." }, { status: 500 });
  }
}
