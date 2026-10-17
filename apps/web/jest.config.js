/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");
const path = require("node:path");
const { workspaceAliases, coverageDefaults, thresholdsFor } = require("../../jest.config.base");

const createJestConfig = nextJest({ dir: __dirname });

module.exports = createJestConfig({
  displayName: "web",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.spec.{ts,tsx}"],
  setupFilesAfterEnv: [path.join(__dirname, "../../test/jest.setup.dom.ts")],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1", ...workspaceAliases },
  clearMocks: true,
  restoreMocks: true,
  ...coverageDefaults,
  coverageThreshold: thresholdsFor("apps/web"),
});
