import { revalidatePath } from "next/cache";

/**
 * Marks every Community page stale, so each one renders again on its next visit: called after any
 * write that changes what they show, such as publishing, saving or deleting a published skill, or
 * an author's profile. Every page rather than the right few keeps renames and deletions simple,
 * and costs one render per page visited afterwards.
 */
export function revalidateCommunity() {
  revalidatePath("/community");
  revalidatePath("/u/[handle]", "page");
  revalidatePath("/u/[handle]/[slug]", "page");
}
