import { describe, expect, it } from "vitest";
import { DESCRIPTION_MAX, NAME_MAX, parseSkillMd, parseTags, SKILL_MD_MAX, skillFormSchema, skillIdSchema } from "./schemas";

const skillMd = (frontmatter: string, body = "# Title\n\nDo the thing.\n") => `---\n${frontmatter}\n---\n${body}`;

describe("parseSkillMd", () => {
  it("returns the frontmatter, extra keys included, and the body after it", () => {
    const result = parseSkillMd(skillMd("name: pdf-tools\ndescription: Fill PDF forms.\nlicense: MIT\nallowed-tools: Read, Grep"));
    expect(result).toEqual({
      ok: true,
      frontmatter: { name: "pdf-tools", description: "Fill PDF forms.", license: "MIT", "allowed-tools": "Read, Grep" },
      body: "# Title\n\nDo the thing.\n",
    });
  });

  it("reads Windows line endings, a byte-order mark and a folded description", () => {
    const result = parseSkillMd("﻿---\r\nname: a\r\ndescription: >\r\n  two\r\n  lines\r\n---\r\nBody");
    expect(result).toEqual({ ok: true, frontmatter: { name: "a", description: "two lines" }, body: "Body" });
  });

  it("needs frontmatter at the very top", () => {
    for (const source of ["# Title\nname: a", "\n---\nname: a\ndescription: b\n---\n", "---\nname: a\ndescription: b\n"]) {
      expect(parseSkillMd(source)).toEqual({ ok: false, problems: [expect.stringMatching(/^Start SKILL.md with frontmatter/)] });
    }
  });

  it("asks for the name and the description when they are missing, empty or not text", () => {
    expect(parseSkillMd("---\n---\n")).toEqual({
      ok: false,
      problems: ["Write the frontmatter as key: value lines, with a name and a description."],
    });
    const result = parseSkillMd(skillMd("name: 42\ndescription: '   '"));
    expect(result).toEqual({
      ok: false,
      problems: [expect.stringMatching(/^Add a name/), expect.stringMatching(/^Add a description/)],
    });
  });

  it("allows only lowercase kebab-case names up to the limit", () => {
    for (const name of ["My-Skill", "my_skill", "-skill", "skill-", "my--skill", "über", "a".repeat(NAME_MAX + 1)]) {
      expect(parseSkillMd(skillMd(`name: ${name}\ndescription: d`)).ok, name).toBe(false);
    }
    expect(parseSkillMd(skillMd(`name: ${"a".repeat(NAME_MAX)}\ndescription: d`)).ok).toBe(true);
  });

  it("reserves the names of the routes beside a user's skills", () => {
    for (const name of ["stacks", "playbooks"]) {
      expect(parseSkillMd(skillMd(`name: ${name}\ndescription: d`))).toEqual({
        ok: false,
        problems: ["This name is reserved on the site. Choose another."],
      });
    }
  });

  it("limits the description and the whole file", () => {
    expect(parseSkillMd(skillMd(`name: a\ndescription: ${"d".repeat(DESCRIPTION_MAX)}`)).ok).toBe(true);
    expect(parseSkillMd(skillMd(`name: a\ndescription: ${"d".repeat(DESCRIPTION_MAX + 1)}`))).toEqual({
      ok: false,
      problems: [`Keep the description to ${DESCRIPTION_MAX} characters.`],
    });
    expect(parseSkillMd(skillMd("name: a\ndescription: d", "x".repeat(SKILL_MD_MAX)))).toEqual({
      ok: false,
      problems: [expect.stringMatching(/^Keep SKILL.md to/)],
    });
  });

  it("reports invalid YAML with its line in the file", () => {
    expect(parseSkillMd(skillMd("name: a\ndescription: [unclosed"))).toEqual({
      ok: false,
      problems: [expect.stringMatching(/^The frontmatter is not valid YAML \(line \d+\)\.$/)],
    });
    expect(parseSkillMd(skillMd("name: a\nname: b\ndescription: d"))).toEqual({
      ok: false,
      problems: ["The frontmatter is not valid YAML (line 3)."],
    });
  });

  it("refuses alias expansion bombs instead of expanding them", () => {
    let yaml = "x: &a [lol, lol, lol, lol, lol, lol, lol, lol, lol]\n";
    let previous = "a";
    for (const anchor of "bcdefghi") {
      yaml += `${anchor}: &${anchor} [${Array(9).fill(`*${previous}`).join(", ")}]\n`;
      previous = anchor;
    }
    expect(parseSkillMd(skillMd(`name: a\ndescription: d\n${yaml}`)).ok).toBe(false);
  });

  it("keeps tags that would build objects in other parsers as plain strings", () => {
    const result = parseSkillMd(skillMd('name: a\ndescription: d\nbinary: !!binary aGk=\nfn: !!js/function "f"\n__proto__:\n  polluted: 1'));
    expect(result).toMatchObject({ ok: true, frontmatter: { binary: "aGk=", fn: "f" } });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe("parseTags", () => {
  it("splits on commas, trims, lowercases and drops repeats and empties", () => {
    expect(parseTags(" React, testing,,react , Code-Review ")).toEqual(["react", "testing", "code-review"]);
    expect(parseTags("")).toEqual([]);
  });
});

describe("skillFormSchema", () => {
  const form = { skillMd: "---\r\nname: a\r\n---\r\n", category: "testing", tags: "e2e, playwright" };

  it("normalizes line endings and parses tags", () => {
    expect(skillFormSchema.parse(form)).toEqual({ skillMd: "---\nname: a\n---\n", category: "testing", tags: ["e2e", "playwright"] });
  });

  it("refuses an unknown category and malformed or too many tags", () => {
    expect(skillFormSchema.safeParse({ ...form, category: "games" }).success).toBe(false);
    expect(skillFormSchema.safeParse({ ...form, tags: "two words" }).success).toBe(false);
    expect(skillFormSchema.safeParse({ ...form, tags: "a,b,c,d,e,f,g" }).success).toBe(false);
  });
});

describe("skillIdSchema", () => {
  it("accepts a UUID and nothing else", () => {
    expect(skillIdSchema.safeParse("6f1c2a3e-8b4d-4f5a-9c7e-1d2b3c4d5e6f").success).toBe(true);
    for (const id of ["", "1", "6f1c2a3e-8b4d-4f5a-9c7e", "'; drop table skill; --", 42, null]) {
      expect(skillIdSchema.safeParse(id).success).toBe(false);
    }
  });
});
