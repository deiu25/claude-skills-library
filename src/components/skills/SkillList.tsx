import { FileText } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { CATEGORY_LABELS, type SkillCategory } from "@/data/types";
import { formatRelativeDate } from "@/lib/github";
import { getMySkills } from "@/lib/skills/queries";
import { RiskBadge } from "./RiskBadge";

/** The signed-in user's skills, each linking to its editor. */
export async function SkillList({ userId }: { userId: string }) {
  const skills = await getMySkills(userId);

  if (!skills.length) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[8px] border border-line bg-surface px-5 py-8 sm:px-8">
        <FileText size={36} className="text-faint" aria-hidden />
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">No skills yet</h2>
          <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-muted">
            Write or paste a SKILL.md. Its frontmatter is checked and the file is scanned for risky commands as you
            type, and every saved change is kept as a version. Your skills are private.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line rounded-[8px] border border-line bg-surface">
      {skills.map((skill) => (
        <li key={skill.id}>
          <Link
            href={`/dashboard/skills/${skill.id}`}
            className="flex flex-col items-start gap-3 px-4 py-4 transition-colors hover:bg-surface-raised sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <span className="min-w-0 space-y-1">
              <span className="block truncate font-mono text-[0.9375rem] font-semibold tracking-tight text-foreground">{skill.name}</span>
              <span className="line-clamp-2 block text-pretty text-sm leading-relaxed text-muted">{skill.description}</span>
              <span className="block text-xs text-faint">
                {CATEGORY_LABELS[skill.category as SkillCategory] ?? skill.category} · version {skill.latestVersion} · changed{" "}
                {formatRelativeDate(skill.updatedAt.toISOString())}
              </span>
            </span>
            <RiskBadge risk={skill.risk} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
