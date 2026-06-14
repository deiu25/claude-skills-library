import { describe, expect, it } from "vitest";
import { decodeSelection, encodeSelection } from "@/lib/selection";

describe("encodeSelection", () => {
  it("sorts and de-duplicates slugs", () => {
    // Arrange
    const slugs = ["caveman", "grill-me", "caveman"];

    // Act
    const encoded = encodeSelection(slugs);

    // Assert
    expect(encoded).toBe("caveman,grill-me");
  });

  it("drops values that are not valid slug shapes", () => {
    expect(encodeSelection(["good-slug", "Bad Slug", "../etc"])).toBe("good-slug");
  });

  it("returns an empty string for an empty set", () => {
    expect(encodeSelection([])).toBe("");
  });
});

describe("decodeSelection", () => {
  it("returns [] for null or empty input", () => {
    expect(decodeSelection(null)).toEqual([]);
    expect(decodeSelection("")).toEqual([]);
  });

  it("parses a comma list and de-duplicates", () => {
    expect(decodeSelection("a,b,a")).toEqual(["a", "b"]);
  });

  it("filters to valid catalog slugs when provided", () => {
    // Arrange
    const valid = ["caveman", "grill-me"];

    // Act / Assert — stale slug is dropped
    expect(decodeSelection("caveman,deleted-skill", valid)).toEqual(["caveman"]);
  });

  it("rejects malformed tokens", () => {
    expect(decodeSelection("ok-one, BAD , ../x")).toEqual(["ok-one"]);
  });

  it("round-trips with encodeSelection", () => {
    const slugs = ["b-skill", "a-skill"];
    expect(decodeSelection(encodeSelection(slugs))).toEqual(["a-skill", "b-skill"]);
  });
});
