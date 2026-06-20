"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

interface CopyForClaudeButtonProps {
  /** Markdown summary copied to the clipboard for pasting into Claude. */
  text: string;
}

export function CopyForClaudeButton({ text }: CopyForClaudeButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={copied ? "Copied" : "Copy for Claude"}
      className="btn btn-ghost text-sm"
    >
      {copied ? (
        <Check size={16} weight="bold" className="text-accent" aria-hidden />
      ) : (
        <Copy size={16} aria-hidden />
      )}
      {copied ? "Copied" : "Copy for Claude"}
    </button>
  );
}
