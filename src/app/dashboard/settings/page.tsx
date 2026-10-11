import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SignedInMarker } from "@/components/auth/SignedInMarker";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const { session, user } = await requireSession();
  const { error } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">Settings</h1>
          <p className="text-pretty text-sm leading-relaxed text-muted sm:text-base">
            Your profile, how you sign in, and your data.
          </p>
        </div>
        <AccountSettings
          user={user}
          currentSessionId={session.id}
          githubError={typeof error === "string" ? error : null}
        />
        {/* A new email address's link signs in and lands here. */}
        <SignedInMarker />
      </main>
      <SiteFooter />
    </>
  );
}
