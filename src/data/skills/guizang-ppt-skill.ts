import type { Skill } from "../types";

export const skill: Skill = {
  slug: "guizang-ppt-skill",
  name: "Guizang PPT Skill",
  tagline: "Agent skill that generates single-file HTML swipe-deck slides, PPT imagery, and multi-platform covers in two locked visual systems.",
  category: "design",
  tags: ["presentation", "html-slides", "design-system", "swiss-style", "cover-image", "claude-code"],
  repo: "op7418/guizang-ppt-skill",
  install: {
    method: "npx-skills",
    command: "npx skills add https://github.com/op7418/guizang-ppt-skill --skill guizang-ppt-skill",
  },
  update: {
    command: "cd ~/.claude/skills/guizang-ppt-skill && git pull",
    note: "Re-run the install command, or git pull in the local skill dir (~/.claude/skills/guizang-ppt-skill), then check the latest commit.",
  },
  usage: [
    { command: "assets/template.html", description: "Style A editorial-magazine deck template (electronic-ink, 10 layout skeletons)." },
    { command: "assets/template-swiss.html", description: "Style B Swiss-international template with 22 locked layouts (grid, anchor color, hairline rules)." },
    { command: "node scripts/validate-swiss-deck.mjs path/to/index.html", description: "Validate a Swiss-style deck: blocks centered titles, off-grid layouts, text-in-SVG, images outside slots." },
    { command: "references/checklist.md", description: "Quality checklist run before delivery; all blocking issues must pass." },
    { command: "references/themes.md / themes-swiss.md", description: "Pick one preset palette (5 Style A inks, 4 Swiss anchor colors); custom hex is disallowed." },
    { command: "references/image-prompts.md", description: "GPT-Image 2.0 / GPT-M 2.0 prompt types and aspect ratios for figures, infographics, and UI scenes." },
  ],
  whenToUse: [
    "You want a single-file HTML horizontal swipe deck for an offline talk, demo day, or product launch with strong personal style.",
    "You need a methodology or product-analysis deck in a strict Swiss grid system with locked layouts and a palette validator.",
    "You want PPT figures, infographics, screenshot redesigns, or cover images generated to match template slots.",
    "You are driving Claude Code or Codex and want a structured slide workflow instead of hand-coding HTML/CSS.",
  ],
  howToUse: `Install the skill (it lands in \`~/.claude/skills/guizang-ppt-skill\`):

\`\`\`bash
npx skills add https://github.com/op7418/guizang-ppt-skill --skill guizang-ppt-skill
\`\`\`

Or clone manually:

\`\`\`bash
git clone https://github.com/op7418/guizang-ppt-skill.git ~/.claude/skills/guizang-ppt-skill
\`\`\`

Then just ask the agent in natural language and the skill auto-triggers:

\`\`\`text
帮我基于这篇文章做一份瑞士风 PPT，控制在 7 页左右，需要 2-3 张配图。
\`\`\`

The workflow is structured: pick Style A (editorial) or Style B (Swiss), copy the matching template, fill content from the layout skeletons, optionally generate images in Codex, then self-check against \`references/checklist.md\`. For Swiss decks, run the validator before delivery:

\`\`\`bash
node scripts/validate-swiss-deck.mjs path/to/index.html
\`\`\`

Output is a single HTML file — open it in any browser, navigate with ← → / scroll / swipe, toggle a static low-perf mode for weak hardware.`,
  whyUseful: `Built by 歸藏 (@op7418), a well-known Chinese AI-product creator, and distilled from real offline talks — pitfalls are written into \`references/checklist.md\`. It ships two complete, opinionated visual systems (electronic-ink editorial with 10 layouts and Swiss international with 22 locked layouts), preset-only palettes (5 inks / 4 anchor colors), and an actual \`validate-swiss-deck.mjs\` script that enforces the grid, so an agent produces consistent decks instead of generic AI slop. The single-file HTML output needs no build or server, and the same theme covers slides, figures, screenshot redesigns, and multi-platform covers. Backed by a 360 安全龍蝦 gold sponsorship and a 真格 (ZhenFund) Token Grant.`,
  examplePrompt: "基于这篇文章生成一份 8 页左右的瑞士风 PPT，克莱因蓝主题，需要 3 张配图，图片比例跟模板槽位匹配。",
  author: "歸藏 (op7418)",
  dateAdded: "2026-06-20",
};
