import { scanFiles, type Finding } from "./scan";

// The files of a skill beside its SKILL.md: what an upload may hold, how a picked folder is read,
// and the limits. Pure apart from reading a picked File, so the editor checks a folder the same way
// the server checks the upload.

/** Files in one version, SKILL.md included. */
export const FILES_MAX = 200;
/** Bytes in one version, SKILL.md included. Under the 2 MB Server Action body limit in next.config.ts. */
export const VERSION_BYTES_MAX = 1024 * 1024;
/** File bytes, SKILL.md left out, that an account stores across every kept version. */
export const ACCOUNT_FILE_BYTES_MAX = 20 * 1024 * 1024;
const PATH_MAX = 255;

// What `npx skills` leaves out when it installs a folder (.git, __pycache__, __pypackages__,
// metadata.json) or hashes one (.git, node_modules), plus the clutter macOS and Windows add. A
// stored skill holds none of them, so its hash is the one the CLI computes after installing it.
const SKIPPED_FOLDERS = new Set([".git", "node_modules", "__pycache__", "__pypackages__"]);
const SKIPPED_FILES = new Set(["metadata.json", ".DS_Store", "Thumbs.db", "desktop.ini"]);

// Characters no file name can hold on one of Linux, macOS or Windows, so a download unpacks anywhere,
// and characters that hide or reorder a name: two names that differ only by one of them look alike
// and sort as equal, which would make the folder's hash depend on the order the files arrived in.
const UNSAFE_CHARACTER_RE = /[\\:*?"<>|\u2028\u2029\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/u;
// Names Windows reserves for devices, with any extension, and names it would silently trim.
const WINDOWS_NAME_RE = /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\..*)?$|[. ]$/i;

const shown = (path: string) => (path.length > 80 ? `${path.slice(0, 80)}…` : path);

/** Whether `npx skills` would leave this file out, so an upload does too. */
export function isSkipped(path: string): boolean {
  const segments = path.split("/");
  return SKIPPED_FILES.has(segments[segments.length - 1]) || segments.slice(0, -1).some((segment) => SKIPPED_FOLDERS.has(segment));
}

/** What is wrong with one file's path, relative to the skill's folder, or null. */
export function pathProblem(path: string): string | null {
  if (!path || path.length > PATH_MAX) return `Keep each file path between 1 and ${PATH_MAX} characters.`;
  if (path.startsWith("/") || path.split("/").some((segment) => segment === "" || segment === "." || segment === "..")) {
    return `${shown(path)} points outside the skill's folder.`;
  }
  if (UNSAFE_CHARACTER_RE.test(path) || !path.isWellFormed() || path !== path.normalize("NFC")) {
    return `${shown(path)} has a character a file name cannot hold.`;
  }
  if (path.split("/").some((segment) => WINDOWS_NAME_RE.test(segment))) {
    return `${shown(path)} has a name Windows cannot use: a device name such as CON or NUL, or one that ends in a dot or a space.`;
  }
  if (isSkipped(path)) return `${shown(path)} is left out of skills, as npx skills leaves it out. Remove it from the upload.`;
  return null;
}

export interface FileSize {
  path: string;
  size: number;
}

/**
 * A path as a case-insensitive file system compares it. Upper case first: letters such as ſ and
 * ı have no lower-case pair of their own, but upper-case to S and I, so ſkill.md is SKILL.md there.
 */
const foldCase = (path: string) => path.toUpperCase().toLowerCase();

/**
 * The first problem with a skill's files, SKILL.md not among them, or null: too many, too large, a
 * path that leaves the folder, or two that would land on one file where names ignore case.
 */
export function filesProblem(files: FileSize[], skillMdBytes: number): string | null {
  if (files.length + 1 > FILES_MAX) return `A skill holds up to ${FILES_MAX} files, SKILL.md included. This one has ${files.length + 1}.`;
  const bytes = files.reduce((sum, file) => sum + file.size, skillMdBytes);
  if (bytes > VERSION_BYTES_MAX) {
    return `A skill holds up to ${formatBytes(VERSION_BYTES_MAX)}, SKILL.md included. This one has ${formatBytes(bytes)}.`;
  }

  const taken = new Map<string, string>([["skill.md", "SKILL.md"]]);
  for (const { path } of files) {
    const problem = pathProblem(path);
    if (problem) return problem;
    const other = taken.get(foldCase(path));
    if (other) return `${shown(path)} and ${shown(other)} differ only in case, so they would be one file on macOS and Windows.`;
    taken.set(foldCase(path), path);
  }
  for (const { path } of files) {
    const segments = foldCase(path).split("/");
    for (let end = 1; end < segments.length; end++) {
      const folder = taken.get(segments.slice(0, end).join("/"));
      if (folder) return `${shown(folder)} is both a file and a folder.`;
    }
  }
  return null;
}

