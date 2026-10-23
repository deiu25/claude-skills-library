import { getAccountExport } from "@/lib/auth/queries";
import { getSession } from "@/lib/auth/session";
import { getReportsExport } from "@/lib/moderation/queries";
import { getSkillsExport } from "@/lib/skills/queries";

/** The signed-in user's data as a JSON download (GDPR art. 15 and 20). */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });

  const exportedAt = new Date().toISOString();
  const [account, skills, reportsSent] = await Promise.all([
    getAccountExport(session.user.id),
    getSkillsExport(session.user.id),
    getReportsExport(session.user.id),
  ]);
  const body = JSON.stringify({ exportedAt, ...account, skills, reportsSent }, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="claude-skills-library-account-${exportedAt.slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
