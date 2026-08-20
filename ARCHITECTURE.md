# MediSure — Codebase Guide

Two workspaces. `backend/` owns data and business rules; `frontend/` owns everything a
browser sees. Roughly 2,700 lines of backend and 6,600 of frontend.

```
medisure/
├── .env                  single source of truth, symlinked into both workspaces
├── package.json          npm workspaces root — orchestration scripts only
├── backend/              @medisure/backend  · data + business logic
└── frontend/             @medisure/frontend · Next.js App Router UI
```

## Why it is split this way, not the other way

Next.js is a full-stack framework: route handlers **must** live under `app/`, so a literal
`backend/app/api/` would simply not run. Rather than pretend otherwise, the split follows
where the *logic* lives:

- **`backend/`** — Prisma schema, database access, the slot engine, booking rules, OTP,
  pricing. No React, no JSX, no HTTP. Every rule that must hold regardless of who calls it.
- **`frontend/`** — pages, components, styling, and thin HTTP adapters in `src/app/api/`
  that parse a request, call a backend function, and map errors to status codes. A route
  handler in this project is ~40 lines of plumbing; the thinking happens in `backend/`.

The practical test: `backend/` could be lifted into a standalone Express or Nest service
with no rewrite of its logic — only new HTTP entry points.

---

## Frameworks and tooling

| Layer | Choice | Why |
|---|---|---|
| UI framework | **Next.js 16** (App Router, React 19) | Server Components read the database directly, so most pages need no client-side fetching or API layer at all |
| Language | **TypeScript 5.9**, strict | Types cross the boundary — a Prisma model change breaks the UI at compile time, not in production |
| Styling | **Tailwind CSS v4** | CSS-first config: design tokens live in `@theme` inside `globals.css`, no `tailwind.config.js` |
| ORM | **Prisma 7** + `@prisma/adapter-pg` | Prisma 7 requires a driver adapter and generates ESM TypeScript |
| Database | **PostgreSQL** | Needs partial/nullable unique indexes and array columns; the booking guard depends on them |
| Validation | **Zod 4** | One schema validates the request and types the handler |
| Tests | **Vitest** against real Postgres | A mocked database cannot prove a unique constraint stops a double booking |
| Icons | **lucide-react** | |
| Carousel | **embla-carousel-react** | Accessible, small, no jQuery-era baggage |
| Module system | **ESM** throughout (`"type": "module"`) | Required by Prisma 7's generated client |

**Not used:** no Redux/Zustand (URL and server state cover it), no component library
(Tailwind primitives are enough at this size), no separate REST/GraphQL server.

---

## `backend/` — data and business logic

### `prisma/schema.prisma` (666 lines)
Every table. Three conventions worth knowing before editing:

1. **Money is integer paise** (`amountPaise`), never float. Razorpay transacts in paise.
2. **Slot times are wall-clock strings** (`"09:30"`) plus a `@db.Date`, never UTC
   timestamps. A clinic that runs 09:00–13:00 runs at those times regardless of server
   timezone; storing instants invites off-by-one-day bugs.
3. **`Appointment.slotLock`** is the double-booking guard — a nullable unique column
   holding `"<doctorId>|<date>|<time>"`. Postgres allows unlimited NULLs in a unique
   index, so cancelling sets it to NULL and frees the slot while the row survives for
   reporting.

Main groups: `Department`/`Condition`/`Doctor` (clinical structure) · `DoctorSchedule`/
`ScheduleException` (availability) · `ServicePackage`/`PackageBooking` (home-physio packs) ·
`Appointment`/`Payment` · `PhoneVerification` · content models (`Achievement`,
`Testimonial`, `Video`, `Faq`, `Insurer`) · `AdminUser`/`AuditLog`.

### `prisma/seed.ts` (407 lines)
Idempotent demo data: 5 departments, 14 conditions, 20 doctors, 275 schedule rows,
9 packages, achievements, testimonials, videos, FAQs, insurers, admin user.
**Every value is invented placeholder content** and must be replaced before launch —
especially package prices, which the client has not confirmed.

### `src/slots.ts` (175 lines) — the availability engine
`getSlots(doctorId, date, serviceType)` runs five steps in order: load the weekday's
windows → expand into fixed-length slots (adding travel buffer for home visits) →
subtract schedule exceptions → subtract slots already held → drop anything inside the
minimum lead time. Also exports `buildSlotLock()`.

### `src/booking.ts` (357 lines) — booking rules
- `createHold()` — reserves a slot as `HOLD` with a 10-minute expiry. Catches the
  `slotLock` unique violation and converts it to a friendly `SlotUnavailableError`.
- `createPackagePurchase()` — buys a package **and** schedules session 1 in one
  transaction, so a taken slot rolls the whole purchase back rather than leaving a paid
  package with no visit.
- `schedulePackageSession()` — books a further session, increments `sessionsUsed`,
  refuses once used up or expired.
- `releaseSlot()` / `expireStaleHolds()` — free a slot without deleting history.

### `src/otp.ts` (148 lines)
SHA-256 hashed codes (never stored plain), `crypto.randomInt` generation, 3 sends per
15 minutes, 5 wrong attempts then locked, 30-minute verification token.
`consumeVerification()` returns the verified phone so a booking can never be made under
a different number than the one that received the code.

### `src/db.ts` · `src/queries.ts` · `src/time.ts` · `src/site.ts`
Prisma singleton (cached on `globalThis` in *all* environments — a dev-only cache creates
several pools during a production build and they close under each other) · read helpers
for the public pages · timezone-safe wall-clock helpers · hospital config (name, address,
phones, hours, booking defaults). **`site.ts` is where the client's real details go.**

