import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { FormMessage } from "@/components/auth/FormMessage";
import { ConfirmDeleteAccount } from "@/components/settings/ConfirmDeleteAccount";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Delete your account",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

const LINK = "font-medium underline underline-offset-4";

/** Where the deletion email's link lands. Better Auth deletes only for the signed-in owner of the token. */
export default async function DeleteAccountPage({ searchParams }: PageProps) {
  const [session, { token }] = await Promise.all([getSession(), searchParams]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-md flex-1 px-4 py-16 sm:px-6 sm:py-24">
        <AuthHeading title="Delete your account?">
          This removes your profile, sign-in methods, sessions, passkeys and two-factor settings.
        </AuthHeading>
        {!session ? (
          <FormMessage tone="error">
            Sign in first, then open the link from the email again.{" "}
            <Link href="/sign-in" className={LINK}>
              Sign in
            </Link>
          </FormMessage>
        ) : typeof token !== "string" || !token ? (
          <FormMessage tone="error">
            This link is incomplete.{" "}
            <Link href="/dashboard/settings#delete" className={LINK}>
              Ask for a new one
            </Link>
          </FormMessage>
        ) : (
          <ConfirmDeleteAccount token={token} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
