import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { formatRelativeDate } from "@/lib/github";
import { getOwnedSkill } from "@/lib/skills/queries";
import { DeleteSkill } from "./DeleteSkill";
import { RiskBadge } from "./RiskBadge";
import { SkillEditor } from "./SkillEditor";

const ago = (date: Date) => formatRelativeDate(date.toISOString());

/** One of the user's skills: its editor, its versions and its deletion. Others get a 404. */
export async function SkillWorkspace({ skillId }: { skillId: string }) {
  const skill = await getOwnedSkill(skillId);
  const [latest] = skill.versions;

  return (
    <>
      <div className="space-y-3">
        <Link href="/dashboard/skills" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={14} aria-hidden />
          Your skills
        </Link>
        <h1 className="break-all font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{skill.name}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
          <span>
            Version {latest.version}, saved {ago(latest.createdAt)}
          </span>
          <RiskBadge risk={latest.risk} />
        </p>
      </div>

      <div className="mt-10">
        <SkillEditor skillId={skill.id} initial={{ skillMd: skill.skillMd, category: skill.category, tags: skill.tags.join(", ") }} />
      </div>

      <div className="mt-14 divide-y divide-line border-t border-line">
        <SettingsSection
          id="versions"
          title="Versions"
          description="Every save that changes SKILL.md is kept as a new version, with the scan it got then."
        >
          <ul className="divide-y divide-line rounded-[8px] border border-line bg-surface">
            {skill.versions.map((version, index) => (
              <li key={version.version}>
                <Link
                  href={`/dashboard/skills/${skill.id}/versions/${version.version}`}
                  className="flex min-h-11 items-center justify-between gap-4 py-2.5 pl-4 pr-3 transition-colors hover:bg-surface-raised"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      Version {version.version}
                      {index === 0 && <span className="ml-2 text-xs font-normal text-accent-strong">Current</span>}
                    </span>
                    <span className="block text-xs text-faint">
                      saved {ago(version.createdAt)}, {version.findingCount === 1 ? "1 finding" : `${version.findingCount} findings`}
                    </span>
                  </span>
                  <RiskBadge risk={version.risk} />
                </Link>
              </li>
            ))}
          </ul>
        </SettingsSection>
        <SettingsSection id="delete" title="Delete skill" description="Removes the skill and every version, for good.">
          <DeleteSkill skillId={skill.id} name={skill.name} versionCount={skill.versions.length} />
        </SettingsSection>
      </div>
    </>
  );
}
