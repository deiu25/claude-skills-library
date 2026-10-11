import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SignedInMarker } from "@/components/auth/SignedInMarker";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-muted sm:text-base">
            Signed in as <span className="text-foreground">{user.email}</span>.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard/settings" className="btn btn-ghost text-sm">
            Settings
          </Link>
          <SignOutButton className="btn btn-ghost text-sm" />
        </div>
        {/* Every sign-in lands here: email, the verification link and GitHub. */}
        <SignedInMarker />
      </main>
      <SiteFooter />
    </>
  );
}
