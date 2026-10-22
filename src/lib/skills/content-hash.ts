import { createHash } from "node:crypto";

/**
 * The hash `npx skills` writes to skills-lock.json as `computedHash` for a folder holding exactly
 * SKILL.md and these files: SHA-256 over each path relative to the folder, then its bytes, with the
 * paths sorted by `localeCompare`. Read from the skills CLI source, versions 1.5.21 to 1.7.2, on
 * 2026-10-22. A code-unit sort gives another hash: "references/…" sorts before "SKILL.md" here.
 */
export function contentHash(skillMd: string, files: { path: string; content: Uint8Array }[]): string {
  const all = [{ path: "SKILL.md", content: Buffer.from(skillMd, "utf8") }, ...files].sort((a, b) => a.path.localeCompare(b.path));
  const hash = createHash("sha256");
  for (const file of all) hash.update(file.path).update(file.content);
  return hash.digest("hex");
}
