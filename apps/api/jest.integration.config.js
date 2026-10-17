/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Integration tests: real Postgres (+ Redis), schema built by replaying ALL migrations from zero.
 * File convention: *.int-spec.ts   Run: pnpm --filter api test:integration   (needs `pnpm db:up`)
 */
const path = require("node:path");
const { workspaceAliases } = require("../../jest.config.base");
const unit = require("./jest.config");

module.exports = {
  displayName: "api:integration",
  rootDir: __dirname,
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.int-spec.ts", "<rootDir>/test/integration/**/*.int-spec.ts"],
  transform: unit.transform,
  moduleNameMapper: workspaceAliases,
  globalSetup: path.join(__dirname, "test/setup/global-setup.js"),
  setupFiles: [path.join(__dirname, "test/setup/env.js")],
  maxWorkers: 1, // suites share one database; correctness > speed here
  testTimeout: 30_000,
  clearMocks: true,
  restoreMocks: true,
  errorOnDeprecated: true,
};
