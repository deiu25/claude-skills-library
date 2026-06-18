"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ListChecks, MagnifyingGlass, Plus, SmileyXEyes } from "@phosphor-icons/react";
import type { Skill, SkillCategory } from "@/data/types";
import { CATEGORY_LABELS } from "@/data/types";
import type { RepoStats } from "@/lib/github";
import { decodeSelection, encodeSelection } from "@/lib/selection";
import { SkillCard } from "./SkillCard";
import { SelectionBar } from "./SelectionBar";

interface SkillSearchProps {
  skills: Skill[];
  statsByRepo: Record<string, RepoStats | null>;
}

export function SkillSearch({ skills, statsByRepo }: SkillSearchProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<SkillCategory | null>(
    (searchParams.get("category") as SkillCategory | null) ?? null,
  );
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(decodeSelection(searchParams.get("sel"), skills.map((s) => s.slug))),
  );

  const categories = useMemo(() => {
    const present = new Set(skills.map((s) => s.category));
    return (Object.keys(CATEGORY_LABELS) as SkillCategory[]).filter((c) => present.has(c));
  }, [skills]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const starsOf = (s: Skill): number => (s.repo ? (statsByRepo[s.repo]?.stars ?? 0) : 0);
    const matches = skills.filter((s) => {
      if (category && s.category !== category) return false;
      if (!q) return true;
      const haystack = [s.name, s.tagline, s.author, ...s.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
    // Highest GitHub star count first; stable sort keeps array order on ties.
    return [...matches].sort((a, b) => starsOf(b) - starsOf(a));
  }, [skills, query, category, statsByRepo]);

  // Selection persists across filters; export needs the full chosen set.
  const selectedSkills = useMemo(
    () => skills.filter((s) => selected.has(s.slug)),
    [skills, selected],
  );

  // Use the native History API, not router.replace: the `sel`/`q`/`category`
  // params are pure client UI state. router.replace re-runs the async server
  // page (getRepoStats) behind <Suspense>, flashing the skeleton and churning
  // selection on every click — replaceState updates the shareable URL with no
  // server roundtrip or remount.
  function syncUrl(nextQuery: string, nextCategory: SkillCategory | null, nextSelected: Set<string>) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextCategory) params.set("category", nextCategory);
    const sel = encodeSelection(nextSelected);
    if (sel) params.set("sel", sel);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/skills?${qs}` : "/skills");
  }

  function toggleSelect(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
    syncUrl(query, category, next);
  }

  // Add/remove the currently filtered skills as a batch; selection of skills
  // hidden by the active filter is left untouched.
  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.slug));

  function toggleSelectAll() {
    const next = new Set(selected);
    if (allFilteredSelected) {
      for (const s of filtered) next.delete(s.slug);
    } else {
      for (const s of filtered) next.add(s.slug);
    }
    setSelected(next);
    syncUrl(query, category, next);
  }

  function clearSelection() {
    const next = new Set<string>();
    setSelected(next);
    syncUrl(query, category, next);
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
            syncUrl(e.target.value, category, selected);
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
            syncUrl(query, null, selected);
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
                syncUrl(query, next, selected);
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-faint" role="status">
          {filtered.length} {filtered.length === 1 ? "skill" : "skills"}
          {selected.size > 0 ? ` · ${selected.size} selected` : ""}
        </p>
        {filtered.length > 0 ? (
          <button
            type="button"
            onClick={toggleSelectAll}
            aria-pressed={allFilteredSelected}
            className="btn btn-ghost text-xs"
          >
            <ListChecks size={15} aria-hidden />
            {allFilteredSelected ? "Deselect all" : "Select all"}
          </button>
        ) : null}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill) => {
            const isSelected = selected.has(skill.slug);
            return (
              <div key={skill.slug} className="relative">
                <button
                  type="button"
                  onClick={() => toggleSelect(skill.slug)}
                  aria-pressed={isSelected}
                  aria-label={isSelected ? `Deselect ${skill.name}` : `Select ${skill.name}`}
                  className={`absolute -right-2 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border transition-colors before:absolute before:-inset-2 before:content-[''] ${
                    isSelected
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-line bg-surface text-muted hover:border-faint hover:text-foreground"
                  }`}
                >
                  {isSelected ? (
                    <Check size={14} weight="bold" aria-hidden />
                  ) : (
                    <Plus size={14} aria-hidden />
                  )}
                </button>
                <SkillCard
                  skill={skill}
                  stats={skill.repo ? (statsByRepo[skill.repo] ?? null) : null}
                />
              </div>
            );
          })}
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
              syncUrl("", null, selected);
            }}
            className="btn btn-ghost mt-2 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      <SelectionBar selected={selectedSkills} statsByRepo={statsByRepo} onClear={clearSelection} />
    </div>
  );
}
