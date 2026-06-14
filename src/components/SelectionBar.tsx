"use client";

import { useState } from "react";
import { Check, Export, LinkSimple, X } from "@phosphor-icons/react";
import type { Skill } from "@/data/types";
import type { RepoStats } from "@/lib/github";
import { toJsonCatalog, toMarkdownReport } from "@/lib/report";
import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";

interface SelectionBarProps {
  selected: Skill[];
  statsByRepo: Record<string, RepoStats | null>;
  onClear: () => void;
}

/**
 * Sticky bar for the multi-select "build my set" flow. Exports only the chosen
 * skills, reusing the shared report serializers, and offers a share link
 * (the current URL already encodes the selection in its `sel` param).
 */
export function SelectionBar({ selected, statsByRepo, onClear }: SelectionBarProps) {
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  if (selected.length === 0) return null;

  const markdown = toMarkdownReport(selected, statsByRepo);
  const json = JSON.stringify(toJsonCatalog(selected, statsByRepo), null, 2);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1600);
    } catch {
      // Clipboard unavailable; nothing sensible to do.
    }
  }

  return (
    <div className="sticky bottom-4 z-30 mx-auto w-full max-w-2xl">
      {open ? (
        <div className="card mb-2 space-y-4 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Export {selected.length} selected
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close export panel"
              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-muted hover:text-foreground"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CopyButton text={markdown} label="Copy selection as Markdown" />
              <span className="text-sm text-muted">Markdown</span>
            </div>
            <DownloadButton content={markdown} filename="selected-skills.md" mime="text/markdown;charset=utf-8">
              .md
            </DownloadButton>
            <DownloadButton content={json} filename="selected-skills.json" mime="application/json">
              .json
            </DownloadButton>
            <button type="button" onClick={copyLink} className="btn btn-ghost text-sm">
              {linkCopied ? (
                <Check size={16} weight="bold" className="text-accent" aria-hidden />
              ) : (
                <LinkSimple size={16} aria-hidden />
              )}
              {linkCopied ? "Link copied" : "Copy share link"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-surface px-4 py-3 shadow-lg">
        <span className="font-mono text-sm text-foreground">
          {selected.length} selected
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClear} className="btn btn-ghost text-sm">
            Clear
          </button>
          <button type="button" onClick={() => setOpen((v) => !v)} className="btn btn-primary text-sm">
            <Export size={16} aria-hidden />
            Export selection
          </button>
        </div>
      </div>
    </div>
  );
}
