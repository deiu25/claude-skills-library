import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityCard } from "@/components/community/CommunityCard";
import { CommunityLabel } from "@/components/community/CommunityLabel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isSignUpOpen } from "@/lib/auth/allowlist";
import { toCard } from "@/lib/community/format";
import { profilePath } from "@/lib/community/links";
import { communityMetadata } from "@/lib/community/metadata";
import { getProfile } from "@/lib/community/queries";

// Rendered on its first visit, then served from the cache until a write marks it stale.
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ handle: string }>;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const profile = isSignUpOpen() ? await getProfile(handle) : null;
  if (!profile) return {};
  return communityMetadata({
    title: handle,
    description: profile.bio ?? `Claude Code skills published by ${handle}.`,
    path: profilePath(handle),
  });
}

export default async function ProfilePage({ params }: PageProps) {
  if (!isSignUpOpen()) notFound();
  const profile = await getProfile((await params).handle);
  if (!profile) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-all font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{profile.handle}</h1>
            <CommunityLabel />
          </div>
          {profile.bio && <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-muted sm:text-base">{profile.bio}</p>}
          <p className="font-mono text-xs text-faint">
            {profile.skills.length} public {profile.skills.length === 1 ? "skill" : "skills"}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profile.skills.map((skill) => (
            <CommunityCard key={skill.slug} skill={toCard(skill)} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
