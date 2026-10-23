"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { startTransition, useActionState, useMemo, useState, type FormEvent } from "react";
import { FormMessage } from "@/components/auth/FormMessage";
import type { Visibility } from "@/lib/skills/access";
import { setSkillVisibility } from "@/lib/skills/actions";
import { keepDraftOnFailure } from "@/lib/skills/keep-draft";

const OPTIONS: { value: Visibility; label: string; hint: string }[] = [
  { value: "private", label: "Private", hint: "Only you can open it." },
  {
    value: "unlisted",
    label: "Unlisted",
    hint: "Listed nowhere, but not secret: anyone with its address, your username and the skill's name, can open and download it.",
  },
  { value: "public", label: "Public", hint: "Listed in Community and on your profile, where search engines can find it." },
];

interface SkillVisibilityProps {
  skillId: string;
  visibility: Visibility;
  status: string;
  /** Where its page is, without the scheme, once the owner has a username. */
  address: string | null;
  /** Why it cannot be published now, or null. */
  blocked: string | null;
  /** Until Community opens, a published skill's page answers 404. */
  communityOpen: boolean;
}

/** Who can see a skill: the state first, then the choice. */
export function SkillVisibility({ skillId, visibility, status, address, blocked, communityOpen }: SkillVisibilityProps) {
  const action = useMemo(() => keepDraftOnFailure(setSkillVisibility.bind(null, skillId)), [skillId]);
  const [state, formAction, pending] = useActionState(action, null);
  const [choice, setChoice] = useState(visibility);
  const [submitted, setSubmitted] = useState<{ choice: Visibility; serverState: string } | null>(null);
  const removed = status === "removed";
  const published = status === "published";

  // The skill can change outside this form, as when a save with a critical finding makes it
  // private again: the choice then starts over from what it is now.
  const serverState = `${visibility}:${status}`;
  const [shownState, setShownState] = useState(serverState);
  if (shownState !== serverState) {
    setShownState(serverState);
    setChoice(visibility);
  }
  // A result describes the skill as this form left it; once the skill has changed since, it is no longer true.
  const result =
    state && !pending && submitted && (state.ok ? visibility === submitted.choice : serverState === submitted.serverState) ? state : null;

  // Dispatched by hand, not through <form action>: React's reset after an action would move the
  // radios back to the choice the page loaded with.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitted({ choice, serverState });
    startTransition(() => formAction(formData));
  }

  const caution =
    blocked ??
    (!communityOpen && published ? "Community pages open when sign-up does. Until then the skill's page is not reachable, even published." : null);

  return (
    <form method="post" onSubmit={submit} className="space-y-5">
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          {published && <CheckCircle size={18} className="text-accent" aria-hidden />}
          {removed ? "Removed from the site" : published ? `Published, ${visibility}` : "Private"}
        </p>
        {published && address && (
          <p className="break-all text-sm text-muted">
            {communityOpen ? (
              <a href={`https://${address}`} className="font-mono text-foreground underline decoration-line underline-offset-4 hover:text-accent-strong">
                {address}
              </a>
            ) : (
              <span className="font-mono">{address}</span>
            )}
          </p>
        )}
      </div>

      <fieldset disabled={removed || pending} className="divide-y divide-line rounded-[8px] border border-line bg-surface">
        <legend className="sr-only">Who can see this skill</legend>
        {OPTIONS.map((option) => {
          const unavailable = option.value !== "private" && blocked !== null;
          return (
            <label
              key={option.value}
              className={`flex min-h-11 gap-3 px-4 py-3 ${unavailable ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={choice === option.value}
                onChange={() => setChoice(option.value)}
                disabled={unavailable}
                className="mt-0.5 size-4 shrink-0 accent-accent"
              />
              <span className="min-w-0 space-y-0.5">
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="block text-pretty text-xs leading-relaxed text-faint">{option.hint}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {caution && <FormMessage tone="warning">{caution}</FormMessage>}
      {result && !result.ok && <FormMessage tone="error">{result.error}</FormMessage>}
      {result?.ok && <FormMessage tone="success">{result.message}</FormMessage>}
      {!removed && (
        <button
          type="submit"
          disabled={pending || choice === visibility}
          className="btn btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save visibility"}
        </button>
      )}
    </form>
  );
}
