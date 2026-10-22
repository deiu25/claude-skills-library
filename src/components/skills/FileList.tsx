import { formatBytes, type FileSummary } from "@/lib/skills/files";

/** A version's files beside SKILL.md: each path, its size, and whether it runs as a script or went unscanned. */
export function FileList({ files }: { files: FileSummary[] }) {
  return (
    <ul className="divide-y divide-line">
      {files.map((file) => (
        <li key={file.path} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5">
          <span className="min-w-0 break-all font-mono text-[0.8125rem] text-foreground">{file.path}</span>
          <span className="flex shrink-0 items-baseline gap-3 text-xs tabular-nums text-faint">
            {file.executable && <span className="text-muted">Executable</span>}
            {!file.scanned && <span>Binary, not scanned</span>}
            <span>{formatBytes(file.size)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
