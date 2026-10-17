import { Client } from "pg";

/** Open a pg client against the (guarded) test database. Prisma-version independent on purpose. */
export async function openDb(): Promise<Client> {
  const connectionString = process.env.DATABASE_URL;
  const isRemote =
    Boolean(connectionString) &&
    !connectionString?.includes("localhost") &&
    !connectionString?.includes("127.0.0.1") &&
    !connectionString?.includes("::1");
  const client = new Client({
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  return client;
}

/** Wipe all data between suites (test DB only; global-setup already proved it is a throwaway DB). */
export async function truncateAll(client: Client): Promise<void> {
  const { rows } = await client.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
  );
  if (rows.length === 0) return;
  const list = rows.map((r) => `"${r.tablename.replace(/"/g, '""')}"`).join(", ");
  await client.query(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
}
