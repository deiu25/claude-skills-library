import { z } from "zod";
import { SLUG_RE } from "@/lib/skills/schemas";

// What a report and a moderation decision may hold. The report table's CHECK constraints list the
// same values (src/lib/db/schema.ts).

export const TARGET_TYPES = ["skill", "user"] as const;
export type TargetType = (typeof TARGET_TYPES)[number];

export const REPORT_REASONS = ["malware", "hidden-instructions", "personal-data", "rights", "illegal", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** Each reason as the report form offers it, in the order of the terms' rules for publishing. */
export const REASON_LABELS: Record<ReportReason, string> = {
  malware: "Malware, or harm that its description does not disclose",
  "hidden-instructions": "Instructions hidden from the people who read it",
  "personal-data": "Someone's secrets, credentials or personal data",
  rights: "It infringes my rights or someone else's, such as copyright or a trademark",
  illegal: "Other illegal content",
  other: "Something else that breaks the terms of use",
};

export const DETAILS_MIN = 20;
export const DETAILS_MAX = 2000;

const details = z
  .string({ error: "Say what is wrong." })
  .trim()
  .min(DETAILS_MIN, `Say what is wrong and where, in at least ${DETAILS_MIN} characters.`)
  .max(DETAILS_MAX, `Keep it under ${DETAILS_MAX.toLocaleString("en")} characters.`);

/**
 * A report as the form sends it. The target is a skill's id or a profile's username, which the
 * action looks up again: what it names must still be shown on the site.
 */
export const reportFormSchema = z.object({
  targetType: z.enum(TARGET_TYPES, { error: "Choose what you report." }),
  targetKey: z.string().min(1).max(100),
  reason: z.enum(REPORT_REASONS, { error: "Choose what is wrong." }),
  details,
  goodFaith: z.literal("on", { error: "Confirm that the report is accurate and complete, to the best of your knowledge." }),
});

export const GROUNDS = ["terms", "illegal"] as const;
export type Ground = (typeof GROUNDS)[number];

export const GROUND_LABELS: Record<Ground, string> = {
  terms: "Breaks the terms of use",
  illegal: "Illegal content",
};

export const DECISIONS = ["remove", "suspend", "dismiss"] as const;
export type Decision = (typeof DECISIONS)[number];

/** What an admin decides about a report: dismissing it needs no reason, the other two do. */
export const decisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("dismiss") }),
  z.object({
    decision: z.enum(["remove", "suspend"]),
    ground: z.enum(GROUNDS, { error: "Choose the ground: the terms of use, or the law." }),
    explanation: details,
  }),
]);

/** The reason a decision states, as its owner reads it in the email and on their dashboard. */
export const statedReason = (ground: Ground, explanation: string) => `${GROUND_LABELS[ground]}: ${explanation}`;

/**
 * What an admin names in the take-down form: a skill by its page's address, with or without the
 * site, or an account by its username. Null for anything else.
 */
export function parseModerationTarget(input: string): { type: "skill"; handle: string; slug: string } | { type: "user"; handle: string } | null {
  const text = input.trim().toLowerCase();
  const path = text.replace(/^https?:\/\/[^/]+/, "").replace(/[?#].*$/, "").replace(/\/+$/, "");
  const address = /^\/u\/([^/]+)\/([^/]+)$/.exec(path);
  if (address) {
    const [, handle, slug] = address;
    return SLUG_RE.test(handle) && SLUG_RE.test(slug) ? { type: "skill", handle, slug } : null;
  }
  const handle = path.replace(/^\/u\//, "").replace(/^@/, "");
  return SLUG_RE.test(handle) ? { type: "user", handle } : null;
}
