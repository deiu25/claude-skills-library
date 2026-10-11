import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/lib/auth/errors";

describe("authErrorMessage", () => {
  it("names the recovery for a rate-limited request, whatever the code", () => {
    expect(authErrorMessage({ status: 429, code: "INVALID_EMAIL_OR_PASSWORD" })).toBe(
      "Too many attempts. Wait a minute, then try again.",
    );
  });

  it("maps known Better Auth codes to the site's own copy", () => {
    expect(authErrorMessage({ status: 401, code: "INVALID_EMAIL_OR_PASSWORD" })).toBe(
      "Wrong email or password.",
    );
    expect(authErrorMessage({ status: 403, code: "EMAIL_NOT_VERIFIED" })).toMatch(/confirm your email/i);
  });

  it("falls back to the server's message, then to a generic one", () => {
    expect(authErrorMessage({ status: 403, code: "SIGN_UP_CLOSED", message: "Sign-up is closed." })).toBe(
      "Sign-up is closed.",
    );
    expect(authErrorMessage({ status: 500 })).toBe("Something went wrong. Try again.");
  });
});
