// Where a seller can be paid from. The platform is in Romania, and these are the countries Stripe
// onboards Express accounts in for it by default, receiving transfers: the EU, Liechtenstein,
// Norway, Switzerland, the United Kingdom and Gibraltar (Connect settings, Onboarding options,
// read 2026-10-24). Stripe also lets the platform add the United States, Canada and a few others,
// but a US seller brings US tax reporting (Form 1099), so none of them is offered yet.
export const SELLER_COUNTRIES = [
  ["AT", "Austria"],
  ["BE", "Belgium"],
  ["BG", "Bulgaria"],
  ["HR", "Croatia"],
  ["CY", "Cyprus"],
  ["CZ", "Czech Republic"],
  ["DK", "Denmark"],
  ["EE", "Estonia"],
  ["FI", "Finland"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["GI", "Gibraltar"],
  ["GR", "Greece"],
  ["HU", "Hungary"],
  ["IE", "Ireland"],
  ["IT", "Italy"],
  ["LV", "Latvia"],
  ["LI", "Liechtenstein"],
  ["LT", "Lithuania"],
  ["LU", "Luxembourg"],
  ["MT", "Malta"],
  ["NL", "Netherlands"],
  ["NO", "Norway"],
  ["PL", "Poland"],
  ["PT", "Portugal"],
  ["RO", "Romania"],
  ["SK", "Slovakia"],
  ["SI", "Slovenia"],
  ["ES", "Spain"],
  ["SE", "Sweden"],
  ["CH", "Switzerland"],
  ["GB", "United Kingdom"],
] as const;

export type SellerCountry = (typeof SELLER_COUNTRIES)[number][0];

export const isSellerCountry = (code: unknown): code is SellerCountry =>
  SELLER_COUNTRIES.some(([country]) => country === code);

/** A seller country's English name; any other code as it is. */
export const countryName = (code: string) => SELLER_COUNTRIES.find(([country]) => country === code)?.[1] ?? code;
