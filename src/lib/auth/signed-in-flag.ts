import { useSyncExternalStore } from "react";

// A localStorage note that this browser has signed in before. The header loads the account menu,
// and with it the only /api/auth request a catalog page can make, only while it is set.
const KEY = "signedIn";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function write(signedIn: boolean) {
  try {
    if (signedIn) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable (private mode): the header simply shows no account menu.
  }
  // Mirrors the attribute the layout's head script sets before first paint.
  document.documentElement.toggleAttribute("data-signed-in", signedIn);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab signing in or out updates this one too.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function markSignedIn() {
  write(true);
}

export function clearSignedIn() {
  write(false);
}

/** False on the server and during hydration, so the prerendered header never depends on it. */
export function useSignedIn(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
