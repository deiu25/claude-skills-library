import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { SITE_REPO_URL } from "@/lib/site";
import { listingPath, profilePath, proposeUrl, reportPath } from "./links";

const listing = { handle: "ada", slug: "pdf-forms", name: "pdf-forms", description: "Fills PDF forms. Use it when a task hands you a PDF & a list of values." };

describe("community paths", () => {
  it("puts a profile at /u/<handle> and its skills below it", () => {
    expect(profilePath("ada")).toBe("/u/ada");
    expect(listingPath("ada", "pdf-forms")).toBe("/u/ada/pdf-forms");
  });

  it("names a skill to report by its id and a profile by its username", () => {
    expect(reportPath({ skill: "6f1c2a3e-8b4d-4f5a-9c7e-1d2b3c4d5e6f" })).toBe("/dashboard/report?skill=6f1c2a3e-8b4d-4f5a-9c7e-1d2b3c4d5e6f");
    expect(reportPath({ user: "ada" })).toBe("/dashboard/report?user=ada");
  });
});

describe("proposeUrl", () => {
  it("opens the suggest-skill form on the catalog's repository, filled in with the listing", () => {
    const url = new URL(proposeUrl(listing));
    expect(`${url.origin}${url.pathname}`).toBe(`${SITE_REPO_URL}/issues/new`);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      template: "suggest-skill.yml",
      title: "Suggest: pdf-forms",
      source: "https://skillcellar.com/u/ada/pdf-forms",
      when: listing.description,
    });
  });

  it("keeps a long description short enough for the URL GitHub accepts", () => {
    const long = { ...listing, description: "Ж".repeat(1024) };
    const when = new URL(proposeUrl(long)).searchParams.get("when") ?? "";
    expect(Array.from(when).length).toBeLessThanOrEqual(300);
    expect(proposeUrl(long).length).toBeLessThan(8000);
  });

  it("fills fields the form really has, by their ids", () => {
    const form = parse(readFileSync(".github/ISSUE_TEMPLATE/suggest-skill.yml", "utf8")) as { body: { id?: string }[] };
    const ids = form.body.map((field) => field.id);
    const filled = [...new URL(proposeUrl(listing)).searchParams.keys()].filter((key) => key !== "template" && key !== "title");
    for (const key of filled) expect(ids).toContain(key);
  });
});
