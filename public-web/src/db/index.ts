import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// A single pooled connection shared across the app (Next.js reuses this
// module instance per server process). In production, point DATABASE_URL at
// the real PostgreSQL instance; consider PgBouncer per the architecture doc
// once concurrent traffic is high (e.g. results-announcement day).
const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool, { schema });
