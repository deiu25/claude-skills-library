// Applies the migrations in drizzle/ with drizzle's own migrator, the one `drizzle-kit migrate`
// calls. drizzle-kit 0.31 exits 1 without printing the error (drizzle-team/drizzle-orm#5521),
// which would leave a failed deploy unexplained; here the error reaches the build log.
import nextEnv from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set.");

const pool = new pg.Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 10_000 });
try {
  await migrate(drizzle({ client: pool }), { migrationsFolder: "drizzle" });
  console.log("Migrations applied.");
} finally {
  await pool.end();
}
