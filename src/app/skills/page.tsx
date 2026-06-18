import type { Metadata } from "next";
import { Suspense } from "react";
import { skills, getUniqueRepos } from "@/data/skills";
import { getRepoStats } from "@/lib/github";
import type { RepoStats } from "@/lib/github";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SkillSearch } from "@/components/SkillSearch";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Browse skills",
  description:
    "Search and filter the full library of curated Claude Code skills by category, tag, or author.",
};

export default async function SkillsPage() {
  const repos = getUniqueRepos();
  const statsList = await Promise.all(repos.map((r) => getRepoStats(r)));
  const statsByRepo: Record<string, RepoStats | null> = Object.fromEntries(
    repos.map((r, i) => [r, statsList[i]]),
  );

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 space-y-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            All skills
          </h1>
          <p className="max-w-[55ch] text-pretty text-sm leading-relaxed text-muted sm:text-base">
            Every entry is curated: a plain explanation of when the skill helps, how to invoke it,
            and the exact install command.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-6" aria-busy="true" aria-label="Loading skills">
              <div className="h-11 animate-pulse rounded-[8px] border border-line bg-surface" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="card h-44 animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <SkillSearch skills={skills} statsByRepo={statsByRepo} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
