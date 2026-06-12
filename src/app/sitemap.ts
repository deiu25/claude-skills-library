import type { MetadataRoute } from "next";
import { skills } from "@/data/skills";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/skills`, changeFrequency: "weekly", priority: 0.9 },
    ...skills.map((skill) => ({
      url: `${SITE_URL}/skills/${skill.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
