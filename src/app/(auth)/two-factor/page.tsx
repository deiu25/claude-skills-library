import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { TwoFactorForm } from "@/components/auth/TwoFactorForm";

export const metadata: Metadata = {
  title: "Two-factor authentication",
};

export default function TwoFactorPage() {
  return (
    <>
      <AuthHeading title="Enter your code">
        Your account has two-factor authentication. Open your authenticator app and enter the code it shows.
      </AuthHeading>
      <TwoFactorForm />
      <p className="mt-6 text-sm">
        <Link href="/sign-in" className="text-muted transition-colors hover:text-accent-strong">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
