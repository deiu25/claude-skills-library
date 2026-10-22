import { describe, expect, it } from "vitest";
import { canEdit, canRead, type SkillAccess } from "./access";

const owner = { id: "user-a" };
const stranger = { id: "user-b" };
const skill = (visibility: string, status: string, ownerId: string | null = owner.id): SkillAccess => ({ ownerId, visibility, status });

describe("canRead", () => {
  it("lets the owner read every skill of theirs, in any state", () => {
    for (const visibility of ["private", "unlisted", "public"]) {
      for (const status of ["draft", "published", "removed"]) {
        expect(canRead(owner, skill(visibility, status))).toBe(true);
      }
    }
  });

  it("hides a private, draft or removed skill from everyone else, signed in or not", () => {
    for (const viewer of [stranger, null]) {
      expect(canRead(viewer, skill("private", "published"))).toBe(false);
      expect(canRead(viewer, skill("public", "draft"))).toBe(false);
      expect(canRead(viewer, skill("public", "removed"))).toBe(false);
    }
  });

  it("shows a published public or unlisted skill to anyone", () => {
    for (const viewer of [stranger, null]) {
      expect(canRead(viewer, skill("public", "published"))).toBe(true);
      expect(canRead(viewer, skill("unlisted", "published"))).toBe(true);
    }
  });

  it("never treats a missing owner as a match", () => {
    expect(canRead({ id: "" }, skill("private", "draft", null))).toBe(false);
  });
});

describe("canEdit", () => {
  it("is the owner only", () => {
    expect(canEdit(owner, skill("public", "published"))).toBe(true);
    expect(canEdit(stranger, skill("public", "published"))).toBe(false);
    expect(canEdit(null, skill("public", "published"))).toBe(false);
    expect(canEdit(owner, skill("private", "draft", null))).toBe(false);
  });
});
