"use client";

import { useState } from "react";
import { GithubLogo } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth/auth-client";
import { authErrorMessage, OFFLINE_MESSAGE } from "@/lib/auth/errors";
import { FormMessage } from "./FormMessage";

export function GitHubSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      // On success the client leaves for GitHub. A failure there comes back as /sign-in?error=<code>.
      const { error } = await authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" });
      if (!error) return;
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
        <GithubLogo size={20} weight="regular" aria-hidden />
        {pending ? "Opening GitHub…" : "Continue with GitHub"}
      </button>
      {error && <FormMessage tone="error">{error}</FormMessage>}
    </div>
  );
}
