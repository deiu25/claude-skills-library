import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOut, FileJs, FileText } from "@phosphor-icons/react/dist/ssr";
import { skills, getUniqueRepos } from "@/data/skills";
import { getRepoStats } from "@/lib/github";
import type { RepoStats } from "@/lib/github";
import { toJsonCatalog, toMarkdownReport, toCheatSheet } from "@/lib/report";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CoverageMap } from "@/components/CoverageMap";
import { CopyButton } from "@/components/CopyButton";
import { DownloadButton } from "@/components/DownloadButton";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Library report",
  description:
    "An exportable report of every Claude Code skill in the library — spot gaps in your workflow and pick the right skills for a task.",
};

export default async function ReportPage() {
  const repos = getUniqueRepos();
  const statsList = await Promise.all(repos.map((r) => getRepoStats(r)));
  const statsByRepo: Record<string, RepoStats | null> = Object.fromEntries(
    repos.map((r, i) => [r, statsList[i]]),
  );

  const markdownReport = toMarkdownReport(skills, statsByRepo);
  const cheatSheet = toCheatSheet(skills, statsByRepo);
  const jsonCatalog = JSON.stringify(toJsonCatalog(skills, statsByRepo), null, 2);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tighter text-foreground sm:text-4xl">
            Library report
          </h1>
          <p className="max-w-[60ch] text-sm leading-relaxed text-muted sm:text-base">
            A full, exportable snapshot of the library. Use it two ways: scan the coverage map to
            spot gaps in your workflow, or export the catalog and hand it to an LLM to pick the right
            skills for a task.
          </p>
        </div>

        <section aria-labelledby="export-heading" className="card space-y-5 p-6 sm:p-8">
          <div className="space-y-1.5">
            <h2 id="export-heading" className="text-xl font-semibold tracking-tight text-foreground">
              Export
            </h2>
            <p className="text-sm text-muted">
              Copy the whole library as Markdown to paste into Claude, or download it in a format of
              your choice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CopyButton text={markdownReport} label="Copy report as Markdown" />
              <span className="text-sm text-muted">Copy as Markdown</span>
            </div>
            <DownloadButton content={markdownReport} filename="skills-report.md" mime="text/markdown;charset=utf-8">
              Markdown report
            </DownloadButton>
            <DownloadButton content={cheatSheet} filename="skills-cheatsheet.md" mime="text/markdown;charset=utf-8">
              Cheat-sheet
            </DownloadButton>
            <DownloadButton content={jsonCatalog} filename="skills.json" mime="application/json">
              JSON catalog
            </DownloadButton>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
            <Link
              href="/skills.json"
              className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
            >
              <FileJs size={15} aria-hidden />
              /skills.json
              <ArrowSquareOut size={13} aria-hidden />
            </Link>
            <Link
              href="/llms.txt"
              className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
            >
              <FileText size={15} aria-hidden />
              /llms.txt
              <ArrowSquareOut size={13} aria-hidden />
            </Link>
          </div>
        </section>

        <section aria-labelledby="coverage-heading" className="mt-12 space-y-6">
          <div className="space-y-1.5">
            <h2 id="coverage-heading" className="text-xl font-semibold tracking-tight text-foreground">
              Coverage
            </h2>
            <p className="text-sm text-muted">
              Where the library is deep and where it is thin. A category marked{" "}
              <span className="font-mono text-faint">gap</span> has no skills yet.
            </p>
          </div>
          <CoverageMap skills={skills} statsByRepo={statsByRepo} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
