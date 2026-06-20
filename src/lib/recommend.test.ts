import { describe, expect, it } from "vitest";
import type { Skill } from "@/data/types";
import { scoreSkills, tokenize } from "@/lib/recommend";

function makeSkill(overrides: Partial<Skill> & Pick<Skill, "slug" | "name" | "category">): Skill {
  return {
    tagline: "",
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
  makeSkill({
    slug: "design-frontend",
    name: "Design Frontend",
    category: "design",
    tagline: "Build polished landing pages and dark UI",
    tags: ["frontend", "landing", "ui", "dark"],
    whenToUse: ["Designing a marketing landing page"],
  }),
  makeSkill({
    slug: "test-writer",
    name: "Test Writer",
    category: "testing",
    tagline: "Write unit and integration tests",
    tags: ["tests", "tdd", "coverage"],
    whenToUse: ["Adding tests for a new feature"],
  }),
  makeSkill({
    slug: "security-review",
    name: "Security Review",
    category: "code-quality",
    tagline: "Find vulnerabilities in code",
    tags: ["security", "owasp", "audit"],
    whenToUse: ["Reviewing code for security issues"],
  }),
];

describe("tokenize", () => {
  it("lowercases, splits, and drops stop-words and 1-char tokens", () => {
    expect(tokenize("Build a DARK landing page")).toEqual(["dark", "landing", "page"]);
  });

  it("returns [] for a blank query", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("scoreSkills", () => {
  it("returns [] for an empty query", () => {
    expect(scoreSkills("", SKILLS)).toEqual([]);
  });

  it("ranks the design skill top for a landing-page task", () => {
    const ranked = scoreSkills("build a dark landing page", SKILLS);
    expect(ranked[0]?.skill.slug).toBe("design-frontend");
  });

  it("ranks the testing skill top for a tests task", () => {
    const ranked = scoreSkills("write tests for my feature", SKILLS);
    expect(ranked[0]?.skill.slug).toBe("test-writer");
  });

  it("only returns skills with a non-zero score", () => {
    const ranked = scoreSkills("security vulnerabilities", SKILLS);
    expect(ranked.every((r) => r.score > 0)).toBe(true);
    expect(ranked[0]?.skill.slug).toBe("security-review");
  });

  it("reports which query tokens matched", () => {
    const ranked = scoreSkills("security audit", SKILLS);
    const top = ranked[0];
    expect(top?.matched).toEqual(expect.arrayContaining(["security", "audit"]));
  });
});
