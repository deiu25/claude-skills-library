"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { FormMessage } from "@/components/auth/FormMessage";
import { TakesFocus } from "@/components/TakesFocus";
import { deleteSkill } from "@/lib/skills/actions";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";

interface DeleteSkillProps {
  skillId: string;
  name: string;
  versionCount: number;
}

// Both buttons are ghost: the accent means "go ahead", and deleting cannot be undone.
export function DeleteSkill({ skillId, name, versionCount }: DeleteSkillProps) {
  const action = useMemo(() => keepDraftOnFailure(deleteSkill.bind(null, skillId)), [skillId]);
  const [state, formAction, pending] = useActionState(action, null);
  const [confirming, setConfirming] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const keptIt = useRef(false);

  // "Keep it" removes the button that had focus; hand focus back to the one that opened the question.
  useEffect(() => {
    if (!confirming && keptIt.current) trigger.current?.focus();
  }, [confirming]);

  if (!confirming) {
    return (
      <button ref={trigger} type="button" onClick={() => setConfirming(true)} className="btn btn-ghost text-sm">
        Delete skill
      </button>
    );
  }
  return (
    <TakesFocus className="space-y-5">
      <FormMessage tone="warning">
        This deletes <span className="break-all font-mono">{name}</span> and {versionCount === 1 ? "its version" : `all ${versionCount} versions`}.
        It cannot be undone.
      </FormMessage>
      {state && !state.ok && <FormMessage tone="error">{state.error}</FormMessage>}
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60">
          {pending ? "Deleting…" : "Delete for good"}
        </button>
        <button
          type="button"
          onClick={() => {
            keptIt.current = true;
            setConfirming(false);
          }}
          disabled={pending}
          className="btn btn-ghost text-sm"
        >
          Keep it
        </button>
      </form>
    </TakesFocus>
  );
}
