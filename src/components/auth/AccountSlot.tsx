"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useSignedIn } from "@/lib/auth/signed-in-flag";

// Better Auth's client ships with the menu, so a browser that has never signed in downloads
// neither and never calls /api/auth.
const AccountMenu = dynamic(() => import("./AccountMenu").then((mod) => mod.AccountMenu), {
  ssr: false,
  loading: () => <span aria-hidden className="block h-11 w-11" />,
});

/**
 * The header's account control: the menu for a browser that has signed in before, otherwise
 * `children`, the "Sign in" link while accounts are open.
 */
export function AccountSlot({ children }: { children?: ReactNode }) {
  const signedIn = useSignedIn();
  if (signedIn) return <AccountMenu />;
  // Before hydration reads the flag, the layout's head script has already set <html data-signed-in>
  // from it: the slot keeps the menu's place, so the nav does not jump when the menu arrives.
  return (
    <>
      <span aria-hidden className="hidden h-11 w-11 [[data-signed-in]_&]:block" />
      {children && <span className="contents [[data-signed-in]_&]:hidden">{children}</span>}
    </>
  );
}
