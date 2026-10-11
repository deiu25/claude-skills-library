import { describe, expect, it } from "vitest";
import { isValidUsername, usernameProblem } from "./username";

describe("usernameProblem", () => {
  it("accepts lowercase letters, digits and single hyphens", () => {
    for (const name of ["ada", "deiu25", "ada-lovelace", "a1-b2-c3", "x".repeat(30)]) {
      expect(usernameProblem(name), name).toBeNull();
    }
  });

  it("refuses names shorter than 3 or longer than 30 characters", () => {
    expect(usernameProblem("ab")).toMatch(/3 to 30/);
    expect(usernameProblem("x".repeat(31))).toMatch(/3 to 30/);
  });

  it("refuses anything that is not a clean URL segment", () => {
    for (const name of ["-ada", "ada-", "ada--b", "ada_b", "ada.b", "Ada", "adă", "a b", "ada/b"]) {
      expect(isValidUsername(name), name).toBe(false);
    }
  });

  it("refuses route names and names that pass for the site", () => {
    for (const name of ["dashboard", "sign-in", "admin", "claude", "anthropic", "u"]) {
      expect(isValidUsername(name), name).toBe(false);
    }
    expect(usernameProblem("settings")).toMatch(/reserved/);
  });
});
