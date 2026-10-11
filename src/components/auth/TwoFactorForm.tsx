"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { authErrorMessage, OFFLINE_MESSAGE } from "@/lib/auth/errors";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";

/** The second step of a password sign-in: a code from the authenticator app, or a backup code. */
export function TwoFactorForm() {
  const [backup, setBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Backup codes are lowercase "xxxxx-xxxxx"; one copied from paper in capitals, or without its
    // hyphen, still matches.
    const typed = String(new FormData(event.currentTarget).get("code")).replace(/\s/g, "");
    const lower = typed.toLowerCase();
    const code = !backup ? typed : /^[a-z0-9]{10}$/.test(lower) ? `${lower.slice(0, 5)}-${lower.slice(5)}` : lower;
    setPending(true);
    setError(null);
    try {
      const { error } = backup
        ? await authClient.twoFactor.verifyBackupCode({ code })
        : await authClient.twoFactor.verifyTotp({ code });
      if (!error) {
        window.location.assign("/dashboard");
        return;
      }
      setError(authErrorMessage(error));
    } catch {
      setError(OFFLINE_MESSAGE);
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {backup ? (
        <Field
          key="backup"
          label="Backup code"
          name="code"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus
          className="input-base font-mono"
          hint="One of the codes you saved when you turned on two-factor. Each works once."
        />
      ) : (
        <Field
          key="totp"
          label="Code from your authenticator app"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          autoFocus
          className="input-base font-mono"
        />
      )}
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full text-sm disabled:cursor-wait disabled:opacity-60">
        {pending ? "Checking…" : "Continue"}
      </button>
      <button
        type="button"
        onClick={() => {
          setBackup(!backup);
          setError(null);
        }}
        className="min-h-11 cursor-pointer text-sm text-muted transition-colors hover:text-accent-strong"
      >
        {backup ? "Use your authenticator app instead" : "Use a backup code instead"}
      </button>
    </form>
  );
}
