"use client";

import Link from "next/link";
import { ArrowSquareOut, Check, Copy, FileJs, FileText } from "@phosphor-icons/react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

interface HeroInstallProps {
  /** The "Get all Skills" master prompt — toInstallAllPrompt(skills). */
  installPrompt: string;
  /** Full library digest — toMarkdownReport(skills, statsByRepo). */
  markdownReport: string;
  skillCount: number;
  categoryCount: number;
  /** Pre-formatted combined star count, e.g. "2.1k". */
  starsLabel: string;
}

const RAW_ENDPOINTS = [
  { href: "/install-all.txt", label: "/install-all.txt", Icon: FileText },
  { href: "/skills.json", label: "/skills.json", Icon: FileJs },
  { href: "/llms.txt", label: "/llms.txt", Icon: FileText },
] as const;

/**
 * Hero asset: a real, interactive panel that installs or exports the whole
 * library. Every control does real work — it copies the actual artifacts the
 * /report page generates (the install-all prompt and the Markdown report) and
 * links to the live raw endpoints. No faked terminal transcript.
 */
export function HeroInstall({
  installPrompt,
  markdownReport,
  skillCount,
  categoryCount,
  starsLabel,
}: HeroInstallProps) {
  const prompt = useCopyToClipboard();
  const markdown = useCopyToClipboard();

  return (
    <div className="card space-y-5 p-6 sm:p-7">
      <div className="space-y-2">
        <span className="font-mono text-xs text-faint">~/.claude/skills</span>
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          Install the whole library
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          One prompt. Claude Code installs every skill, asks global or project, and skips what you
          already have.
        </p>
      </div>

      <p className="font-mono text-xs text-faint">
        {skillCount} skills, {categoryCount} categories, {starsLabel}★ combined
      </p>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => prompt.copy(installPrompt)}
          aria-label={prompt.copied ? "Copied" : "Copy install-all prompt"}
          className="btn btn-primary w-full text-sm"
        >
          {prompt.copied ? (
            <Check size={16} weight="bold" aria-hidden />
          ) : (
            <Copy size={16} aria-hidden />
          )}
          {prompt.copied ? "Copied" : "Copy install-all prompt"}
        </button>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => markdown.copy(markdownReport)}
            aria-label={markdown.copied ? "Copied" : "Copy library as Markdown"}
            className="btn btn-ghost text-sm"
          >
            {markdown.copied ? (
              <Check size={16} weight="bold" className="text-accent" aria-hidden />
            ) : (
              <Copy size={16} aria-hidden />
            )}
            {markdown.copied ? "Copied" : "Copy as Markdown"}
          </button>
          <Link href="/report" className="btn btn-ghost text-sm">
            Full report
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4 text-xs">
        {RAW_ENDPOINTS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent-strong"
          >
            <Icon size={14} aria-hidden />
            {label}
            <ArrowSquareOut size={12} aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
