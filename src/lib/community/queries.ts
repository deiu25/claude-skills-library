import "server-only";
import { and, desc, eq, inArray, isNotNull, sql, type SQL } from "drizzle-orm";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { cache } from "react";
import { USERNAME_MAX, USERNAME_MIN } from "@/lib/auth/username";
import { db } from "@/lib/db";
import { skill, skillVersion, user } from "@/lib/db/schema";
import { getFileSummaries } from "@/lib/skills/file-summaries";
import type { FileSummary } from "@/lib/skills/files";
import type { Finding, Risk } from "@/lib/skills/scan";
import { NAME_MAX, SLUG_RE } from "@/lib/skills/schemas";

// Reads for the Community pages, which are prerendered and revalidated (ISR): they take no session
// and set no cookie. Only published skills whose owner has a username ever leave this module, and
// only public ones are listed; an unlisted skill is reached by its address alone.

/** Public skills on /community, newest change first. Search and filters run in the browser over this many. */
const COMMUNITY_MAX = 500;
const SITEMAP_MAX = 10_000;

export interface CommunitySkill {
  handle: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  /** The latest version's highest scan severity. */
  risk: Risk;
  updatedAt: Date;
}

export interface Profile {
  handle: string;
  bio: string | null;
  skills: CommunitySkill[];
}

export interface Listing extends CommunitySkill {
  /** The skill's id, which its zip download takes. */
  id: string;
  visibility: "public" | "unlisted";
  /** The latest version, which is the one shown and downloaded. */
  version: number;
  savedAt: Date;
  skillMd: string;
  findings: Finding[];
  files: FileSummary[];
}

/**
 * `next build` runs without a database (merge rule 3), so a read that fails there renders the
 * empty page. At request time the error is thrown: ISR then keeps serving the last page that
 * rendered, and tries again on the next request.
 */
async function emptyAtBuild<T>(read: () => Promise<T>, empty: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw error;
    // drizzle wraps the driver's error, whose code names the cause, such as ECONNREFUSED.
    const cause = error instanceof Error ? (error.cause as { code?: unknown } | undefined) : undefined;
    console.warn("Community read failed during the build, rendered empty:", error instanceof Error ? error.name : "unknown error", cause?.code ?? "");
    return empty;
  }
}

const isHandle = (handle: string) => handle.length >= USERNAME_MIN && handle.length <= USERNAME_MAX && SLUG_RE.test(handle);
const isSlug = (slug: string) => slug.length <= NAME_MAX && SLUG_RE.test(slug);

const latestRisk = sql<Risk>`(select ${skillVersion.risk} from ${skillVersion} where ${skillVersion.skillId} = ${skill.id} order by ${skillVersion.version} desc limit 1)`;
const handleColumn = sql<string>`${user.username}`;

/** Published skills whose owner has a username, and match `where`. */
const shown = (where: SQL | undefined) => and(eq(skill.status, "published"), isNotNull(user.username), where);

/** Published skills matching `where`, newest change first, as cards show them. */
function selectSkills(where: SQL | undefined) {
  return db
    .select({
      handle: handleColumn,
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      tags: skill.tags,
      risk: latestRisk,
      updatedAt: skill.updatedAt,
    })
    .from(skill)
    .innerJoin(user, eq(user.id, skill.ownerId))
    .where(shown(where))
    .orderBy(desc(skill.updatedAt));
}

export function getCommunitySkills(): Promise<CommunitySkill[]> {
  return emptyAtBuild(() => selectSkills(eq(skill.visibility, "public")).limit(COMMUNITY_MAX), []);
}

/** An author's profile and public skills. Null when the handle has no public skill: a profile exists only through one. */
export const getProfile = cache(async (handle: string): Promise<Profile | null> => {
  if (!isHandle(handle)) return null;
  return emptyAtBuild(async () => {
    const [owner] = await db.select({ id: user.id, bio: user.bio }).from(user).where(eq(user.username, handle));
    if (!owner) return null;
    const skills = await selectSkills(and(eq(skill.ownerId, owner.id), eq(skill.visibility, "public"))).limit(COMMUNITY_MAX);
    return skills.length ? { handle, bio: owner.bio, skills } : null;
  }, null);
});

/** A published skill's page, public or unlisted, with its latest version. Cached per request, because the page's metadata reads it too. */
export const getListing = cache(async (handle: string, slug: string): Promise<Listing | null> => {
  if (!isHandle(handle) || !isSlug(slug)) return null;
  return emptyAtBuild(async () => {
    const [row] = await db
      .select({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        tags: skill.tags,
        visibility: skill.visibility,
        updatedAt: skill.updatedAt,
        versionId: skillVersion.id,
        version: skillVersion.version,
        risk: skillVersion.risk,
        findings: skillVersion.findings,
        skillMd: skillVersion.skillMd,
        savedAt: skillVersion.createdAt,
      })
      .from(skill)
      .innerJoin(user, eq(user.id, skill.ownerId))
      .innerJoin(skillVersion, eq(skillVersion.skillId, skill.id))
      .where(shown(and(eq(user.username, handle), eq(skill.slug, slug), inArray(skill.visibility, ["public", "unlisted"]))))
      .orderBy(desc(skillVersion.version))
      .limit(1);
    if (!row) return null;
    const { versionId, ...listing } = row;
    return {
      ...listing,
      handle,
      slug,
      visibility: row.visibility as Listing["visibility"],
      risk: row.risk as Risk,
      files: await getFileSummaries(versionId),
    };
  }, null);
});

/** Every public skill's address and last change, for the sitemap. */
export function getSitemapSkills(): Promise<Pick<CommunitySkill, "handle" | "slug" | "updatedAt">[]> {
  return emptyAtBuild(
    () =>
      db
        .select({ handle: handleColumn, slug: skill.slug, updatedAt: skill.updatedAt })
        .from(skill)
        .innerJoin(user, eq(user.id, skill.ownerId))
        .where(shown(eq(skill.visibility, "public")))
        .orderBy(desc(skill.updatedAt))
        .limit(SITEMAP_MAX),
    [],
  );
}
