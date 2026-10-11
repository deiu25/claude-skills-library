import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading title="Reset your password">
        Enter the email you signed up with, and we will send you a link to choose a new password.
      </AuthHeading>
      <ForgotPasswordForm />
      <p className="mt-6 text-sm">
        <Link href="/sign-in" className="text-muted transition-colors hover:text-accent-strong">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
