import { FolderOpen, Trash } from "@phosphor-icons/react/dist/ssr";
import { useRef } from "react";
import { FILES_MAX, formatBytes, VERSION_BYTES_MAX, type FileSummary } from "@/lib/skills/files";
import { FileList } from "./FileList";

interface SkillFilesProps {
  files: FileSummary[];
  /** Bytes of SKILL.md and every file, which the version limit counts. */
  bytes: number;
  /** Says what saving will do with a folder chosen since the last save. */
  note: string | null;
  disabled: boolean;
  onPick: (files: File[]) => void;
  onRemove: () => void;
}

/** The editor's files beside SKILL.md: the list, and the folder picker that replaces them. */
export function SkillFiles({ files, bytes, note, disabled, onPick, onRemove }: SkillFilesProps) {
  const picker = useRef<HTMLInputElement>(null);

  function choose() {
    const input = picker.current;
    if (!input) return;
    // React does not know webkitdirectory, so the picker becomes a folder picker here.
    input.webkitdirectory = true;
    input.click();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="skill-files-title" className="text-sm font-medium text-foreground">
          Files
        </h2>
        <span className={`text-xs tabular-nums ${bytes > VERSION_BYTES_MAX ? "font-medium text-foreground" : "text-faint"}`}>
          {files.length === 1 ? "1 file" : `${files.length} files`} · {formatBytes(bytes)} of {formatBytes(VERSION_BYTES_MAX)}
        </span>
      </div>
      <div className="rounded-[8px] border border-line bg-surface">
        {files.length ? (
          <div role="region" aria-labelledby="skill-files-title" tabIndex={0} className="max-h-[22rem] overflow-y-auto rounded-[8px]">
            <FileList files={files} />
          </div>
        ) : (
          <p className="text-pretty px-4 py-3 text-sm leading-relaxed text-muted">
            Only SKILL.md. Upload the skill&rsquo;s folder to add its scripts, references and assets.
          </p>
        )}
      </div>
      {note && (
        <p className="text-pretty text-sm text-muted" aria-live="polite">
          {note}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="button" onClick={choose} disabled={disabled} className="btn btn-ghost text-sm disabled:cursor-not-allowed disabled:opacity-60">
          <FolderOpen size={16} aria-hidden />
          Upload folder
        </button>
        {files.length > 0 && (
          <button type="button" onClick={onRemove} disabled={disabled} className="btn btn-ghost text-sm disabled:cursor-not-allowed disabled:opacity-60">
            <Trash size={16} aria-hidden />
            Remove files
          </button>
        )}
        <input
          ref={picker}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            const chosen = [...(event.currentTarget.files ?? [])];
            // Cleared, so choosing the same folder again after an edit reads it again.
            event.currentTarget.value = "";
            if (chosen.length) onPick(chosen);
          }}
        />
      </div>
      <p id="skill-files-hint" className="text-xs text-faint">
        Choose the folder that holds SKILL.md: its SKILL.md replaces the text above, and its other files replace these. Up to{" "}
        {FILES_MAX} files and {formatBytes(VERSION_BYTES_MAX)} in all. Scripts that start with #! are marked executable. .git,
        node_modules, __pycache__ and metadata.json are left out, as npx skills leaves them out.
      </p>
    </div>
  );
}
