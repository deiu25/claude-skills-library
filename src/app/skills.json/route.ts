import { skills, getUniqueRepos } from "@/data/skills";
import { getRepoStats } from "@/lib/github";
import type { RepoStats } from "@/lib/github";
import { toJsonCatalog } from "@/lib/report";

// Prerender to a static file at build/revalidate — no runtime backend.
export const dynamic = "force-static";
export const revalidate = 21600;

export async function GET() {
  const repos = getUniqueRepos();
  const statsList = await Promise.all(repos.map((r) => getRepoStats(r)));
  const statsByRepo: Record<string, RepoStats | null> = Object.fromEntries(
    repos.map((r, i) => [r, statsList[i]]),
  );

  return Response.json(toJsonCatalog(skills, statsByRepo));
}
