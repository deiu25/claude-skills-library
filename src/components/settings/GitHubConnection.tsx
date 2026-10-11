"use client";

import { GithubLogo } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormMessage } from "@/components/auth/FormMessage";
import { authClient } from "@/lib/auth/auth-client";
import { useAuthAction } from "@/lib/auth/useAuthAction";

interface GitHubConnectionProps {
  /** The connected account's row and when it was connected ("today"), or null when there is none. */
  connection: { accountId: string; since: string } | null;
  /** Whether this deployment has a GitHub OAuth app. Previews have none. */
  available: boolean;
  /** Only a password keeps the account reachable without GitHub: passkeys are not sign-in accounts here. */
  hasPassword: boolean;
  /** The fixed message for a failed connection, from the page's ?error= code. */
  failure: string | null;
}

export function GitHubConnection({ connection, available, hasPassword, failure }: GitHubConnectionProps) {
  const router = useRouter();
  const { pending, error, run } = useAuthAction();

  async function connect() {
    // On success the browser leaves for GitHub; a failure there comes back as ?error=<code>.
    await run(() =>
      authClient.linkSocial({
        provider: "github",
        callbackURL: "/dashboard/settings",
        errorCallbackURL: "/dashboard/settings",
      }),
    );
  }

  async function disconnect(accountId: string) {
    if (await run(() => authClient.unlinkAccount({ accountId }))) router.refresh();
  }

  const message = error ?? failure;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <GithubLogo size={20} className="shrink-0 text-faint" aria-hidden />
        <p className="text-sm text-muted">
          {connection
            ? `Connected ${connection.since}.`
            : available
              ? "GitHub is not connected."
              : "GitHub sign-in is not available on this deployment."}
        </p>
      </div>
      {message && <FormMessage tone="error">{message}</FormMessage>}
      {connection && !hasPassword ? (
        <p className="text-sm leading-relaxed text-muted">Add a password before you disconnect GitHub, so you can still sign in.</p>
      ) : connection ? (
        <button type="button" onClick={() => disconnect(connection.accountId)} disabled={pending} className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60">
          {pending ? "Disconnecting…" : "Disconnect GitHub"}
        </button>
      ) : (
        available && (
          <button type="button" onClick={connect} disabled={pending} className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60">
            {pending ? "Opening GitHub…" : "Connect GitHub"}
          </button>
        )
      )}
    </div>
  );
}
