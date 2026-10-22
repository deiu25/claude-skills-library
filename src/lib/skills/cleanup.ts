import "server-only";
import { isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { skill } from "@/lib/db/schema";

/**
 * Deletes skills whose owner is gone. Deleting an account deletes its skills first, but a save
 * that lands while the account is being deleted would outlive it. Until a skill can be sold, no
 * skill should be left without an owner.
 */
export async function deleteOwnerlessSkills() {
  const result = await db.delete(skill).where(isNull(skill.ownerId));
  return result.rowCount ?? 0;
}
