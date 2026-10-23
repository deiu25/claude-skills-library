import { SITE_REPO_URL, SITE_URL } from "@/lib/site";
import { summary } from "./format";

/** How much of a description goes into the form: a full one, in a non-Latin script, would pass the length GitHub accepts in a URL. */
const PROPOSE_DESCRIPTION_MAX = 300;

export const profilePath = (handle: string) => `/u/${handle}`;

export const listingPath = (handle: string, slug: string) => `/u/${handle}/${slug}`;

/** The report form for a published skill, named by its id, or for a profile, named by its username. */
export const reportPath = (target: { skill: string } | { user: string }) => `/dashboard/report?${new URLSearchParams(target)}`;

/**
 * A new issue on the catalog's repository, from the suggest-skill.yml form, filled in with a
 * Community skill's page and the start of its description, which the visitor reviews before they
 * submit. GitHub fills a form field from the parameter named after its id.
 */
export function proposeUrl(listing: { handle: string; slug: string; name: string; description: string }): string {
  const params = new URLSearchParams({
    template: "suggest-skill.yml",
    title: `Suggest: ${listing.name}`,
    source: `${SITE_URL}${listingPath(listing.handle, listing.slug)}`,
    when: summary(listing.description, PROPOSE_DESCRIPTION_MAX),
  });
  return `${SITE_REPO_URL}/issues/new?${params}`;
}
