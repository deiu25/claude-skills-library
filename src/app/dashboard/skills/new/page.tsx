import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkillEditor } from "@/components/skills/SkillEditor";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New skill",
  robots: { index: false },
};

const STARTER = `---
name: my-skill
description: What this skill does, and when Claude should use it.
---

# My skill

Steps for Claude to follow, in order.
`;

export default async function NewSkillPage() {
  await requireUser();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">New skill</h1>
          <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-muted sm:text-base">
            Write a SKILL.md, or paste one you already use. The name in its frontmatter becomes the skill&rsquo;s name.
          </p>
        </div>
        <div className="mt-10">
          <SkillEditor initial={{ skillMd: STARTER, category: "", tags: "" }} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