const UTF8 = new TextDecoder("utf-8", { fatal: true });
const LENIENT_UTF8 = new TextDecoder("utf-8");

// Files that people, shells or Claude read as text, whatever bytes they hold.
const TEXT_NAME_RE = /\.(?:md|markdown|mdx|txt|sh|bash|zsh|fish|ps1|psm1|bat|cmd|py|rb|pl|php|js|mjs|cjs|ts|mts|cts|jsx|tsx|json|jsonc|ya?ml|toml|ini|cfg|conf|env|xml|html?|css|sql|csv)$/i;

/** A script starting with #! is marked executable, since a browser cannot read a file's mode. */
export const isExecutable = (content: Uint8Array) => content[0] === 0x23 && content[1] === 0x21;

/**
 * A file's text for the scan, or null for a binary file. UTF-8 without a NUL byte is text, and so is
 * UTF-16 with a byte-order mark, as Windows editors save PowerShell and batch files. A script that
 * starts with #!, or a file named as text, is read as text whatever it holds, so one stray byte
 * cannot take it out of the scan; a NUL in it is then flagged as a hidden character.
 */
export function textOf(path: string, content: Uint8Array): string | null {
  if (content[0] === 0xff && content[1] === 0xfe) return new TextDecoder("utf-16le").decode(content);
  if (content[0] === 0xfe && content[1] === 0xff) return new TextDecoder("utf-16be").decode(content);
  if (!content.includes(0)) {
    try {
      return UTF8.decode(content);
    } catch {
      // Not UTF-8: text only when its start or its name says so.
    }
  }
  return isExecutable(content) || TEXT_NAME_RE.test(path) ? LENIENT_UTF8.decode(content) : null;
}

/** "512 B", "12.5 KB", "1 MB". Rounded up, so a size over a limit never reads as the limit itself. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const [value, unit] = bytes < 1024 * 1024 ? [bytes / 1024, "KB"] : [bytes / (1024 * 1024), "MB"];
  return `${(Math.ceil(value * 10) / 10).toLocaleString("en")} ${unit}`;
}

/** A file beside SKILL.md as the editor lists it: never its content. */
export interface FileSummary {
  path: string;
  size: number;
  executable: boolean;
  /** False for a binary file, which the scan cannot read. */
  scanned: boolean;
}

export interface PickedFile extends FileSummary {
  file: File;
}

export type PickedFolder =
  | { ok: true; skillMd: string; files: PickedFile[]; findings: Finding[]; skipped: number }
  | { ok: false; error: string };

/**
 * Reads a folder chosen with a directory picker: its SKILL.md and every other file, under paths
 * relative to the folder, scanned the way the server scans them. Leaves out what `npx skills` does.
 */
export async function readSkillFolder(picked: File[]): Promise<PickedFolder> {
  let skillMd: File | undefined;
  const others: { path: string; file: File }[] = [];
  let skipped = 0;
  for (const file of picked) {
    // webkitRelativePath starts with the chosen folder's own name. macOS can hand over decomposed
    // accents, which the server refuses, so names are composed here.
    const path = (file.webkitRelativePath || file.name).split("/").slice(1).join("/").normalize("NFC");
    if (path === "SKILL.md") skillMd = file;
    else if (isSkipped(path)) skipped++;
    else others.push({ path, file });
  }
  if (!skillMd) return { ok: false, error: "This folder has no SKILL.md at its top level. Choose the folder that holds the skill's SKILL.md." };

  const problem = filesProblem(
    others.map(({ path, file }) => ({ path, size: file.size })),
    skillMd.size,
  );
  if (problem) return { ok: false, error: problem };

  const files = await Promise.all(
    others.map(async ({ path, file }) => {
      const content = new Uint8Array(await file.arrayBuffer());
      return { path, file, content, text: textOf(path, content) };
    }),
  );
  return {
    ok: true,
    skillMd: await skillMd.text(),
    files: files
      .map(({ path, file, content, text }) => ({ path, file, size: content.length, executable: isExecutable(content), scanned: text !== null }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    findings: scanFiles(files.flatMap(({ path, text }) => (text === null ? [] : [{ path, text }]))),
    skipped,
  };
}
