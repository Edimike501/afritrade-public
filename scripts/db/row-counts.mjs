#!/usr/bin/env node
/**
 * Data-preservation check for migration rehearsals.
 *   node scripts/db/row-counts.mjs snapshot <file>   # before migrating
 *   node scripts/db/row-counts.mjs compare  <file>   # after migrating
 * Fails if a table disappeared, lost rows, or a migration is unfinished/rolled back.
 * Run from apps/api (resolves pg from there):  pnpm --filter api exec node ../../scripts/db/row-counts.mjs ...
 */
import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(`${process.cwd()}/package.json`);
const { Client } = require("pg");
const [mode, file] = process.argv.slice(2);
if (!["snapshot", "compare"].includes(mode) || !file) {
  console.error("usage: row-counts.mjs <snapshot|compare> <file>");
  process.exit(2);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rows: tables } = await client.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> '_prisma_migrations'
      ORDER BY 1`,
  );
  const counts = {};
  for (const { table_name } of tables) {
    const { rows } = await client.query(`SELECT count(*)::bigint AS n FROM "${table_name.replace(/"/g, '""')}"`);
    counts[table_name] = Number(rows[0].n);
  }

  if (mode === "snapshot") {
    fs.writeFileSync(file, JSON.stringify(counts, null, 2));
    console.log(`snapshot: ${Object.keys(counts).length} tables, ${Object.values(counts).reduce((a, b) => a + b, 0)} rows`);
  } else {
    const before = JSON.parse(fs.readFileSync(file, "utf8"));
    const problems = [];
    for (const [table, n] of Object.entries(before)) {
      if (!(table in counts)) problems.push(`table "${table}" no longer exists (had ${n} rows)`);
      else if (counts[table] < n) problems.push(`table "${table}" lost rows: ${n} -> ${counts[table]}`);
    }
    const { rows: bad } = await client.query(
      `SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL`,
    );
    for (const { migration_name } of bad) problems.push(`migration "${migration_name}" is unfinished or rolled back`);
    if (problems.length) {
      for (const p of problems) console.error(`::error::${p}`);
      process.exit(1);
    }
    console.log("\u2705 no data loss detected; all migrations finished");
  }
} finally {
  await client.end();
}