### `tests/` (489 lines, 19 tests)
`slots.test.ts` — window expansion, travel buffer, leave, lead time, hold expiry, and a
**20-way concurrent race for one slot** (exactly 1 winner, 19 clean rejections).
`packages.test.ts` — package price charged (not the per-visit fee), session accounting,
expiry, over-booking refusal, cancelled sessions returned to the allowance.

---

## `frontend/` — everything the browser sees

### Where the design lives

**`src/app/globals.css` (139 lines) is the design system.** Tailwind v4 keeps tokens in
CSS, so this one file defines the whole visual language:

- **Brand teal** `--color-brand-50…950` — trust, structure, headers, footer
- **Coral accent** `--color-accent-50…800` — *reserved for booking CTAs only*, so "book"
  is always the most urgent thing on screen
- **`--color-emergency`** — the ambulance number and destructive actions, nothing else
- **Warm grey `--color-ink-*`** — softer than pure slate
- **Type**: Inter (body) + Plus Jakarta Sans (headings), via `next/font`
- Base layer: focus rings, `prefers-reduced-motion`, `.input` form control

Component-level design decisions live with the components: `ui/Button.tsx` holds the
variant matrix (`primary` teal · `book` coral · `outline` · `ghost` · `emergency`) and
sizes with `min-h` values that keep every touch target ≥44px.

### `src/app/` — routes (30)

**Marketing:** `page.tsx` (homepage, 228 lines — hero slider, action rail, speciality
tabs, booking split, stats, doctors, testimonials, videos, what's new, insurance, FAQs) ·
`about` · `specialities` + `[slug]` · `doctors` + `[slug]` · `home-physiotherapy`
(package catalog) · `testimonials` · `achievements` · `gallery` · `insurance` · `contact`

**Booking:** `book/` (the OP vs home-physio fork) · `book/op` · `book/home-physio` ·
`book/success/[ref]` · `manage/` · `manage/[ref]`

**Lead capture:** `second-opinion`

**Legal:** `privacy` · `terms` · `refund-policy` — deliberately empty placeholders listing
what each must cover. No invented policy text: these are binding statements, and Razorpay
checks the refund policy at merchant onboarding.

**API adapters** (`src/app/api/`): `slots` · `bookings` (257 lines — the largest, because
it validates, checks OTP, branches on package vs single visit, and computes price
server-side) · `otp/send` · `otp/verify` · `manage` · `manage/details` · `second-opinion`

### `src/components/`

| Folder | Files | Notes |
|---|---|---|
| `booking/` | `OpBookingFlow` (454), `HomePhysioFlow` (506), `ManageBooking` (375), `SlotPicker` (178), `OtpStep` (174), `SecondOpinionForm` (173) | The multi-step flows. `SlotPicker` derives "loading" from a request key rather than a flag, so stale slots never flash |
| `hero/` | `AchievementSlider` (216), `ActionRail` (90) | Slider pauses on hover, focus, hidden tab, and `prefers-reduced-motion`; has a real pause button and an `aria-live` announcer |
| `specialities/` | `CoreSpecialityTabs` (193) | WAI-ARIA tabs with arrow-key navigation; stacked cards below `lg` |
| `cards/` | `DoctorCard`, `PackageCard`, `TestimonialCard` | Doctor card leads with *experience*; package card switches CTA between `Book Now` and `Enquire Now` |
| `layout/` | `Header`, `Footer`, `MobileBookBar`, `PolicyPlaceholder` | Emergency number pinned in the header at all scroll positions |
| `home/`, `video/`, `doctors/`, `ui/` | Stats band, FAQ accordion, YouTube facade, filters, Button/Container | `VideoGrid` loads zero YouTube JS until clicked |

`src/lib/utils.ts` — `cn()` class merging and `formatPhone()`. That is the only frontend
lib file; everything else comes from `@medisure/backend`.

---

## How the two halves talk

The frontend imports the backend through subpath exports, which keeps server-only code
out of client bundles:

```ts
import { getSlots }   from "@medisure/backend/slots";    // server only
import { db }         from "@medisure/backend/db";       // server only
import { formatDateLabel } from "@medisure/backend/time"; // safe in "use client"
import { site }       from "@medisure/backend/site";      // safe in "use client"
```

`db`, `queries`, `slots`, `booking` and `otp` all import `server-only`, so importing them
from a client component fails the build rather than leaking database code to the browser.
`time` and `site` are pure and deliberately client-safe.

Next compiles the backend from TypeScript source via `transpilePackages` — one toolchain,
no separate build step to consume our own package.

---

## Commands (all from the repo root)

```bash
npm run db:dev       # start the local Postgres (prisma dev) — do this first
npm run db:migrate   # apply schema changes
npm run db:seed      # load demo content
npm run dev          # Next dev server on :3000
npm run build        # generate Prisma client, then build the app
npm test             # 19 tests against the real database
npm run typecheck    # both workspaces
npm run lint
```

---

## Known gaps

- **No payment is collected yet.** Bookings sit in `HOLD`; the success page says "payment
  pending". Razorpay orders, the signature-verified webhook, and refunds are the next phase.
- **SMS/email is a console stub.** OTPs print to the server log and are returned as
  `devCode` in development only.
- **No admin panel yet.** The schema (`AdminUser`, `AuditLog`, `SiteSetting`) is ready.
- **Second-opinion report uploads are not wired** — those are medical records and need a
  private bucket with signed URLs, not the public media bucket.
- **All seeded content is placeholder**, including every price.
