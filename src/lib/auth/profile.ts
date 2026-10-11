const NAME_MAX = 100;

interface Profile {
  name?: string;
  image?: string | null;
}

/**
 * Normalizes the profile fields a user sets, on sign-up and on every update: a name of one line
 * and at most 100 characters, without control or bidirectional characters, and an https image
 * or none. Fields the input leaves out stay out, so an update touches only what it changes.
 */
export function cleanProfile(input: { name?: unknown; image?: unknown }): Profile {
  const profile: Profile = {};
  if (typeof input.name === "string") {
    const oneLine = input.name.replace(/[\p{Cc}\p{Cf}]/gu, (c) => (/\s/.test(c) ? " " : ""));
    profile.name = Array.from(oneLine.replace(/\s+/g, " ").trim()).slice(0, NAME_MAX).join("");
  }
  if (input.image !== undefined) {
    profile.image = typeof input.image === "string" && input.image.startsWith("https://") ? input.image : null;
  }
  return profile;
}
