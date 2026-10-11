"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { clearSignedIn } from "@/lib/auth/signed-in-flag";
import { SignOutButton } from "./SignOutButton";

const ITEM =
  "flex min-h-11 w-full cursor-pointer items-center rounded-[8px] px-3 text-left text-sm text-foreground transition-colors hover:bg-surface-raised";

/** The signed-in part of the header, loaded by AccountSlot only after a sign-in in this browser. */
export function AccountMenu() {
  const { data, isPending, error } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // An empty session (signed out in another tab, or expired) clears the flag, so later pages stop
  // asking. A failed request proves nothing and keeps it.
  const signedOut = !isPending && !error && !data;
  useEffect(() => {
    if (signedOut) clearSignedIn();
  }, [signedOut]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // A failed request keeps the slot: the next page load asks again.
  if (isPending || error) return <span aria-hidden className="block h-11 w-11" />;
  if (!data) return null;

  const { name, email } = data.user;
  const initial = (name.trim() || email).charAt(0).toUpperCase();

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        className="press flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line bg-surface-raised text-sm font-semibold text-foreground hover:border-faint"
      >
        {initial}
      </button>
      {/* Solid, not material: the header's own backdrop-filter makes it the backdrop root, so a
          translucent panel inside it would show the page through without blurring it. */}
      {open && (
        <div
          id={menuId}
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-[14px] border border-line bg-surface p-1.5 shadow-[inset_0_1px_0_var(--material-edge),var(--shadow-floating)] transition-[opacity,scale] duration-200 ease-(--ease-out-quint) starting:scale-95 starting:opacity-0"
        >
          <div className="px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <div className="mx-1.5 mb-1.5 border-t border-line" />
          <Link href="/dashboard" onClick={() => setOpen(false)} className={ITEM}>
            Dashboard
          </Link>
          <Link href="/dashboard/settings" onClick={() => setOpen(false)} className={ITEM}>
            Settings
          </Link>
          <SignOutButton className={ITEM} />
        </div>
      )}
    </div>
  );
}
