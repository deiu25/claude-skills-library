interface Searchable {
  handle: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
}

/** The skills in `category`, or all, whose name, description, author or tags contain every word of `query`. */
export function filterSkills<T extends Searchable>(skills: T[], query: string, category: string | null): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return skills.filter((skill) => {
    if (category && skill.category !== category) return false;
    const haystack = [skill.name, skill.description, skill.handle, ...skill.tags].join(" ").toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
