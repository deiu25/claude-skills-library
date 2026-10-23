"use client";

import Link from "next/link";
import { startTransition, useActionState, useMemo, type FormEvent } from "react";
import { FormMessage } from "@/components/auth/FormMessage";
import { TakesFocus } from "@/components/TakesFocus";
import { submitReport } from "@/lib/moderation/actions";
import { DETAILS_MAX, DETAILS_MIN, REASON_LABELS, REPORT_REASONS, type TargetType } from "@/lib/moderation/schemas";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";

interface ReportFormProps {
  targetType: TargetType;
  /** The skill's id, or the profile's username. */
  targetKey: string;
  /** Where the reported page is, to go back to. */
  path: string;
}

export function ReportForm({ targetType, targetKey, path }: ReportFormProps) {
  const action = useMemo(() => keepDraftOnFailure(submitReport), []);
  const [state, formAction, pending] = useActionState(action, null);

  // Dispatched by hand, not through <form action>: React's reset after an action would empty the
  // text of a report the server refused.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  if (state?.ok) {
    return (
      <TakesFocus className="space-y-5">
        <FormMessage tone="success">{state.message}</FormMessage>
        <Link href={path} className="btn btn-ghost text-sm">
          Back to the page
        </Link>
      </TakesFocus>
    );
  }

  return (
    <form method="post" onSubmit={submit} className="space-y-6">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetKey" value={targetKey} />

      <fieldset disabled={pending} className="space-y-2">
        <legend className="mb-2 text-sm font-medium text-foreground">What is wrong?</legend>
        <div className="divide-y divide-line rounded-[8px] border border-line bg-surface">
          {REPORT_REASONS.map((reason) => (
            <label key={reason} className="flex min-h-11 cursor-pointer gap-3 px-4 py-3">
              <input type="radio" name="reason" value={reason} required className="mt-0.5 size-4 shrink-0 accent-accent" />
              <span className="text-pretty text-sm text-foreground">{REASON_LABELS[reason]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="details" className="block text-sm font-medium text-foreground">
          What exactly, and where
        </label>
        <textarea
          id="details"
          name="details"
          required
          minLength={DETAILS_MIN}
          maxLength={DETAILS_MAX}
          rows={7}
          disabled={pending}
          aria-describedby="details-hint"
          className="input-base block resize-y px-3.5 py-3 text-sm leading-relaxed"
        />
        <p id="details-hint" className="text-pretty text-xs text-faint">
          Name the file or line, and say why it breaks the terms of use or the law. A person reads it; the reported
          author does not.
        </p>
      </div>

      <label className="flex min-h-11 cursor-pointer gap-3 text-sm leading-relaxed text-foreground">
        <input type="checkbox" name="goodFaith" required disabled={pending} className="mt-1 size-4 shrink-0 accent-accent" />
        <span>I believe in good faith that this report is accurate and complete.</span>
      </label>

      {state && !state.ok && <FormMessage tone="error">{state.error}</FormMessage>}
      <button type="submit" disabled={pending} className="btn btn-primary text-sm disabled:cursor-wait disabled:opacity-60">
        {pending ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}
