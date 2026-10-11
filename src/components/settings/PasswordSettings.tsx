"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { TakesFocus } from "@/components/TakesFocus";
import { FormMessage } from "@/components/auth/FormMessage";
import { authClient } from "@/lib/auth/auth-client";
import { useAuthAction } from "@/lib/auth/useAuthAction";

interface PasswordSettingsProps {
  email: string;
  hasPassword: boolean;
}

export function PasswordSettings({ email, hasPassword }: PasswordSettingsProps) {
  const router = useRouter();
  const { pending, error, run } = useAuthAction();
  const [done, setDone] = useState(false);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setDone(false);
    const changed = await run(() =>
      authClient.changePassword({
        currentPassword: String(form.get("currentPassword")),
        newPassword: String(form.get("newPassword")),
        revokeOtherSessions: true,
      }),
    );
    if (!changed) return;
    formElement.reset();
    setDone(true);
    // Every session was replaced by a new one for this browser: the sessions list is out of date.
    router.refresh();
  }

  // Without a password, the account gets one the way a reset works: from a link that proves the address.
  async function sendLink() {
    const sent = await run(() => authClient.requestPasswordReset({ email, redirectTo: "/reset-password" }));
    if (sent) setDone(true);
  }

  if (!hasPassword) {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-muted">
          You sign in without a password. To add one, we email you a link to choose it.
        </p>
        {error && <FormMessage tone="error">{error}</FormMessage>}
        {done ? (
          <TakesFocus className="space-y-5">
            <FormMessage tone="success">
              We sent a link to <strong className="font-medium">{email}</strong>. It works once, within an hour.
            </FormMessage>
            <button type="button" onClick={() => setDone(false)} className="btn btn-ghost text-sm">
              Send another link
            </button>
          </TakesFocus>
        ) : (
          <button
            type="button"
            onClick={sendLink}
            disabled={pending}
            className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Sending…" : "Email me a link"}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={changePassword} className="space-y-5">
      <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
      <Field
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="At least 8 characters."
      />
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {done && <FormMessage tone="success">Password changed. Your other sessions are signed out.</FormMessage>}
      <button type="submit" disabled={pending} className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60">
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
