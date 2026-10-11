"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { authErrorMessage, OFFLINE_MESSAGE } from "@/lib/auth/errors";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      // On success the client navigates to callbackURL itself. For an unverified address,
      // the verification link Better Auth resends lands there too.
      const { error } = await authClient.signIn.email({
        email: String(form.get("email")),
        password: String(form.get("password")),
        callbackURL: "/dashboard",
      });
      if (!error) return;
      setError(authErrorMessage(error));
    } catch {
      setError(OFFLINE_MESSAGE);
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full text-sm disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
