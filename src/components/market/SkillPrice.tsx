"use client";

import { startTransition, useActionState, useMemo, useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { FormMessage } from "@/components/auth/FormMessage";
import { removeSkillPrice, setSkillPrice } from "@/lib/market/actions";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";

interface SkillPriceProps {
  skillId: string;
  /** The price as a buyer reads it, such as "€9.99", or null while the skill is free. */
  price: string | null;
  /** What the price field starts with, such as "9.99". */
  inputValue: string;
  /** The range a price can take, under the field. */
  hint: string;
}

/** A ready seller's price for one skill: the price first, then the field to change it. */
export function SkillPrice({ skillId, price, inputValue, hint }: SkillPriceProps) {
  const save = useMemo(() => keepDraftOnFailure(setSkillPrice.bind(null, skillId)), [skillId]);
  const free = useMemo(() => keepDraftOnFailure(removeSkillPrice.bind(null, skillId)), [skillId]);
  const [saved, saveAction, saving] = useActionState(save, null);
  const [freed, freeAction, freeing] = useActionState(free, null);
  const [last, setLast] = useState<"save" | "free" | null>(null);
  const pending = saving || freeing;
  // One message per form: the answer to whichever button was pressed last.
  const result = pending ? null : last === "save" ? saved : last === "free" ? freed : null;

  // Dispatched by hand, not through <form action>: React's reset after an action would put back
  // the price the page loaded with, and the field would no longer show what was saved.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLast("save");
    startTransition(() => saveAction(formData));
  }

  function makeFree() {
    setLast("free");
    startTransition(() => freeAction());
  }

  return (
    <form method="post" onSubmit={submit} className="space-y-5">
      <p className="text-sm font-medium text-foreground">{price ?? "Free"}</p>
      <Field
        label="Price in euros"
        name="price"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        required
        defaultValue={inputValue}
        hint={hint}
      />
      {result && !result.ok && <FormMessage tone="error">{result.error}</FormMessage>}
      {result?.ok && <FormMessage tone="success">{result.message}</FormMessage>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary text-sm disabled:cursor-wait disabled:opacity-60">
          {saving ? "Saving…" : "Save price"}
        </button>
        {price && (
          <button type="button" onClick={makeFree} disabled={pending} className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60">
            {freeing ? "Saving…" : "Make it free"}
          </button>
        )}
      </div>
    </form>
  );
}
