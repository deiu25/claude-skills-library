import { describe, expect, it } from "vitest";
import { isSignUpAllowed } from "@/lib/auth/allowlist";

describe("isSignUpAllowed", () => {
  it("refuses every address when sign-up is closed and the allowlist is empty", () => {
    expect(isSignUpAllowed("a@example.com", {})).toBe(false);
    expect(isSignUpAllowed("a@example.com", { ACCOUNTS_OPEN: "false", ACCOUNTS_ALLOWLIST: "" })).toBe(false);
  });

  it("allows only listed addresses while sign-up is closed", () => {
    const env = { ACCOUNTS_ALLOWLIST: "owner@example.com, second@example.com" };
    expect(isSignUpAllowed("owner@example.com", env)).toBe(true);
    expect(isSignUpAllowed("second@example.com", env)).toBe(true);
    expect(isSignUpAllowed("stranger@example.com", env)).toBe(false);
  });

  it("compares addresses without case or surrounding spaces", () => {
    const env = { ACCOUNTS_ALLOWLIST: " Owner@Example.com " };
    expect(isSignUpAllowed("owner@example.COM", env)).toBe(true);
  });

  it("does not match on a substring or an empty entry", () => {
    const env = { ACCOUNTS_ALLOWLIST: "owner@example.com,," };
    expect(isSignUpAllowed("wner@example.com", env)).toBe(false);
    expect(isSignUpAllowed("", env)).toBe(false);
  });

  it("allows every address only when ACCOUNTS_OPEN is exactly true", () => {
    expect(isSignUpAllowed("anyone@example.com", { ACCOUNTS_OPEN: "true" })).toBe(true);
    expect(isSignUpAllowed("anyone@example.com", { ACCOUNTS_OPEN: "TRUE" })).toBe(false);
    expect(isSignUpAllowed("anyone@example.com", { ACCOUNTS_OPEN: "1" })).toBe(false);
  });
});
