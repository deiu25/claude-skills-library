"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getIsDark() {
  return document.documentElement.classList.contains("dark");
}

// Server snapshot matches the default `dark` class set in the root layout.
function getServerIsDark() {
  return true;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getIsDark, getServerIsDark);

  function toggle() {
    const next = !getIsDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage unavailable (private mode); theme still toggles for the session
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-line text-muted transition-colors hover:border-faint hover:text-foreground active:scale-[0.98]"
    >
      {isDark ? (
        <Sun size={20} weight="regular" aria-hidden />
      ) : (
        <Moon size={20} weight="regular" aria-hidden />
      )}
    </button>
  );
}
