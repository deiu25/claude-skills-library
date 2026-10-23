import type { Risk } from "./scan";

/** The columns of a skill that decide who may see or change it. */
export interface SkillAccess {
  ownerId: string | null;
  visibility: string;
  status: string;
}

type Viewer = { id: string } | null;

/** The owner reads any of their skills; anyone else only a published one that is public or unlisted. */
export function canRead(viewer: Viewer, skill: SkillAccess): boolean {
  if (canEdit(viewer, skill)) return true;
  return skill.status === "published" && (skill.visibility === "public" || skill.visibility === "unlisted");
}

/** Only the owner changes a skill. A skill whose owner deleted their account has none. */
export function canEdit(viewer: Viewer, skill: Pick<SkillAccess, "ownerId">): boolean {
  return viewer !== null && skill.ownerId !== null && skill.ownerId === viewer.id;
}

export const VISIBILITIES = ["private", "unlisted", "public"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

/** What the owner's choice of visibility stores: unlisted and public publish the skill, private takes it back to a draft. */
export const statusFor = (visibility: Visibility) => (visibility === "private" ? "draft" : "published");

interface PublishState {
  status: string;
  /** The latest version's number and its scan's highest severity. */
  version: number;
  risk: Risk;
  /** The owner's username, which a published skill's address needs: /u/<username>/<name>. */
  username: string | null;
}

/**
 * Why the owner cannot give a skill this visibility, or null when they can. A critical finding
 * blocks publishing, never a private skill; a removed skill stays as it is.
 */
export function visibilityProblem(visibility: Visibility, skill: PublishState): string | null {
  if (skill.status === "removed") return "This skill was removed from the site, so its visibility cannot change.";
  if (visibility === "private") return null;
  if (!skill.username) return "Choose a username in your settings first: a published skill's address starts with it.";
  if (skill.risk === "critical") {
    return `Version ${skill.version} has a critical finding, so it cannot be published. Fix what the check flags and save, then publish.`;
  }
  return null;
}
