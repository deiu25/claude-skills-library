import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import { isSignUpOpen } from "@/lib/auth/allowlist";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { skill, skillFile, skillVersion, user } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";
import { canEdit, canRead, type Visibility } from "./access";
import { getFileSummaries } from "./file-summaries";
import type { FileSummary } from "./files";
import type { Finding, Risk } from "./scan";
import { skillIdSchema } from "./schemas";

// Reads for the skill pages under /dashboard. Each one checks that the signed-in user owns the
// skill, and answers 404 otherwise, the same as for a skill that does not exist. The zip download
// also serves published skills to anyone (findVersionArchive).

export interface SkillListItem {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: string;
  status: string;
  latestVersion: number;
  risk: Risk;
  updatedAt: Date;
}

/** The user's skills, most recently changed first, each with its latest version's number and risk. */
export async function getMySkills(userId: string): Promise<SkillListItem[]> {
  const skills = await db
    .select({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      visibility: skill.visibility,
      status: skill.status,
      updatedAt: skill.updatedAt,
    })
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
  /** The name in the latest frontmatter, which a published skill's address ends with. */
  slug: string;
  visibility: Visibility;
  status: string;
  /** The owner's username, which a published skill's address starts with. */
  username: string | null;
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
  const currentUser = await requireUser();
  if (!skillIdSchema.safeParse(skillId).success) notFound();
  const [row] = await db
    .select({
      id: skill.id,
      ownerId: skill.ownerId,
      name: skill.name,
      category: skill.category,
      tags: skill.tags,
      slug: skill.slug,
      visibility: skill.visibility,
      status: skill.status,
      username: user.username,
    })
    .from(skill)
    .leftJoin(user, eq(user.id, skill.ownerId))
    .where(eq(skill.id, skillId));
  if (!row || !canEdit(currentUser, row)) notFound();

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
    slug: row.slug,
    visibility: row.visibility as Visibility,
    status: row.status,
    username: row.username,
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
 * A skill's zip download, if the viewer may have it: the latest version without a version number.
 * The owner gets any kept version; anyone else only the latest version of a published skill that is
 * public or unlisted, and only once Community is open. Null otherwise, the same as for a skill that
 * does not exist. Only `read` loads the files, so the caller can apply its rate limit in between.
 */
export async function findVersionArchive(
  viewer: { id: string } | null,
  skillId: string,
  version?: number,
): Promise<{ read: () => Promise<VersionArchive | null> } | null> {
  if (!skillIdSchema.safeParse(skillId).success || (version !== undefined && !isVersionNumber(version))) return null;
  // Signed out, only a published skill can be downloaded, and only once Community is open.
  if (!viewer && !isSignUpOpen()) return null;
  const [row] = await db
    .select({ ownerId: skill.ownerId, visibility: skill.visibility, status: skill.status })
    .from(skill)
    .where(eq(skill.id, skillId));
  if (!row) return null;
  if (canEdit(viewer, row)) return { read: () => readVersionArchive(skillId, version, false) };
  // Others get only the latest version: an older one may hold what a later save fixed, such as a
  // finding that blocks publishing.
  if (version !== undefined || !isSignUpOpen() || !canRead(viewer, row)) return null;
  return { read: () => readVersionArchive(skillId, undefined, true) };
}

async function readVersionArchive(skillId: string, version: number | undefined, publishedOnly: boolean): Promise<VersionArchive | null> {
  const [saved] = await db
    .select({
      id: skillVersion.id,
      name: sql<string>`${skillVersion.frontmatter}->>'name'`,
      version: skillVersion.version,
      createdAt: skillVersion.createdAt,
      skillMd: skillVersion.skillMd,
    })
    .from(skillVersion)
    .innerJoin(skill, eq(skill.id, skillVersion.skillId))
    .where(
      and(
        eq(skillVersion.skillId, skillId),
        version === undefined ? undefined : eq(skillVersion.version, version),
        // Checked again in the statement that picks the version: a save that unpublished the skill
        // since the access check, such as one with a critical finding, is never served to others.
        publishedOnly ? and(eq(skill.status, "published"), inArray(skill.visibility, ["public", "unlisted"])) : undefined,
      ),
    )
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
 * its risk, how many findings and files it had and the address that downloads it with its files;
 * the findings and the files stay out, which keeps the export under the response size limit.
 */
export async function getSkillsExport(userId: string) {
  const [skills, versions] = await Promise.all([
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
        skillId: skillVersion.skillId,
        version: skillVersion.version,
        skillMd: skillVersion.skillMd,
        contentHash: skillVersion.contentHash,
        risk: skillVersion.risk,
        findingCount: sql<number>`jsonb_array_length(${skillVersion.findings})`.mapWith(Number),
        fileCount: sql<number>`(select count(*) from ${skillFile} where ${skillFile.versionId} = ${skillVersion.id})`.mapWith(Number),
        fileBytes: sql<number>`(select coalesce(sum(octet_length(${skillFile.content})), 0) from ${skillFile} where ${skillFile.versionId} = ${skillVersion.id})`.mapWith(Number),
        createdAt: skillVersion.createdAt,
      })
      .from(skillVersion)
      .innerJoin(skill, eq(skill.id, skillVersion.skillId))
      .where(eq(skill.ownerId, userId))
      .orderBy(skillVersion.version),
  ]);
  return skills.map((row) => ({
    ...row,
    versions: versions
      .filter((version) => version.skillId === row.id)
      .map(({ version, skillMd, contentHash, risk, findingCount, fileCount, fileBytes, createdAt }) => ({
        version,
        skillMd,
        contentHash,
        risk,
        findingCount,
        fileCount,
        fileBytes,
        createdAt,
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
