"use server";

import { createHash } from "node:crypto";
import { and, count, desc, eq, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { skill, skillVersion } from "@/lib/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { riskOf, scanSkillMd } from "./scan";
import { ACCOUNT_CHARACTERS_MAX, parseSkillMd, skillFormSchema, skillIdSchema, SKILLS_MAX, VERSIONS_KEPT } from "./schemas";

export type SkillActionState = { ok: true; message: string } | { ok: false; error: string } | null;

const SIGNED_OUT = "You are signed out. Sign in again in another tab, then save here: your text is still in the editor.";
const NOT_FOUND = "We could not find this skill. It may have been deleted.";
const TOO_MANY = "Too many changes in a short time. Wait a minute, then try again.";
const UNAVAILABLE = "Saving is unavailable for a moment. Try again shortly.";
const FAILED = "Your skill was not saved. Try again in a moment.";
const SKILLS_FULL = `You have ${SKILLS_MAX} skills, the most an account can keep. Delete one you no longer need first.`;
const SPACE_FULL = `Your skills use the ${ACCOUNT_CHARACTERS_MAX.toLocaleString("en")} characters an account can store. Delete a skill you no longer need, then save again.`;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The Postgres error code behind a failed query; drizzle wraps the driver's error in `cause`. */
function pgCode(error: unknown): string | undefined {
  const source = (error instanceof Error && error.cause) || error;
  const code = (source as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : undefined;
}

/**
 * The signed-in user, after the write limit. Actions answer with a message instead of redirecting
 * to sign in, so an editor whose session ended keeps its text.
 */
async function writer(): Promise<{ id: string } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: SIGNED_OUT };
  const limit = await rateLimit("skill-write", session.user.id);
  if (limit !== "ok") return { error: limit === "limited" ? TOO_MANY : UNAVAILABLE };
  return { id: session.user.id };
}

/**
 * The editor's fields, checked: SKILL.md parsed and scanned, category and tags validated. Every
 * value that is stored comes from here, never from the client's idea of the result.
 */
function readForm(formData: FormData) {
  const form = skillFormSchema.safeParse({
    skillMd: formData.get("skillMd"),
    category: formData.get("category"),
    tags: formData.get("tags") ?? "",
  });
  if (!form.success) return { ok: false as const, error: form.error.issues[0].message };
  const parsed = parseSkillMd(form.data.skillMd);
  if (!parsed.ok) return { ok: false as const, error: parsed.problems.join(" ") };
  const findings = scanSkillMd(form.data.skillMd, parsed.frontmatter);
  return {
    ok: true as const,
    skill: {
      slug: parsed.frontmatter.name,
      name: parsed.frontmatter.name,
      description: parsed.frontmatter.description,
      category: form.data.category,
      tags: form.data.tags,
    },
    version: {
      skillMd: form.data.skillMd,
      frontmatter: parsed.frontmatter,
      contentHash: createHash("sha256").update(form.data.skillMd).digest("hex"),
      risk: riskOf(findings),
      findings,
    },
  };
}

/** SKILL.md characters the user stores, leaving out one skill's versions below `keepFrom`, which the save deletes. */
async function storedCharacters(tx: Transaction, userId: string, pruning?: { skillId: string; keepFrom: number }) {
  const [row] = await tx
    .select({ total: sql<number>`coalesce(sum(length(${skillVersion.skillMd})), 0)`.mapWith(Number) })
    .from(skillVersion)
    .innerJoin(skill, eq(skill.id, skillVersion.skillId))
    .where(
      pruning
        ? and(eq(skill.ownerId, userId), sql`not (${skillVersion.skillId} = ${pruning.skillId} and ${skillVersion.version} < ${pruning.keepFrom})`)
        : eq(skill.ownerId, userId),
    );
  return row.total;
}

const nameTaken = (name: string) =>
  `You already have a skill named ${name}. Open it from your skills to save a new version, or choose another name.`;

