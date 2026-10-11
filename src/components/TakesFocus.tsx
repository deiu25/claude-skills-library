"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Moves focus to its content when it appears. For a view that replaces the control focus was on,
 * which would otherwise drop keyboard and screen-reader users back at the top of the page.
 */
export function TakesFocus({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} className={`outline-none ${className ?? ""}`}>
      {children}
    </div>
  );
}
