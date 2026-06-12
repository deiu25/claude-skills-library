import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Skill } from "@/data/types";
import { CATEGORY_LABELS } from "@/data/types";
import type { RepoStats } from "@/lib/github";
import { StatsRow } from "./StatsRow";

interface SkillCardProps {
  skill: Skill;
  stats: RepoStats | null;
}

export function SkillCard({ skill, stats }: SkillCardProps) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="card group flex h-full flex-col gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-faint"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-[15px] font-semibold tracking-tight text-foreground">
          {skill.name}
        </h3>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
          {CATEGORY_LABELS[skill.category]}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-muted">{skill.tagline}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        {stats ? (
          <StatsRow stats={stats} />
        ) : (
          <span className="font-mono text-xs text-faint">
            {skill.repo ? "stats unavailable" : "local skill"}
          </span>
        )}
        <ArrowRight
          size={16}
          className="text-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </div>
    </Link>
  );
}
