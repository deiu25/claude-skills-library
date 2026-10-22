import { describe, expect, it } from "vitest";
import { contentHash } from "./content-hash";

const text = (value: string) => new TextEncoder().encode(value);

// A nested skill folder. `npx skills@1.7.2 add <folder> -a claude-code --copy` installed it on
// 2026-10-22 and wrote this computedHash to skills-lock.json.
const SKILL_MD = "---\nname: hash-fixture\ndescription: A nested skill folder whose hash the skills CLI computed.\n---\n\n# Hash fixture\n\nRun `scripts/run.sh`, then read `references/Guide.md`.\n";
const FILES = [
  { path: "scripts/run.sh", content: text('#!/bin/sh\necho "hash fixture"\n') },
  { path: "references/Guide.md", content: text("# Guide\n\nSee api/v1.md.\n") },
  { path: "references/api/v1.md", content: text("# API v1\n") },
  { path: "assets/logo.png", content: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0xff, 0xfe, 0x00, 0x01]) },
  { path: "README.md", content: text("Hash fixture for content_hash.\n") },
];
const LOCK_ENTRY = "28e0235051e66a3961cee5064d2b001815f790dac4d5302d1270d19f4381ba6b";

describe("contentHash", () => {
  it("matches the computedHash the skills CLI wrote to skills-lock.json for the same folder", () => {
    expect(contentHash(SKILL_MD, FILES)).toBe(LOCK_ENTRY);
  });

  it("does not depend on the order the files arrive in", () => {
    expect(contentHash(SKILL_MD, [...FILES].reverse())).toBe(LOCK_ENTRY);
  });

  it("changes with any byte, path or file", () => {
    const [first, ...rest] = FILES;
    expect(contentHash(`${SKILL_MD} `, FILES)).not.toBe(LOCK_ENTRY);
    expect(contentHash(SKILL_MD, [{ ...first, path: "scripts/Run.sh" }, ...rest])).not.toBe(LOCK_ENTRY);
    expect(contentHash(SKILL_MD, rest)).not.toBe(LOCK_ENTRY);
  });

  it("is SHA-256 over path then bytes for a skill that is only SKILL.md", async () => {
    const { createHash } = await import("node:crypto");
    expect(contentHash("x", [])).toBe(createHash("sha256").update("SKILL.mdx").digest("hex"));
  });
});
