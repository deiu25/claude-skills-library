import { accountExportResponse } from "@/lib/auth/export";
import { getSession } from "@/lib/auth/session";

/** The signed-in user's data as a JSON download (GDPR art. 15 and 20). */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });
  return accountExportResponse(session.user.id);
}
