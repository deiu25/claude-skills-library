import { zipSync, type ZipOptions, type Zippable } from "fflate";
import { SLUG_RE } from "./schemas";

const UNIX = 3;

/** A regular file's Unix mode, in the high half of a zip entry's external attributes. */
const unixAttributes = (executable: boolean) => ((0o100000 | (executable ? 0o755 : 0o644)) << 16) >>> 0;

export interface ZipInput {
  name: string;
  createdAt: Date;
  skillMd: string;
  files: { path: string; content: Uint8Array; executable: boolean }[];
}

/**
 * A version as a zip of one folder named after the skill, ready to unpack into ~/.claude/skills.
 * Scripts keep their executable mode on Unix, and every entry carries the version's save time, so
 * one version always zips to the same bytes.
 */
export function zipVersion({ name, createdAt, skillMd, files }: ZipInput): Uint8Array {
  // Names are checked on save; the guard keeps any other value from naming a path in the archive.
  const folder = SLUG_RE.test(name) ? name : "skill";
  const entry = (content: Uint8Array, executable: boolean): [Uint8Array, ZipOptions] => [
    content,
    { mtime: createdAt, os: UNIX, attrs: unixAttributes(executable) },
  ];
  const entries: Zippable = { [`${folder}/SKILL.md`]: entry(new TextEncoder().encode(skillMd), false) };
  for (const file of files) entries[`${folder}/${file.path}`] = entry(file.content, file.executable);
  return zipSync(entries);
}
