import { UsersThree } from "@phosphor-icons/react/dist/ssr";

/** Marks what a user published, so it is never mistaken for the curated catalog. */
export function CommunityLabel() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 py-1 text-xs text-muted">
      <UsersThree size={14} aria-hidden />
      Community
    </span>
  );
}
