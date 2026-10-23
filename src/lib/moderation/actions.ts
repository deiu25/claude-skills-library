"use server";

import { APIError } from "better-auth/api";
import { and, count, eq, exists, gt, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { isAdmin } from "@/lib/auth/admin";
import { auth } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";
import { listingPath, profilePath } from "@/lib/community/links";
import { revalidateCommunity } from "@/lib/community/revalidate";
import { db } from "@/lib/db";
import { report, skill, user } from "@/lib/db/schema";
import {
  newReportEmail,
  removalEmail,
  reportDecisionEmail,
  reportReceivedEmail,
  sendEmail,
  suspensionEmail,
  type ReportOutcome,
} from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { skillIdSchema } from "@/lib/skills/schemas";
import { findReportTarget, findSkillByAddress, findUserByHandle, getAdminEmails } from "./queries";
import { decisionSchema, parseModerationTarget, reportFormSchema, statedReason, type TargetType } from "./schemas";

export type ModerationState = { ok: true; message: string } | { ok: false; error: string } | null;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const NOT_ADMIN = "Only an admin can do this. If you are one, sign in again.";
const REPORT_DECIDED = "This report was already decided.";
const FAILED = "Nothing changed. Try again in a moment.";

/** How many of one sender's reports may wait for a decision at once: each one emails a receipt. */
const OPEN_REPORTS_MAX = 5;

/** Admins hear about waiting reports at most this often, however many arrive. */
const NOTICE_INTERVAL = sql`interval '1 hour'`;

/** The Postgres error code behind a failed query; drizzle wraps the driver's error in `cause`. */
function pgCode(error: unknown): string | undefined {
  const source = (error instanceof Error && error.cause) || error;
  const code = (source as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : undefined;
}

/** The signed-in admin. Moderation answers anyone else with a message, never a hint of what exists. */
async function moderator(): Promise<{ id: string } | { error: string }> {
  const session = await getSession();
  if (!session || !isAdmin(session.user.id)) return { error: NOT_ADMIN };
  return { id: session.user.id };
}

/**
 * Sends a report about a published skill or a profile, then emails its sender a receipt and, unless
 * another report arrived within the hour, every admin a notice. A second report of the same target
 * by the same sender, while the first is open, is not stored again, and a sender has at most
 * OPEN_REPORTS_MAX reports waiting at once.
 */
export async function submitReport(_previous: ModerationState, formData: FormData): Promise<ModerationState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "You are signed out. Sign in again, then send the report." };
  const limit = await rateLimit("report", session.user.id);
  if (limit !== "ok") {
    return {
      ok: false,
      error: limit === "limited" ? "Too many reports in a short time. Wait a minute, then try again." : "Reports are unavailable for a moment. Try again shortly.",
    };
  }
  const form = reportFormSchema.safeParse({
    targetType: formData.get("targetType"),
    targetKey: formData.get("targetKey"),
    reason: formData.get("reason"),
    details: formData.get("details"),
    goodFaith: formData.get("goodFaith"),
  });
  if (!form.success) return { ok: false, error: form.error.issues[0].message };
  const target = await findReportTarget(form.data.targetType, form.data.targetKey);
  if (!target) return { ok: false, error: "This is no longer shown on the site, so there is nothing left to report." };

  let created: { id: string; noticeDue: boolean } | "full";
  try {
    created = await db.transaction(async (tx) => {
      const [{ open }] = await tx
        .select({ open: count() })
        .from(report)
        .where(and(eq(report.reporterId, session.user.id), eq(report.status, "open")));
      if (open >= OPEN_REPORTS_MAX) return "full";
      const [recent] = await tx
        .select({ id: report.id })
        .from(report)
        .where(and(eq(report.status, "open"), gt(report.createdAt, sql`now() - ${NOTICE_INTERVAL}`)))
        .limit(1);
      const [row] = await tx
        .insert(report)
        .values({ reporterId: session.user.id, targetType: target.type, targetId: target.id, reason: form.data.reason, details: form.data.details })
        .returning({ id: report.id });
      return { id: row.id, noticeDue: !recent };
    });
  } catch (error) {
    if (pgCode(error) === "23505") {
      return { ok: true, message: "You already reported this, and we have not decided yet. We will email you once we do." };
    }
    console.error("Report failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: "Your report was not sent. Try again in a moment." };
  }
  if (created === "full") {
    return { ok: false, error: `${OPEN_REPORTS_MAX} of your reports are waiting for a decision. Send this one once we have decided those.` };
  }

  sendEmail(reportReceivedEmail(session.user.email, `${SITE_URL}${target.path}`));
  if (created.noticeDue) {
    try {
      for (const to of await getAdminEmails()) sendEmail(newReportEmail(to));
    } catch (error) {
      console.error("Report notice not sent:", pgCode(error) ?? "unknown error");
    }
  }
  return { ok: true, message: "Report sent. We emailed you a receipt, and we will email you what we decide." };
}

/**
 * Closes the open reports `where` matches with a decision, and returns their senders' addresses. It
 * takes a transaction, so a report never closes without the address its decision goes to.
 */
async function resolveReports(tx: Transaction, adminId: string, status: "actioned" | "dismissed", where: SQL | undefined) {
  const resolved = await tx
    .update(report)
    .set({ status, resolvedBy: adminId, resolvedAt: new Date() })
    .where(and(eq(report.status, "open"), where))
    .returning({ reporterId: report.reporterId });
  const senders = resolved.flatMap(({ reporterId }) => (reporterId ? [reporterId] : []));
  if (!senders.length) return { count: resolved.length, emails: [] };
  const rows = await tx.select({ email: user.email }).from(user).where(inArray(user.id, senders));
  return { count: resolved.length, emails: rows.map((row) => row.email) };
}

/**
 * Where a report's target is, for the emails about it, and whether the site still shows it, as the
 * report form requires: its page on the site, or its name once it has none.
 */
async function describeTarget(type: TargetType, id: string): Promise<{ address: string; shown: boolean }> {
  if (type === "skill" && skillIdSchema.safeParse(id).success) {
    const [row] = await db
      .select({ name: skill.name, slug: skill.slug, status: skill.status, visibility: skill.visibility, handle: user.username, suspended: user.banned })
      .from(skill)
      .leftJoin(user, eq(user.id, skill.ownerId))
      .where(eq(skill.id, id));
    if (row) {
      return {
        address: row.handle ? `${SITE_URL}${listingPath(row.handle, row.slug)}` : `the skill ${row.name}`,
        shown: row.status === "published" && row.visibility !== "private" && Boolean(row.handle) && !row.suspended,
      };
    }
  }
  if (type === "user") {
    const [row] = await db
      .select({
        handle: user.username,
        suspended: user.banned,
        hasPublic: exists(
          db
            .select({ id: skill.id })
            .from(skill)
            .where(and(eq(skill.ownerId, user.id), eq(skill.status, "published"), eq(skill.visibility, "public"))),
        ).mapWith(Boolean),
      })
      .from(user)
      .where(eq(user.id, id));
    if (row?.handle) return { address: `${SITE_URL}${profilePath(row.handle)}`, shown: !row.suspended && row.hasPublic };
  }
  return { address: `a page on ${SITE_NAME}`, shown: false };
}

function afterDecision() {
  revalidateCommunity();
  revalidatePath("/dashboard/admin");
}

const reportsLine = (count: number) => (count === 1 ? "1 report was closed" : `${count} reports were closed`);

function emailOutcome(emails: string[], address: string, outcome: ReportOutcome) {
  for (const to of emails) sendEmail(reportDecisionEmail(to, address, outcome));
}

/**
 * Removes a published skill from the site: it leaves Community and its download stops, and its
 * owner keeps it in their dashboard but cannot publish it again. Every open report about it is
 * closed as acted on. The owner gets the reason by email, and each report's sender the decision.
 */
async function removeSkill(adminId: string, skillId: string, reason: string): Promise<ModerationState> {
  const { address } = await describeTarget("skill", skillId);
  let removed: { name: string; ownerEmail: string | null; reports: { count: number; emails: string[] } } | null;
  try {
    removed = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(skill)
        .set({ status: "removed", removalReason: reason })
        .where(and(eq(skill.id, skillId), ne(skill.status, "removed")))
        .returning({ name: skill.name, ownerId: skill.ownerId });
      if (!row) return null;
      const [owner] = row.ownerId ? await tx.select({ email: user.email }).from(user).where(eq(user.id, row.ownerId)) : [];
      const reports = await resolveReports(tx, adminId, "actioned", and(eq(report.targetType, "skill"), eq(report.targetId, skillId)));
      return { name: row.name, ownerEmail: owner?.email ?? null, reports };
    });
  } catch (error) {
    console.error("Skill removal failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: FAILED };
  }
  if (!removed) return { ok: false, error: "This skill was deleted or is already removed." };

  afterDecision();
  if (removed.ownerEmail) sendEmail(removalEmail(removed.ownerEmail, removed.name, { reason, onReport: removed.reports.count > 0 }));
  emailOutcome(removed.reports.emails, address, "acted");
  return { ok: true, message: `Removed ${removed.name}, emailed its owner the reason, and ${reportsLine(removed.reports.count)}.` };
}

