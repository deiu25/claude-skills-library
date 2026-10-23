import { describe, expect, it } from "vitest";
import { NEW_ACCOUNT_PASSWORD_PATH } from "./auth/links";
import {
  changeEmailConfirmationEmail,
  deleteAccountEmail,
  newEmailAddressEmail,
  newReportEmail,
  passkeyAddedEmail,
  passwordLinkEmail,
  removalEmail,
  reportDecisionEmail,
  reportReceivedEmail,
  suspensionEmail,
} from "./email";
import { OPERATOR, SITE_URL } from "./site";

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

describe("moderation emails", () => {
  const address = `${SITE_URL}/u/bob/pdf-forms`;

  it("confirm a report to its sender, and tell an admin without quoting it", () => {
    const receipt = reportReceivedEmail("ada@example.com", address);
    expect(receipt.to).toBe("ada@example.com");
    expect(receipt.text).toContain(address);

    const notice = newReportEmail("admin@example.com");
    expect(notice.text).toContain(`${SITE_URL}/dashboard/admin`);
    expect(notice.text).not.toContain(address);
  });

  it("send a report's sender the decision and how to contest it", () => {
    const acted = reportDecisionEmail("ada@example.com", address, "acted");
    expect(acted.text).toMatch(/^We acted on your report/);
    const dismissed = reportDecisionEmail("ada@example.com", address, "dismissed");
    expect(dismissed.text).toMatch(/decided not to act/);
    const gone = reportDecisionEmail("ada@example.com", address, "gone");
    expect(gone.text).toMatch(/no longer on .* when we reviewed it/);
    for (const email of [acted, dismissed, gone]) {
      expect(email.text).toContain(OPERATOR.email);
      expect(email.text).toContain(`${SITE_URL}/terms`);
    }
  });

  it("state the reasons for a removal or a suspension, as the Digital Services Act asks", () => {
    const statement = { reason: "Breaks the terms of use: install.sh uploads ~/.ssh to a remote server.", onReport: true };
    const removal = removalEmail("bob@example.com", "pdf-forms", statement);
    const suspension = suspensionEmail("bob@example.com", { ...statement, onReport: false });
    expect(removal.subject).toContain("pdf-forms");
    for (const email of [removal, suspension]) {
      expect(email.to).toBe("bob@example.com");
      // What happened, where and for how long; why; who decided and how; and the way to contest it.
      expect(email.text).toMatch(/everywhere, with no end date/);
      expect(email.text).toContain(`Why: ${statement.reason}`);
      expect(email.text).toMatch(/A person made this decision; no automated system took it\./);
      expect(email.text).toContain(OPERATOR.email);
      // The sender address is Resend's test address for now, so nothing may ask for a reply.
      expect(email.text).not.toMatch(/reply/i);
    }
    expect(removal.text).toContain("after a report");
    expect(suspension.text).toContain("on our own review");
  });
});
