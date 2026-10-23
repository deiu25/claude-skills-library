import { describe, expect, it } from "vitest";
import { filterSkills } from "./search";

const skills = [
  { handle: "ada", name: "pdf-forms", description: "Fills PDF forms from a list of values.", category: "productivity", tags: ["pdf"] },
  { handle: "grace", name: "review-bot", description: "Reviews a diff before a commit.", category: "code-quality", tags: ["review", "git"] },
];

describe("filterSkills", () => {
  it("returns everything for an empty query and no category", () => {
    expect(filterSkills(skills, "  ", null)).toEqual(skills);
  });

  it("matches the name, description, author and tags, ignoring case", () => {
    expect(filterSkills(skills, "PDF", null).map((skill) => skill.name)).toEqual(["pdf-forms"]);
    expect(filterSkills(skills, "grace", null).map((skill) => skill.name)).toEqual(["review-bot"]);
    expect(filterSkills(skills, "git", null).map((skill) => skill.name)).toEqual(["review-bot"]);
  });

  it("needs every word of the query, in any order", () => {
    expect(filterSkills(skills, "commit diff", null).map((skill) => skill.name)).toEqual(["review-bot"]);
    expect(filterSkills(skills, "commit pdf", null)).toEqual([]);
  });

  it("keeps only the chosen category", () => {
    expect(filterSkills(skills, "", "code-quality").map((skill) => skill.name)).toEqual(["review-bot"]);
    expect(filterSkills(skills, "pdf", "code-quality")).toEqual([]);
  });
});
