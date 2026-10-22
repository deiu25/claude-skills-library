"use server";

import { createHash } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { skill, skillVersion } from "@/lib/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { riskOf, scanSkillMd } from "./scan";
import { parseSkillMd, skillFormSchema, skillIdSchema } from "./schemas";

export type SkillActionState = { ok: true; message: string } | { ok: false; error: string } | null;

const NOT_FOUND = "We could not find this skill. It may have been deleted.";
const TOO_MANY = "Too many changes in a short time. Wait a minute, then try again.";
const FAILED = "Your skill was not saved. Try again in a moment.";

/** The Postgres error code behind a failed query; drizzle wraps the driver's error in `cause`. */
function pgCode(error: unknown): string | undefined {
  const source = (error instanceof Error && error.cause) || error;
  const code = (source as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : undefined;
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

const nameTaken = (name: string) =>
  `You already have a skill named ${name}. Open it from your skills to save a new version, or choose another name.`;

/** Creates a skill and its first version, then opens it. */
export async function createSkill(_previous: SkillActionState, formData: FormData): Promise<SkillActionState> {
  const user = await requireUser();
  if (!(await rateLimit("skill-write", user.id))) return { ok: false, error: TOO_MANY };
  const input = readForm(formData);
  if (!input.ok) return input;

  let id: string;
  try {
    id = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(skill)
        .values({ ...input.skill, ownerId: user.id })
        .returning({ id: skill.id });
      await tx.insert(skillVersion).values({ ...input.version, skillId: row.id, version: 1 });
      return row.id;
    });
  } catch (error) {
    if (pgCode(error) === "23505") return { ok: false, error: nameTaken(input.skill.name) };
    console.error("Skill create failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: FAILED };
  }
  revalidatePath("/dashboard/skills");
  redirect(`/dashboard/skills/${id}`);
}

/**
 * Saves the editor: a new version when SKILL.md changed, and the skill's name, description,
 * category and tags in any case. Only the owner's own skill is found.
 */
export async function updateSkill(skillId: unknown, _previous: SkillActionState, formData: FormData): Promise<SkillActionState> {
  const user = await requireUser();
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  if (!(await rateLimit("skill-write", user.id))) return { ok: false, error: TOO_MANY };
  const input = readForm(formData);
  if (!input.ok) return input;

  let saved: number | null | "missing";
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
      if (next !== null) await tx.insert(skillVersion).values({ ...input.version, skillId: owned.id, version: next });
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

  revalidatePath("/dashboard/skills");
  revalidatePath(`/dashboard/skills/${id.data}`);
  return { ok: true, message: saved === null ? "Saved. SKILL.md did not change, so there is no new version." : `Saved as version ${saved}.` };
}

/** Deletes one of the user's skills with all its versions, then returns to the list. */
export async function deleteSkill(skillId: unknown): Promise<SkillActionState> {
  const user = await requireUser();
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  if (!(await rateLimit("skill-write", user.id))) return { ok: false, error: TOO_MANY };

  const deleted = await db
    .delete(skill)
    .where(and(eq(skill.id, id.data), eq(skill.ownerId, user.id)))
    .returning({ id: skill.id });
  if (!deleted.length) return { ok: false, error: NOT_FOUND };

  revalidatePath("/dashboard/skills");
  redirect("/dashboard/skills");
}
