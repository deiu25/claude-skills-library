import type { Skill } from "../types";

export const skill: Skill = {
  slug: "stitch-skills",
  name: "Stitch Skills",
  tagline: "Google Stitch agent skills for AI UI design: generate screens, convert designs to React, manage design systems.",
  category: "design",
  tags: ["design", "ui-generation", "stitch", "react", "mcp", "design-system"],
  repo: "google-labs-code/stitch-skills",
  repoPath: "plugins",
  install: {
    method: "plugin",
    command: "npx plugins add google-labs-code/stitch-skills --scope project --target claude-code",
  },
  whenToUse: [
    "You use Google Stitch to design UIs and want your coding agent to drive it (generate screens from text/images, manage themes)",
    "You want to convert existing frontend code or static HTML into Stitch designs, or turn Stitch designs into React / React Native components",
    "You want to extract a DESIGN.md design system from a Stitch project or enhance vague UI prompts into detailed briefs",
    "You already have the Stitch MCP server configured and want a ready-made skill suite around it",
  ],
  howToUse: `Install the plugin suite into Claude Code (project-scoped):

\`\`\`bash
npx plugins add google-labs-code/stitch-skills --scope project --target claude-code
\`\`\`

Prerequisite: the **Stitch MCP server** must be configured and running — the skills call it to do the actual design/generation work. The collection follows the Agent Skills open standard (Claude Code, Codex, Gemini CLI, Cursor) and ships three packages:

- **stitch-design** — code-to-design, generate-design, manage-design-system, extract-design-md, upload-to-stitch
- **stitch-build** — react-components, react-native, remotion (walkthrough videos), shadcn-ui
- **stitch-utilities** — design-md, enhance-prompt, stitch-loop, taste-design

Once installed, invoke the relevant skill in conversation. For selective install, use \`npx skills add google-labs-code/stitch-skills\`.`,
  whyUseful: `A first-party Google Labs suite that turns Google Stitch's AI UI-design engine into agent-callable skills, covering the full loop: generate or import designs, manage a design system, and emit production React / React Native / shadcn/ui code plus Remotion walkthrough videos. Because it follows the Agent Skills open standard, the same skills work across Claude Code, Codex, Gemini CLI, and Cursor.`,
  examplePrompt: "Generate a Stitch design for a pricing page, then convert the selected screen into React with shadcn/ui.",
  author: "google-labs-code",
  dateAdded: "2026-06-14",
};
