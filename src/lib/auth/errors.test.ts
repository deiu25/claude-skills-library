import { describe, expect, it } from "vitest";
import { authErrorMessage, oauthErrorMessage } from "@/lib/auth/errors";

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
    expect(authErrorMessage({ status: 400, code: "SIGN_UP_CLOSED" })).toMatch(/invite-only.*use that address/i);
  });

  it("falls back to the server's message, then to a generic one", () => {
    expect(authErrorMessage({ status: 400, code: "USER_ALREADY_EXISTS", message: "User already exists." })).toBe(
      "User already exists.",
    );
    expect(authErrorMessage({ status: 500 })).toBe("Something went wrong. Try again.");
  });
});

describe("oauthErrorMessage", () => {
  it("explains the codes a user can act on", () => {
    expect(oauthErrorMessage("SIGN_UP_CLOSED")).toMatch(/invite-only.*sign in with that address/i);
    expect(oauthErrorMessage("email_not_verified")).toMatch(/verify your email address on github/i);
    expect(oauthErrorMessage("account_not_linked")).toMatch(/sign in with your email and password/i);
  });

  it("answers anything else, prototype keys included, with the generic retry message", () => {
    for (const code of ["state_mismatch", "internal_server_error", "constructor", "__proto__", ""]) {
      expect(oauthErrorMessage(code)).toBe("GitHub sign-in did not finish. Try again.");
    }
  });
});
