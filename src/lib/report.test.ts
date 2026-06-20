import { describe, expect, it } from "vitest";
import type { Skill } from "@/data/types";
import type { StatsByRepo } from "@/lib/report";
import { toCheatSheet, toJsonCatalog, toLlmsTxt, toMarkdownReport } from "@/lib/report";

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

describe("toCheatSheet", () => {
  it("renders a Markdown table row per skill and escapes pipes", () => {
    const skills = [makeSkill({ slug: "g", name: "Gamma", category: "meta", install: { method: "npx-skills", command: "a | b" } })];
    const sheet = toCheatSheet(skills);
    expect(sheet).toContain("| Skill | Category | Install | When to use |");
    expect(sheet).toContain("`a \\| b`");
  });
});
