"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy to clipboard" }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={copied ? "Copied" : label}
      className="press relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line text-muted before:absolute before:-inset-1 before:content-[''] hover:border-faint hover:text-foreground"
    >
      {copied ? (
        <Check size={16} weight="bold" className="animate-pop-in text-accent" aria-hidden />
      ) : (
        <Copy size={16} aria-hidden />
      )}
    </button>
  );
}
