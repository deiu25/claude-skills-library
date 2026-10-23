"use client";

import { MagnifyingGlass, SmileyXEyes } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { CATEGORY_LABELS, type SkillCategory } from "@/data/types";
import type { CommunityCardData } from "@/lib/community/format";
import { filterSkills } from "@/lib/community/search";
import { CommunityCard } from "./CommunityCard";

/** Search and a category filter over the Community skills already in the page: no request is made. */
export function CommunitySearch({ skills }: { skills: CommunityCardData[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const skill of skills) counts.set(skill.category, (counts.get(skill.category) ?? 0) + 1);
    return (Object.keys(CATEGORY_LABELS) as SkillCategory[]).filter((c) => counts.has(c)).map((c) => ({ id: c, count: counts.get(c) ?? 0 }));
  }, [skills]);
  const filtered = useMemo(() => filterSkills(skills, query, category), [skills, query, category]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <MagnifyingGlass size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, description, author or tag..."
          aria-label="Search Community skills"
          className="input-base pl-11"
        />
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button type="button" onClick={() => setCategory(null)} className={`chip ${category === null ? "chip-active" : ""}`} aria-pressed={category === null}>
            All
            <span className="text-faint">{skills.length}</span>
          </button>
          {categories.map(({ id, count }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(category === id ? null : id)}
              className={`chip ${category === id ? "chip-active" : ""}`}
              aria-pressed={category === id}
            >
              {CATEGORY_LABELS[id]}
              <span className="text-faint">{count}</span>
            </button>
          ))}
        </div>
      )}

      <p className="font-mono text-xs text-faint" role="status">
        {filtered.length} {filtered.length === 1 ? "skill" : "skills"}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill) => (
            <CommunityCard key={`${skill.handle}/${skill.slug}`} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SmileyXEyes size={36} className="text-faint" aria-hidden />
          <p className="text-foreground">No Community skills match that search.</p>
          <p className="max-w-sm text-sm text-muted">Try another word, or clear the category filter.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(null);
            }}
            className="btn btn-ghost mt-2 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
