"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { startTransition, useActionState, useDeferredValue, useMemo, useRef, useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { FormMessage } from "@/components/auth/FormMessage";
import { CATEGORY_LABELS } from "@/data/types";
import { createSkill, updateSkill } from "@/lib/skills/actions";
import { readSkillFolder, VERSION_BYTES_MAX, type FileSummary, type PickedFile } from "@/lib/skills/files";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";
import { combineFindings, riskOf, scanSkillMd, type Finding } from "@/lib/skills/scan";
import { DESCRIPTION_MAX, normalizeSkillMd, parseSkillMd, SKILL_MD_MAX, TAGS_MAX } from "@/lib/skills/schemas";
import { FindingList } from "./FindingList";
import { RiskBadge } from "./RiskBadge";
import { SkillFiles } from "./SkillFiles";

interface SkillEditorProps {
  /** The skill being edited; without one, saving creates a skill. */
  skillId?: string;
  /** The latest version's content; its files come as summaries, with the findings their scan saved. */
  initial: { skillMd: string; category: string; tags: string; files: FileSummary[]; fileFindings: Finding[] };
}

/** A folder chosen since the last save, which the next save stores in place of the saved files. */
interface Upload {
  files: PickedFile[];
  findings: Finding[];
  skipped: number;
}

/** Checks SKILL.md on every change, the same way the server checks it on save, beside the files' findings. */
function check(source: string, fileFindings: Finding[]) {
  const text = normalizeSkillMd(source);
  const parsed = parseSkillMd(text);
  // Past the limit the file cannot be saved, so it is not worth scanning on every keystroke.
  const skillMdFindings = text.length > SKILL_MD_MAX ? [] : scanSkillMd(text, parsed.ok ? parsed.frontmatter : undefined);
  const findings = combineFindings(skillMdFindings, fileFindings);
  return { parsed, findings, risk: riskOf(findings), skillMdBytes: new TextEncoder().encode(text).length };
}

function uploadNote({ files, skipped }: Upload): string {
  if (!files.length) return "The next save stores SKILL.md alone, without these files.";
  const left = skipped ? ` ${skipped === 1 ? "1 file" : `${skipped} files`} that npx skills does not install ${skipped === 1 ? "was" : "were"} left out.` : "";
  return `From the folder you chose. The next save stores these files.${left}`;
}

