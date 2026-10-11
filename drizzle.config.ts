import { defineConfig } from "drizzle-kit";

// Only `drizzle-kit generate` runs against this file; scripts/migrate.mjs applies the migrations.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
});
