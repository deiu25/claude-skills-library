import { userAgentFromString } from "next/server";

/** A session's device as people name it, such as "Chrome on Linux", from its stored user agent. */
export function describeDevice(userAgent: string | null): string {
  const { browser, os } = userAgentFromString(userAgent ?? undefined);
  if (browser.name && os.name) return `${browser.name} on ${os.name}`;
  return browser.name ?? os.name ?? "Unknown device";
}
