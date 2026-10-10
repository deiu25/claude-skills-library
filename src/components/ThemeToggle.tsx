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
    const apply = () => {
      document.documentElement.classList.toggle("dark", next);
    };
    // Cross-fade the switch instead of a hard brightness jump.
    if (document.startViewTransition) document.startViewTransition(apply);
    else apply();
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
      className="press flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-line text-muted hover:border-faint hover:text-foreground"
    >
      {isDark ? (
        <Sun size={20} weight="regular" aria-hidden />
      ) : (
        <Moon size={20} weight="regular" aria-hidden />
      )}
    </button>
  );
}
