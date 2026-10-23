import { describe, expect, it } from "vitest";
import { adminUserIds } from "./admin";

describe("adminUserIds", () => {
  it("reads comma-separated ids and drops blanks", () => {
    expect(adminUserIds(" abc , def,,")).toEqual(["abc", "def"]);
  });

  it("names nobody when the variable is unset or empty", () => {
    expect(adminUserIds(undefined)).toEqual([]);
    expect(adminUserIds("")).toEqual([]);
  });
});
