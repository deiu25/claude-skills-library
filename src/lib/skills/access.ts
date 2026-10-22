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
