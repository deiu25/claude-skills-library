"use client";

import { startTransition, useActionState, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FormMessage } from "@/components/auth/FormMessage";
import { decideReport, takeDown } from "@/lib/moderation/actions";
import { DETAILS_MAX, DETAILS_MIN, GROUND_LABELS, GROUNDS, type Decision, type TargetType } from "@/lib/moderation/schemas";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";

const DECISIONS: Record<TargetType, { value: Decision; label: string; hint: string }[]> = {
  skill: [
    { value: "remove", label: "Remove the skill", hint: "Its page and download go. Its owner keeps it, and can never publish it again." },
    { value: "suspend", label: "Suspend its author", hint: "They cannot sign in, and every skill they published is hidden." },
    { value: "dismiss", label: "Dismiss the report", hint: "Nothing changes. Its sender hears that we did not act." },
  ],
  user: [
    { value: "suspend", label: "Suspend the account", hint: "It cannot sign in, and every skill it published is hidden." },
    { value: "dismiss", label: "Dismiss the report", hint: "Nothing changes. Its sender hears that we did not act." },
  ],
};

const RADIO_ROW = "flex min-h-11 cursor-pointer gap-3 px-4 py-3";
const RADIO = "mt-0.5 size-4 shrink-0 accent-accent";

interface ModerationFormProps {
  /** The open report this form decides. Without one, it takes down a pasted skill address or username. */
  report?: { id: string; targetType: TargetType };
}

// Every decision button is ghost: removing and suspending are destructive, and the accent means "go ahead".
export function ModerationForm({ report }: ModerationFormProps) {
  const reportId = report?.id;
  const action = useMemo(() => keepDraftOnFailure(reportId ? decideReport.bind(null, reportId) : takeDown), [reportId]);
  const [state, formAction, pending] = useActionState(action, null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const needsReason = !report || (decision !== null && decision !== "dismiss");
  const id = reportId ?? "take-down";

  // Dispatched by hand, not through <form action>: React's reset after an action would drop the
  // reason typed into a decision the server refused.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  // A decided report leaves the list; the take-down form stays, so it empties itself after a success.
  useEffect(() => {
    if (state?.ok && !reportId) form.current?.reset();
  }, [state, reportId]);

  return (
    <form ref={form} method="post" onSubmit={submit} className="space-y-5">
      {report ? (
        <fieldset disabled={pending} className="divide-y divide-line rounded-[8px] border border-line bg-surface">
          <legend className="sr-only">Decision</legend>
          {DECISIONS[report.targetType].map((option) => (
            <label key={option.value} className={RADIO_ROW}>
              <input
                type="radio"
                name="decision"
                value={option.value}
                checked={decision === option.value}
                onChange={() => setDecision(option.value)}
                required
                className={RADIO}
              />
              <span className="min-w-0 space-y-0.5">
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="block text-pretty text-xs leading-relaxed text-faint">{option.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="space-y-2">
          <label htmlFor={`${id}-target`} className="block text-sm font-medium text-foreground">
            Skill address or username
          </label>
          <input
            id={`${id}-target`}
            name="target"
            type="text"
            required
            disabled={pending}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-describedby={`${id}-target-hint`}
            className="input-base font-mono text-sm"
          />
          <p id={`${id}-target-hint`} className="text-pretty text-xs text-faint">
            A skill&rsquo;s address removes that skill; a username suspends that account.
          </p>
        </div>
      )}

      {needsReason && (
        <>
          <fieldset disabled={pending} className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-foreground">Ground</legend>
            <div className="divide-y divide-line rounded-[8px] border border-line bg-surface">
              {GROUNDS.map((ground) => (
                <label key={ground} className={RADIO_ROW}>
                  <input type="radio" name="ground" value={ground} required className={RADIO} />
                  <span className="text-sm text-foreground">{GROUND_LABELS[ground]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <label htmlFor={`${id}-explanation`} className="block text-sm font-medium text-foreground">
              Reason
            </label>
            <textarea
              id={`${id}-explanation`}
              name="explanation"
              required
              minLength={DETAILS_MIN}
              maxLength={DETAILS_MAX}
              rows={4}
              disabled={pending}
              aria-describedby={`${id}-explanation-hint`}
              className="input-base block resize-y px-3.5 py-3 text-sm leading-relaxed"
            />
            <p id={`${id}-explanation-hint`} className="text-pretty text-xs text-faint">
              The account gets it by email, word for word, with how to contest it. Say what breaks the rule and where;
              for illegal content, name the law.
            </p>
          </div>
        </>
      )}

      {state && !state.ok && <FormMessage tone="error">{state.error}</FormMessage>}
      {state?.ok && <FormMessage tone="success">{state.message}</FormMessage>}
      <button
        type="submit"
        disabled={pending || (report !== undefined && decision === null)}
        className="btn btn-ghost text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Applying…" : report ? "Apply decision" : "Take down"}
      </button>
    </form>
  );
}
