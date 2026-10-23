import { revalidatePath, revalidateTag } from "next/cache";

/** The cache tag on Community data cached outside a page: the sitemap's read. */
export const COMMUNITY_TAG = "community";

/**
 * Marks every Community page stale, so each one renders again on its next visit, and expires the
 * sitemap's cached read: called after any write that changes what they show, such as publishing,
 * saving or deleting a published skill, or an author's profile. Every page rather than the right
 * few keeps renames and deletions simple, and costs one render per page visited afterwards.
 */
export function revalidateCommunity() {
  revalidatePath("/community");
  revalidatePath("/u/[handle]", "page");
  revalidatePath("/u/[handle]/[slug]", "page");
  revalidateTag(COMMUNITY_TAG, { expire: 0 });
}
