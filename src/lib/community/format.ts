import type { CommunitySkill } from "./queries";

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "23 Oct 2026": a fixed date rather than "3 days ago", which would go stale in a page cached for hours. */
export const formatDate = (date: Date) => DATE.format(date);

/** What a Community card shows, and the tags search reads: nothing more crosses into the browser. */
export interface CommunityCardData {
  handle: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  /** Formatted on the server, so the browser renders the same text. */
  updated: string;
}

export const toCard = ({ handle, slug, name, description, category, tags, updatedAt }: CommunitySkill): CommunityCardData => ({
  handle,
  slug,
  name,
  description,
  category,
  tags,
  updated: formatDate(updatedAt),
});

/** Text cut to at most `max` characters at a word boundary, for a meta description. */
export function summary(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:.]+$/, "")}…`;
}
