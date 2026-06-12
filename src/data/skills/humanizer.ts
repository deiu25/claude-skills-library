import type { Skill } from "../types";

export const skill: Skill = {
  slug: "humanizer",
  name: "Humanizer",
  tagline: "Removes signs of AI-generated writing from text, based on Wikipedia's detection guide.",
  category: "productivity",
  tags: ["writing", "editing", "content", "ai-detection"],
  repo: "blader/humanizer",
  install: {
    method: "manual-copy",
    command: "git clone https://github.com/blader/humanizer ~/.claude/skills/humanizer",
  },
  whenToUse: [
    "Editing README files, blog posts, or docs drafted with AI assistance",
    "Marketing copy that needs to sound human, not generated",
    "Any text where AI tells (inflated symbolism, rule of three, em-dash overuse) would hurt credibility",
  ],
  howToUse: `Ask Claude to humanize a text or review a draft:

\`\`\`
Humanize the README I just wrote
\`\`\`

The skill detects and fixes specific patterns from Wikipedia's "Signs of AI writing" guide: promotional language, superficial -ing analyses, vague attributions, negative parallelisms ("not just X, but Y"), AI vocabulary words, filler phrases, and em-dash overuse.`,
  whyUseful: `Readers have learned to spot generated text, and it costs trust. This skill encodes a concrete, sourced checklist instead of a vague "make it sound natural" instruction, so the edits are systematic and explainable. Especially useful before publishing anything public-facing.`,
  examplePrompt: "Use humanizer on docs/announcement.md before I publish it",
  author: "blader",
  dateAdded: "2026-06-12",
};
