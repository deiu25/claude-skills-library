import { Plus } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkillList } from "@/components/skills/SkillList";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Your skills",
  robots: { index: false },
};

export default async function SkillsPage() {
  const user = await requireUser();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
          <div className="space-y-3">
            <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">Your skills</h1>
            <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-muted sm:text-base">
              Skills you write here stay private until you publish them. Each one is checked and scanned as you edit it.
            </p>
          </div>
          <Link href="/dashboard/skills/new" className="btn btn-primary text-sm">
            <Plus size={16} weight="bold" aria-hidden />
            New skill
          </Link>
        </div>
        <div className="mt-10">
          <SkillList userId={user.id} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
