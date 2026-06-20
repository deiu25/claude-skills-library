import type { Skill } from "../types";

export const skill: Skill = {
  slug: "guizang-social-card-skill",
  name: "Guizang Social Card Skill",
  tagline: "Generate Xiaohongshu image-card sets and WeChat 21:9 + 1:1 cover pairs in Editorial or Swiss visual systems.",
  category: "design",
  tags: ["social-cards", "xiaohongshu", "editorial-design", "swiss-design", "html-to-png", "layout"],
  repo: "op7418/guizang-social-card-skill",
  install: {
    method: "npx-skills",
    command: "npx skills add https://github.com/op7418/guizang-social-card-skill --skill guizang-social-card-skill",
  },
  update: {
    command: "git -C ~/.claude/skills/guizang-social-card-skill pull",
    note: "README's documented update flow: cd into ~/.claude/skills/guizang-social-card-skill and run git pull. Or re-run the install command. The skill is a git checkout under ~/.claude/skills.",
  },
  usage: [
    { command: "node render.mjs", description: "Render the task's HTML posters to output/*.png via Playwright, no frontend build chain." },
    { command: "node validate-social-deck.mjs path/to/task-dir", description: "QA the real DOM for overflow, type-size caps, 4-band density, and footer collision." },
    { command: ".poster.xhs / .poster.wide / .poster.square", description: "Pick artboard: 1080x1440 (XHS 3:4), 2100x900 (WeChat 21:9), 1080x1080 (WeChat 1:1)." },
    { command: "M01-M16 / S01-S12", description: "Choose from 28 layout skeletons: 16 Editorial (Image-Led Cover, Pipeline, Before/After) + 12 Swiss (KPI Tower, H-Bar Chart, Matrix+Hero)." },
    { command: "10 theme presets", description: "6 Editorial inks (incl. Midnight Ink) + 4 Swiss anchor colors (IKB Klein Blue, Lemon Yellow, Lemon Green, Safety Orange)." },
  ],
  whenToUse: [
    "You need a multi-card Xiaohongshu/Rednote carousel from an article, review, screenshots, or photos.",
    "You want a matched WeChat cover pair: a 21:9 header plus a 1:1 share card with consistent visuals.",
    "You want product reviews or data recaps as Swiss grid cards, or lifestyle/travel content as restrained Editorial magazine layouts.",
    "You need image-card output an agent can write, render to PNG, and validate without a frontend build chain.",
  ],
  howToUse: `Install with the skills CLI, then talk to the agent in natural language:

\`\`\`bash
npx skills add https://github.com/op7418/guizang-social-card-skill --skill guizang-social-card-skill
\`\`\`

The skill drives a 7-step workflow (intake -> style & theme -> layout -> asset prep -> compose & render -> deliver -> iterate). Trigger it with requests like "make a 5-card Swiss-style Xiaohongshu set in IKB blue" or "turn this article into a WeChat 21:9 header + 1:1 share card." It fills layout skeletons and fetches images (user-supplied first, else Unsplash -> Pexels -> Flickr CC -> Wallhaven, writing SOURCES.md), then renders:

\`\`\`bash
node render.mjs                                   # posters -> output/*.png
node validate-social-deck.mjs path/to/task-dir    # optional QA on the real DOM
\`\`\`

Needs an agent with file read/write plus shell (Claude Code, Codex, Cursor); not for plain chatbots without a render pipeline.`,
  whyUseful: `Built by op7418 (歸藏), a well-known Chinese AI/design creator, as the sister skill to guizang-ppt-skill, sharing the same aesthetic language. It is opinionated where it matters: two locked visual systems (Editorial magazine vs. Swiss international), 10 theme presets, and 28 vetted layout skeletons, so output stays consistent instead of drifting. The single-file HTML + Playwright pipeline lets an agent author, render to PNG, and verify layout with real DOM measurements (validate-social-deck.mjs) rather than guessing.`,
  examplePrompt: "Turn this product review into a 5-card Swiss-style Xiaohongshu set in IKB blue, using KPI Tower and H-Bar Chart layouts.",
  author: "op7418 (歸藏)",
  dateAdded: "2026-06-20",
};
