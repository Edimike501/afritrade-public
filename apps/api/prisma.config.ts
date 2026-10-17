import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile();
} catch {
  // No .env file (e.g. on a host where env vars are injected) — that's fine.
}

// Ensure @afritrade/shared is built before seeding if invoked directly via Prisma CLI
const sharedDist = path.resolve(__dirname, "../../packages/shared/dist/index.cjs");
if (!fs.existsSync(sharedDist)) {
  try {
    execSync("pnpm --filter @afritrade/shared build", {
      cwd: path.resolve(__dirname, "../.."),
      stdio: "inherit",
    });
  } catch {
    // If build fails or pnpm is unavailable, Prisma CLI will proceed and surface any error
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
