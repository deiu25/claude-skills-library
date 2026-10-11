import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { FormMessage } from "@/components/auth/FormMessage";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password",
};

interface PageProps {
  searchParams: Promise<{ token?: string | string[]; error?: string | string[] }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token, error } = await searchParams;

  return (
    <>
      <AuthHeading title="Choose a new password">
        Pick a password you do not use anywhere else.
      </AuthHeading>
      {typeof token === "string" && token && !error ? (
        <ResetPasswordForm token={token} />
      ) : (
        <FormMessage tone="error">
          This reset link is invalid or has expired.{" "}
          <Link href="/forgot-password" className="font-medium underline underline-offset-4">
            Request a new one
          </Link>
        </FormMessage>
      )}
    </>
  );
}
