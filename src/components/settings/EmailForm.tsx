"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { TakesFocus } from "@/components/TakesFocus";
import { FormMessage } from "@/components/auth/FormMessage";
import { authClient } from "@/lib/auth/auth-client";
import { useAuthAction } from "@/lib/auth/useAuthAction";

export function EmailForm({ email }: { email: string }) {
  const { pending, error, setError, run } = useAuthAction();
  const [sentFor, setSentFor] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newEmail = String(new FormData(event.currentTarget).get("newEmail")).trim();
    if (newEmail.toLowerCase() === email.toLowerCase()) {
      setError("That is already your email address.");
      return;
    }
    // Better Auth answers the same whether or not the new address is taken, and then sends nothing.
    const done = await run(() => authClient.changeEmail({ newEmail, callbackURL: "/dashboard/settings" }));
    if (done) setSentFor(newEmail);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        Signed in as <span className="break-all text-foreground">{email}</span>.
      </p>
      {sentFor ? (
        <TakesFocus className="space-y-5">
          <FormMessage tone="success">
            Open the link we sent to <strong className="font-medium">{email}</strong> and confirm there. We then send
            a link to <strong className="font-medium">{sentFor}</strong>, and the change is done once you open that one
            too.
          </FormMessage>
          <button type="button" onClick={() => setSentFor(null)} className="btn btn-ghost text-sm">
            Use another address
          </button>
        </TakesFocus>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="New email" name="newEmail" type="email" autoComplete="email" required />
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <button type="submit" disabled={pending} className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60">
            {pending ? "Sending…" : "Change email"}
          </button>
        </form>
      )}
    </div>
  );
}
