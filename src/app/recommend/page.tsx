import type { Metadata } from "next";
import { skills, getUniqueRepos } from "@/data/skills";
import { getRepoStats } from "@/lib/github";
import type { RepoStats } from "@/lib/github";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SkillRecommender } from "@/components/SkillRecommender";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Recommend skills",
  description:
    "Describe your task and get the Claude Code skills that fit it, ranked by relevance.",
};

export default async function RecommendPage() {
  const repos = getUniqueRepos();
  const statsList = await Promise.all(repos.map((r) => getRepoStats(r)));
  const statsByRepo: Record<string, RepoStats | null> = Object.fromEntries(
    repos.map((r, i) => [r, statsList[i]]),
  );

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tighter text-foreground sm:text-4xl">
            Which skill for your task?
          </h1>
          <p className="max-w-[55ch] text-sm leading-relaxed text-muted sm:text-base">
            Describe what you are about to do. The matcher ranks the library by what fits — no
            account, no AI call, just the catalog.
          </p>
        </div>

        <SkillRecommender skills={skills} statsByRepo={statsByRepo} />
      </main>
      <SiteFooter />
    </>
  );
}
