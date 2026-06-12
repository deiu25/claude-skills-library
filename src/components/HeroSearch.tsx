"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

/** Hero search: submits to the directory with the query prefilled. */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/skills?q=${encodeURIComponent(q)}` : "/skills");
      }}
      className="flex w-full max-w-md gap-2"
    >
      <div className="relative flex-1">
        <MagnifyingGlass
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills..."
          aria-label="Search skills"
          className="input-base pl-11"
        />
      </div>
      <button type="submit" className="btn btn-primary text-sm">
        Search
      </button>
    </form>
  );
}
