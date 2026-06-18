import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Skill } from "@/data/types";
import { CATEGORY_LABELS } from "@/data/types";
import type { RepoStats } from "@/lib/github";
import { StatsRow } from "./StatsRow";

interface SkillCardProps {
  skill: Skill;
  stats: RepoStats | null;
  /** Larger padding + name, used by the home "Start with these" bento. */
  featured?: boolean;
  /** Accent-tinted surface for the lead featured cell. */
  accent?: boolean;
}

export function SkillCard({ skill, stats, featured = false, accent = false }: SkillCardProps) {
  const surface = accent
    ? "rounded-[14px] border border-accent/40 bg-accent-soft hover:border-accent"
    : "card hover:border-faint";

  return (
    <Link
      href={`/skills/${skill.slug}`}
      className={`group flex h-full flex-col gap-3 transition-[transform,border-color,background-color,color] duration-200 hover:-translate-y-0.5 ${surface} ${
        featured ? "p-6" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`font-mono font-semibold tracking-tight text-foreground ${
            featured ? "text-base" : "text-[15px]"
          }`}
        >
          {skill.name}
        </h3>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
          {CATEGORY_LABELS[skill.category]}
        </span>
      </div>

      <p className="text-pretty text-sm leading-relaxed text-muted">{skill.tagline}</p>

      <div className={`mt-auto flex items-center justify-between gap-3 ${featured ? "pt-3" : "pt-2"}`}>
        {stats ? (
          <StatsRow stats={stats} />
        ) : featured ? (
          // Featured cells stay clean when stats are missing; the arrow holds the row.
          <StatsRow stats={null} />
        ) : (
          <span className="font-mono text-xs text-faint">
            {skill.repo ? "stats unavailable" : "local skill"}
          </span>
        )}
        <ArrowRight
          size={16}
          className="shrink-0 text-faint transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </div>
    </Link>
  );
}
