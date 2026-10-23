import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { CATEGORY_LABELS, type SkillCategory } from "@/data/types";
import type { CommunityCardData } from "@/lib/community/format";
import { listingPath } from "@/lib/community/links";

/** A published skill in a Community grid, linking to its page. */
export function CommunityCard({ skill }: { skill: CommunityCardData }) {
  return (
    <Link
      href={listingPath(skill.handle, skill.slug)}
      className="press card group flex h-full flex-col gap-3 p-5 [--press-scale:0.98] hover:-translate-y-0.5 hover:border-faint"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-all font-mono text-[0.9375rem] font-semibold text-foreground">{skill.name}</h3>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.6875rem] text-muted">
          {CATEGORY_LABELS[skill.category as SkillCategory] ?? skill.category}
        </span>
      </div>

      <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-muted">{skill.description}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="min-w-0 truncate text-xs text-faint">
          by <span className="font-mono text-muted">{skill.handle}</span> · {skill.updated}
        </span>
        <ArrowRight
          size={16}
          className="shrink-0 text-faint transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </div>
    </Link>
  );
}
