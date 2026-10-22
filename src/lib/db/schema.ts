import { sql } from "drizzle-orm";
import { boolean, check, customType, integer, jsonb, pgTable, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import type { Finding } from "../skills/scan";
import { user } from "./auth-schema";

export * from "./auth-schema";

/** A skill a user wrote. Its content lives in `skill_version`; these columns follow the latest version. */
export const skill = pgTable(
  "skill",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // SET NULL, not CASCADE: a sold skill outlives its author, so buyers keep their downloads.
    ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    visibility: text("visibility").notNull().default("private"),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("skill_owner_slug_unique").on(table.ownerId, table.slug),
    check("skill_visibility_check", sql`${table.visibility} in ('private', 'unlisted', 'public')`),
    check("skill_status_check", sql`${table.status} in ('draft', 'published', 'removed')`),
  ],
);

/** One saved version of a skill, numbered from 1: its SKILL.md, the scan that ran on it and its files. Never edited after insert. */
export const skillVersion = pgTable(
  "skill_version",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    skillMd: text("skill_md").notNull(),
    frontmatter: jsonb("frontmatter").$type<Record<string, unknown>>().notNull(),
    contentHash: text("content_hash").notNull(),
    risk: text("risk").notNull(),
    findings: jsonb("findings").$type<Finding[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("skill_version_skill_version_unique").on(table.skillId, table.version),
    check("skill_version_version_check", sql`${table.version} > 0`),
    check("skill_version_risk_check", sql`${table.risk} in ('none', 'low', 'medium', 'high', 'critical')`),
  ],
);

// drizzle-orm 0.45 has no bytea column; node-postgres reads and writes the type as a Buffer.
const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });

/** A file of one version beside its SKILL.md, under a path relative to the skill's folder. */
export const skillFile = pgTable(
  "skill_file",
  {
    versionId: uuid("version_id")
      .notNull()
      .references(() => skillVersion.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    content: bytea("content").notNull(),
    executable: boolean("executable").notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.versionId, table.path] }),
    // The upload checks every path; this keeps one that escapes the folder out of the table anyway.
    check(
      "skill_file_path_check",
      sql`${table.path} <> '' and ${table.path} !~ '^/|(^|/)\\.\\.(/|$)' and strpos(${table.path}, '\\') = 0`,
    ),
  ],
);
