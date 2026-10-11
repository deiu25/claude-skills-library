import { describe, expect, it } from "vitest";
import { cleanProfile } from "@/lib/auth/profile";

describe("cleanProfile", () => {
  it("keeps a name to one line without control or bidirectional characters", () => {
    expect(cleanProfile({ name: "  Ada\n\nYour account was flagged.\tVerify now  " })).toEqual({
      name: "Ada Your account was flagged. Verify now",
    });
    expect(cleanProfile({ name: "evil‮txt.exe\u0007" })).toEqual({ name: "eviltxt.exe" });
  });

  it("caps a name at 100 characters without splitting a character", () => {
    expect(cleanProfile({ name: "a".repeat(1_000_000) }).name).toHaveLength(100);
    expect(Array.from(cleanProfile({ name: "😀".repeat(150) }).name ?? "")).toHaveLength(100);
  });

  it("keeps only https images", () => {
    expect(cleanProfile({ image: "https://avatars.githubusercontent.com/u/1" })).toEqual({
      image: "https://avatars.githubusercontent.com/u/1",
    });
    expect(cleanProfile({ image: "javascript:alert(1)" })).toEqual({ image: null });
    expect(cleanProfile({ image: "http://example.com/a.png" })).toEqual({ image: null });
    expect(cleanProfile({ image: null })).toEqual({ image: null });
  });

  it("leaves out fields an update does not touch", () => {
    expect(cleanProfile({})).toEqual({});
  });
});
