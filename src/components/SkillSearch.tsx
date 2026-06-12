"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, SmileyXEyes } from "@phosphor-icons/react";
import type { Skill, SkillCategory } from "@/data/types";
import { CATEGORY_LABELS } from "@/data/types";
import type { RepoStats } from "@/lib/github";
import { SkillCard } from "./SkillCard";

interface SkillSearchProps {
  skills: Skill[];
  statsByRepo: Record<string, RepoStats | null>;
}

export function SkillSearch({ skills, statsByRepo }: SkillSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<SkillCategory | null>(
    (searchParams.get("category") as SkillCategory | null) ?? null,
  );

  const categories = useMemo(() => {
    const present = new Set(skills.map((s) => s.category));
    return (Object.keys(CATEGORY_LABELS) as SkillCategory[]).filter((c) => present.has(c));
  }, [skills]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      if (category && s.category !== category) return false;
      if (!q) return true;
      const haystack = [s.name, s.tagline, s.author, ...s.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [skills, query, category]);

  function syncUrl(nextQuery: string, nextCategory: SkillCategory | null) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextCategory) params.set("category", nextCategory);
    const qs = params.toString();
    router.replace(qs ? `/skills?${qs}` : "/skills", { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <MagnifyingGlass
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            syncUrl(e.target.value, category);
          }}
          placeholder="Search by name, tag, or author..."
          aria-label="Search skills"
          className="input-base pl-11"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => {
            setCategory(null);
            syncUrl(query, null);
          }}
          className={`chip ${category === null ? "chip-active" : ""}`}
          aria-pressed={category === null}
        >
          All
          <span className="text-faint">{skills.length}</span>
        </button>
        {categories.map((c) => {
          const count = skills.filter((s) => s.category === c).length;
          return (
            <button
              key={c}
              type="button"
              onClick={() => {
                const next = category === c ? null : c;
                setCategory(next);
                syncUrl(query, next);
              }}
              className={`chip ${category === c ? "chip-active" : ""}`}
              aria-pressed={category === c}
            >
              {CATEGORY_LABELS[c]}
              <span className="text-faint">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="font-mono text-xs text-faint" role="status">
        {filtered.length} {filtered.length === 1 ? "skill" : "skills"}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill) => (
            <SkillCard
              key={skill.slug}
              skill={skill}
              stats={skill.repo ? (statsByRepo[skill.repo] ?? null) : null}
            />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SmileyXEyes size={36} className="text-faint" aria-hidden />
          <p className="text-foreground">No skills match that search.</p>
          <p className="max-w-sm text-sm text-muted">
            Try a different term, or clear the category filter. Know a skill that belongs here?
            Open a pull request.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(null);
              syncUrl("", null);
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
