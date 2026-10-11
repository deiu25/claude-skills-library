"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { FormMessage } from "@/components/auth/FormMessage";
import { authClient } from "@/lib/auth/auth-client";
import { BIO_MAX } from "@/lib/auth/profile";
import { useAuthAction } from "@/lib/auth/useAuthAction";
import { USERNAME_MAX, usernameProblem } from "@/lib/auth/username";

interface ProfileFormProps {
  name: string;
  username: string | null;
  bio: string | null;
}

export function ProfileForm({ name, username, bio }: ProfileFormProps) {
  const router = useRouter();
  const { pending, error, setError, run } = useAuthAction();
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextUsername = String(form.get("username")).trim().toLowerCase();
    setSaved(false);
    const problem = nextUsername ? usernameProblem(nextUsername) : null;
    if (problem) {
      setError(problem);
      return;
    }
    const done = await run(() =>
      authClient.updateUser({
        name: String(form.get("name")),
        bio: String(form.get("bio")),
        ...(nextUsername && nextUsername !== username ? { username: nextUsername } : {}),
      }),
    );
    if (!done) return;
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Name" name="name" type="text" autoComplete="name" required maxLength={100} defaultValue={name} />
      <Field
        label="Username"
        name="username"
        type="text"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={USERNAME_MAX}
        // Once chosen, a username can change but not go back to none.
        required={username !== null}
        defaultValue={username ?? ""}
        className="input-base font-mono"
        hint="Your handle on public pages. Letters, digits and single hyphens, 3 to 30 characters."
      />
      <Field
        label="Bio"
        name="bio"
        type="text"
        maxLength={BIO_MAX}
        defaultValue={bio ?? ""}
        hint={`One line about you, up to ${BIO_MAX} characters.`}
      />
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {saved && <FormMessage tone="success">Profile saved.</FormMessage>}
      <button type="submit" disabled={pending} className="btn btn-primary text-sm disabled:cursor-wait disabled:opacity-60">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
