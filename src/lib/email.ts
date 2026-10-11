import { after } from "next/server";
import { Resend } from "resend";
import { SITE_NAME } from "./site";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

// Templates hold no text a user typed, so an email from this site never carries someone else's words.

export function verificationEmail(to: string, url: string): EmailMessage {
  return {
    to,
    subject: `Confirm your email for ${SITE_NAME}`,
    text: `Open this link to confirm your email address and finish creating your ${SITE_NAME} account:

${url}

If you did not create this account, do not open the link. Ignore this email instead: an unconfirmed account cannot be used.
`,
  };
}

export function resetPasswordEmail(to: string, url: string): EmailMessage {
  return {
    to,
    subject: `Reset your ${SITE_NAME} password`,
    text: `Open this link to choose a new password for your ${SITE_NAME} account:

${url}

If you did not ask for this, ignore this email. Your password stays the same.
`,
  };
}

export function existingAccountEmail(to: string): EmailMessage {
  return {
    to,
    subject: `Your ${SITE_NAME} account already exists`,
    text: `Someone tried to create a ${SITE_NAME} account with this email address, which already has one.

If it was you, sign in, or choose "Forgot your password?" on the sign-in page to set a new password.

If it was not you, ignore this email.
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
