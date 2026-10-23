import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { skillFile } from "@/lib/db/schema";
import { textOf, type FileSummary } from "./files";

/**
 * A version's files as the pages list them, in path order: sizes and kinds, never their content.
 * It checks no access: callers pass a version they may show, the owner's or a published one.
 */
export async function getFileSummaries(versionId: string): Promise<FileSummary[]> {
  const rows = await db
    .select({ path: skillFile.path, content: skillFile.content, executable: skillFile.executable })
    .from(skillFile)
    .where(eq(skillFile.versionId, versionId));
  return rows
    .map(({ path, content, executable }) => ({ path, size: content.length, executable, scanned: textOf(path, content) !== null }))
    .sort((a, b) => a.path.localeCompare(b.path));
}
