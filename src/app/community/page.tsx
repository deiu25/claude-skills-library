import { UsersThree } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunitySearch } from "@/components/community/CommunitySearch";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isSignUpOpen } from "@/lib/auth/allowlist";
import { toCard } from "@/lib/community/format";
import { communityMetadata } from "@/lib/community/metadata";
import { getCommunitySkills } from "@/lib/community/queries";

// Writes that change what it shows revalidate it at once (revalidateCommunity); the hour is a backstop.
export const revalidate = 3600;

// Nothing, not even a canonical address, until the page exists.
export function generateMetadata(): Metadata {
  if (!isSignUpOpen()) return {};
  return communityMetadata({
    title: "Community",
    description: "Claude Code skills published by their authors on the Claude Skills Library, apart from the curated catalog.",
    path: "/community",
  });
}

export default async function CommunityPage() {
  if (!isSignUpOpen()) notFound();
  const skills = (await getCommunitySkills()).map(toCard);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 space-y-3">
          <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">Community</h1>
          <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-muted sm:text-base">
            Skills their authors published here. They are not part of the curated catalog and nobody reviews them, so
            read a skill&rsquo;s page, its scan and its files before you install it.
          </p>
        </div>

        {skills.length ? (
          <CommunitySearch skills={skills} />
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-[8px] border border-line bg-surface px-5 py-8 sm:px-8">
            <UsersThree size={36} className="text-faint" aria-hidden />
            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">No Community skills yet</h2>
              <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-muted">
                Write a skill in your dashboard, then make it public to list it here.
              </p>
            </div>
            {/* No prefetch: the dashboard renders per request and would ask for a session. */}
            <Link href="/dashboard/skills" prefetch={false} className="btn btn-ghost text-sm">
              Your skills
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