/**
 * Suspends an account through Better Auth's admin plugin: its sessions end, it cannot sign in, and
 * its published skills are hidden. Every open report about the account or one of its skills is
 * closed as acted on. An account already suspended is not suspended or emailed again; an admin's
 * account cannot be suspended at all.
 */
async function suspendAccount(adminId: string, userId: string, reason: string): Promise<ModerationState> {
  if (userId === adminId || isAdmin(userId)) return { ok: false, error: "An admin's account cannot be suspended here." };
  const [account] = await db.select({ handle: user.username, suspended: user.banned }).from(user).where(eq(user.id, userId));
  if (!account) return { ok: false, error: "This account no longer exists." };
  const { address } = await describeTarget("user", userId);
  const name = account.handle ? `@${account.handle}` : "the account";

  let suspendedEmail: string | null = null;
  if (!account.suspended) {
    try {
      const { user: suspended } = await auth.api.banUser({ body: { userId, banReason: reason }, headers: await headers() });
      suspendedEmail = suspended.email;
    } catch (error) {
      if (error instanceof APIError && error.status === "NOT_FOUND") return { ok: false, error: "This account no longer exists." };
      console.error("Suspension failed:", error instanceof APIError ? error.body?.code : pgCode(error) ?? "unknown error");
      return { ok: false, error: FAILED };
    }
    afterDecision();
  }

  let reports: { count: number; emails: string[] } = { count: 0, emails: [] };
  try {
    const itsSkills = db.select({ id: sql`${skill.id}::text` }).from(skill).where(eq(skill.ownerId, userId));
    reports = await db.transaction((tx) =>
      resolveReports(
        tx,
        adminId,
        "actioned",
        or(and(eq(report.targetType, "user"), eq(report.targetId, userId)), and(eq(report.targetType, "skill"), inArray(report.targetId, itsSkills))),
      ),
    );
  } catch (error) {
    console.error("Closing reports after a suspension failed:", pgCode(error) ?? "unknown error");
  }

  revalidatePath("/dashboard/admin");
  if (suspendedEmail) sendEmail(suspensionEmail(suspendedEmail, { reason, onReport: reports.count > 0 }));
  emailOutcome(reports.emails, address, "acted");
  return {
    ok: true,
    message: suspendedEmail
      ? `Suspended ${name}, emailed it the reason, and ${reportsLine(reports.count)}.`
      : `${name} was already suspended; ${reportsLine(reports.count)}.`,
  };
}

