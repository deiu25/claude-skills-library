import { z } from "zod";
import { isSellerCountry } from "./countries";

/** Prices are in euros, the only currency a skill can be sold in for now. */
export const CURRENCY = "eur";
/** €1: below it, card fees would take most of a sale. */
export const PRICE_MIN_CENTS = 100;
/** €1,000: a ceiling that catches a mistyped price. */
export const PRICE_MAX_CENTS = 100_000;

const euros = new Intl.NumberFormat("en", { style: "currency", currency: "EUR" });

/** A price in cents as a buyer reads it, such as "€9.99". */
export const formatPrice = (cents: number) => euros.format(cents / 100);

/** A price in cents as the price field holds it, such as "9.99". */
export const priceInputValue = (cents: number) => (cents / 100).toFixed(2);

const PRICE_FORMAT = "Write the price in euros, such as 9 or 9.99.";
// Whole euros with up to two decimals, after a point or a comma; no sign, no exponent, no thousands separator.
const PRICE_RE = /^(\d{1,7})(?:[.,](\d{1,2}))?$/;

/** The price field: euros as typed, turned into whole cents without floating-point rounding. */
export const priceSchema = z
  .string({ error: PRICE_FORMAT })
  .trim()
  .regex(PRICE_RE, PRICE_FORMAT)
  .transform((value) => {
    const [, whole, fraction = ""] = PRICE_RE.exec(value) as RegExpExecArray;
    return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  })
  .refine(
    (cents) => cents >= PRICE_MIN_CENTS && cents <= PRICE_MAX_CENTS,
    `Set a price from ${formatPrice(PRICE_MIN_CENTS)} to ${formatPrice(PRICE_MAX_CENTS)}.`,
  );

export const countrySchema = z
  .string({ error: "Choose the country you are based in." })
  .refine(isSellerCountry, "Choose the country you are based in.");
