import { sql } from "drizzle-orm";
import { check, integer, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
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

/** One saved SKILL.md, numbered from 1, with the scan that ran on it. Never edited after insert. */
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
