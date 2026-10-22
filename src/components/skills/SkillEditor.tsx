"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { startTransition, useActionState, useDeferredValue, useMemo, useRef, useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { FormMessage } from "@/components/auth/FormMessage";
import { CATEGORY_LABELS } from "@/data/types";
import { createSkill, updateSkill } from "@/lib/skills/actions";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";
import { riskOf, scanSkillMd } from "@/lib/skills/scan";
import { DESCRIPTION_MAX, normalizeSkillMd, parseSkillMd, SKILL_MD_MAX, TAGS_MAX } from "@/lib/skills/schemas";
import { FindingList } from "./FindingList";
import { RiskBadge } from "./RiskBadge";

interface SkillEditorProps {
  /** The skill being edited; without one, saving creates a skill. */
  skillId?: string;
  initial: { skillMd: string; category: string; tags: string };
}

/** Checks SKILL.md on every change, the same way the server checks it on save. */
function check(source: string) {
  const text = normalizeSkillMd(source);
  const parsed = parseSkillMd(text);
  // Past the limit the file cannot be saved, so it is not worth scanning on every keystroke.
  const findings = text.length > SKILL_MD_MAX ? [] : scanSkillMd(text, parsed.ok ? parsed.frontmatter : undefined);
  return { parsed, findings, risk: riskOf(findings) };
}

export function SkillEditor({ skillId, initial }: SkillEditorProps) {
  const action = useMemo(() => keepDraftOnFailure(skillId ? updateSkill.bind(null, skillId) : createSkill), [skillId]);
  const [state, formAction, pending] = useActionState(action, null);
  const [skillMd, setSkillMd] = useState(initial.skillMd);
  const [category, setCategory] = useState(initial.category);
  const [tags, setTags] = useState(initial.tags);
  const [editedSinceSave, setEditedSinceSave] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Typing stays responsive on a long file: the check renders from a value that may lag a keystroke.
  const deferred = useDeferredValue(skillMd);
  const { parsed, findings, risk } = useMemo(() => check(deferred), [deferred]);

  function edit(update: () => void) {
    update();
    setEditedSinceSave(true);
  }

  // Dispatched by hand, not through <form action>: React resets a form after its action, which puts
  // a controlled <select> back on its first option, and the next save would store that category.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditedSinceSave(false);
    const formData = new FormData(event.currentTarget);
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
            Nothing flagged. The scan looks for hidden characters, scripts run straight from a download, credentials
            near a network call, encoded commands, broad allowed-tools and destructive commands. No findings does not
            prove a skill is safe.
          </p>
        )}
      </section>

      {state && !state.ok && !pending && <FormMessage tone="error">{state.error}</FormMessage>}
      {state?.ok && !editedSinceSave && !pending && <FormMessage tone="success">{state.message}</FormMessage>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || skillMd.length > SKILL_MD_MAX}
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
