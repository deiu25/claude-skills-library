import { describe, expect, it } from "vitest";
import { countrySchema, formatPrice, priceInputValue, priceSchema } from "./schemas";

describe("priceSchema", () => {
  it.each([
    ["9", 900],
    ["9.5", 950],
    ["9.99", 999],
    ["9,99", 999],
    [" 12.30 ", 1230],
    ["1", 100],
    ["1000", 100_000],
    ["1000.00", 100_000],
    // 0.29 * 100 is 28.999999999999996 in floating point; the parse never multiplies a fraction.
    ["4.29", 429],
  ])("reads %j as %d cents", (input, cents) => {
    expect(priceSchema.parse(input)).toBe(cents);
  });

  it.each(["", "abc", "9.999", "-5", "+5", "1e3", "1,000.00", "9.", ".99", "0x10", "Infinity"])("refuses %j as unreadable", (input) => {
    const result = priceSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Write the price in euros, such as 9 or 9.99.");
  });

  it.each(["0", "0.99", "1000.01", "1001", "9999999"])("refuses %j as out of range", (input) => {
    const result = priceSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Set a price from €1.00 to €1,000.00.");
  });

  it("refuses a value that is not text", () => {
    expect(priceSchema.safeParse(null).success).toBe(false);
    expect(priceSchema.safeParse(9).success).toBe(false);
  });
});

describe("price display", () => {
  it("formats cents in euros", () => {
    expect(formatPrice(999)).toBe("€9.99");
    expect(formatPrice(100_000)).toBe("€1,000.00");
  });

  it("fills the price field the way the schema reads it back", () => {
    expect(priceInputValue(950)).toBe("9.50");
    expect(priceSchema.parse(priceInputValue(429))).toBe(429);
  });
});

describe("countrySchema", () => {
  it("accepts a country Stripe onboards sellers in for the platform", () => {
    expect(countrySchema.parse("RO")).toBe("RO");
    expect(countrySchema.parse("GB")).toBe("GB");
    expect(countrySchema.parse("CH")).toBe("CH");
  });

  // The United States and Canada are possible on Stripe but not offered: US sellers bring Form 1099 reporting.
  it.each(["US", "CA", "IS", "ro", "JP", "", null])("refuses %j", (input) => {
    expect(countrySchema.safeParse(input).success).toBe(false);
  });
});
