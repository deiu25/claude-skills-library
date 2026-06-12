import { Eye, GitFork, Star } from "@phosphor-icons/react/dist/ssr";
import type { RepoStats } from "@/lib/github";
import { formatCount } from "@/lib/github";

interface StatsRowProps {
  stats: RepoStats | null;
  /** Compact for cards, full for detail pages. */
  size?: "sm" | "md";
}

/** Star / fork / watcher counts. Renders nothing when stats are unavailable. */
export function StatsRow({ stats, size = "sm" }: StatsRowProps) {
  if (!stats) return null;

  const iconSize = size === "sm" ? 14 : 16;
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-4 font-mono ${textClass} text-muted`}>
      <span className="flex items-center gap-1.5" title={`${stats.stars} stars`}>
        <Star size={iconSize} aria-hidden />
        {formatCount(stats.stars)}
        <span className="sr-only">stars</span>
      </span>
      <span className="flex items-center gap-1.5" title={`${stats.forks} forks`}>
        <GitFork size={iconSize} aria-hidden />
        {formatCount(stats.forks)}
        <span className="sr-only">forks</span>
      </span>
      <span className="flex items-center gap-1.5" title={`${stats.watchers} watchers`}>
        <Eye size={iconSize} aria-hidden />
        {formatCount(stats.watchers)}
        <span className="sr-only">watchers</span>
      </span>
    </div>
  );
}
