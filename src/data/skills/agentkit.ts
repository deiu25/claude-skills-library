import type { Skill } from "../types";

export const skill: Skill = {
  slug: "agentkit",
  name: "AgentKit",
  tagline: "Claude Code plugin marketplace: 10 plugins, 23 skills, 13 agents for Git, security/OWASP, React/Next.js, and TYPO3.",
  category: "meta",
  tags: ["plugin-marketplace", "plugins", "git", "security", "react"],
  repo: "redpop/agentkit",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add redpop/agentkit",
  },
  update: {
    command: "/plugin marketplace update ak-marketplace",
    note: "Then run /reload-plugins. Formerly redpop/claude-code-toolkit; the pre-plugin v6.x install.sh version is archived at redpop/claude-code-toolkit-legacy.",
  },
  usage: [
    { command: "/plugin marketplace add redpop/agentkit", description: "Register the AgentKit marketplace in Claude Code (slug: ak-marketplace)." },
    { command: "/plugin install ak-review@ak-marketplace", description: "Install the code-review plugin (one of 10: ak-git, ak-security, ak-react, ak-typo3, ...)." },
    { command: "/plugin install ak-security@ak-marketplace", description: "Add OWASP-oriented security analysis skills and agents." },
    { command: "/plugin install ak-git@ak-marketplace", description: "Add Git workflow automation plugins." },
  ],
  whenToUse: [
    "You want a curated Claude Code plugin marketplace spanning Git, security, React/Next.js, and TYPO3 workflows",
    "You need composable plugins (10 plugins / 23 skills / 13 agents) instead of one monolithic toolkit",
    "You want OWASP-oriented security review skills wired into the Claude Code agent loop",
  ],
  howToUse: `Add the marketplace, then install only the plugins you need (marketplace slug \`ak-marketplace\`):

\`\`\`
/plugin marketplace add redpop/agentkit
/plugin install ak-review@ak-marketplace
\`\`\`

AgentKit ships 10 plugins — \`ak-git\`, \`ak-improve\`, \`ak-js\`, \`ak-knowledge\`, \`ak-meta\`, \`ak-notifications\`, \`ak-react\`, \`ak-review\`, \`ak-security\`, \`ak-typo3\` — totalling 23 skills and 13 agents. It was formerly \`redpop/claude-code-toolkit\`; the pre-plugin v6.x \`install.sh\` architecture is archived at \`redpop/claude-code-toolkit-legacy\`.`,
  whyUseful: `A well-organized, domain-spanning Claude Code plugin marketplace from redpop: 10 composable plugins (23 skills, 13 agents) for Git, security/OWASP, React/Next.js, and TYPO3 v13.4. Installing a single plugin loads only its skills and agents, keeping context lean, and the security plugin brings OWASP-aligned review into the agent loop.`,
  examplePrompt: "Add the redpop/agentkit marketplace and install ak-git and ak-review, then review this PR for security issues.",
  author: "redpop",
  dateAdded: "2026-06-20",
};
