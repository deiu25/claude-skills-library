import type { Skill } from "../types";

export const skill: Skill = {
  slug: "karpathy-guidelines",
  name: "Karpathy Guidelines",
  tagline: "Andrej Karpathy's coding principles as a skill: think first, stay simple, change surgically.",
  category: "code-quality",
  tags: ["principles", "simplicity", "code-quality", "philosophy"],
  repo: "forrestchang/andrej-karpathy-skills",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add forrestchang/andrej-karpathy-skills",
  },
  update: {
    command: "/plugin marketplace update andrej-karpathy-skills",
    note: "Then run /reload-plugins. Official marketplaces auto-update at startup.",
  },
  usage: [
    { command: "/karpathy-guidelines", description: "Invoke the skill to apply the four principles to current work." },
    { command: "Add to CLAUDE.md", description: "Paste the four principles as standing project rules for automatic application." },
    { command: "Think before coding", description: "State assumptions, surface tradeoffs, push back on complexity." },
    { command: "Simplicity first", description: "Write the minimum code that solves the problem, nothing speculative." },
    { command: "Surgical changes", description: "Touch only what you must; clean up only your own mess." },
    { command: "Goal-driven execution", description: "Define success criteria and loop until verified." },
  ],
  whenToUse: [
    "Every project: paste the principles into CLAUDE.md as standing rules",
    "When generated code keeps growing speculative abstractions and unrequested features",
    "Reviewing diffs that touched more than they needed to",
  ],
  howToUse: `Works best as standing guidance rather than an invoked skill. The four principles:

1. Think before coding: state assumptions, surface tradeoffs, push back on complexity
2. Simplicity first: minimum code that solves the problem, nothing speculative
3. Surgical changes: touch only what you must, clean up only your own mess
4. Goal-driven execution: define success criteria, loop until verified

Add to a project's CLAUDE.md or install the plugin for automatic application.`,
  whyUseful: `Four short rules that counteract the most common LLM coding failures: over-engineering, scope creep, drive-by refactors, and declaring victory without verification. Cheap to adopt, immediately visible in diff quality.`,
  examplePrompt: "Apply the Karpathy principles when refactoring this module",
  author: "forrestchang (principles by Andrej Karpathy)",
  dateAdded: "2026-06-12",
};
