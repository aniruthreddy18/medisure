import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --env-file=../.env prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    // `prisma dev` exposes a second database for migration shadowing. Without
    // pointing Prisma at it explicitly, migrate tries to reuse the primary and
    // fails with "type already exists".
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
