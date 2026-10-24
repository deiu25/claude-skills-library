import "server-only";
import { getAccountExport } from "@/lib/auth/queries";
import { getSellerExport } from "@/lib/market/queries";
import { getReportsExport } from "@/lib/moderation/queries";
import { getSkillsExport } from "@/lib/skills/queries";

/** A user's data as a JSON download (GDPR art. 15 and 20). */
export async function accountExportResponse(userId: string): Promise<Response> {
  const exportedAt = new Date().toISOString();
  const [account, skills, seller, reportsSent] = await Promise.all([
    getAccountExport(userId),
    getSkillsExport(userId),
    getSellerExport(userId),
    getReportsExport(userId),
  ]);
  const body = JSON.stringify({ exportedAt, ...account, skills, seller, reportsSent }, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="claude-skills-library-account-${exportedAt.slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