export function SkillEditor({ skillId, initial }: SkillEditorProps) {
  const action = useMemo(() => keepDraftOnFailure(skillId ? updateSkill.bind(null, skillId) : createSkill), [skillId]);
  const [state, formAction, pending] = useActionState(action, null);
  const [skillMd, setSkillMd] = useState(initial.skillMd);
  const [category, setCategory] = useState(initial.category);
  const [tags, setTags] = useState(initial.tags);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [editedSinceSave, setEditedSinceSave] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);

  // A save stores the chosen folder's files, and the page then lists them as the saved ones.
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state?.ok) setUpload(null);
  }

  const files: FileSummary[] = upload?.files ?? initial.files;
  const fileFindings = upload?.findings ?? initial.fileFindings;

  // Typing stays responsive on a long file: the check renders from a value that may lag a keystroke.
  const deferred = useDeferredValue(skillMd);
  const { parsed, findings, risk, skillMdBytes } = useMemo(() => check(deferred, fileFindings), [deferred, fileFindings]);
  const bytes = files.reduce((sum, file) => sum + file.size, skillMdBytes);

  function edit(update: () => void) {
    update();
    setEditedSinceSave(true);
  }

  async function pickFolder(chosen: File[]) {
    const folder = await readSkillFolder(chosen);
    if (!folder.ok) {
      setFolderError(folder.error);
      return;
    }
    setFolderError(null);
    edit(() => {
      setSkillMd(folder.skillMd);
      setUpload({ files: folder.files, findings: folder.findings, skipped: folder.skipped });
    });
  }

  // Dispatched by hand, not through <form action>: React resets a form after its action, which puts
  // a controlled <select> back on its first option, and the next save would store that category.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditedSinceSave(false);
    setFolderError(null);
    const formData = new FormData(event.currentTarget);
    if (upload) {
      formData.set("fileMode", "replace");
      for (const { path, file } of upload.files) {
        formData.append("filePath", path);
        formData.append("file", file);
      }
    }
    startTransition(() => formAction(formData));
  }

  /** Selects a whole line, which also scrolls it into view. */
  function goToLine(line: number) {
    const element = textarea.current;
    if (!element) return;
    const lines = element.value.split("\n");
    const start = lines.slice(0, line - 1).reduce((offset, text) => offset + text.length + 1, 0);
    element.focus();
    element.setSelectionRange(start, start + (lines[line - 1]?.length ?? 0));
  }

  const summary = `${parsed.ok ? "Frontmatter is valid." : `${parsed.problems.length} frontmatter problem${parsed.problems.length === 1 ? "" : "s"}.`} ${
    findings.length ? `${findings.length} finding${findings.length === 1 ? "" : "s"}, ${risk} risk.` : "No findings."
  }`;

  return (
    // method="post" keeps a submit before hydration from putting the file in the URL.
    <form method="post" onSubmit={submit} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-foreground">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            value={category}
            onChange={(event) => edit(() => setCategory(event.target.value))}
            className="input-base cursor-pointer"
          >
            <option value="" disabled>
              Choose a category
            </option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Tags"
          name="tags"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={tags}
          onChange={(event) => edit(() => setTags(event.target.value))}
          hint={`Up to ${TAGS_MAX}, separated by commas, such as pdf, forms.`}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="skillMd" className="block font-mono text-sm font-medium text-foreground">
            SKILL.md
          </label>
          <span className={`text-xs tabular-nums ${skillMd.length > SKILL_MD_MAX ? "font-medium text-foreground" : "text-faint"}`}>
            {skillMd.length.toLocaleString("en")} of {SKILL_MD_MAX.toLocaleString("en")} characters
          </span>
        </div>
        <textarea
          ref={textarea}
          id="skillMd"
          name="skillMd"
          required
          rows={22}
          value={skillMd}
          onChange={(event) => edit(() => setSkillMd(event.target.value))}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          aria-describedby="skillMd-hint skill-check-summary"
          className="input-base block min-h-[24rem] resize-y px-4 py-3 font-mono text-[0.8125rem] leading-relaxed"
        />
        <p id="skillMd-hint" className="text-xs text-faint">
          Start with frontmatter: a name in lowercase letters, digits and hyphens, and a description of what the skill
          does and when to use it. Checked and scanned as you type.
        </p>
      </div>

      <SkillFiles
        files={files}
        bytes={bytes}
        note={upload ? uploadNote(upload) : null}
        disabled={pending}
        onPick={pickFolder}
        onRemove={() => edit(() => setUpload({ files: [], findings: [], skipped: 0 }))}
      />

      <section aria-labelledby="skill-check-title" className="rounded-[8px] border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 id="skill-check-title" className="text-sm font-medium text-foreground">
            Check
          </h2>
          <RiskBadge risk={risk} />
          <p id="skill-check-summary" className="sr-only" aria-live="polite">
            {summary}
          </p>
        </div>
        <div className="flex gap-3 border-b border-line px-4 py-3">
          {parsed.ok ? (
            <CheckCircle size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          ) : (
            <WarningCircle size={18} className="mt-0.5 shrink-0 text-foreground" aria-hidden />
          )}
          <div className="min-w-0 space-y-1 text-sm leading-relaxed">
            <p className="font-medium text-foreground">Frontmatter</p>
            {parsed.ok ? (
              <p className="text-muted">
                Name <span className="break-all font-mono text-foreground">{parsed.frontmatter.name}</span>, description of{" "}
                {parsed.frontmatter.description.length.toLocaleString("en")} of {DESCRIPTION_MAX.toLocaleString("en")} characters.
              </p>
            ) : (
              <ul className="space-y-1 text-muted">
                {parsed.problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {findings.length ? (
          <FindingList findings={findings} onSelect={goToLine} />
        ) : (
          <p className="text-pretty px-4 py-3 text-sm leading-relaxed text-muted">
            Nothing flagged. The scan reads SKILL.md and every text file for hidden characters, scripts run straight
            from a download, credentials near a network call, encoded commands and destructive commands, and
            SKILL.md&rsquo;s allowed-tools for broad access. No findings does not prove a skill is safe.
          </p>
        )}
      </section>

      {folderError ? (
        <FormMessage tone="error">{folderError}</FormMessage>
      ) : (
        <>
          {state && !state.ok && !pending && <FormMessage tone="error">{state.error}</FormMessage>}
          {state?.ok && !editedSinceSave && !pending && <FormMessage tone="success">{state.message}</FormMessage>}
        </>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || skillMd.length > SKILL_MD_MAX || bytes > VERSION_BYTES_MAX}
          className="btn btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : skillId ? "Save" : "Create skill"}
        </button>
        {!skillId && (
          <Link href="/dashboard/skills" className="btn btn-ghost text-sm">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
