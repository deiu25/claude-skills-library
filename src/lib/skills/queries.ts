import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { skill, skillFile, skillVersion } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";
import { canEdit } from "./access";
import { textOf, type FileSummary } from "./files";
import type { Finding, Risk } from "./scan";
import { skillIdSchema } from "./schemas";

// Reads for the skill pages under /dashboard. Each one checks that the signed-in user owns the
// skill, and answers 404 otherwise, the same as for a skill that does not exist.

export interface SkillListItem {
  id: string;
  name: string;
  description: string;
  category: string;
  latestVersion: number;
  risk: Risk;
  updatedAt: Date;
}

/** The user's skills, most recently changed first, each with its latest version's number and risk. */
export async function getMySkills(userId: string): Promise<SkillListItem[]> {
  const skills = await db
    .select({ id: skill.id, name: skill.name, description: skill.description, category: skill.category, updatedAt: skill.updatedAt })
    .from(skill)
    .where(eq(skill.ownerId, userId))
    .orderBy(desc(skill.updatedAt));
  if (!skills.length) return [];

  const latest = await db
    .selectDistinctOn([skillVersion.skillId], { skillId: skillVersion.skillId, version: skillVersion.version, risk: skillVersion.risk })
    .from(skillVersion)
    .where(inArray(skillVersion.skillId, skills.map((row) => row.id)))
    .orderBy(skillVersion.skillId, desc(skillVersion.version));
  const byId = new Map(latest.map((row) => [row.skillId, row]));
  return skills.map((row) => ({
    ...row,
    latestVersion: byId.get(row.id)?.version ?? 0,
    risk: (byId.get(row.id)?.risk ?? "none") as Risk,
  }));
}

export interface VersionSummary {
  version: number;
  risk: Risk;
  findingCount: number;
  createdAt: Date;
}

export interface OwnedSkill {
  id: string;
  name: string;
  category: string;
  tags: string[];
  versions: VersionSummary[];
  /** The latest version's SKILL.md and scan. */
  skillMd: string;
  findings: Finding[];
  /** The latest version's other files, without their content. */
  files: FileSummary[];
}

/**
 * One of the signed-in user's skills, with every version's summary and the latest version's
 * content. Cached per request, because the page's metadata reads it too.
 */
export const getOwnedSkill = cache(async (skillId: string): Promise<OwnedSkill> => {
  const user = await requireUser();
  if (!skillIdSchema.safeParse(skillId).success) notFound();
  const [row] = await db
    .select({ id: skill.id, ownerId: skill.ownerId, name: skill.name, category: skill.category, tags: skill.tags })
    .from(skill)
    .where(eq(skill.id, skillId));
  if (!row || !canEdit(user, row)) notFound();

  const versions = await db
    .select({
      version: skillVersion.version,
      risk: skillVersion.risk,
      findingCount: sql<number>`jsonb_array_length(${skillVersion.findings})`.mapWith(Number),
      createdAt: skillVersion.createdAt,
    })
    .from(skillVersion)
    .where(eq(skillVersion.skillId, skillId))
    .orderBy(desc(skillVersion.version));
  const latest = await getVersionContent(skillId, versions[0]?.version ?? 0);
  if (!latest) notFound();

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tags: row.tags,
    versions: versions.map((version) => ({ ...version, risk: version.risk as Risk })),
    skillMd: latest.skillMd,
    findings: latest.findings,
    files: await getFileSummaries(latest.id),
  };
});

export interface OwnedVersion {
  skillId: string;
  name: string;
  version: number;
  risk: Risk;
  skillMd: string;
  findings: Finding[];
  files: FileSummary[];
  createdAt: Date;
}

/** One saved version of one of the signed-in user's skills. Cached per request, like getOwnedSkill. */
export const getOwnedVersion = cache(async (skillId: string, version: number): Promise<OwnedVersion> => {
  const user = await requireUser();
  if (!skillIdSchema.safeParse(skillId).success || !isVersionNumber(version)) notFound();
  const [row] = await db.select({ ownerId: skill.ownerId, name: skill.name }).from(skill).where(eq(skill.id, skillId));
  if (!row || !canEdit(user, row)) notFound();
  const content = await getVersionContent(skillId, version);
  if (!content) notFound();
  const { id, ...saved } = content;
  return { skillId, name: row.name, version, ...saved, files: await getFileSummaries(id) };
});

export interface VersionArchive {
  /** The name in the version's own frontmatter, which names the folder it unpacks to. */
  name: string;
  version: number;
  createdAt: Date;
  skillMd: string;
  files: { path: string; content: Buffer; executable: boolean }[];
}

/**
 * One version of a user's own skill with every file's content, for the zip download: the latest
 * one without a version number. Null for someone else's skill, or a version that does not exist.
 */
