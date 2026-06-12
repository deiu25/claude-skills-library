"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy to clipboard" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable; nothing sensible to do client-side
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-line text-muted transition-colors hover:border-faint hover:text-foreground active:scale-[0.98]"
    >
      {copied ? (
        <Check size={16} weight="bold" className="text-accent" aria-hidden />
      ) : (
        <Copy size={16} aria-hidden />
      )}
    </button>
  );
}
