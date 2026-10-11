"use client";

import { signOut } from "@/lib/auth/actions";
import { clearSignedIn } from "@/lib/auth/signed-in-flag";

/** Ends the session. Clearing the flag first keeps the next page from asking /api/auth again. */
export function SignOutButton({ className }: { className: string }) {
  return (
    <form action={signOut} onSubmit={clearSignedIn}>
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}
