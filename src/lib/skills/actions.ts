"use server";

import { and, count, desc, eq, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { revalidateCommunity } from "@/lib/community/revalidate";
import { db } from "@/lib/db";
import { skill, skillFile, skillVersion, user as userTable } from "@/lib/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { statusFor, visibilityProblem, type Visibility } from "./access";
import { contentHash } from "./content-hash";
import { ACCOUNT_FILE_BYTES_MAX, filesProblem, formatBytes, isExecutable, textOf } from "./files";
import { combineFindings, riskOf, scanFiles, scanSkillMd, type Risk } from "./scan";
import {
  ACCOUNT_CHARACTERS_MAX,
  parseSkillMd,
  skillFormSchema,
  skillIdSchema,
  SKILLS_MAX,
  VERSIONS_KEPT,
  visibilitySchema,
  type SkillFrontmatter,
} from "./schemas";

export type SkillActionState = { ok: true; message: string } | { ok: false; error: string } | null;

const SIGNED_OUT = "You are signed out. Sign in again in another tab, then save here: your text is still in the editor.";
const NOT_FOUND = "We could not find this skill. It may have been deleted.";
const TOO_MANY = "Too many changes in a short time. Wait a minute, then try again.";
const UNAVAILABLE = "Saving is unavailable for a moment. Try again shortly.";
const FAILED = "Your skill was not saved. Try again in a moment.";
const UPLOAD_INCOMPLETE = "The folder did not arrive whole. Choose it again, then save.";
const SKILLS_FULL = `You have ${SKILLS_MAX} skills, the most an account can keep. Delete one you no longer need first.`;
const SPACE_FULL = `Your skills use the ${ACCOUNT_CHARACTERS_MAX.toLocaleString("en")} characters an account can store. Delete a skill you no longer need, then save again.`;
const FILES_FULL = `Your skills' files would pass the ${formatBytes(ACCOUNT_FILE_BYTES_MAX)} an account can store. Delete a skill you no longer need, then save again.`;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

interface StoredFile {
  path: string;
  content: Buffer;
  executable: boolean;
}

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
 * The files a save brings: a whole folder's files when the editor sends one ("replace"), or null
 * to keep the latest version's. Their paths and sizes are checked with the version, in buildVersion.
 */
async function readUpload(formData: FormData): Promise<{ files: StoredFile[] | null } | { error: string }> {
  if (formData.get("fileMode") !== "replace") return { files: null };
  const paths = formData.getAll("filePath");
  const files = formData.getAll("file");
  if (paths.length !== files.length || paths.some((path) => typeof path !== "string") || files.some((file) => !(file instanceof File))) {
    return { error: UPLOAD_INCOMPLETE };
  }
  return {
    files: await Promise.all(
      (files as File[]).map(async (file, index) => {
        const content = Buffer.from(await file.arrayBuffer());
        return { path: paths[index] as string, content, executable: isExecutable(content) };
      }),
    ),
  };
}

/** The editor's fields, checked: SKILL.md parsed, category and tags validated, an uploaded folder read. */
async function readForm(formData: FormData) {
  const form = skillFormSchema.safeParse({
    skillMd: formData.get("skillMd"),
    category: formData.get("category"),
    tags: formData.get("tags") ?? "",
  });
  if (!form.success) return { ok: false as const, error: form.error.issues[0].message };
  const parsed = parseSkillMd(form.data.skillMd);
  if (!parsed.ok) return { ok: false as const, error: parsed.problems.join(" ") };
  const upload = await readUpload(formData);
  if ("error" in upload) return { ok: false as const, error: upload.error };
  return {
    ok: true as const,
    skill: {
      slug: parsed.frontmatter.name,
      name: parsed.frontmatter.name,
      description: parsed.frontmatter.description,
      category: form.data.category,
      tags: form.data.tags,
    },
    skillMd: form.data.skillMd,
    frontmatter: parsed.frontmatter,
    upload: upload.files,
  };
}

/**
 * A version as it is stored: its files checked against the limits, every file scanned, and the
 * folder hashed. Every stored value comes from here, never from the client's idea of the result.
 */
function buildVersion(skillMd: string, frontmatter: SkillFrontmatter, files: StoredFile[]) {
  const problem = filesProblem(
    files.map(({ path, content }) => ({ path, size: content.length })),
    Buffer.byteLength(skillMd),
  );
  if (problem) return { ok: false as const, error: problem };
  const texts = files.flatMap(({ path, content }) => {
    const text = textOf(path, content);
    return text === null ? [] : [{ path, text }];
  });
  const findings = combineFindings(scanSkillMd(skillMd, frontmatter), scanFiles(texts));
  return {
    ok: true as const,
    version: { skillMd, frontmatter, contentHash: contentHash(skillMd, files), risk: riskOf(findings), findings },
    files,
  };
}

type BuiltVersion = Extract<ReturnType<typeof buildVersion>, { ok: true }>;

/** Serializes one user's writes, so two saves at once cannot both fit under the account's limits. */
function lockAccount(tx: Transaction, userId: string) {
  return tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
}

/** The latest version's files, carried into a save that brings no folder. */
function versionFiles(tx: Transaction, versionId: string): Promise<StoredFile[]> {
  return tx.select({ path: skillFile.path, content: skillFile.content, executable: skillFile.executable }).from(skillFile).where(eq(skillFile.versionId, versionId));
}

/** A version's file paths and sizes, without reading the files. */
function versionFileSizes(tx: Transaction, versionId: string): Promise<{ path: string; size: number }[]> {
  return tx
    .select({ path: skillFile.path, size: sql<number>`octet_length(${skillFile.content})`.mapWith(Number) })
    .from(skillFile)
    .where(eq(skillFile.versionId, versionId));
}

/** Whether files hold the same paths with the same sizes as a saved version. */
function sameFiles(files: StoredFile[], saved: { path: string; size: number }[]) {
  const listed = (entries: { path: string; size: number }[]) => entries.map(({ path, size }) => `${size} ${path}`).sort().join("\n");
  return listed(files.map(({ path, content }) => ({ path, size: content.length }))) === listed(saved);
}

/**
 * Whether the user's skills still fit the account's space with `built` added, leaving out one
 * skill's versions below `keepFrom`, which the save deletes.
 */
async function spaceProblem(tx: Transaction, userId: string, built: BuiltVersion, pruning?: { skillId: string; keepFrom: number }) {
  const kept = pruning
    ? and(eq(skill.ownerId, userId), sql`not (${skillVersion.skillId} = ${pruning.skillId} and ${skillVersion.version} < ${pruning.keepFrom})`)
    : eq(skill.ownerId, userId);
  const [characters] = await tx
    .select({ total: sql<number>`coalesce(sum(length(${skillVersion.skillMd})), 0)`.mapWith(Number) })
    .from(skillVersion)
    .innerJoin(skill, eq(skill.id, skillVersion.skillId))
    .where(kept);
  if (characters.total + built.version.skillMd.length > ACCOUNT_CHARACTERS_MAX) return SPACE_FULL;
  if (!built.files.length) return null;
  const [bytes] = await tx
    .select({ total: sql<number>`coalesce(sum(octet_length(${skillFile.content})), 0)`.mapWith(Number) })
    .from(skillFile)
    .innerJoin(skillVersion, eq(skillVersion.id, skillFile.versionId))
    .innerJoin(skill, eq(skill.id, skillVersion.skillId))
    .where(kept);
  const adding = built.files.reduce((sum, file) => sum + file.content.length, 0);
  return bytes.total + adding > ACCOUNT_FILE_BYTES_MAX ? FILES_FULL : null;
}

/** Stores a version and its files. */
async function insertVersion(tx: Transaction, skillId: string, version: number, built: BuiltVersion) {
  const [row] = await tx
    .insert(skillVersion)
    .values({ ...built.version, skillId, version })
    .returning({ id: skillVersion.id });
  if (built.files.length) await tx.insert(skillFile).values(built.files.map((file) => ({ ...file, versionId: row.id })));
}

const nameTaken = (name: string) =>
  `You already have a skill named ${name}. Open it from your skills to save a new version, or choose another name.`;

/** Creates a skill and its first version, with the files of an uploaded folder, then opens it. */
export async function createSkill(_previous: SkillActionState, formData: FormData): Promise<SkillActionState> {
  const user = await writer();
  if ("error" in user) return { ok: false, error: user.error };
  const input = await readForm(formData);
  if (!input.ok) return input;
  const built = buildVersion(input.skillMd, input.frontmatter, input.upload ?? []);
  if (!built.ok) return built;

  let created: { id: string } | { error: string };
  try {
    created = await db.transaction(async (tx) => {
      await lockAccount(tx, user.id);
      const [{ skills }] = await tx.select({ skills: count() }).from(skill).where(eq(skill.ownerId, user.id));
      if (skills >= SKILLS_MAX) return { error: SKILLS_FULL };
      const full = await spaceProblem(tx, user.id, built);
      if (full) return { error: full };
      const [row] = await tx
        .insert(skill)
        .values({ ...input.skill, ownerId: user.id })
        .returning({ id: skill.id });
      await insertVersion(tx, row.id, 1, built);
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
 * Saves the editor: a new version when SKILL.md or the files changed, deleting the oldest beyond
 * the latest VERSIONS_KEPT, and the skill's name, description, category and tags in any case. A
 * save without a folder keeps the latest version's files. Only the owner's own skill is found. A
 * published skill whose new version has a critical finding goes back to private: the save is kept,
 * the publishing is not.
 */
export async function updateSkill(skillId: unknown, _previous: SkillActionState, formData: FormData): Promise<SkillActionState> {
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  const user = await writer();
  if ("error" in user) return { ok: false, error: user.error };
  const input = await readForm(formData);
  if (!input.ok) return input;
  // An uploaded folder is checked and scanned before any lock is taken; kept files are read inside.
  const uploaded = input.upload ? buildVersion(input.skillMd, input.frontmatter, input.upload) : null;
  if (uploaded && !uploaded.ok) return uploaded;

  let saved: { version: number | null; published: boolean; unpublished: boolean } | "missing" | { error: string };
  try {
    saved = await db.transaction(async (tx) => {
      await lockAccount(tx, user.id);
      // The row lock orders concurrent saves of one skill, so each gets the next version number.
      const [owned] = await tx
        .select({ id: skill.id, status: skill.status })
        .from(skill)
        .where(and(eq(skill.id, id.data), eq(skill.ownerId, user.id)))
        .for("update");
      if (!owned) return "missing";
      const [latest] = await tx
        .select({ id: skillVersion.id, version: skillVersion.version, contentHash: skillVersion.contentHash })
        .from(skillVersion)
        .where(eq(skillVersion.skillId, owned.id))
        .orderBy(desc(skillVersion.version))
        .limit(1);
      const built = uploaded ?? buildVersion(input.skillMd, input.frontmatter, latest ? await versionFiles(tx, latest.id) : []);
      if (!built.ok) return { error: built.error };
      // The hash runs each path and its bytes together, as the skills CLI does, so "a" holding "bc"
      // hashes like "ab" holding "c": an uploaded folder is unchanged only when its paths and sizes are too.
      const unchanged =
        latest &&
        latest.contentHash === built.version.contentHash &&
        (!uploaded || sameFiles(built.files, await versionFileSizes(tx, latest.id)));
      const next = unchanged ? null : (latest?.version ?? 0) + 1;
      if (next !== null) {
        const keepFrom = next - VERSIONS_KEPT + 1;
        const full = await spaceProblem(tx, user.id, built, { skillId: owned.id, keepFrom });
        if (full) return { error: full };
        await insertVersion(tx, owned.id, next, built);
        await tx.delete(skillVersion).where(and(eq(skillVersion.skillId, owned.id), lt(skillVersion.version, keepFrom)));
      }
      const published = owned.status === "published";
      const unpublished = published && next !== null && built.version.risk === "critical";
      await tx
        .update(skill)
        .set({ ...input.skill, ...(unpublished && { visibility: "private", status: statusFor("private") }), updatedAt: new Date() })
        .where(and(eq(skill.id, owned.id), eq(skill.ownerId, user.id)));
      return { version: next, published, unpublished };
    });
  } catch (error) {
    if (pgCode(error) === "23505") return { ok: false, error: nameTaken(input.skill.name) };
    console.error("Skill update failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: FAILED };
  }
  if (saved === "missing") return { ok: false, error: NOT_FOUND };
  if ("error" in saved) return { ok: false, error: saved.error };

  revalidatePath("/dashboard/skills");
  revalidatePath(`/dashboard/skills/${id.data}`);
  if (saved.published) revalidateCommunity();
  if (saved.unpublished) {
    return {
      ok: true,
      message: `Saved as version ${saved.version}. It has a critical finding, so the skill is private again: fix what the check flags, save, then publish it.`,
    };
  }
  return {
    ok: true,
    message: saved.version === null ? "Saved. SKILL.md and the files did not change, so there is no new version." : `Saved as version ${saved.version}.`,
  };
}

const VISIBILITY_SAVED: Record<Visibility, string> = {
  private: "The skill is private. Only you can open it.",
  unlisted: "The skill is published as unlisted. Anyone with its address can open and download it.",
  public: "The skill is published. It is listed in Community and on your profile.",
};

/**
 * Sets who can see one of the user's skills: private keeps it a draft, unlisted and public publish
 * it. Publishing needs a username, and a latest version without a critical finding.
 */
export async function setSkillVisibility(skillId: unknown, _previous: SkillActionState, formData: FormData): Promise<SkillActionState> {
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  const visibility = visibilitySchema.safeParse(formData.get("visibility"));
  if (!visibility.success) return { ok: false, error: visibility.error.issues[0].message };
  const user = await writer();
  if ("error" in user) return { ok: false, error: user.error };

  let changed: boolean | "missing" | { error: string };
  try {
    changed = await db.transaction(async (tx) => {
      // The row lock orders this after a save of the same skill, so the version checked is the latest.
      const [owned] = await tx
        .select({ visibility: skill.visibility, status: skill.status })
        .from(skill)
        .where(and(eq(skill.id, id.data), eq(skill.ownerId, user.id)))
        .for("update");
      if (!owned) return "missing";
      const [latest] = await tx
        .select({ version: skillVersion.version, risk: skillVersion.risk })
        .from(skillVersion)
        .where(eq(skillVersion.skillId, id.data))
        .orderBy(desc(skillVersion.version))
        .limit(1);
      const [owner] = await tx.select({ username: userTable.username }).from(userTable).where(eq(userTable.id, user.id));
      const problem = visibilityProblem(visibility.data, {
        status: owned.status,
        version: latest?.version ?? 0,
        risk: (latest?.risk ?? "none") as Risk,
        username: owner?.username ?? null,
      });
      if (problem) return { error: problem };
      const status = statusFor(visibility.data);
      if (owned.visibility === visibility.data && owned.status === status) return false;
      // A change, as Community counts one: it sorts by it, and the sitemap dates a page by it.
      await tx
        .update(skill)
        .set({ visibility: visibility.data, status, updatedAt: new Date() })
        .where(and(eq(skill.id, id.data), eq(skill.ownerId, user.id)));
      return true;
    });
  } catch (error) {
    console.error("Skill visibility change failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: "Who can see the skill did not change. Try again in a moment." };
  }
  if (changed === "missing") return { ok: false, error: NOT_FOUND };
  if (typeof changed === "object") return { ok: false, error: changed.error };

  if (changed) {
    revalidatePath("/dashboard/skills");
    revalidatePath(`/dashboard/skills/${id.data}`);
    revalidateCommunity();
  }
  return { ok: true, message: VISIBILITY_SAVED[visibility.data] };
}

/** Deletes one of the user's skills with all its versions, then returns to the list. */
export async function deleteSkill(skillId: unknown): Promise<SkillActionState> {
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  const user = await writer();
  if ("error" in user) return { ok: false, error: user.error };

  let deleted: { status: string }[];
  try {
    deleted = await db
      .delete(skill)
      .where(and(eq(skill.id, id.data), eq(skill.ownerId, user.id)))
      .returning({ status: skill.status });
  } catch (error) {
    console.error("Skill delete failed:", pgCode(error) ?? "unknown error");
    return { ok: false, error: "The skill was not deleted. Try again in a moment." };
  }
  if (!deleted.length) return { ok: false, error: NOT_FOUND };

  revalidatePath("/dashboard/skills");
  if (deleted[0].status === "published") revalidateCommunity();
  redirect("/dashboard/skills");
}
