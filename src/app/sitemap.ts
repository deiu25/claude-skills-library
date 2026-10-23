import type { MetadataRoute } from "next";
import { skills } from "@/data/skills";
import { isSignUpOpen } from "@/lib/auth/allowlist";
import { listingPath, profilePath } from "@/lib/community/links";
import { getSitemapSkills } from "@/lib/community/queries";
import { SITE_URL } from "@/lib/site";

// Community writes revalidate it at once (revalidateCommunity); the hour is a backstop.
export const revalidate = 3600;

/** Public Community pages: each public skill, and each author's profile, dated by their newest change. */
async function communityEntries(): Promise<MetadataRoute.Sitemap> {
  if (!isSignUpOpen()) return [];
  const listings = await getSitemapSkills();
  // Newest first, so the first date seen for an author is their profile's.
  const profiles = new Map<string, Date>();
  for (const { handle, updatedAt } of listings) if (!profiles.has(handle)) profiles.set(handle, updatedAt);
  return [
    { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.6 },
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
