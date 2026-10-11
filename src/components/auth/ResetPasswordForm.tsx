"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { authErrorMessage, OFFLINE_MESSAGE } from "@/lib/auth/errors";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";

export function ResetPasswordForm({ token, finishing }: { token: string; finishing: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newPassword = String(new FormData(event.currentTarget).get("password"));
    setPending(true);
    setError(null);
    try {
      const { error } = await authClient.resetPassword({ newPassword, token });
      if (!error) {
        setDone(true);
        return;
      }
      setError(authErrorMessage(error));
    } catch {
      setError(OFFLINE_MESSAGE);
    }
    setPending(false);
  }

  if (done) {
    return (
      <FormMessage tone="success">
        {finishing
          ? "Your password is set, and your account is ready."
          : "Your password is changed, and every session that used the old one is signed out."}{" "}
        <Link href="/sign-in" className="font-medium underline underline-offset-4">
          Sign in
        </Link>
      </FormMessage>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="At least 8 characters."
      />
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full text-sm disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
