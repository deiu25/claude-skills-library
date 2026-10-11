import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { SignInOptions } from "@/components/auth/SignInOptions";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function SignUpPage() {
  return (
    <>
      <AuthHeading title="Create an account">
        An account keeps your own skills. Browsing the library never needs one.
      </AuthHeading>
      <SignInOptions />
      <SignUpForm />
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-foreground transition-colors hover:text-accent-strong">
          Sign in
        </Link>
      </p>
    </>
  );
}
