"use client";

import { useActionState, useMemo } from "react";
import { liftSuspension } from "@/lib/moderation/actions";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";

const ROW_BUTTON =
  "inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-[8px] px-3 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground disabled:cursor-wait disabled:opacity-60";

/** A suspended account's row action. On success the account leaves the list. */
export function LiftSuspension({ userId, name }: { userId: string; name: string }) {
  const action = useMemo(() => keepDraftOnFailure(liftSuspension.bind(null, userId)), [userId]);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex shrink-0 flex-col items-end">
      <button type="submit" disabled={pending} aria-label={`Lift the suspension of ${name}`} className={ROW_BUTTON}>
        {pending ? "Lifting…" : "Lift suspension"}
      </button>
      {state && !state.ok && (
        <p role="alert" className="max-w-56 px-3 pb-1 text-right text-xs text-foreground">
          {state.error}
        </p>
      )}
    </form>
  );
}
