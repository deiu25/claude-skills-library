import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { FormMessage } from "@/components/auth/FormMessage";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a password",
};

interface PageProps {
  searchParams: Promise<{ token?: string | string[]; error?: string | string[]; new?: string | string[] }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token, error, new: newAccount } = await searchParams;
  // The sign-up email's link: the same form, finishing a new account.
  const finishing = newAccount === "1";

  return (
    <>
      <AuthHeading title={finishing ? "Choose your password" : "Choose a new password"}>
        {finishing
          ? "This finishes creating your account. Pick a password you do not use anywhere else."
          : "Pick a password you do not use anywhere else."}
      </AuthHeading>
      {typeof token === "string" && token && !error ? (
        <ResetPasswordForm token={token} finishing={finishing} />
      ) : (
        <FormMessage tone="error">
          This link is invalid or has expired.{" "}
          <Link href="/forgot-password" className="font-medium underline underline-offset-4">
            Request a new one
          </Link>
        </FormMessage>
      )}
    </>
  );
}
