/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Shared Jest building blocks for every workspace (api, web, admin, shared, hooks, ui).
 * Philosophy:
 *  - Tests run against package SOURCE via moduleNameMapper (no "build shared first" step).
 *  - SWC transpiles (fast); types are enforced by `pnpm typecheck`, which includes spec files.
 *  - Coverage is strict where money and state live, a ratcheting floor everywhere else.
 */
const path = require("node:path");
const fs = require("node:fs");

const ROOT = __dirname;

/** @afritrade/<pkg> -> packages/<pkg>/src (only for packages that exist) */
const workspaceAliases = Object.fromEntries(
  ["shared", "hooks", "ui"].flatMap((name) => {
    const src = path.join(ROOT, "packages", name, "src");
    if (!fs.existsSync(src)) return [];
    return [
      [`^@afritrade/${name}$`, path.join(src, "index.ts")],
      [`^@afritrade/${name}/(.*)$`, path.join(src, "$1")],
    ];
  }),
);

/** Repo-relative thresholds. Raise the floor as tests land; never lower it. */
const THRESHOLDS = {
  global: { statements: 50, branches: 40, functions: 50, lines: 50 },
  // Money + state live here: RULES §15 ("hard where money and state are involved")
  "apps/api/src/modules/payments/": { statements: 90, branches: 85, functions: 90, lines: 90 },
  "apps/api/src/modules/orders/": { statements: 85, branches: 80, functions: 85, lines: 85 },
  "packages/shared/src/types/money.ts": { statements: 95, branches: 90, functions: 95, lines: 95 },
  "packages/shared/src/types/enums.ts": { statements: 95, branches: 90, functions: 95, lines: 95 },
  "apps/web/src/components/SidebarNav.tsx": { statements: 85, branches: 75, functions: 70, lines: 85 },
  "apps/admin/src/components/AdminSidebar.tsx": { statements: 85, branches: 75, functions: 70, lines: 85 },
};

/** Re-key THRESHOLDS for a workspace (workspaceRel e.g. "apps/api") or for the repo root (""). */
function thresholdsFor(workspaceRel = "") {
  const out = {};
  if (workspaceRel === "apps/web" || workspaceRel === "apps/admin") {
    // Next.js App Router frontends rely on smoke tests for page routes; ratchet tested components
    out.global = { statements: 0, branches: 0, functions: 0, lines: 0 };
  } else {
    out.global = THRESHOLDS.global;
  }
  for (const [key, value] of Object.entries(THRESHOLDS)) {
    if (key !== "global") {
      if (!workspaceRel) out[`./${key}`] = value;
      else if (key.startsWith(`${workspaceRel}/`)) out[`./${key.slice(workspaceRel.length + 1)}`] = value;
    }
  }
  return out;
}

let tsJestPath;
try {
  tsJestPath = require.resolve("ts-jest", {
    paths: [path.join(ROOT, "apps/api"), path.join(ROOT, "node_modules/.pnpm/node_modules")],
  });
} catch {
  tsJestPath = "ts-jest";
}

const defaultTransform = ({ tsx }) => [
  tsJestPath,
  {
    tsconfig: {
      module: "commonjs",
      moduleResolution: "node",
      target: "es2022",
      esModuleInterop: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      allowJs: true,
      ...(tsx ? { jsx: "react-jsx" } : {}),
    },
    diagnostics: { ignoreCodes: [151002] },
  },
];

const coverageDefaults = {
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.{spec,int-spec,test}.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.ts",
    "!src/**/index.ts",
    "!src/**/*.module.ts",
    "!src/**/*.dto.ts",
    "!src/**/__mocks__/**",
  ],
  coverageDirectory: "<rootDir>/coverage",
};

/**
 * createConfig({ name, rel, env, ... })
 *  name: displayName, rel: workspace path relative to repo root (e.g. "apps/api")
 */
function createConfig({ name, rel, env = "node", setupFilesAfterEnv = [], moduleNameMapper = {}, extra = {} }) {
  const dom = env === "jsdom";
  return {
    displayName: name,
    rootDir: path.join(ROOT, rel),
    testEnvironment: env,
    testMatch: ["<rootDir>/src/**/*.spec.{ts,tsx}", "<rootDir>/test/**/*.spec.{ts,tsx}"],
    transform: { "^.+\\.(t|j)sx?$": defaultTransform({ tsx: dom }) },
    moduleNameMapper: {
      ...(dom ? { "\\.(css|scss|svg|png|jpg)$": path.join(ROOT, "test/file-stub.js") } : {}),
      ...workspaceAliases,
      ...moduleNameMapper,
    },
    setupFilesAfterEnv: [...(dom ? [path.join(ROOT, "test/jest.setup.dom.ts")] : []), ...setupFilesAfterEnv],
    clearMocks: true,
    restoreMocks: true,
    errorOnDeprecated: true,
    ...coverageDefaults,
    ...extra,
  };
}

module.exports = { ROOT, createConfig, workspaceAliases, coverageDefaults, thresholdsFor, THRESHOLDS };
