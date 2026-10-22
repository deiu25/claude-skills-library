import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkillVersionView } from "@/components/skills/SkillVersionView";
import { getOwnedVersion } from "@/lib/skills/queries";

interface PageProps {
  params: Promise<{ id: string; version: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, version } = await params;
  const { name } = await getOwnedVersion(id, Number(version));
  return { title: `${name}, version ${version}`, robots: { index: false } };
}

export default async function SkillVersionPage({ params }: PageProps) {
  const { id, version } = await params;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <SkillVersionView skillId={id} version={Number(version)} />
      </main>
      <SiteFooter />
    </>
  );
}
