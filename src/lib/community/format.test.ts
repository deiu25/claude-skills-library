import { describe, expect, it } from "vitest";
import { formatDate, revealBidi, summary } from "./format";

describe("revealBidi", () => {
  // Built from code points, so this file holds no control character itself.
  const rlo = String.fromCodePoint(0x202e);
  const pdi = String.fromCodePoint(0x2069);

  it("writes every bidirectional control as its code point", () => {
    expect(revealBidi(`run ${rlo}hs.tpircs${pdi} now`)).toBe("run [U+202E]hs.tpircs[U+2069] now");
  });

  it("leaves other text, emoji and Arabic marks alone", () => {
    const text = `# Skill\nUse 🙂 and ${String.fromCodePoint(0x200f)}here.`;
    expect(revealBidi(text)).toBe(text);
  });
});

describe("formatDate", () => {
  it("writes the UTC day, whatever the server's time zone", () => {
    expect(formatDate(new Date("2026-10-23T23:30:00Z"))).toBe("23 Oct 2026");
    expect(formatDate(new Date("2026-01-01T00:00:00Z"))).toBe("1 Jan 2026");
  });
});

describe("summary", () => {
  it("keeps a short text whole, on one line", () => {
    expect(summary("Fills PDF forms.\n\nUse it for  invoices.")).toBe("Fills PDF forms. Use it for invoices.");
  });

  it("cuts a long text at a word boundary within the limit", () => {
    const text = `${"word ".repeat(50)}end`;
    const cut = summary(text, 40);
    expect(cut.length).toBeLessThanOrEqual(40);
    expect(cut).toMatch(/^(word )+word…$/);
  });

  it("cuts inside a word only when it has no space to break at", () => {
    expect(summary("a".repeat(200), 20)).toBe(`${"a".repeat(19)}…`);
  });

  it("never cuts an emoji in half", () => {
    const cut = summary("🙂".repeat(100), 20);
    expect(cut).toBe(`${"🙂".repeat(19)}…`);
    expect(cut.isWellFormed()).toBe(true);
  });
});
