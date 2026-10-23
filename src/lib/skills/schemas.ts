import { parse, YAMLError } from "yaml";
import { z } from "zod";
import { CATEGORY_LABELS, type SkillCategory } from "@/data/types";
import { VISIBILITIES } from "./access";

export const NAME_MAX = 64;
export const DESCRIPTION_MAX = 1024;
/** Characters, after line endings are normalized. Well under the 1 MB Server Action body limit. */
export const SKILL_MD_MAX = 100_000;
export const TAGS_MAX = 6;
export const TAG_MAX = 30;
/** The latest versions a skill keeps; a save beyond them deletes the oldest. */
export const VERSIONS_KEPT = 20;
export const SKILLS_MAX = 50;
/** SKILL.md characters an account stores across every kept version, which keeps its data export under Vercel's 4.5 MB response limit. */
export const ACCOUNT_CHARACTERS_MAX = 1_500_000;

// Lowercase letters and digits with single hyphens between them: the name becomes a URL segment
// (/u/<handle>/<name>) and the folder the skill installs into.
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Routes beside a user's skills: /u/<handle>/stacks/<slug> and /u/<handle>/playbooks/<slug>.
const RESERVED_NAMES = new Set(["stacks", "playbooks"]);

const FRONTMATTER_RE = /^\uFEFF?---[ \t]*\n(?:([\s\S]*?)\n)?---[ \t]*(?:\n|$)/;

const frontmatterSchema = z.looseObject({
  name: z
    .string({ error: "Add a name to the frontmatter, such as name: my-skill." })
    .max(NAME_MAX, `Keep the name to ${NAME_MAX} characters.`)
    .regex(SLUG_RE, "Write the name in lowercase letters, digits and single hyphens, such as my-skill.")
    .refine((name) => !RESERVED_NAMES.has(name), "This name is reserved on the site. Choose another."),
  description: z
    .string({ error: "Add a description to the frontmatter: what the skill does and when to use it." })
    .trim()
    .min(1, "Add a description to the frontmatter: what the skill does and when to use it.")
    .max(DESCRIPTION_MAX, `Keep the description to ${DESCRIPTION_MAX} characters.`),
});

export type SkillFrontmatter = z.infer<typeof frontmatterSchema>;

export type ParsedSkillMd =
  | { ok: true; frontmatter: SkillFrontmatter; body: string }
  | { ok: false; problems: string[] };

/** Browsers submit a textarea with CRLF line endings; the stored file and its hash use LF. */
export function normalizeSkillMd(source: string): string {
  return source.replace(/\r\n?/g, "\n");
}

/** Whether every key and string in the parsed frontmatter fits Postgres jsonb: no NUL, no half surrogate pair. */
function storable(value: unknown): boolean {
  const stack: unknown[] = [value];
  while (stack.length) {
    const item = stack.pop();
    if (typeof item === "string") {
      if (item.includes("\0") || !item.isWellFormed()) return false;
    } else if (item !== null && typeof item === "object") {
      for (const [key, child] of Object.entries(item)) stack.push(key, child);
    }
  }
  return true;
}

/** Splits a SKILL.md into its YAML frontmatter and Markdown body, and checks the fields Claude Code needs. */
export function parseSkillMd(source: string): ParsedSkillMd {
  const text = normalizeSkillMd(source);
  if (text.length > SKILL_MD_MAX) {
    return { ok: false, problems: [`Keep SKILL.md to ${SKILL_MD_MAX.toLocaleString("en")} characters.`] };
  }
  const match = FRONTMATTER_RE.exec(text);
  if (!match) {
    return { ok: false, problems: ["Start SKILL.md with frontmatter: a --- line, name and description, then another --- line."] };
  }

  // Postgres stores neither a NUL character in text nor one, or half a surrogate pair, in jsonb.
  if (text.includes("\0") || !text.isWellFormed()) {
    return { ok: false, problems: ["SKILL.md contains a character that cannot be stored: a NUL, or half of an emoji or other paired character."] };
  }

  let data: unknown;
  try {
    // Known tags outside the core schema (!!binary, !!timestamp) stay strings. Aliases are refused:
    // each one would be stored expanded, so a few could multiply the frontmatter many times over.
    data = parse(match[1] ?? "", { schema: "core", resolveKnownTags: false, logLevel: "error", maxAliasCount: 0 });
  } catch (error) {
    const line = error instanceof YAMLError ? error.linePos?.[0].line : undefined;
    // The frontmatter starts on the second line of the file.
    return {
      ok: false,
      problems: [`The frontmatter is not valid YAML${line ? ` (line ${line + 1})` : ""}. Put quotes around a value that contains “: ”.`],
    };
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { ok: false, problems: ["Write the frontmatter as key: value lines, with a name and a description."] };
  }
  if (!storable(data)) {
    return { ok: false, problems: ["The frontmatter contains a character that cannot be stored, such as an escaped NUL."] };
  }

  const result = frontmatterSchema.safeParse(data);
  if (!result.success) return { ok: false, problems: result.error.issues.map((issue) => issue.message) };
  return { ok: true, frontmatter: result.data, body: text.slice(match[0].length) };
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as [SkillCategory, ...SkillCategory[]];

/** Comma-separated tags, lowercased and de-duplicated, in the order written. */
export function parseTags(input: string): string[] {
  return [...new Set(input.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

/** The fields of the skill editor, as the form submits them. */
export const skillFormSchema = z.object({
  skillMd: z.string().transform(normalizeSkillMd),
  category: z.enum(CATEGORIES, { error: "Choose a category." }),
  tags: z
    .string()
    .transform(parseTags)
    .pipe(
      z
        .array(
          z
            .string()
            .max(TAG_MAX, `Keep each tag to ${TAG_MAX} characters.`)
            .regex(SLUG_RE, "Write tags in lowercase letters, digits and single hyphens, such as code-review."),
        )
        .max(TAGS_MAX, `Use up to ${TAGS_MAX} tags.`),
    ),
});

export type SkillForm = z.infer<typeof skillFormSchema>;

/** A skill id from a URL or an action argument. */
export const skillIdSchema = z.uuid();

/** Who can see a skill, as the visibility form submits it. */
export const visibilitySchema = z.enum(VISIBILITIES, { error: "Choose who can see the skill." });
