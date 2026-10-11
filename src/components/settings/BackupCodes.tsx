"use client";

import { DownloadButton } from "@/components/DownloadButton";
import { FormMessage } from "@/components/auth/FormMessage";
import { SITE_NAME } from "@/lib/site";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

interface BackupCodesProps {
  codes: string[];
  justEnabled: boolean;
  onDone: () => void;
}

/** Backup codes, shown once: right after two-factor turns on, or after new ones are made. */
export function BackupCodes({ codes, justEnabled, onDone }: BackupCodesProps) {
  const { copied, copy } = useCopyToClipboard();
  const text = codes.join("\n");
  return (
    <div className="space-y-5">
      {justEnabled && <FormMessage tone="success">Two-factor is on.</FormMessage>}
      <p className="text-sm leading-relaxed text-muted">
        Save these backup codes somewhere safe. Each one signs you in once if you lose your authenticator app. They
        are not shown again, and any older codes no longer work.
      </p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-[8px] border border-line bg-surface p-4 font-mono text-[0.8125rem] text-foreground">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => copy(text)} className="btn btn-ghost text-sm">
          {copied ? "Copied" : "Copy codes"}
        </button>
        <DownloadButton content={`${SITE_NAME} backup codes\n\n${text}\n`} filename="backup-codes.txt">
          Download
        </DownloadButton>
        <button type="button" onClick={onDone} className="btn btn-primary text-sm">
          I saved them
        </button>
      </div>
    </div>
  );
}
