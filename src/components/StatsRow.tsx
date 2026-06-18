import { Eye, GitFork, Star } from "@phosphor-icons/react/dist/ssr";
import type { RepoStats } from "@/lib/github";
import { formatCount } from "@/lib/github";

interface StatsRowProps {
  stats: RepoStats | null;
}

/** Star / fork / watcher counts. Renders nothing when stats are unavailable. */
export function StatsRow({ stats }: StatsRowProps) {
  if (!stats) return null;

  return (
    <div className="flex items-center gap-4 font-mono text-xs text-muted">
      <span className="flex items-center gap-1.5" title={`${stats.stars} stars`}>
        <Star size={14} aria-hidden />
        {formatCount(stats.stars)}
        <span className="sr-only">stars</span>
      </span>
      <span className="flex items-center gap-1.5" title={`${stats.forks} forks`}>
        <GitFork size={14} aria-hidden />
        {formatCount(stats.forks)}
        <span className="sr-only">forks</span>
      </span>
      <span className="flex items-center gap-1.5" title={`${stats.watchers} watchers`}>
        <Eye size={14} aria-hidden />
        {formatCount(stats.watchers)}
        <span className="sr-only">watchers</span>
      </span>
    </div>
  );
}
