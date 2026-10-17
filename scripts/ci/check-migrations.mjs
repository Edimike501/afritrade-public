#!/usr/bin/env node
/**
 * Migration safety gate (runs locally via `pnpm db:check` and in CI).
 *  1. Structure   - every migration dir is <14 digits>_<snake_name>/migration.sql, lock file is postgresql.
 *  2. Immutable   - a migration that exists on the base ref may not be modified, renamed or deleted.
 *  3. Expand-only - NEW migrations may not contain destructive/locking SQL unless they carry
 *                   `-- safe-migration: <reason>` (forces a conscious expand/contract decision).
 *  4. Review aid  - new migration SQL is printed to the GitHub job summary.
 * Env: BASE_REF (default origin/staging, then origin/main). Unknown base => immutability check is skipped with a warning.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const MIG_DIR = "apps/api/prisma/migrations";
const errors = [];
const warnings = [];
const gh = process.env.GITHUB_ACTIONS === "true";
const err = (msg, file) => errors.push({ msg, file });
const warn = (msg) => warnings.push(msg);

const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const refExists = (ref) => {
  try {
    git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
    return true;
  } catch {
    return false;
  }
};

if (!fs.existsSync(MIG_DIR)) {
  err(`${MIG_DIR} does not exist. Generate the first migration: pnpm migrate:dev -- --name init`);
} else {
  // 1. structure
  const dirs = fs.readdirSync(MIG_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  if (dirs.length === 0) err("no migrations found. Generate the first one: pnpm migrate:dev -- --name init");
  for (const name of dirs) {
    if (!/^\d{14}_[a-z0-9_]+$/.test(name)) err(`bad migration name "${name}" (expected 14-digit timestamp + snake_case)`, `${MIG_DIR}/${name}`);
    const sql = path.join(MIG_DIR, name, "migration.sql");
    if (!fs.existsSync(sql) || fs.statSync(sql).size === 0) err(`migration "${name}" has no migration.sql content`, sql);
  }
  const lock = path.join(MIG_DIR, "migration_lock.toml");
  if (!fs.existsSync(lock) || !/provider\s*=\s*"postgresql"/.test(fs.readFileSync(lock, "utf8"))) {
    err("migration_lock.toml missing or provider is not postgresql", lock);
  }

  // 2 + 3. compare with base
  let base = process.env.BASE_REF;
  if (!base) base = ["origin/staging", "origin/main"].find(refExists);
  const changed = []; // {status, file}
  if (base && refExists(base)) {
    const mergeBase = git("merge-base", base, "HEAD");
    const out = git("diff", "--name-status", "--no-renames", mergeBase, "--", MIG_DIR);
    for (const line of out.split("\n").filter(Boolean)) {
      const [status, file] = line.split("\t");
      changed.push({ status, file });
    }
    const untracked = git("ls-files", "--others", "--exclude-standard", "--", MIG_DIR).split("\n").filter(Boolean);
    for (const file of untracked) changed.push({ status: "A", file });
  } else {
    warn(`base ref "${base ?? "(none)"}" not found: skipping immutability + destructive-SQL checks`);
  }

  for (const { status, file } of changed) {
    if (status !== "A") err(`existing migration was ${status === "M" ? "modified" : "removed"}: migrations are immutable once merged. Add a new migration instead.`, file);
  }

  const DESTRUCTIVE = [
    [/\bDROP\s+(TABLE|COLUMN|TYPE|SCHEMA)\b/i, "DROP TABLE/COLUMN/TYPE/SCHEMA"],
    [/\bALTER\s+COLUMN\s+\S+\s+(SET\s+DATA\s+)?TYPE\b/i, "column type change (rewrites table / can fail on data)"],
    [/\bSET\s+NOT\s+NULL\b/i, "SET NOT NULL on existing column"],
    [/\bRENAME\b/i, "RENAME (breaks the previous app version that is still running during deploy)"],
    [/\bTRUNCATE\b/i, "TRUNCATE"],
    [/\bDELETE\s+FROM\b/i, "DELETE FROM"],
  ];
  const added = changed.filter((c) => c.status === "A" && c.file.endsWith("migration.sql"));
  let summary = "";
  for (const { file } of added) {
    const sql = fs.readFileSync(file, "utf8");
    summary += `<details><summary>${file}</summary>\n\n\`\`\`sql\n${sql}\n\`\`\`\n</details>\n\n`;
    const marker = sql.match(/--\s*safe-migration:\s*(.+)/i);
    const hasReason = !!marker && marker[1].trim().length >= 10;
    const stripped = sql.replace(/--.*$/gm, "");
    const hits = [];
    for (const [re, label] of DESTRUCTIVE) if (re.test(stripped)) hits.push(label);
    for (const stmt of stripped.split(";")) {
      if (/\bADD\s+COLUMN\b/i.test(stmt) && /\bNOT\s+NULL\b/i.test(stmt) && !/\bDEFAULT\b/i.test(stmt)) {
        hits.push("ADD COLUMN ... NOT NULL without DEFAULT (fails on populated tables)");
      }
    }
    if (hits.length && !hasReason) {
      err(
        `destructive/breaking SQL: ${[...new Set(hits)].join("; ")}. If intentional (contract step after the code stopped using it), add a line "-- safe-migration: <why this is safe>" to the file.`,
        file,
      );
    }
  }
  if (summary && process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## New migrations\n\n${summary}`);
  }
  console.log(`checked ${dirs.length} migrations; ${added.length} new vs ${base ?? "n/a"}`);
}

for (const w of warnings) console.warn(gh ? `::warning::${w}` : `\u26a0\ufe0f  ${w}`);
for (const { msg, file } of errors) console.error(gh ? `::error${file ? ` file=${file}` : ""}::${msg}` : `\u274c ${msg}${file ? `  (${file})` : ""}`);
if (errors.length) process.exit(1);
console.log("\u2705 migration checks passed");