/** Creates a skill and its first version, then opens it. */
export async function createSkill(_previous: SkillActionState, formData: FormData): Promise<SkillActionState> {
  const user = await writer();
  if ("error" in user) return { ok: false, error: user.error };
  const input = readForm(formData);
  if (!input.ok) return input;

  let created: { id: string } | { error: string };
  try {
    created = await db.transaction(async (tx) => {
      const [{ skills }] = await tx.select({ skills: count() }).from(skill).where(eq(skill.ownerId, user.id));
      if (skills >= SKILLS_MAX) return { error: SKILLS_FULL };
      if ((await storedCharacters(tx, user.id)) + input.version.skillMd.length > ACCOUNT_CHARACTERS_MAX) return { error: SPACE_FULL };
      const [row] = await tx
        .insert(skill)
        .values({ ...input.skill, ownerId: user.id })
        .returning({ id: skill.id });
      await tx.insert(skillVersion).values({ ...input.version, skillId: row.id, version: 1 });
      return { id: row.id };
    });
  } catch (error) {
    if (pgCode(error) === "23505") return { ok: false, error: nameTaken(input.skill.name) };
    console.error("Skill create failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: FAILED };
  }
  if ("error" in created) return { ok: false, error: created.error };
  revalidatePath("/dashboard/skills");
  redirect(`/dashboard/skills/${created.id}`);
}

/**
 * Saves the editor: a new version when SKILL.md changed, deleting the oldest beyond the latest
 * VERSIONS_KEPT, and the skill's name, description, category and tags in any case. Only the
 * owner's own skill is found.
 */
export async function updateSkill(skillId: unknown, _previous: SkillActionState, formData: FormData): Promise<SkillActionState> {
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  const user = await writer();
  if ("error" in user) return { ok: false, error: user.error };
  const input = readForm(formData);
  if (!input.ok) return input;

  let saved: number | null | "missing" | "full";
  try {
    saved = await db.transaction(async (tx) => {
      // The row lock orders concurrent saves of one skill, so each gets the next version number.
      const [owned] = await tx
        .select({ id: skill.id })
        .from(skill)
        .where(and(eq(skill.id, id.data), eq(skill.ownerId, user.id)))
        .for("update");
      if (!owned) return "missing";
      const [latest] = await tx
        .select({ version: skillVersion.version, contentHash: skillVersion.contentHash })
        .from(skillVersion)
        .where(eq(skillVersion.skillId, owned.id))
        .orderBy(desc(skillVersion.version))
        .limit(1);
      const next = latest?.contentHash === input.version.contentHash ? null : (latest?.version ?? 0) + 1;
      if (next !== null) {
        const keepFrom = next - VERSIONS_KEPT + 1;
        const stored = await storedCharacters(tx, user.id, { skillId: owned.id, keepFrom });
        if (stored + input.version.skillMd.length > ACCOUNT_CHARACTERS_MAX) return "full";
        await tx.insert(skillVersion).values({ ...input.version, skillId: owned.id, version: next });
        await tx.delete(skillVersion).where(and(eq(skillVersion.skillId, owned.id), lt(skillVersion.version, keepFrom)));
      }
      await tx
        .update(skill)
        .set({ ...input.skill, updatedAt: new Date() })
        .where(and(eq(skill.id, owned.id), eq(skill.ownerId, user.id)));
      return next;
    });
  } catch (error) {
    if (pgCode(error) === "23505") return { ok: false, error: nameTaken(input.skill.name) };
    console.error("Skill update failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: FAILED };
  }
  if (saved === "missing") return { ok: false, error: NOT_FOUND };
  if (saved === "full") return { ok: false, error: SPACE_FULL };

  revalidatePath("/dashboard/skills");
  revalidatePath(`/dashboard/skills/${id.data}`);
  return { ok: true, message: saved === null ? "Saved. SKILL.md did not change, so there is no new version." : `Saved as version ${saved}.` };
}

/** Deletes one of the user's skills with all its versions, then returns to the list. */
export async function deleteSkill(skillId: unknown): Promise<SkillActionState> {
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  const user = await writer();
  if ("error" in user) return { ok: false, error: user.error };

  let deleted: { id: string }[];
  try {
    deleted = await db
      .delete(skill)
      .where(and(eq(skill.id, id.data), eq(skill.ownerId, user.id)))
      .returning({ id: skill.id });
  } catch (error) {
    console.error("Skill delete failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: "The skill was not deleted. Try again in a moment." };
  }
  if (!deleted.length) return { ok: false, error: NOT_FOUND };

  revalidatePath("/dashboard/skills");
  redirect("/dashboard/skills");
}
