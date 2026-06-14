import type { Skill, SkillCategory } from "@/data/types";
import { CATEGORY_LABELS } from "@/data/types";
import type { RepoStats } from "@/lib/github";
import { formatRelativeDate } from "@/lib/github";

interface CoverageMapProps {
  skills: Skill[];
  statsByRepo: Record<string, RepoStats | null>;
}

/**
 * Coverage / gap map. Renders every category (including empty ones) so thin
 * or missing areas of the library are obvious — the "what's missing from my
 * workflow" view. Plus install-method spread and freshness, all derived from
 * the data already loaded by the page.
 */
export function CoverageMap({ skills, statsByRepo }: CoverageMapProps) {
  const allCategories = Object.keys(CATEGORY_LABELS) as SkillCategory[];
  const countByCategory = new Map<SkillCategory, number>();
  for (const c of allCategories) countByCategory.set(c, 0);
  for (const s of skills) countByCategory.set(s.category, (countByCategory.get(s.category) ?? 0) + 1);
  const maxCount = Math.max(1, ...countByCategory.values());

  const installMethods = new Map<string, number>();
  for (const s of skills) {
    installMethods.set(s.install.method, (installMethods.get(s.install.method) ?? 0) + 1);
  }

  const repoCount = new Set(skills.flatMap((s) => (s.repo ? [s.repo] : []))).size;
  const localCount = skills.filter((s) => !s.repo).length;
  const lastPush = Object.values(statsByRepo)
    .map((s) => s?.pushedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  const summary = [
    { label: "Skills", value: String(skills.length) },
    { label: "Categories covered", value: `${[...countByCategory.values()].filter((n) => n > 0).length}/${allCategories.length}` },
    { label: "Source repos", value: String(repoCount) },
    { label: "Local-only", value: String(localCount) },
    { label: "Most recent update", value: lastPush ? formatRelativeDate(lastPush) : "n/a" },
  ];

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
        {summary.map((item) => (
          <div key={item.label} className="flex flex-col gap-1 bg-surface p-4">
            <dt className="text-xs text-faint">{item.label}</dt>
            <dd className="font-mono text-lg font-semibold tracking-tight text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Coverage by category</h3>
        <ul className="space-y-2">
          {allCategories.map((category) => {
            const count = countByCategory.get(category) ?? 0;
            const pct = Math.round((count / maxCount) * 100);
            const isGap = count === 0;
            return (
              <li key={category} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-muted">{CATEGORY_LABELS[category]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className={`h-full rounded-full ${isGap ? "bg-line" : "bg-accent"}`}
                    style={{ width: `${Math.max(pct, isGap ? 0 : 6)}%` }}
                  />
                </div>
                <span
                  className={`w-20 shrink-0 text-right font-mono text-xs ${isGap ? "text-faint" : "text-muted"}`}
                >
                  {isGap ? "gap" : `${count} skill${count === 1 ? "" : "s"}`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Install methods</h3>
        <div className="flex flex-wrap gap-2">
          {[...installMethods.entries()].map(([method, count]) => (
            <span key={method} className="chip cursor-default">
              {method}
              <span className="text-faint">{count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
