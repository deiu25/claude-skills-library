import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/components/auth/AuthHeading";

export const metadata: Metadata = {
  title: "Account deleted",
};

export default function AccountDeletedPage() {
  return (
    <>
      <AuthHeading title="Your account is deleted">
        Its profile, sign-in methods, sessions and two-factor settings are gone. The library itself never needs an
        account.
      </AuthHeading>
      <Link href="/skills" className="btn btn-ghost text-sm">
        Browse skills
      </Link>
    </>
  );
}
