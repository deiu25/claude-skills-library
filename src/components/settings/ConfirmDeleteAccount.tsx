"use client";

import Link from "next/link";
import { useState } from "react";
import { FormMessage } from "@/components/auth/FormMessage";
import { authClient } from "@/lib/auth/auth-client";
import { clearSignedIn } from "@/lib/auth/signed-in-flag";
import { useAuthAction } from "@/lib/auth/useAuthAction";

// Both buttons are ghost: the accent means "go ahead", and this is the one step that cannot be undone.
export function ConfirmDeleteAccount({ token }: { token: string }) {
  const { pending, error, run } = useAuthAction();
  const [leaving, setLeaving] = useState(false);

  async function confirm() {
    if (!(await run(() => authClient.deleteUser({ token })))) return;
    setLeaving(true);
    clearSignedIn();
    window.location.assign("/account-deleted");
  }

  return (
    <div className="space-y-5">
      <FormMessage tone="warning">Deleting cannot be undone, and we cannot bring the account back.</FormMessage>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={confirm}
          disabled={pending || leaving}
          className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60"
        >
          {pending || leaving ? "Deleting…" : "Delete my account"}
        </button>
        <Link href="/dashboard/settings" className="btn btn-ghost text-sm">
          Keep my account
        </Link>
      </div>
    </div>
  );
}
