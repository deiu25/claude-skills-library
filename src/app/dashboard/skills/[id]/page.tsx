import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkillWorkspace } from "@/components/skills/SkillWorkspace";
import { getOwnedSkill } from "@/lib/skills/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await getOwnedSkill((await params).id);
  return { title: name, robots: { index: false } };
}

export default async function SkillPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <SkillWorkspace skillId={id} />
      </main>
      <SiteFooter />
    </>
  );
}
