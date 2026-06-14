import type { Skill } from "@/data/types";
import { CATEGORY_LABELS } from "@/data/types";

/**
 * Client-side "describe your task -> ranked skills" matcher. No backend, no
 * embeddings: a weighted token-overlap score is more than enough for a
 * catalog of tens of skills and keeps the dependency count at zero (KISS).
 */

export interface ScoredSkill {
  skill: Skill;
  score: number;
  /** Distinct query tokens that matched somewhere — drives the "why" hints. */
  matched: string[];
}

// Field weights: a hit in the name/tags is a stronger signal than a hit in
// the longer prose fields.
const WEIGHTS = {
  name: 6,
  tags: 5,
  category: 4,
  whenToUse: 3,
  tagline: 2,
} as const;

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "to", "of", "for", "in", "on", "with",
  "my", "me", "i", "is", "are", "be", "this", "that", "it", "want", "need",
  "help", "how", "do", "can", "build", "make", "create", "using", "use",
]);

/** Lowercase, split on non-word chars, drop stop-words and 1-char tokens. */
export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function countHits(token: string, haystack: string): number {
  if (!token) return 0;
  let count = 0;
  let from = haystack.indexOf(token);
  while (from !== -1) {
    count += 1;
    from = haystack.indexOf(token, from + token.length);
  }
  return count;
}

function scoreOne(tokens: string[], skill: Skill): { score: number; matched: string[] } {
  const fields = {
    name: skill.name.toLowerCase(),
    tags: skill.tags.join(" ").toLowerCase(),
    category: `${skill.category} ${CATEGORY_LABELS[skill.category]}`.toLowerCase(),
    whenToUse: skill.whenToUse.join(" ").toLowerCase(),
    tagline: skill.tagline.toLowerCase(),
  };

  let score = 0;
  const matched = new Set<string>();
  for (const token of tokens) {
    for (const [field, weight] of Object.entries(WEIGHTS) as [keyof typeof WEIGHTS, number][]) {
      const hits = countHits(token, fields[field]);
      if (hits > 0) {
        score += weight * hits;
        matched.add(token);
      }
    }
  }
  return { score, matched: [...matched] };
}

/**
 * Rank skills against a free-text task description. Returns only skills with a
 * non-zero score, highest first; ties broken by name for a stable order.
 * An empty/blank query returns [] so the UI can show its prompt state.
 */
export function scoreSkills(query: string, skills: Skill[]): ScoredSkill[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  return skills
    .map((skill) => {
      const { score, matched } = scoreOne(tokens, skill);
      return { skill, score, matched };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));
}
