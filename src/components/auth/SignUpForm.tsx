"use client";

import { useState, type FormEvent } from "react";
import { TakesFocus } from "@/components/TakesFocus";
import { authClient } from "@/lib/auth/auth-client";
import { authErrorMessage, OFFLINE_MESSAGE } from "@/lib/auth/errors";
import { NEW_ACCOUNT_PASSWORD_PATH } from "@/lib/auth/links";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";

// Better Auth's sign-up asks for a password. The server stores its own random one instead (auth.ts,
// hooks.before); this one is random too, so nothing known is ever sent. The account's real password
// is chosen from the emailed link, once the address is proven.
function throwawayPassword(): string {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
}

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    setPending(true);
    setError(null);
    try {
      // An address that already has an account answers the same, so this never tells who has one.
      const signUp = await authClient.signUp.email({
        name: String(form.get("name")),
        email,
        password: throwawayPassword(),
      });
      const { error } = signUp.error
        ? signUp
        : await authClient.requestPasswordReset({ email, redirectTo: NEW_ACCOUNT_PASSWORD_PATH });
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
      <TakesFocus>
        <FormMessage tone="success">
          We sent a link to <strong className="font-medium">{sentTo}</strong>. Open it to choose your password and
          finish creating your account.
        </FormMessage>
      </TakesFocus>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Name" name="name" type="text" autoComplete="name" required maxLength={100} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        hint="We email you a link to choose your password."
      />
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full text-sm disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
