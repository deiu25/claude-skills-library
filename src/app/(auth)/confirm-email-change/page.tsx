import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { FormMessage } from "@/components/auth/FormMessage";

export const metadata: Metadata = {
  title: "Confirm your new email address",
};

interface PageProps {
  searchParams: Promise<{ token?: string | string[]; sent?: string | string[]; error?: string | string[] }>;
}

const LINK = "font-medium underline underline-offset-4";

/**
 * Where the current address's confirmation link lands. Confirming takes a button press, which a
 * link scanner opening every URL in an email never makes; the form goes to Better Auth's
 * verify-email, which mails the new address and comes back here with ?sent=1.
 */
export default async function ConfirmEmailChangePage({ searchParams }: PageProps) {
  const { token, sent, error } = await searchParams;

  return (
    <>
      <AuthHeading title="Change your email address?">
        Your account moves to the new address we emailed you about. We then send a link there, and the change is
        done once it is opened.
      </AuthHeading>
      {error ? (
        <FormMessage tone="error">
          This link is invalid or has expired.{" "}
          <Link href="/dashboard/settings#email" className={LINK}>
            Ask for a new one
          </Link>
        </FormMessage>
      ) : sent === "1" ? (
        <FormMessage tone="success">
          Confirmed. We sent a link to the new address, and the change is done once it is opened.
        </FormMessage>
      ) : typeof token === "string" && token ? (
        <form action="/api/auth/verify-email" method="get">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="callbackURL" value="/confirm-email-change?sent=1" />
          <button type="submit" className="btn btn-primary text-sm">
            Confirm the change
          </button>
        </form>
      ) : (
        <FormMessage tone="error">
          This link is incomplete.{" "}
          <Link href="/dashboard/settings#email" className={LINK}>
            Ask for a new one
          </Link>
        </FormMessage>
      )}
    </>
  );
}
