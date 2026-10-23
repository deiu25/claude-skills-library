import "server-only";
import { and, lt, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { report } from "@/lib/db/schema";

const DAY_MS = 24 * 60 * 60 * 1000;

/** How long a decided report is kept, as the record of a notice and of what was done about it. */
const DECIDED_REPORT_DAYS = 365;

/** Deletes reports decided more than a year ago. Open reports stay until they are decided. */
export async function deleteDecidedReports(now = new Date()) {
  const result = await db
    .delete(report)
    .where(and(ne(report.status, "open"), lt(report.resolvedAt, new Date(now.getTime() - DECIDED_REPORT_DAYS * DAY_MS))));
  return result.rowCount ?? 0;
}