export async function getVersionArchive(userId: string, skillId: string, version?: number): Promise<VersionArchive | null> {
  if (!skillIdSchema.safeParse(skillId).success || (version !== undefined && !isVersionNumber(version))) return null;
  const [row] = await db.select({ ownerId: skill.ownerId }).from(skill).where(eq(skill.id, skillId));
  if (!row || !canEdit({ id: userId }, row)) return null;
  const [saved] = await db
    .select({
      id: skillVersion.id,
      name: sql<string>`${skillVersion.frontmatter}->>'name'`,
      version: skillVersion.version,
      createdAt: skillVersion.createdAt,
      skillMd: skillVersion.skillMd,
    })
    .from(skillVersion)
    .where(version === undefined ? eq(skillVersion.skillId, skillId) : and(eq(skillVersion.skillId, skillId), eq(skillVersion.version, version)))
    .orderBy(desc(skillVersion.version))
    .limit(1);
  if (!saved) return null;
  const { id, ...archive } = saved;
  const files = await db
    .select({ path: skillFile.path, content: skillFile.content, executable: skillFile.executable })
    .from(skillFile)
    .where(eq(skillFile.versionId, id));
  return { ...archive, files };
}

/**
 * The user's skills with every kept version's SKILL.md, for /api/me/export. Each version carries
 * its risk and how many findings it had, and lists its other files with the address that
 * downloads them; the findings and the files' content stay out, which keeps the export under the
 * response size limit.
 */
export async function getSkillsExport(userId: string) {
  const [skills, versions, files] = await Promise.all([
    db
      .select({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        tags: skill.tags,
        visibility: skill.visibility,
        status: skill.status,
        createdAt: skill.createdAt,
        updatedAt: skill.updatedAt,
      })
      .from(skill)
      .where(eq(skill.ownerId, userId))
      .orderBy(skill.createdAt),
    db
      .select({
        id: skillVersion.id,
        skillId: skillVersion.skillId,
        version: skillVersion.version,
        skillMd: skillVersion.skillMd,
        contentHash: skillVersion.contentHash,
        risk: skillVersion.risk,
        findingCount: sql<number>`jsonb_array_length(${skillVersion.findings})`.mapWith(Number),
        createdAt: skillVersion.createdAt,
      })
      .from(skillVersion)
      .innerJoin(skill, eq(skill.id, skillVersion.skillId))
      .where(eq(skill.ownerId, userId))
      .orderBy(skillVersion.version),
    db
      .select({
        versionId: skillFile.versionId,
        path: skillFile.path,
        size: sql<number>`octet_length(${skillFile.content})`.mapWith(Number),
        executable: skillFile.executable,
      })
      .from(skillFile)
      .innerJoin(skillVersion, eq(skillVersion.id, skillFile.versionId))
      .innerJoin(skill, eq(skill.id, skillVersion.skillId))
      .where(eq(skill.ownerId, userId))
      .orderBy(skillFile.path),
  ]);
  return skills.map((row) => ({
    ...row,
    versions: versions
      .filter((version) => version.skillId === row.id)
      .map(({ id, version, skillMd, contentHash, risk, findingCount, createdAt }) => ({
        version,
        skillMd,
        contentHash,
        risk,
        findingCount,
        createdAt,
        files: files.filter((file) => file.versionId === id).map(({ path, size, executable }) => ({ path, size, executable })),
        download: `${SITE_URL}/api/skills/${row.id}/download?version=${version}`,
      })),
  }));
}

/** A version number is a Postgres integer: anything outside 1 to 2^31 - 1 cannot exist. */
const isVersionNumber = (version: number) => Number.isInteger(version) && version >= 1 && version <= 2 ** 31 - 1;

async function getVersionContent(skillId: string, version: number) {
  const [row] = await db
    .select({ id: skillVersion.id, skillMd: skillVersion.skillMd, findings: skillVersion.findings, risk: skillVersion.risk, createdAt: skillVersion.createdAt })
    .from(skillVersion)
    .where(and(eq(skillVersion.skillId, skillId), eq(skillVersion.version, version)));
  return row ? { ...row, risk: row.risk as Risk } : null;
}

/** A version's files as the pages list them, in path order: sizes and kinds, never their content. */
async function getFileSummaries(versionId: string): Promise<FileSummary[]> {
  const rows = await db
    .select({ path: skillFile.path, content: skillFile.content, executable: skillFile.executable })
    .from(skillFile)
    .where(eq(skillFile.versionId, versionId));
  return rows
    .map(({ path, content, executable }) => ({ path, size: content.length, executable, scanned: textOf(content) !== null }))
    .sort((a, b) => a.path.localeCompare(b.path));
}
