"use server";

import { APIError } from "better-auth/api";
import { and, eq, inArray, ne, or, type SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { isAdmin } from "@/lib/auth/admin";
import { auth } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";
import { listingPath, profilePath } from "@/lib/community/links";
import { revalidateCommunity } from "@/lib/community/revalidate";
import { db } from "@/lib/db";
import { report, skill, user } from "@/lib/db/schema";
import { newReportEmail, removalEmail, reportDecisionEmail, reportReceivedEmail, sendEmail, suspensionEmail } from "@/lib/email";
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
 * Sends a report about a published skill or a profile, then emails its sender a receipt and every
 * admin a notice. A second report of the same target by the same sender, while the first is open,
 * is not stored again.
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

  try {
    await db.insert(report).values({
      reporterId: session.user.id,
      targetType: target.type,
      targetId: target.id,
      reason: form.data.reason,
      details: form.data.details,
    });
  } catch (error) {
    if (pgCode(error) === "23505") {
      return { ok: true, message: "You already reported this, and we have not decided yet. We will email you once we do." };
    }
    console.error("Report failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: "Your report was not sent. Try again in a moment." };
  }

  sendEmail(reportReceivedEmail(session.user.email, `${SITE_URL}${target.path}`));
  try {
    for (const to of await getAdminEmails()) sendEmail(newReportEmail(to));
  } catch (error) {
    console.error("Report notice not sent:", pgCode(error) ?? "unknown error");
  }
  return { ok: true, message: "Report sent. We emailed you a receipt, and we will email you what we decide." };
}

/** Closes the open reports `where` matches with a decision, and returns their senders' addresses. */
async function resolveReports(tx: Transaction | typeof db, adminId: string, status: "actioned" | "dismissed", where: SQL | undefined) {
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

/** Where a report's target is, for the emails about it: its page on the site, or its name. */
async function targetAddress(type: TargetType, id: string): Promise<string> {
  if (type === "skill" && skillIdSchema.safeParse(id).success) {
    const [row] = await db
      .select({ name: skill.name, slug: skill.slug, handle: user.username })
      .from(skill)
      .leftJoin(user, eq(user.id, skill.ownerId))
      .where(eq(skill.id, id));
    if (row) return row.handle ? `${SITE_URL}${listingPath(row.handle, row.slug)}` : `the skill ${row.name}`;
  }
  if (type === "user") {
    const [row] = await db.select({ handle: user.username }).from(user).where(eq(user.id, id));
    if (row?.handle) return `${SITE_URL}${profilePath(row.handle)}`;
  }
  return `a page on ${SITE_NAME}`;
}

function afterDecision() {
  revalidateCommunity();
  revalidatePath("/dashboard/admin");
}

const reportsLine = (count: number) => (count === 1 ? "1 report was closed" : `${count} reports were closed`);

/**
 * Removes a skill from the site: it leaves Community and its download stops, and its owner keeps it
 * in their dashboard but cannot publish it again. Every open report about it is closed as acted on.
 * The owner gets the reason by email, and each report's sender the decision.
 */
async function removeSkill(adminId: string, skillId: string, reason: string): Promise<ModerationState> {
  const address = await targetAddress("skill", skillId);
  let removed: { name: string; ownerId: string | null; reports: { count: number; emails: string[] } } | null;
  try {
    removed = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(skill)
        .set({ status: "removed", removalReason: reason })
        .where(and(eq(skill.id, skillId), ne(skill.status, "removed")))
        .returning({ name: skill.name, ownerId: skill.ownerId });
      if (!row) return null;
      return { ...row, reports: await resolveReports(tx, adminId, "actioned", and(eq(report.targetType, "skill"), eq(report.targetId, skillId))) };
    });
  } catch (error) {
    console.error("Skill removal failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: FAILED };
  }
  if (!removed) return { ok: false, error: "This skill was deleted or is already removed." };

  afterDecision();
  const [owner] = removed.ownerId ? await db.select({ email: user.email }).from(user).where(eq(user.id, removed.ownerId)) : [];
  if (owner) sendEmail(removalEmail(owner.email, removed.name, { reason, onReport: removed.reports.count > 0 }));
  for (const to of removed.reports.emails) sendEmail(reportDecisionEmail(to, address, true));
  return { ok: true, message: `Removed ${removed.name}, emailed its owner the reason, and ${reportsLine(removed.reports.count)}.` };
}

/**
 * Suspends an account through Better Auth's admin plugin: its sessions end, it cannot sign in, and
 * its published skills are hidden. The open reports about the account are closed as acted on, with
 * the report `alsoClosing` if the decision came from one about its skill.
 */
async function suspendAccount(adminId: string, userId: string, reason: string, alsoClosing?: string): Promise<ModerationState> {
  if (userId === adminId) return { ok: false, error: "You cannot suspend your own account." };
  const address = await targetAddress("user", userId);
  let suspendedEmail: string;
  try {
    const { user: suspended } = await auth.api.banUser({ body: { userId, banReason: reason }, headers: await headers() });
    suspendedEmail = suspended.email;
  } catch (error) {
    if (error instanceof APIError && error.status === "NOT_FOUND") return { ok: false, error: "This account no longer exists." };
    console.error("Suspension failed:", error instanceof APIError ? error.body?.code : pgCode(error) ?? "unknown error");
    return { ok: false, error: FAILED };
  }
  const reports = await resolveReports(
    db,
    adminId,
    "actioned",
    or(and(eq(report.targetType, "user"), eq(report.targetId, userId)), alsoClosing ? eq(report.id, alsoClosing) : undefined),
  );

  afterDecision();
  sendEmail(suspensionEmail(suspendedEmail, { reason, onReport: reports.count > 0 }));
  for (const to of reports.emails) sendEmail(reportDecisionEmail(to, address, true));
  return { ok: true, message: `Suspended the account, emailed it the reason, and ${reportsLine(reports.count)}.` };
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
    const address = await targetAddress(targetType, open.targetId);
    const reports = await resolveReports(db, admin.id, "dismissed", eq(report.id, id.data));
    if (!reports.count) return { ok: false, error: REPORT_DECIDED };
    revalidatePath("/dashboard/admin");
    for (const to of reports.emails) sendEmail(reportDecisionEmail(to, address, false));
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
  return suspendAccount(admin.id, owned.ownerId, reason, id.data);
}

/**
 * Acts without a report: removes the skill at a pasted address, or suspends the account with a
 * pasted username.
 */
export async function takeDown(_previous: ModerationState, formData: FormData): Promise<ModerationState> {
  const admin = await moderator();
  if ("error" in admin) return { ok: false, error: admin.error };
  const target = parseModerationTarget(String(formData.get("target") ?? ""));
  if (!target) return { ok: false, error: `Paste a skill's address, such as ${SITE_URL}/u/name/skill-name, or a username.` };
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
    if (!found) return { ok: false, error: "No skill that is still on the site has this address." };
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
