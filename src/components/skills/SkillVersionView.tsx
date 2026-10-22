import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { TerminalBlock } from "@/components/TerminalBlock";
import { formatRelativeDate } from "@/lib/github";
import { getOwnedVersion } from "@/lib/skills/queries";
import { FileList } from "./FileList";
import { FindingList } from "./FindingList";
import { RiskBadge } from "./RiskBadge";

/** One saved version, read-only: its scan as it ran on save, its files, then SKILL.md itself. */
export async function SkillVersionView({ skillId, version }: { skillId: string; version: number }) {
  const saved = await getOwnedVersion(skillId, version);

  return (
    <>
      <div className="space-y-3">
        <Link href={`/dashboard/skills/${skillId}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={14} aria-hidden />
          <span className="break-all font-mono">{saved.name}</span>
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="space-y-3">
            <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">Version {saved.version}</h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
              <span>Saved {formatRelativeDate(saved.createdAt.toISOString())}</span>
              <RiskBadge risk={saved.risk} />
            </p>
          </div>
          <a href={`/api/skills/${skillId}/download?version=${saved.version}`} download className="btn btn-ghost text-sm">
            <DownloadSimple size={16} aria-hidden />
            Download .zip
          </a>
        </div>
      </div>

      <section aria-labelledby="scan-title" className="mt-10 rounded-[8px] border border-line bg-surface">
        <h2 id="scan-title" className="border-b border-line px-4 py-3 text-sm font-medium text-foreground">
          Scan
        </h2>
        {saved.findings.length ? (
          <FindingList findings={saved.findings} />
        ) : (
          <p className="px-4 py-3 text-sm leading-relaxed text-muted">Nothing flagged when this version was saved.</p>
        )}
      </section>

      <section aria-labelledby="files-title" className="mt-8 rounded-[8px] border border-line bg-surface">
        <h2 id="files-title" className="border-b border-line px-4 py-3 text-sm font-medium text-foreground">
          Files
        </h2>
        {saved.files.length ? (
          <FileList files={saved.files} />
        ) : (
          <p className="px-4 py-3 text-sm leading-relaxed text-muted">Only SKILL.md.</p>
        )}
      </section>

      <div className="mt-8">
        <TerminalBlock title="SKILL.md" copyText={saved.skillMd} copyLabel="Copy SKILL.md">
          <pre className="whitespace-pre-wrap break-words">{saved.skillMd}</pre>
        </TerminalBlock>
      </div>
    </>
  );
}
