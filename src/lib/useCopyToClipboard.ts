"use client";

import { useState } from "react";

/**
 * Copy-to-clipboard with transient "copied" feedback. Shared by every copy
 * affordance (icon button, labeled button) so the clipboard handling lives in
 * exactly one place.
 */
export function useCopyToClipboard(resetMs = 1600) {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
    } catch {
      // Clipboard API unavailable; nothing sensible to do client-side
    }
  }

  return { copied, copy };
}
