import { sql } from "drizzle-orm";
import { boolean, check, customType, integer, jsonb, pgTable, primaryKey, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
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
    // Why an admin removed it, as its owner was told; null unless the status is "removed".
    removalReason: text("removal_reason"),
    // What a buyer pays, in the currency's smallest unit, as its seller set it; both null while it is free.
    priceCents: integer("price_cents"),
    currency: text("currency"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("skill_owner_slug_unique").on(table.ownerId, table.slug),
    check("skill_visibility_check", sql`${table.visibility} in ('private', 'unlisted', 'public')`),
    check("skill_status_check", sql`${table.status} in ('draft', 'published', 'removed')`),
    check("skill_price_cents_check", sql`${table.priceCents} > 0`),
    check("skill_currency_check", sql`${table.currency} in ('eur')`),
    check("skill_price_currency_check", sql`(${table.priceCents} is null) = (${table.currency} is null)`),
  ],
);

/** The Stripe account a user is paid into once they start selling: one per user, opened on Stripe. */
export const sellerAccount = pgTable(
  "seller_account",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    stripeAccountId: text("stripe_account_id").notNull().unique(),
    // Whether Stripe lets the account receive the transfers its sales pay out, as last read from Stripe.
    ready: boolean("ready").notNull().default(false),
    // Where the seller is based, as an ISO 3166-1 code: Stripe fixes it when the account opens.
    country: text("country").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [check("seller_account_country_check", sql`${table.country} ~ '^[A-Z]{2}$'`)],
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
    // The upload checks every path; this keeps one that escapes the folder out of the table anyway:
    // no empty, "." or ".." segment, which also refuses an absolute path, and no backslash.
    check("skill_file_path_check", sql`${table.path} !~ '(^|/)\\.{0,2}(/|$)' and strpos(${table.path}, '\\') = 0`),
  ],
);

/** A notice that a published skill or a profile breaks the terms or the law, and what an admin decided. */
export const report = pgTable(
  "report",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // SET NULL: the record of what was reported and decided outlives the sender's account.
    reporterId: text("reporter_id").references(() => user.id, { onDelete: "set null" }),
    // A skill's id, or a user's id for a profile. No foreign key: the record outlives its target.
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    details: text("details").notNull(),
    status: text("status").notNull().default("open"),
    resolvedBy: text("resolved_by").references(() => user.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("report_target_type_check", sql`${table.targetType} in ('skill', 'user')`),
    check(
      "report_reason_check",
      sql`${table.reason} in ('malware', 'hidden-instructions', 'personal-data', 'rights', 'illegal', 'other')`,
    ),
    check("report_status_check", sql`${table.status} in ('open', 'actioned', 'dismissed')`),
    // A second report of the same target by the same sender adds nothing while the first is open.
    uniqueIndex("report_open_unique").on(table.reporterId, table.targetType, table.targetId).where(sql`${table.status} = 'open'`),
  ],
);

/**
 * A username given up by a rename or an account deletion, kept from everyone else until the hold
 * ends, so its old addresses cannot pass to someone else.
 */
export const usernameHold = pgTable("username_hold", {
  username: text("username").primaryKey(),
  // The account that gave it up, which may take it back; null once that account is deleted.
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  heldUntil: timestamp("held_until", { withTimezone: true }).notNull(),
});