/** Decides one open report: remove the skill, suspend the account behind it, or dismiss the report. */
export async function decideReport(reportId: unknown, _previous: ModerationState, formData: FormData): Promise<ModerationState> {
  const admin = await moderator();
  if ("error" in admin) return { ok: false, error: admin.error };
  const id = skillIdSchema.safeParse(reportId);
  if (!id.success) return { ok: false, error: REPORT_DECIDED };
  const decision = decisionSchema.safeParse({
    decision: formData.get("decision"),
    ground: formData.get("ground"),
    explanation: formData.get("explanation"),
  });
  if (!decision.success) return { ok: false, error: decision.error.issues[0].message };
  const [open] = await db
    .select({ targetType: report.targetType, targetId: report.targetId })
    .from(report)
    .where(and(eq(report.id, id.data), eq(report.status, "open")));
  if (!open) return { ok: false, error: REPORT_DECIDED };
  const targetType = open.targetType as TargetType;

  if (decision.data.decision === "dismiss") {
    // A target its owner deleted or hid since is not "found to break nothing": its sender hears it was gone.
    const { address, shown } = await describeTarget(targetType, open.targetId);
    const reports = await db.transaction((tx) => resolveReports(tx, admin.id, "dismissed", eq(report.id, id.data)));
    if (!reports.count) return { ok: false, error: REPORT_DECIDED };
    revalidatePath("/dashboard/admin");
    emailOutcome(reports.emails, address, shown ? "dismissed" : "gone");
    return { ok: true, message: "Dismissed the report and emailed its sender." };
  }

  const reason = statedReason(decision.data.ground, decision.data.explanation);
  if (decision.data.decision === "remove") {
    if (targetType !== "skill") return { ok: false, error: "A profile cannot be removed. Suspend the account instead." };
    return removeSkill(admin.id, open.targetId, reason);
  }
  if (targetType === "user") return suspendAccount(admin.id, open.targetId, reason);
  const [owned] = await db.select({ ownerId: skill.ownerId }).from(skill).where(eq(skill.id, open.targetId));
  if (!owned?.ownerId) return { ok: false, error: "This skill has no owner any more, so there is no account to suspend." };
  return suspendAccount(admin.id, owned.ownerId, reason);
}

