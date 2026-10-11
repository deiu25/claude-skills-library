"use client";

import { useState } from "react";
import { TakesFocus } from "@/components/TakesFocus";
import { FormMessage } from "@/components/auth/FormMessage";
import { authClient } from "@/lib/auth/auth-client";
import { useAuthAction } from "@/lib/auth/useAuthAction";

/** Asks for the confirmation email. Nothing is deleted until its link is opened and confirmed. */
export function DeleteAccount({ email }: { email: string }) {
  const { pending, error, run } = useAuthAction();
  const [sent, setSent] = useState(false);

  async function request() {
    if (await run(() => authClient.deleteUser({}))) setSent(true);
  }

  if (sent) {
    return (
      <TakesFocus>
        <FormMessage tone="success">
          We sent a link to <strong className="font-medium">{email}</strong>. Open it in this browser to confirm.
          Nothing is deleted until you do.
        </FormMessage>
      </TakesFocus>
    );
  }

  return (
    <div className="space-y-5">
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <button type="button" onClick={request} disabled={pending} className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60">
        {pending ? "Sending…" : "Delete my account"}
      </button>
    </div>
  );
}
