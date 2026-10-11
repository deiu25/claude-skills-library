import { describe, expect, it } from "vitest";
import { NEW_ACCOUNT_PASSWORD_PATH } from "./auth/links";
import {
  changeEmailConfirmationEmail,
  deleteAccountEmail,
  newEmailAddressEmail,
  passkeyAddedEmail,
  passwordLinkEmail,
} from "./email";

// The URL Better Auth builds for a password link: /reset-password/<token>?callbackURL=<redirectTo>.
const link = (redirectTo: string) =>
  `https://example.com/api/auth/reset-password/abc123?callbackURL=${encodeURIComponent(redirectTo)}`;

describe("passwordLinkEmail", () => {
  it("finishes a new account while its address is unconfirmed", () => {
    const email = passwordLinkEmail({ email: "ada@example.com", emailVerified: false }, link(NEW_ACCOUNT_PASSWORD_PATH));
    expect(email.subject).toMatch(/^Finish creating/);
    expect(email.text).toContain(link(NEW_ACCOUNT_PASSWORD_PATH));
  });

  it("tells an existing account about a sign-up attempt, link included", () => {
    const email = passwordLinkEmail({ email: "ada@example.com", emailVerified: true }, link(NEW_ACCOUNT_PASSWORD_PATH));
    expect(email.subject).toMatch(/already exists$/);
    expect(email.text).toContain("abc123");
  });

  it("is a plain reset for a confirmed address asking from the reset page", () => {
    const email = passwordLinkEmail({ email: "ada@example.com", emailVerified: true }, link("/reset-password"));
    expect(email.subject).toMatch(/^Reset your/);
    expect(email.to).toBe("ada@example.com");
  });
});

describe("account emails", () => {
  it("send each link to the address it belongs to", () => {
    const confirm = changeEmailConfirmationEmail("old@example.com", "new@example.com", "https://example.com/confirm-email-change?token=t1");
    expect(confirm.to).toBe("old@example.com");
    expect(confirm.text).toContain("new@example.com");
    expect(confirm.text).toContain("https://example.com/confirm-email-change?token=t1");

    const verify = newEmailAddressEmail("new@example.com", "https://example.com/api/auth/verify-email?token=t2");
    expect(verify.to).toBe("new@example.com");
    expect(verify.text).toContain("token=t2");

    const remove = deleteAccountEmail("ada@example.com", "https://example.com/dashboard/delete-account?token=t3");
    expect(remove.text).toContain("/dashboard/delete-account?token=t3");
  });

  it("tells the owner about a new passkey without naming it", () => {
    const added = passkeyAddedEmail("ada@example.com");
    expect(added.to).toBe("ada@example.com");
    expect(added.subject).toMatch(/passkey was added/);
  });
});
