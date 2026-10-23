import { describe, expect, it } from "vitest";
import { formatDate, summary } from "./format";

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
});
