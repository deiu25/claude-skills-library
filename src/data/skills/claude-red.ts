import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-red",
  name: "Claude-Red",
  tagline: "58 offensive-security SKILL.md files turning Claude into a red-team operator across web, cloud, wireless, and exploit dev.",
  category: "domain",
  tags: ["security", "red-team", "pentesting", "offensive-security", "skill-collection", "exploit-dev"],
  repo: "SnailSploit/Claude-Red",
  install: {
    method: "manual-copy",
    command: "git clone https://github.com/SnailSploit/claude-red ~/.claude/skills/claude-red",
  },
  whenToUse: [
    "Conducting authorized penetration testing or red-team engagements and wanting Claude primed with attack methodology",
    "Researching a specific attack surface like SQL injection, JWT exploitation, Kerberoasting, or EDR evasion",
    "Doing exploit development, fuzzing, or vulnerability research and needing structured technique references",
    "Working across web, cloud, wireless, mobile, IoT, or Active Directory security domains",
  ],
  howToUse: `Install the whole library by cloning into your skills directory:

\`\`\`bash
git clone https://github.com/SnailSploit/claude-red ~/.claude/skills/claude-red
\`\`\`

Install just one or two categories with sparse checkout, or run the interactive installer:

\`\`\`bash
git clone --filter=blob:none --sparse https://github.com/SnailSploit/claude-red
cd claude-red && git sparse-checkout set Skills/web Skills/active-directory
# or:
./install.sh --category web
\`\`\`

Once installed, skills load automatically on conversational triggers (e.g. mentioning SQL injection activates the relevant skill). You can also pipe a SKILL.md into a session: \`cat Skills/web/offensive-sqli/SKILL.md | claude --system-file -\`.`,
  whyUseful: `Packs 58 expert-authored offensive-security methodologies into drop-in SKILL.md files spanning 13 domains (web, auth, AD, wireless, cloud, mobile, IoT, infra/red-team, exploit dev, fuzzing, recon, AI security, reporting). Contextual loading means only the relevant attack-surface knowledge enters the context window. Intended strictly for authorized, legal security testing.`,
  examplePrompt: "Help me test this login endpoint for SQL injection and JWT algorithm-confusion on my authorized engagement.",
  author: "SnailSploit (Kai Aizen)",
  dateAdded: "2026-06-14",
};
