import type { Skill } from "../types";

export const skill: Skill = {
  slug: "awesome-claude-skills",
  name: "Awesome Agent Skills",
  tagline: "Curated, hand-picked index of 1424+ official and community Agent Skills, grouped by publishing team.",
  category: "resource",
  tags: ["awesome-list", "skills", "directory", "claude-code", "community", "official"],
  repo: "VoltAgent/awesome-claude-skills",
  install: {
    method: "manual-copy",
    command: "Browse at github.com/VoltAgent/awesome-agent-skills (github.com/VoltAgent/awesome-claude-skills 301-redirects here)",
  },
  update: {
    command: "git pull / re-visit the repo",
    note: "Curated list, no install — bookmark and revisit. The repo was renamed to awesome-agent-skills; the old awesome-claude-skills URL still 301-redirects.",
  },
  usage: [
    { command: "Browse #table-of-contents", description: "Jump to official skills by team: Anthropic, Google Gemini, Vercel, Stripe, Cloudflare, Supabase, Figma, OpenAI, NVIDIA, and 50+ more." },
    { command: "git clone https://github.com/VoltAgent/awesome-agent-skills", description: "Clone the README link-index to browse the full catalog of 1424+ skills offline." },
    { command: "Follow a skill link, then copy its SKILL.md into .claude/skills/", description: "Each entry links to the skill source (officialskills.sh or GitHub); copy it project-scoped, or use ~/.claude/skills/ for global." },
    { command: "See 'Skills Paths for Other AI Coding Assistants'", description: "Path table for Codex (.agents/skills/), Cursor, Gemini CLI, Copilot, OpenCode, Windsurf, Antigravity." },
    { command: "Read 'Skill Quality Standards'", description: "Quality criteria: third-person description, progressive disclosure, no absolute paths, scoped tools." },
    { command: "Read '🔒 Security Notice'", description: "Reminder that listed skills are curated, not audited — review the source before installing." },
  ],
  whenToUse: [
    "You want to discover real, team-published Agent Skills (Anthropic, Vercel, Stripe, Cloudflare, Hugging Face, Trail of Bits, Figma) rather than AI-generated filler.",
    "You need a skill for a specific vendor or domain and want to find the official one fast.",
    "You are authoring your own skill and want quality criteria plus the correct install path for each AI coding assistant.",
    "You want a vendor-neutral reference covering Claude Code, Codex, Cursor, Gemini CLI, Copilot, OpenCode, Windsurf, and Antigravity.",
  ],
  howToUse: `This is a **curated awesome-list**, not an installable plugin. Browse the index, follow each skill's link to its source, then copy the skill into a skill folder.

\`\`\`bash
git clone https://github.com/VoltAgent/awesome-agent-skills
# (github.com/VoltAgent/awesome-claude-skills 301-redirects to the same repo)
\`\`\`

The README itself is a link-index, not a vendored copy of every skill — entries link out to \`officialskills.sh/<org>/skills/<name>\` or to the skill's GitHub repo. Skills are grouped by publishing team in the table of contents. To use one in Claude Code, fetch its \`SKILL.md\` (and supporting files) from the linked source and drop it into a skill folder:

\`\`\`bash
# project-scoped
mkdir -p .claude/skills/<skill-name>
# copy SKILL.md + assets from the linked source into it
# or global: ~/.claude/skills/<skill-name>/
\`\`\`

The README's path table maps the same layout to Codex (\`.agents/skills/\`), Cursor (\`.cursor/skills/\`), Gemini CLI (\`.gemini/skills/\`), Copilot (\`.github/skills/\`), OpenCode, Windsurf, and Antigravity. Heed the Security Notice: listed skills are curated, not audited — review the source before installing.`,
  whyUseful: `Maintained by VoltAgent, this is positioned as the most-contributed Agent Skills index and is explicitly hand-picked ("not AI-slop generated"), prioritizing skills proven in real-world use over freshly-generated ones (the contributing note even rejects skills "created 3 hours ago"). It aggregates official skills from Anthropic, Google Gemini, Vercel, Stripe, Cloudflare, Supabase, Hugging Face, Trail of Bits, Figma, OpenAI, NVIDIA, Microsoft, and 50+ other teams in one place, so you find the authoritative version instead of a fork. It is vendor-neutral (path table for 8 coding assistants) and ships explicit quality standards plus a security notice, making it a credible first stop for skill discovery.`,
  examplePrompt: "Find the official Stripe and Cloudflare skills in awesome-agent-skills and copy them into my project's .claude/skills/ directory.",
  author: "VoltAgent",
  dateAdded: "2026-06-20",
};
