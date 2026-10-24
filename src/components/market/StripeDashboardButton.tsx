"use client";

import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { useActionState } from "react";
import { FormMessage } from "@/components/auth/FormMessage";
import { openStripeDashboard } from "@/lib/market/actions";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";

const action = keepDraftOnFailure(openStripeDashboard);

/** Signs a ready seller in to their Express Dashboard, with a single-use link made on the click. */
export function StripeDashboardButton() {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-5">
      {state && !state.ok && <FormMessage tone="error">{state.error}</FormMessage>}
      <button type="submit" disabled={pending} className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60">
        {pending ? "Opening Stripe…" : "Open your Stripe dashboard"}
        {!pending && <ArrowSquareOut size={16} aria-hidden />}
      </button>
    </form>
  );
}
