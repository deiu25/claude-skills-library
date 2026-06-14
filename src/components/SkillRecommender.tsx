"use client";

import { useMemo, useState } from "react";
import { Lightbulb, Sparkle } from "@phosphor-icons/react";
import type { Skill } from "@/data/types";
import type { RepoStats } from "@/lib/github";
import { scoreSkills } from "@/lib/recommend";
import { SkillCard } from "./SkillCard";

interface SkillRecommenderProps {
  skills: Skill[];
  statsByRepo: Record<string, RepoStats | null>;
}

const EXAMPLES = [
  "build a dark landing page",
  "review my code for security issues",
  "write tests for a new feature",
  "plan a refactor before I start",
];

const MAX_RESULTS = 8;

/**
 * "Describe your task -> ranked skills". Pure client-side matching via
 * scoreSkills (no backend). Reuses SkillCard for results so the UI stays
 * consistent with /skills.
 */
export function SkillRecommender({ skills, statsByRepo }: SkillRecommenderProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => scoreSkills(query, skills).slice(0, MAX_RESULTS), [query, skills]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="task" className="block text-sm font-medium text-foreground">
          Describe your task
        </label>
        <textarea
          id="task"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder="e.g. I need to build a polished dashboard UI and then review it for accessibility"
          className="input-base resize-y py-3"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-faint">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuery(example)}
              className="chip"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {hasQuery ? (
        results.length > 0 ? (
          <div className="space-y-4">
            <p className="font-mono text-xs text-faint" role="status">
              {results.length} {results.length === 1 ? "match" : "matches"}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {results.map(({ skill }) => (
                <SkillCard
                  key={skill.slug}
                  skill={skill}
                  stats={skill.repo ? (statsByRepo[skill.repo] ?? null) : null}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Lightbulb size={36} className="text-faint" aria-hidden />
            <p className="text-foreground">No skill matches that task yet.</p>
            <p className="max-w-sm text-sm text-muted">
              Try different words, or browse all skills. A gap here might be a skill worth adding.
            </p>
          </div>
        )
      ) : (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Sparkle size={36} className="text-faint" aria-hidden />
          <p className="text-foreground">Describe what you are trying to do.</p>
          <p className="max-w-sm text-sm text-muted">
            The matcher ranks skills by what fits your task — name, tags, category, and when each one
            earns its place.
          </p>
        </div>
      )}
    </div>
  );
}
