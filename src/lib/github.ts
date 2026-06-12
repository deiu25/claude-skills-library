export interface RepoStats {
  repo: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  pushedAt: string;
  license: string | null;
  language: string | null;
}

const GITHUB_API = "https://api.github.com/repos";
const REVALIDATE_SECONDS = 21600; // 6 hours

/**
 * Fetch repo stats from the GitHub REST API with ISR caching.
 * Returns null on any failure (rate limit, 404, network) so the UI
 * can degrade gracefully. Next.js dedupes identical fetch URLs, so
 * skills sharing a monorepo cost one request per revalidation window.
 */
export async function getRepoStats(repo: string): Promise<RepoStats | null> {
  const token = process.env.GITHUB_TOKEN;

  try {
    const response = await fetch(`${GITHUB_API}/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) {
      return null;
    }

    const d = data as Record<string, unknown>;
    return {
      repo,
      stars: typeof d.stargazers_count === "number" ? d.stargazers_count : 0,
      forks: typeof d.forks_count === "number" ? d.forks_count : 0,
      watchers: typeof d.subscribers_count === "number" ? d.subscribers_count : 0,
      openIssues: typeof d.open_issues_count === "number" ? d.open_issues_count : 0,
      pushedAt: typeof d.pushed_at === "string" ? d.pushed_at : "",
      license:
        typeof d.license === "object" && d.license !== null
          ? ((d.license as Record<string, unknown>).spdx_id as string | null)
          : null,
      language: typeof d.language === "string" ? d.language : null,
    };
  } catch {
    return null;
  }
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function formatRelativeDate(iso: string): string {
  if (!iso) return "unknown";
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
