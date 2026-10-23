import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { FormMessage } from "@/components/auth/FormMessage";
import { ReportForm } from "@/components/moderation/ReportForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isSignUpOpen } from "@/lib/auth/allowlist";
import { getSession } from "@/lib/auth/session";
import { findReportTarget } from "@/lib/moderation/queries";
import { OPERATOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "Report",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ skill?: string | string[]; user?: string | string[] }>;
}

const LINK = "font-medium underline underline-offset-4";

/**
 * Where "Report this skill" and "Report this profile" lead. Signed out, it says how to report
 * without looking anything up; signed in, it names what is reported, or answers 404 when the site
 * no longer shows it.
 */
export default async function ReportPage({ searchParams }: PageProps) {
  // The session is read first, so the page renders per request like the rest of /dashboard,
  // whatever ACCOUNTS_OPEN was when it was built.
  const [session, params] = await Promise.all([getSession(), searchParams]);
  if (!isSignUpOpen()) notFound();
  const targetType = typeof params.skill === "string" ? "skill" : typeof params.user === "string" ? "user" : null;
  const key = targetType === "skill" ? params.skill : params.user;
  if (!targetType || typeof key !== "string") notFound();
  const noun = targetType === "skill" ? "skill" : "profile";

  if (!session) {
    return (
      <Page title={`Report a ${noun}`} intro="A person reviews every report, and we email you what we decide.">
        <FormMessage tone="warning">
          Sign in to send a report from your account.{" "}
          <Link href="/sign-in" className={LINK}>
            Sign in
          </Link>
          . Without an account, write to{" "}
          <a href={`mailto:${OPERATOR.email}`} className={LINK}>
            {OPERATOR.email}
          </a>{" "}
          with the page&rsquo;s address, what is wrong with it and why, your name, and a statement that
          your report is accurate and complete to the best of your knowledge.
        </FormMessage>
      </Page>
    );
  }

  const target = await findReportTarget(targetType, key);
  if (!target) notFound();
  return (
    <Page
      title={`Report a ${noun}`}
      intro={
        <>
          Tell us what is wrong with <span className="break-all font-mono text-foreground">{target.name}</span>. A person
          reviews every report, and we email you what we decide.
        </>
      }
    >
      <ReportForm targetType={target.type} targetKey={key} path={target.path} />
    </Page>
  );
}

function Page({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-md flex-1 px-4 py-16 sm:px-6 sm:py-24">
        <AuthHeading title={title}>{intro}</AuthHeading>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
