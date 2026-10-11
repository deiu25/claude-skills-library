import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
};

const LINK = "text-muted transition-colors hover:text-accent-strong";

export default function SignInPage() {
  return (
    <>
      <AuthHeading title="Sign in">Welcome back. Sign in with your email and password.</AuthHeading>
      <SignInForm />
      <div className="mt-6 flex flex-wrap justify-between gap-x-6 gap-y-2 text-sm">
        <Link href="/forgot-password" className={LINK}>
          Forgot your password?
        </Link>
        <Link href="/sign-up" className={LINK}>
          Create an account
        </Link>
      </div>
    </>
  );
}
