# MediSure Hospital

Website and slot-booking portal for a multi-speciality hospital — physiotherapy,
orthopaedics and general surgery, with home physiotherapy sold as session packages.

**Full codebase guide: [ARCHITECTURE.md](./ARCHITECTURE.md)**

## Layout

```
backend/    @medisure/backend  — Prisma schema, database access, slot engine,
                                 booking rules, OTP. No React, no HTTP.
frontend/   @medisure/frontend — Next.js App Router: pages, components, styling,
                                 and thin API adapters over the backend.
```

Next.js requires route handlers to live under `app/`, so the split follows where the
logic sits rather than where the HTTP endpoints sit. `backend/` could move to a
standalone service without rewriting its rules.

## Getting started

```bash
npm install
npm run db:dev      # start the local Postgres (leave running in its own terminal)
npm run db:migrate  # apply the schema
npm run db:seed     # load demo content
npm run dev         # http://localhost:3000
```

`npm run db:dev` prints connection strings. Use the plain form — omit the
`max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0` parameters it
suggests, as they cause the server to drop pooled connections and produce
intermittent `ConnectionClosed` build failures.

## Other commands

```bash
npm test          # 19 tests against the real database
npm run typecheck # both workspaces
npm run lint
npm run build
```

## Status

Working: the full public site, both booking flows (OP consultation and home
physiotherapy), package purchase and session scheduling, OTP verification, and
self-service reschedule/cancel.

Not built yet: payment capture (Razorpay), real SMS/email delivery, the admin panel.
All seeded content — including every price — is placeholder and must be replaced with
the client's own before launch.
