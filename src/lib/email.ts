import { after } from "next/server";
import { Resend } from "resend";
import { isNewAccountLink } from "./auth/links";
import { SITE_NAME } from "./site";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

// Templates hold no free text a user typed, so an email from this site never carries someone
// else's words. The one exception is the new address of an email change, which goes only to the
// account's current address.

/**
 * The email that carries a password link: it finishes a new account, answers a sign-up attempt
 * on an existing one, or resets a password. Opening the link proves the address, so it is also
 * how a new account's email is confirmed.
 */
export function passwordLinkEmail(user: { email: string; emailVerified: boolean }, url: string): EmailMessage {
  if (!user.emailVerified) {
    return {
      to: user.email,
      subject: `Finish creating your ${SITE_NAME} account`,
      text: `Open this link to choose your password and finish creating your ${SITE_NAME} account:

${url}

The link works once, within an hour. If you did not create this account, ignore this email: nobody can sign in to it until a password is chosen from this link.
`,
    };
  }
  if (isNewAccountLink(url)) {
    return {
      to: user.email,
      subject: `Your ${SITE_NAME} account already exists`,
      text: `Someone tried to create a ${SITE_NAME} account with this email address, which already has one.

If it was you, open this link to choose a new password:

${url}

If it was not you, ignore this email. Your password stays the same.
`,
    };
  }
  return {
    to: user.email,
    subject: `Reset your ${SITE_NAME} password`,
    text: `Open this link to choose a new password for your ${SITE_NAME} account:

${url}

If you did not ask for this, ignore this email. Your password stays the same.
`,
  };
}

/** Sent to the current address before an email change: the change goes ahead only from here. */
export function changeEmailConfirmationEmail(to: string, newEmail: string, url: string): EmailMessage {
  return {
    to,
    subject: `Confirm the new email address for your ${SITE_NAME} account`,
    text: `Someone asked to change the email address of your ${SITE_NAME} account to ${newEmail}.

If it was you, open this link and confirm on the page it opens. We then send a link to the new address, and the change is done once you open that one too:

${url}

If it was not you, ignore this email and your address stays the same. Then change your password, and sign out of your other sessions in your account settings.
`,
  };
}

/** Sent to the new address of an email change, once the current address has confirmed it. */
export function newEmailAddressEmail(to: string, url: string): EmailMessage {
  return {
    to,
    subject: `Confirm your new email address for ${SITE_NAME}`,
    text: `Open this link to make this address the email of your ${SITE_NAME} account:

${url}

The link signs you in on the browser where you open it. If you did not ask for this, ignore this email.
`,
  };
}

/** A passkey signs in without the password or two-factor, so the owner hears about every new one. */
export function passkeyAddedEmail(to: string): EmailMessage {
  return {
    to,
    subject: `A passkey was added to your ${SITE_NAME} account`,
    text: `A new passkey can now sign in to your ${SITE_NAME} account, without your password or a two-factor code.

If you added it, there is nothing to do.

If you did not, remove it under Passkeys in your account settings, then change your password and sign out of your other sessions there.
`,
  };
}

export function deleteAccountEmail(to: string, url: string): EmailMessage {
  return {
    to,
    subject: `Confirm deleting your ${SITE_NAME} account`,
    text: `Someone asked to delete your ${SITE_NAME} account. If it was you, open this link in the browser where you are signed in, and confirm there:

${url}

Deleting the account removes your profile, sign-in methods, sessions and two-factor settings, and cannot be undone. The link works for 24 hours.

If it was not you, ignore this email: your account stays. Then change your password, and sign out of your other sessions in your account settings.
`,
  };
}

/**
 * Sends once the response is out, so its timing never tells whether an email went out.
 * Never throws. Without RESEND_API_KEY and EMAIL_FROM outside production, the message goes
 * to the server log instead, which keeps sign-up testable locally.
 */
export function sendEmail(message: EmailMessage): void {
  after(async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      if (process.env.NODE_ENV === "production") {
        console.error("Email not sent: RESEND_API_KEY or EMAIL_FROM is not set.");
      } else {
        console.info(`Email to ${message.to}: ${message.subject}\n\n${message.text}`);
      }
      return;
    }
    const { error } = await new Resend(apiKey).emails.send({ from, ...message });
    if (error) console.error(`Email not sent: ${error.name}: ${error.message}`);
  });
}
