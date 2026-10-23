import "server-only";
import { and, desc, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { adminUserIds, isAdmin } from "@/lib/auth/admin";
import { requireUser } from "@/lib/auth/session";
import { listingPath, profilePath } from "@/lib/community/links";
import { db } from "@/lib/db";
import { report, skill, user } from "@/lib/db/schema";
import { skillIdSchema } from "@/lib/skills/schemas";
import type { ReportReason, TargetType } from "./schemas";

// Reads for reports and for /dashboard/admin. A report names only what Community shows; the admin
// page answers 404 to anyone whose id is not in ADMIN_USER_IDS.

/** The signed-in admin. Anyone else gets a 404, as for a page that does not exist. */
export async function requireAdmin() {
  const currentUser = await requireUser();
  if (!isAdmin(currentUser.id)) notFound();
  return currentUser;
}

/** Shown to others, as on the Community pages: a published skill whose owner has a username and is not suspended. */
const notSuspended = sql`${user.banned} is not true`;

export interface ReportTarget {
  type: TargetType;
  /** The skill's id, or the user's id for a profile. */
  id: string;
  /** The skill's name, or the profile's username. */
  name: string;
  path: string;
}

/**
 * What a report can name: a published skill by its id, or a profile by its username, as long as the
 * site still shows it. Null otherwise.
 */
export async function findReportTarget(type: TargetType, key: string): Promise<ReportTarget | null> {
  if (type === "skill") {
    if (!skillIdSchema.safeParse(key).success) return null;
    const [row] = await db
      .select({ id: skill.id, name: skill.name, slug: skill.slug, handle: user.username })
      .from(skill)
      .innerJoin(user, eq(user.id, skill.ownerId))
      .where(
        and(
          eq(skill.id, key),
          eq(skill.status, "published"),
          inArray(skill.visibility, ["public", "unlisted"]),
          isNotNull(user.username),
          notSuspended,
        ),
      );
    return row?.handle ? { type, id: row.id, name: row.name, path: listingPath(row.handle, row.slug) } : null;
  }
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.username, key), notSuspended));
  return row ? { type, id: row.id, name: key, path: profilePath(key) } : null;
}

/** The email addresses of the admins, who hear about every new report. */
export async function getAdminEmails(): Promise<string[]> {
  const ids = adminUserIds();
  if (!ids.length) return [];
  const rows = await db.select({ email: user.email }).from(user).where(inArray(user.id, ids));
  return rows.map((row) => row.email);
}

export interface OpenReport {
  id: string;
  targetType: TargetType;
  reason: ReportReason;
  details: string;
  createdAt: Date;
  /** Null once the sender deleted their account. */
  reporterEmail: string | null;
  /** The reported skill or profile as it is now, or null when it no longer exists. */
  target: { name: string; path: string | null; ownerHandle: string | null; state: "shown" | "removed" | "hidden" | "suspended" } | null;
}

/** Reports waiting for a decision, oldest first, as the admin page lists them. */
export async function getOpenReports(): Promise<OpenReport[]> {
  const rows = await db
    .select({
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      details: report.details,
      createdAt: report.createdAt,
      reporterEmail: user.email,
    })
    .from(report)
    .leftJoin(user, eq(user.id, report.reporterId))
    .where(eq(report.status, "open"))
    .orderBy(report.createdAt)
    .limit(200);
  if (!rows.length) return [];

  const skillIds = rows.filter((row) => row.targetType === "skill" && skillIdSchema.safeParse(row.targetId).success).map((row) => row.targetId);
  const userIds = rows.filter((row) => row.targetType === "user").map((row) => row.targetId);
  const [skills, users] = await Promise.all([
    skillIds.length
      ? db
          .select({ id: skill.id, name: skill.name, slug: skill.slug, status: skill.status, handle: user.username, banned: user.banned })
          .from(skill)
          .leftJoin(user, eq(user.id, skill.ownerId))
          .where(inArray(skill.id, skillIds))
      : [],
    userIds.length ? db.select({ id: user.id, handle: user.username, banned: user.banned }).from(user).where(inArray(user.id, userIds)) : [],
  ]);
  const skillsById = new Map(skills.map((row) => [row.id, row]));
  const usersById = new Map(users.map((row) => [row.id, row]));

  return rows.map(({ targetId, ...row }) => {
    let target: OpenReport["target"] = null;
    if (row.targetType === "skill") {
      const found = skillsById.get(targetId);
      if (found) {
        target = {
          name: found.name,
          path: found.handle ? listingPath(found.handle, found.slug) : null,
          ownerHandle: found.handle,
          state: found.banned ? "suspended" : found.status === "removed" ? "removed" : found.status === "published" ? "shown" : "hidden",
        };
      }
    } else {
      const found = usersById.get(targetId);
      if (found) {
        target = {
          name: found.handle ?? "an account without a username",
          path: found.handle ? profilePath(found.handle) : null,
          ownerHandle: found.handle,
          state: found.banned ? "suspended" : "shown",
        };
      }
    }
    return { ...row, targetType: row.targetType as TargetType, reason: row.reason as ReportReason, target };
  });
}

export interface SuspendedAccount {
  id: string;
  handle: string | null;
  email: string;
  reason: string | null;
}

/** Suspended accounts, most recently changed first. */
export async function getSuspendedAccounts(): Promise<SuspendedAccount[]> {
  return db
    .select({ id: user.id, handle: user.username, email: user.email, reason: user.banReason })
    .from(user)
    .where(eq(user.banned, true))
    .orderBy(desc(user.updatedAt))
    .limit(200);
}

/** A skill the take-down form names by its address, unless it is already removed. */
export async function findSkillByAddress(handle: string, slug: string): Promise<{ id: string } | null> {
  const [row] = await db
    .select({ id: skill.id })
    .from(skill)
    .innerJoin(user, eq(user.id, skill.ownerId))
    .where(and(eq(user.username, handle), eq(skill.slug, slug), ne(skill.status, "removed")));
  return row ?? null;
}

/** An account the take-down form names by its username. */
export async function findUserByHandle(handle: string): Promise<{ id: string } | null> {
  const [row] = await db.select({ id: user.id }).from(user).where(eq(user.username, handle));
  return row ?? null;
}
