"use client";

import { useState } from "react";
import { Key } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth/auth-client";
import { authErrorMessage, OFFLINE_MESSAGE } from "@/lib/auth/errors";
import { FormMessage } from "./FormMessage";

export function PasskeySignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.passkey();
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
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="btn btn-ghost w-full text-sm disabled:cursor-wait disabled:opacity-60"
      >
        <Key size={20} weight="regular" aria-hidden />
        {pending ? "Waiting for your passkey…" : "Sign in with a passkey"}
      </button>
      {error && <FormMessage tone="error">{error}</FormMessage>}
    </div>
  );
}
