import { defineConfig } from "vitest/config";
import "dotenv/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Integration tests hit the real dev Postgres — a mocked database cannot
    // prove that a unique constraint stops a double booking.
    env: { NODE_ENV: "test", DATABASE_URL: process.env.DATABASE_URL ?? "" },
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@/lib": path.resolve(import.meta.dirname, "./src"),
      "@": path.resolve(import.meta.dirname, "./src"),
      // `server-only` throws outside a React Server Component. Tests exercise
      // these modules directly in Node, so it is stubbed out.
      "server-only": path.resolve(import.meta.dirname, "./tests/stubs/server-only.ts"),
    },
  },
});
