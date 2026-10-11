"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { authErrorMessage, OFFLINE_MESSAGE } from "@/lib/auth/errors";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email"));
    setPending(true);
    setError(null);
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (!error) {
        setSentTo(email);
        return;
      }
      setError(authErrorMessage(error));
    } catch {
      setError(OFFLINE_MESSAGE);
    }
    setPending(false);
  }

  if (sentTo) {
    return (
      <FormMessage tone="success">
        If an account exists for <strong className="font-medium">{sentTo}</strong>, a link to reset
        its password is on its way.
      </FormMessage>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full text-sm disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
