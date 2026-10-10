"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

// Critically damped: a click carries no momentum, so nothing overshoots.
// Springs retarget from the on-screen value, so either can be interrupted.
const SLIDE = { type: "spring", bounce: 0, duration: 0.4 } as const;
const GROW = { type: "spring", bounce: 0, duration: 0.3 } as const;

/**
 * Sticky bar for the multi-select "build my set" flow. Exports only the chosen
 * skills, reusing the shared report serializers, and offers a share link
 * (the current URL already encodes the selection in its `sel` param).
 * Mount it inside <AnimatePresence>: it rises from the bottom edge and leaves
 * the same way, and the export panel grows out of its trigger.
 */
export function SelectionBar({ selected, statsByRepo, onClear }: SelectionBarProps) {
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  // Reduced motion keeps only the cross-fade: no slide, no growth.
  const reduceMotion = useReducedMotion();
  const below = reduceMotion ? 0 : "100%";
  const tucked = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 };

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

  // Only the wrapper moves; the glass surfaces fade themselves, because an
  // ancestor below full opacity switches their backdrop blur off.
  return (
    <motion.div
      className="sticky bottom-4 z-30 mx-auto w-full max-w-2xl"
      initial={{ y: below }}
      animate={{ y: 0 }}
      exit={{ y: below }}
      transition={SLIDE}
    >
      <AnimatePresence propagate>
        {open ? (
          <motion.div
            key="export-panel"
            className="material-thick mb-2 origin-bottom-right space-y-4 rounded-[14px] p-5"
            initial={tucked}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={tucked}
            transition={GROW}
          >
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
                  <Check size={16} weight="bold" className="animate-pop-in text-accent" aria-hidden />
                ) : (
                  <LinkSimple size={16} aria-hidden />
                )}
                {linkCopied ? "Link copied" : "Copy share link"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="material-thick flex items-center justify-between gap-3 rounded-[14px] px-4 py-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={SLIDE}
      >
        <span className="font-mono text-sm text-foreground">
          {selected.length} selected
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClear} className="btn btn-ghost text-sm">
            Clear
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="btn btn-primary text-sm"
          >
            <Export size={16} aria-hidden />
            Export selection
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
