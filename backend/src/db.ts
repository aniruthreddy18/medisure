import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma client singleton.
 *
 * Next.js hot-reloads modules in development, which would otherwise open a
 * new connection pool on every save until Postgres refuses new connections.
 * Stashing the instance on globalThis keeps exactly one pool per process.
 */
const createClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

/**
 * Cached in every environment, not just development.
 *
 * A production build evaluates this module once per module graph (RSC and SSR
 * are separate graphs), so a dev-only cache silently creates several
 * connection pools. Whichever pool is torn down first takes its sockets with
 * it, and the next query fails with `ConnectionClosed` mid-prerender. One
 * pool per process is both correct and cheaper.
 */
export const db = globalForPrisma.prisma ?? createClient();
globalForPrisma.prisma = db;
