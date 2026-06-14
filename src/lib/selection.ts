/**
 * Encode/decode a set of selected skill slugs to/from the `sel` query param,
 * mirroring the URL-as-state pattern already used in SkillSearch. Pure and
 * order-stable so a shared link round-trips to the same selection.
 */

const SEP = ",";

/** Slugs are kebab-case ([a-z0-9-]); guard against anything else from a URL. */
const SLUG_RE = /^[a-z0-9-]+$/;

/** Sorted, de-duplicated slug list -> comma-joined string ("" when empty). */
export function encodeSelection(slugs: Iterable<string>): string {
  return [...new Set(slugs)].filter((s) => SLUG_RE.test(s)).sort().join(SEP);
}

/**
 * Parse a `sel` param value into a slug list. `validSlugs`, when provided,
 * filters out anything not in the catalog so a stale/hand-edited URL degrades
 * gracefully instead of selecting nothing-skills.
 */
export function decodeSelection(value: string | null, validSlugs?: Iterable<string>): string[] {
  if (!value) return [];
  const allowed = validSlugs ? new Set(validSlugs) : null;
  const slugs = value
    .split(SEP)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && SLUG_RE.test(s));
  const unique = [...new Set(slugs)];
  return allowed ? unique.filter((s) => allowed.has(s)) : unique;
}
