import { describe, expect, it } from "vitest";
import { decisionSchema, parseModerationTarget, reportFormSchema, statedReason } from "./schemas";

const REPORT = {
  targetType: "skill",
  targetKey: "6f1c2a3e-8b4d-4f5a-9c7e-1d2b3c4d5e6f",
  reason: "malware",
  details: "  install.sh downloads a binary and runs it without saying so.  ",
  goodFaith: "on",
};

describe("reportFormSchema", () => {
  it("accepts a complete report and trims its text", () => {
    const parsed = reportFormSchema.parse(REPORT);
    expect(parsed.details).toBe("install.sh downloads a binary and runs it without saying so.");
  });

  it("asks for the good-faith statement the Digital Services Act requires", () => {
    const parsed = reportFormSchema.safeParse({ ...REPORT, goodFaith: null });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0].message).toMatch(/^Confirm that the report is accurate/);
  });

  it("refuses an explanation too short to act on, and a reason it does not know", () => {
    expect(reportFormSchema.safeParse({ ...REPORT, details: "bad" }).error?.issues[0].message).toMatch(/at least 20 characters/);
    expect(reportFormSchema.safeParse({ ...REPORT, reason: "spam" }).success).toBe(false);
    expect(reportFormSchema.safeParse({ ...REPORT, targetType: "playbook" }).success).toBe(false);
  });
});

describe("decisionSchema", () => {
  it("dismisses without a reason", () => {
    expect(decisionSchema.parse({ decision: "dismiss", ground: null, explanation: null })).toEqual({ decision: "dismiss" });
  });

  it("needs a ground and an explanation to remove or suspend", () => {
    expect(decisionSchema.safeParse({ decision: "remove", ground: null, explanation: "x".repeat(30) }).error?.issues[0].message).toMatch(/^Choose the ground/);
    expect(decisionSchema.safeParse({ decision: "suspend", ground: "terms", explanation: "short" }).success).toBe(false);
    expect(decisionSchema.parse({ decision: "suspend", ground: "illegal", explanation: "Its skills hand out API keys stolen from others." })).toMatchObject({
      decision: "suspend",
      ground: "illegal",
    });
  });

  it("refuses a decision it does not know", () => {
    expect(decisionSchema.safeParse({ decision: "delete", ground: "terms", explanation: "x".repeat(30) }).success).toBe(false);
  });
});

describe("statedReason", () => {
  it("puts the ground before the admin's explanation", () => {
    expect(statedReason("terms", "It hides instructions in an HTML comment.")).toBe("Breaks the terms of use: It hides instructions in an HTML comment.");
  });
});

describe("parseModerationTarget", () => {
  it("reads a skill's address with or without the site, a trailing slash or a query", () => {
    const skill = { type: "skill", handle: "ada", slug: "pdf-forms" };
    expect(parseModerationTarget("https://skillcellar.com/u/ada/pdf-forms")).toEqual(skill);
    expect(parseModerationTarget("  /u/Ada/pdf-forms/?ref=x#files ")).toEqual(skill);
  });

  it("names an account only as @username", () => {
    expect(parseModerationTarget(" @Ada ")).toEqual({ type: "user", handle: "ada" });
    // A bare name, a profile's address and a skill's address missing its name suspend nobody.
    expect(parseModerationTarget("ada")).toBeNull();
    expect(parseModerationTarget("https://skillcellar.com/u/ada")).toBeNull();
    expect(parseModerationTarget("https://skillcellar.com/u/ada/")).toBeNull();
  });

  it("refuses anything else, and long input before any pattern runs", () => {
    expect(parseModerationTarget("")).toBeNull();
    expect(parseModerationTarget("@")).toBeNull();
    expect(parseModerationTarget("/u/ada/pdf-forms/versions/2")).toBeNull();
    expect(parseModerationTarget("/u/../etc")).toBeNull();
    expect(parseModerationTarget("@ada lovelace")).toBeNull();
    expect(parseModerationTarget(`/u/ada/${"/".repeat(200_000)}x`)).toBeNull();
  });
});
