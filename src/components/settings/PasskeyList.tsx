"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { FormMessage } from "@/components/auth/FormMessage";
import { authClient } from "@/lib/auth/auth-client";
import { useAuthAction } from "@/lib/auth/useAuthAction";

export interface PasskeyRow {
  id: string;
  name: string | null;
  /** "added today", "added 3 days ago", formatted on the server. */
  added: string;
  backedUp: boolean;
}

const ROW_BUTTON =
  "inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-[8px] px-3 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground disabled:cursor-wait disabled:opacity-60";

export function PasskeyList({ passkeys }: { passkeys: PasskeyRow[] }) {
  const router = useRouter();
  const { pending, error, run } = useAuthAction();
  const [removing, setRemoving] = useState<string | null>(null);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const name = String(new FormData(formElement).get("passkeyName")).trim();
    setRemoving(null);
    const added = await run(() => authClient.passkey.addPasskey(name ? { name } : undefined));
    if (!added) return;
    formElement.reset();
    router.refresh();
  }

  async function remove(id: string) {
    setRemoving(id);
    if (await run(() => authClient.passkey.deletePasskey({ id }))) router.refresh();
  }

  return (
    <div className="space-y-5">
      {passkeys.length > 0 ? (
        <ul className="divide-y divide-line rounded-[8px] border border-line bg-surface">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center justify-between gap-4 py-2 pl-4 pr-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{passkey.name || "Passkey"}</p>
                <p className="text-xs text-faint">
                  {passkey.backedUp ? "Synced" : "This device only"}, {passkey.added}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(passkey.id)}
                disabled={pending}
                aria-label={`Remove passkey ${passkey.name || passkey.added}`}
                className={ROW_BUTTON}
              >
                {pending && removing === passkey.id ? "Removing…" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-medium text-foreground">No passkeys yet</p>
      )}
      <form onSubmit={add} className="space-y-5">
        <Field
          label="Name for a new passkey"
          name="passkeyName"
          type="text"
          maxLength={60}
          placeholder="MacBook, phone…"
          hint="Optional. Helps you tell your passkeys apart."
        />
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <button type="submit" disabled={pending} className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60">
          {pending && removing === null ? "Waiting for your device…" : "Add a passkey"}
        </button>
      </form>
    </div>
  );
}
