"use client";

import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { startTransition, useActionState, type FormEvent } from "react";
import { FormMessage } from "@/components/auth/FormMessage";
import { startSelling } from "@/lib/market/actions";
import { SELLER_COUNTRIES } from "@/lib/market/countries";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";

const action = keepDraftOnFailure(startSelling);

interface StartSellingProps {
  /** A seller with a Stripe account goes back to Stripe's form; without one, they choose a country first. */
  hasAccount: boolean;
  label: string;
  primary: boolean;
}

/** Sends the user to Stripe's onboarding form, opening their Stripe account first if they have none. */
export function StartSelling({ hasAccount, label, primary }: StartSellingProps) {
  const [state, formAction, pending] = useActionState(action, null);

  // Dispatched by hand, not through <form action>: React's reset after an action would put the
  // country back on "Choose a country" when Stripe refuses the request.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form method="post" onSubmit={submit} className="space-y-5">
      {!hasAccount && (
        <div className="space-y-2">
          <label htmlFor="country" className="block text-sm font-medium text-foreground">
            Country
          </label>
          <select id="country" name="country" required defaultValue="" aria-describedby="country-hint" className="input-base cursor-pointer">
            <option value="" disabled>
              Choose a country
            </option>
            {SELLER_COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <p id="country-hint" className="text-pretty text-xs leading-relaxed text-faint">
            Where you or your business are based. Stripe fixes it once your account opens, and pays out to a bank
            account there.
          </p>
        </div>
      )}
      {state && !state.ok && <FormMessage tone="error">{state.error}</FormMessage>}
      <button
        type="submit"
        disabled={pending}
        className={`btn ${primary ? "btn-primary" : "btn-ghost"} text-sm disabled:cursor-wait disabled:opacity-60`}
      >
        {pending ? "Opening Stripe…" : label}
        {!pending && <ArrowSquareOut size={16} aria-hidden />}
      </button>
    </form>
  );
}
