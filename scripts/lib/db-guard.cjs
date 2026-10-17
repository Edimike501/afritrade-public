#!/usr/bin/env node
/**
 * Refuses to let destructive tooling (migrate reset, truncate, smoke seeding) touch anything
 * that is not a local/CI throwaway database. Used by scripts/db/reset.sh, jest global setup
 * and verify-prod.sh.  Rule of thumb: host must be local AND db name must end in _test/_smoke/_ci/_shadow.
 */
const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "postgres"]);
const ALLOWED_SUFFIXES = ["_test", "_smoke", "_ci", "_shadow"];

function assertSafeDatabaseUrl(raw) {
  if (!raw) throw new Error("db-guard: DATABASE_URL is empty");
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("db-guard: DATABASE_URL is not a valid URL");
  }
  const dbName = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    throw new Error(`db-guard: refusing host "${url.hostname}" (only local throwaway databases are allowed)`);
  }
  if (!ALLOWED_SUFFIXES.some((s) => dbName.endsWith(s))) {
    throw new Error(`db-guard: refusing database "${dbName}" (name must end in ${ALLOWED_SUFFIXES.join(", ")})`);
  }
  return { host: url.hostname, dbName };
}

module.exports = { assertSafeDatabaseUrl };

if (require.main === module) {
  try {
    const { host, dbName } = assertSafeDatabaseUrl(process.argv[2] ?? process.env.DATABASE_URL);
    console.log(`db-guard: ok (${host}/${dbName})`);
  } catch (err) {
    console.error(`\u274c ${err.message}`);
    process.exit(1);
  }
}
