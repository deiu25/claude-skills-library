const NAME_MAX = 100;
export const BIO_MAX = 160;

interface Profile {
  name?: string;
  image?: string | null;
  bio?: string | null;
}

/** One line of at most `max` characters, without control or bidirectional characters. */
function oneLine(text: string, max: number): string {
  const visible = text.replace(/[\p{Cc}\p{Cf}]/gu, (c) => (/\s/.test(c) ? " " : ""));
  return Array.from(visible.replace(/\s+/g, " ").trim()).slice(0, max).join("");
}

/**
 * Normalizes the profile fields a user sets, on sign-up and on every update: a name of one line
 * and at most 100 characters, a bio of one line and at most 160 (empty becomes none), and an
 * https image or none. Fields the input leaves out stay out, so an update touches only what it
 * changes.
 */
export function cleanProfile(input: { name?: unknown; image?: unknown; bio?: unknown }): Profile {
  const profile: Profile = {};
  if (typeof input.name === "string") profile.name = oneLine(input.name, NAME_MAX);
  if (input.image !== undefined) {
    profile.image = typeof input.image === "string" && input.image.startsWith("https://") ? input.image : null;
  }
  if (input.bio !== undefined) {
    profile.bio = (typeof input.bio === "string" && oneLine(input.bio, BIO_MAX)) || null;
  }
  return profile;
}
