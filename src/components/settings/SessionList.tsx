"use client";

import { useState, useTransition } from "react";
import { FormMessage } from "@/components/auth/FormMessage";
import { revokeOtherSessions, revokeSession, type ActionResult } from "@/lib/auth/actions";

export interface SessionRow {
  id: string;
  device: string;
  ipAddress: string | null;
  /** "active today", formatted on the server. */
  lastActive: string;
  current: boolean;
}

const ROW_BUTTON =
  "inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-[8px] px-3 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground disabled:cursor-wait disabled:opacity-60";

export function SessionList({ sessions }: { sessions: SessionRow[] }) {
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The actions revalidate the settings page, so the list redraws without the revoked rows.
  function act(id: string, action: () => Promise<ActionResult>) {
    setError(null);
    setTarget(id);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) setError(result.error);
      } catch {
        setError("Could not reach the server. Check your connection and try again.");
      }
    });
  }

  const busy = (id: string) => pending && target === id;
  const others = sessions.filter((session) => !session.current);
  return (
    <div className="space-y-5">
      <ul className="divide-y divide-line rounded-[8px] border border-line bg-surface">
        {sessions.map((session) => (
          <li key={session.id} className="flex items-center justify-between gap-4 py-2 pl-4 pr-2">
            <div className="min-w-0 py-1">
              <p className="truncate text-sm font-medium text-foreground">
                {session.device}
                {session.current && <span className="ml-2 text-xs font-normal text-accent-strong">This browser</span>}
              </p>
              <p className="truncate text-xs text-faint">
                {[session.ipAddress, session.lastActive].filter(Boolean).join(", ")}
              </p>
            </div>
            {!session.current && (
              <button
                type="button"
                onClick={() => act(session.id, () => revokeSession(session.id))}
                disabled={pending}
                aria-label={`Sign out ${session.device}`}
                className={ROW_BUTTON}
              >
                {busy(session.id) ? "Signing out…" : "Sign out"}
              </button>
            )}
          </li>
        ))}
      </ul>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {others.length > 1 && (
        <button
          type="button"
          onClick={() => act("others", revokeOtherSessions)}
          disabled={pending}
          className="btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60"
        >
          {busy("others") ? "Signing out…" : "Sign out of all other sessions"}
        </button>
      )}
    </div>
  );
}
