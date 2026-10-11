import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// A pool connects on its first query, not here, so `next build` needs no database.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis: 10_000,
});

// An idle client's error is emitted on the pool, and with no listener it crashes the process.
pool.on("error", (error) => console.error("Idle Postgres client error", error));

// Keeps the function alive until idle connections close. A no-op outside Vercel.
attachDatabasePool(pool);

export const db = drizzle({ client: pool, schema });
