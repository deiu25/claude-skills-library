import { describe, expect, it } from "vitest";
import { canEdit, canRead, statusFor, visibilityProblem, VISIBILITIES, type SkillAccess } from "./access";

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

describe("statusFor", () => {
  it("publishes an unlisted or public skill and keeps a private one a draft", () => {
    expect(statusFor("public")).toBe("published");
    expect(statusFor("unlisted")).toBe("published");
    expect(statusFor("private")).toBe("draft");
  });

  it("gives every visibility a status that canRead agrees with", () => {
    for (const visibility of VISIBILITIES) {
      expect(canRead(stranger, skill(visibility, statusFor(visibility)))).toBe(visibility !== "private");
    }
  });
});

describe("visibilityProblem", () => {
  const ready = { status: "draft", version: 3, risk: "high" as const, username: "ada" };

  it("publishes a skill whose latest version has no critical finding", () => {
    expect(visibilityProblem("public", ready)).toBeNull();
    expect(visibilityProblem("unlisted", ready)).toBeNull();
  });

  it("blocks publishing a critical version, never making it private", () => {
    const critical = { ...ready, risk: "critical" as const };
    expect(visibilityProblem("public", critical)).toMatch(/^Version 3 has a critical finding/);
    expect(visibilityProblem("unlisted", critical)).toMatch(/^Version 3 has a critical finding/);
    expect(visibilityProblem("private", { ...critical, status: "published" })).toBeNull();
  });

  it("asks for a username before publishing", () => {
    expect(visibilityProblem("public", { ...ready, username: null })).toMatch(/^Choose a username/);
    expect(visibilityProblem("private", { ...ready, username: null })).toBeNull();
  });

  it("leaves a removed skill as it is", () => {
    for (const visibility of VISIBILITIES) {
      expect(visibilityProblem(visibility, { ...ready, status: "removed" })).toMatch(/was removed/);
    }
  });
});
