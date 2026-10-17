/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * GLOBAL trigger: one Jest run across every workspace (watch mode, combined coverage, single report).
 *   pnpm test:global        pnpm test:global:cov        pnpm test:watch
 * Per-workspace runs (cached, parallel in CI) still go through `pnpm test` (turbo) or `pnpm --filter <pkg> test`.
 * Integration tests are deliberately NOT here: they need a database (see apps/api/jest.integration.config.js).
 */
const fs = require("node:fs");
const path = require("node:path");
const { thresholdsFor } = require("./jest.config.base");

const workspaces = ["packages/shared", "packages/hooks", "packages/ui", "apps/api", "apps/web", "apps/admin"].filter(
  (w) => fs.existsSync(path.join(__dirname, w, "jest.config.js")) || fs.existsSync(path.join(__dirname, w, "jest.config.cjs")),
);

module.exports = {
  projects: workspaces.map((w) => `<rootDir>/${w}`),
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text-summary", "lcov", "json-summary"],
  coverageThreshold: thresholdsFor(""),
};
