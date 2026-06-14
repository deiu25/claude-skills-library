"use client";

import { DownloadSimple } from "@phosphor-icons/react";

interface DownloadButtonProps {
  /** File contents. */
  content: string;
  /** Suggested file name, e.g. "skills.json". */
  filename: string;
  /** MIME type, defaults to plain text. */
  mime?: string;
  children: React.ReactNode;
}

/** Triggers a client-side download of `content` as `filename`. No backend. */
export function DownloadButton({
  content,
  filename,
  mime = "text/plain;charset=utf-8",
  children,
}: DownloadButtonProps) {
  function download() {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className="btn btn-ghost text-sm">
      <DownloadSimple size={16} aria-hidden />
      {children}
    </button>
  );
}
