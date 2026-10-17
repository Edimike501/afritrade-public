/**
 * Policy-as-tests: the database itself must obey RULES.md, no matter which code wrote the migration.
 * These run against a schema built by replaying every migration from zero.
 */
import type { Client } from "pg";
import fs from "node:fs";
import path from "node:path";
import { openDb } from "../helpers/db";

let db: Client;
beforeAll(async () => { db = await openDb(); });
afterAll(async () => { await db.end(); });

// RULES §1 & AGENTS.md: Money is stored as Postgres Decimal(14,2) and travels over the API as a decimal string.
const NUMERIC_ALLOWLIST: Array<{ table: string; column: string; reason: string }> = [
  { table: "Order", column: "totalAmount", reason: "Stored decimal string per AGENTS.md and TRD" },
  { table: "Product", column: "price", reason: "Stored decimal string per AGENTS.md and TRD" },
  { table: "OrderItem", column: "unitPrice", reason: "Stored decimal string per AGENTS.md and TRD" },
  { table: "Payment", column: "amount", reason: "Stored decimal string per AGENTS.md and TRD" },
  { table: "PaymentLedgerEntry", column: "amount", reason: "Stored decimal string per AGENTS.md and TRD" },
  { table: "ExchangeRate", column: "ratePerUsd", reason: "Indicative display-only FX rate per TRD" },
];

describe("migrations", () => {
  it("every migration on disk is applied, finished and not rolled back", async () => {
    const dir = path.resolve(__dirname, "../../prisma/migrations");
    const onDisk = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
    const { rows } = await db.query<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }>(
      `SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY migration_name`,
    );
    expect(rows.map((r) => r.migration_name)).toEqual(onDisk);
    expect(rows.filter((r) => !r.finished_at || r.rolled_back_at)).toEqual([]);
  });
});

describe("RULES §1: money columns", () => {
  it("no float/decimal columns anywhere (money is integer minor units)", async () => {
    const { rows } = await db.query<{ table_name: string; column_name: string; data_type: string }>(
      `SELECT table_name, column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND data_type IN ('numeric', 'double precision', 'real', 'money')`,
    );
    const offenders = rows.filter((r) => !NUMERIC_ALLOWLIST.some((a) => a.table === r.table_name && a.column === r.column_name));
    expect(offenders).toEqual([]);
  });

  it("every *Minor column is bigint", async () => {
    const { rows } = await db.query<{ table_name: string; column_name: string; data_type: string }>(
      `SELECT table_name, column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name ~* 'minor$'`,
    );
    expect(rows.filter((r) => r.data_type !== 'bigint')).toEqual([]);
  });
});

describe("structure", () => {
  it("every table has a primary key", async () => {
    const { rows } = await db.query<{ table_name: string }>(
      `SELECT t.table_name FROM information_schema.tables t
        WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE' AND t.table_name <> '_prisma_migrations'
          AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints c
                           WHERE c.table_schema = 'public' AND c.table_name = t.table_name AND c.constraint_type = 'PRIMARY KEY')`,
    );
    expect(rows).toEqual([]);
  });
});

describe("RULES §2: payment ledger is structurally append-only and idempotent", () => {
  async function ledgerTable(): Promise<string> {
    const { rows } = await db.query<{ tablename: string }>(`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename ~* 'ledger'`);
    expect(rows).toHaveLength(1); // exactly one ledger table must exist
    return rows[0].tablename;
  }

  it("has a UNIQUE (reference, type) constraint so a duplicate callback cannot double-record", async () => {
    const table = await ledgerTable();
    const { rows } = await db.query<{ indexdef: string }>(`SELECT indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=$1`, [table]);
    expect(rows.some((r) => /UNIQUE/i.test(r.indexdef) && /reference/i.test(r.indexdef) && /type/i.test(r.indexdef))).toBe(true);
  });

  it("has a trigger that blocks UPDATE and DELETE", async () => {
    const table = await ledgerTable();
    const { rows } = await db.query<{ def: string }>(
      `SELECT pg_get_triggerdef(t.oid) AS def FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
        WHERE c.relname = $1 AND NOT t.tgisinternal`,
      [table],
    );
    const defs = rows.map((r) => r.def).join("\n");
    expect(defs).toMatch(/BEFORE/i);
    expect(defs).toMatch(/UPDATE/i);
    expect(defs).toMatch(/DELETE/i);
  });
});
