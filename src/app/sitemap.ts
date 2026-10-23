import type { MetadataRoute } from "next";
import { skills } from "@/data/skills";
import { isSignUpOpen } from "@/lib/auth/allowlist";
import { listingPath, profilePath } from "@/lib/community/links";
import { getSitemapSkills } from "@/lib/community/queries";
import { SITE_URL } from "@/lib/site";

// Rendered per request. On Vercel, a sitemap.ts that exports `revalidate` is deployed as a static
// file and never regenerated (vercel/next.js#99055, Next 16.2 and later), which would freeze the
// Community entries at the deploy. Its one query is cached until a Community write (getSitemapSkills).
export const dynamic = "force-dynamic";

/** Public Community pages: each public skill, and each author's profile, dated by their newest change. */
async function communityEntries(): Promise<MetadataRoute.Sitemap> {
  if (!isSignUpOpen()) return [];
  const community = { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.6 } as const;
  let listings: Awaited<ReturnType<typeof getSitemapSkills>>;
  try {
    listings = await getSitemapSkills();
  } catch (error) {
    // The catalog's entries never depend on the database.
    console.error("Sitemap without Community skills:", error instanceof Error ? error.name : "unknown error");
    return [community];
  }
  // Newest first, so the first date seen for an author is their profile's.
  const profiles = new Map<string, string>();
  for (const { handle, updatedAt } of listings) if (!profiles.has(handle)) profiles.set(handle, updatedAt);
  return [
    community,
    ...[...profiles].map(([handle, lastModified]) => ({ url: `${SITE_URL}${profilePath(handle)}`, lastModified, priority: 0.4 })),
    ...listings.map(({ handle, slug, updatedAt }) => ({ url: `${SITE_URL}${listingPath(handle, slug)}`, lastModified: updatedAt, priority: 0.5 })),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/skills`, changeFrequency: "weekly", priority: 0.9 },
    ...skills.map((skill) => ({
      url: `${SITE_URL}/skills/${skill.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(await communityEntries()),
  ];
}
