import type { ReactNode } from "react";
import { CopyButton } from "./CopyButton";

interface TerminalBlockProps {
  title?: string;
  /** When set, shows a copy button for this exact text. */
  copyText?: string;
  children: ReactNode;
}

/** Terminal-styled surface for real commands and real file content. */
export function TerminalBlock({ title = "terminal", copyText, children }: TerminalBlockProps) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-terminal-bg">
      <div className="flex items-center justify-between gap-3 border-b border-line/60 px-4 py-2.5">
        <span className="font-mono text-xs text-faint">{title}</span>
        {copyText ? <CopyButton text={copyText} label="Copy command" /> : null}
      </div>
      <div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-terminal-fg">
        {children}
      </div>
    </div>
  );
}