/**
 * Acts without a report: removes the published skill at a pasted address, or suspends the account
 * named as @username.
 */
export async function takeDown(_previous: ModerationState, formData: FormData): Promise<ModerationState> {
  const admin = await moderator();
  if ("error" in admin) return { ok: false, error: admin.error };
  const target = parseModerationTarget(String(formData.get("target") ?? ""));
  if (!target) return { ok: false, error: `Paste a skill's address, such as ${SITE_URL}/u/name/skill-name, or an account's @username.` };
  const decision = decisionSchema.safeParse({
    decision: target.type === "skill" ? "remove" : "suspend",
    ground: formData.get("ground"),
    explanation: formData.get("explanation"),
  });
  if (!decision.success) return { ok: false, error: decision.error.issues[0].message };
  if (decision.data.decision === "dismiss") return { ok: false, error: FAILED };
  const reason = statedReason(decision.data.ground, decision.data.explanation);

  if (target.type === "skill") {
    const found = await findSkillByAddress(target.handle, target.slug);
    if (!found) return { ok: false, error: "No published skill has this address." };
    return removeSkill(admin.id, found.id, reason);
  }
  const found = await findUserByHandle(target.handle);
  if (!found) return { ok: false, error: "No account has this username." };
  return suspendAccount(admin.id, found.id, reason);
}

/** Lifts a suspension: the account can sign in again, and its published skills are shown again. */
export async function liftSuspension(userId: unknown): Promise<ModerationState> {
  const admin = await moderator();
  if ("error" in admin) return { ok: false, error: admin.error };
  if (typeof userId !== "string" || !userId) return { ok: false, error: "This account no longer exists." };
  try {
    await auth.api.unbanUser({ body: { userId }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError && error.status === "NOT_FOUND") return { ok: false, error: "This account no longer exists." };
    console.error("Lifting a suspension failed:", error instanceof APIError ? error.body?.code : pgCode(error) ?? "unknown error");
    return { ok: false, error: FAILED };
  }
  afterDecision();
  return { ok: true, message: "The suspension is lifted. The account can sign in again, and its published skills are shown." };
}
