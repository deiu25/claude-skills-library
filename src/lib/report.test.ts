import { describe, expect, it } from "vitest";
import type { Skill } from "@/data/types";
import type { StatsByRepo } from "@/lib/report";
import { toCheatSheet, toInstallAllPrompt, toJsonCatalog, toLlmsTxt, toMarkdownReport, toSkillMarkdown } from "@/lib/report";

function makeSkill(overrides: Partial<Skill> & Pick<Skill, "slug" | "name" | "category">): Skill {
  return {
    tagline: "A skill",
    tags: [],
    repo: null,
    install: { method: "manual-copy", command: "copy it" },
    update: { command: "update it" },
    whenToUse: [],
    usage: [],
    howToUse: "",
    whyUseful: "",
    author: "Test",
    dateAdded: "2026-01-01",
    ...overrides,
  };
}

const SKILLS: Skill[] = [
  makeSkill({ slug: "alpha", name: "Alpha", category: "design", repo: "owner/alpha", tags: ["x"] }),
  makeSkill({ slug: "beta", name: "Beta", category: "testing", whenToUse: ["When testing"] }),
];

const STATS: StatsByRepo = {
  "owner/alpha": {
    repo: "owner/alpha",
    stars: 100,
    forks: 1,
    watchers: 1,
    openIssues: 0,
    pushedAt: "2026-01-02",
    license: "MIT",
    language: "TypeScript",
  },
};

describe("toJsonCatalog", () => {
  it("is versioned and counts skills", () => {
    const catalog = toJsonCatalog(SKILLS, STATS);
    expect(catalog.version).toBe(1);
    expect(catalog.count).toBe(2);
    expect(catalog.generatedAt).toBe("");
  });

  it("orders by stars descending, then attaches stars", () => {
    const catalog = toJsonCatalog(SKILLS, STATS);
    expect(catalog.skills[0]?.slug).toBe("alpha");
    expect(catalog.skills[0]?.stars).toBe(100);
    expect(catalog.skills[1]?.stars).toBeNull();
  });

  it("includes a route url per skill", () => {
    const catalog = toJsonCatalog(SKILLS);
    expect(catalog.skills.find((s) => s.slug === "alpha")?.url).toBe("/skills/alpha");
  });
});

describe("toLlmsTxt", () => {
  it("emits an H1 and per-skill link lines grouped by category", () => {
    const txt = toLlmsTxt(SKILLS);
    expect(txt).toContain("# Claude Code Skills Library");
    expect(txt).toContain("## Design");
    expect(txt).toContain("- [Alpha](/skills/alpha): A skill");
  });
});

describe("toMarkdownReport", () => {
  it("groups by category with a heading and skill entries", () => {
    const md = toMarkdownReport(SKILLS, STATS);
    expect(md).toContain("# Claude Code Skills — Library Report");
    expect(md).toContain("## Design (1)");
    expect(md).toContain("### Alpha — 100★");
    expect(md).toContain("- Install: `copy it`");
  });
});

describe("toSkillMarkdown", () => {
  it("emits an H1, tagline, category and install for a single skill", () => {
    const md = toSkillMarkdown(SKILLS[1]!); // beta: no repo, has whenToUse
    expect(md).toContain("# Beta");
    expect(md).toContain("A skill");
    expect(md).toContain("- Category: Testing");
    expect(md).toContain("- Install: `copy it`");
    expect(md).toContain("- When to use:");
    expect(md).toContain("  - When testing");
  });

  it("appends a star count and source link when repo stats are present", () => {
    const md = toSkillMarkdown(SKILLS[0]!, STATS["owner/alpha"]); // alpha: repo + tags
    expect(md).toContain("# Alpha — 100★");
    expect(md).toContain("- Tags: x");
    expect(md).toContain("- Source: https://github.com/owner/alpha");
  });

  it("omits stars, tags, when-to-use, and source when those fields are empty", () => {
    const md = toSkillMarkdown(SKILLS[1]!); // beta: no repo, no tags
    expect(md).not.toContain("★");
    expect(md).not.toContain("- Tags:");
    expect(md).not.toContain("- Source:");
  });
});

describe("toCheatSheet", () => {
  it("renders a Markdown table row per skill and escapes pipes", () => {
    const skills = [makeSkill({ slug: "g", name: "Gamma", category: "meta", install: { method: "npx-skills", command: "a | b" } })];
    const sheet = toCheatSheet(skills);
    expect(sheet).toContain("| Skill | Category | Install | When to use |");
    expect(sheet).toContain("`a \\| b`");
  });
});

describe("toInstallAllPrompt", () => {
  const ALL_METHODS: Skill[] = [
    makeSkill({ slug: "mp", name: "Mp", category: "workflow", repo: "owner/mp", install: { method: "marketplace", command: "/plugin marketplace add owner/mp" } }),
    makeSkill({ slug: "pl", name: "Pl", category: "workflow", install: { method: "plugin", command: "/plugin install pl@mkt" } }),
    makeSkill({ slug: "nx", name: "Nx", category: "research", install: { method: "npx-skills", command: "pip install nx" } }),
    makeSkill({ slug: "mc", name: "Mc", category: "research", install: { method: "manual-copy", command: "Copy SKILL.md into ~/.claude/skills/mc/" } }),
  ];

  it("titles with the total skill count", () => {
    expect(toInstallAllPrompt(ALL_METHODS)).toContain("# Install all Claude Code skills (4)");
  });

  it("instructs Claude to ask global vs project scope", () => {
    const prompt = toInstallAllPrompt(ALL_METHODS);
    expect(prompt).toContain("GLOBAL");
    expect(prompt).toContain("PROJECT");
    expect(prompt).toContain("~/.claude/skills/");
    expect(prompt).toContain(".claude/skills/");
  });

  it("tells Claude to check what is already installed and skip it", () => {
    const prompt = toInstallAllPrompt(ALL_METHODS);
    expect(prompt).toContain("already installed");
    expect(prompt).toContain("skip");
  });

  it("groups skills under a heading per install method with its command", () => {
    const prompt = toInstallAllPrompt(ALL_METHODS);
    expect(prompt).toContain("## Marketplace skills (1)");
    expect(prompt).toContain("## Plugin skills (1)");
    expect(prompt).toContain("## npx / CLI skills (1)");
    expect(prompt).toContain("## Manual-copy skills (1)");
    expect(prompt).toContain("- **Mp** — `/plugin marketplace add owner/mp`  (source: https://github.com/owner/mp)");
    expect(prompt).toContain("- **Nx** — `pip install nx`");
  });

  it("omits the source note for skills without a repo", () => {
    const prompt = toInstallAllPrompt([ALL_METHODS[2]!]); // nx: no repo
    expect(prompt).toContain("- **Nx** — `pip install nx`");
    expect(prompt).not.toContain("(source:");
  });

  it("is deterministic across calls", () => {
    expect(toInstallAllPrompt(ALL_METHODS)).toBe(toInstallAllPrompt(ALL_METHODS));
  });
});
