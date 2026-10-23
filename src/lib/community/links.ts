import { SITE_REPO_URL, SITE_URL } from "@/lib/site";

export const profilePath = (handle: string) => `/u/${handle}`;

export const listingPath = (handle: string, slug: string) => `/u/${handle}/${slug}`;

/**
 * A new issue on the catalog's repository, from the suggest-skill.yml form, filled in with a
 * Community skill's page and description. GitHub fills a form field from the parameter named
 * after its id.
 */
export function proposeUrl(listing: { handle: string; slug: string; name: string; description: string }): string {
  const params = new URLSearchParams({
    template: "suggest-skill.yml",
    title: `Suggest: ${listing.name}`,
    source: `${SITE_URL}${listingPath(listing.handle, listing.slug)}`,
    when: listing.description,
  });
  return `${SITE_REPO_URL}/issues/new?${params}`;
}
