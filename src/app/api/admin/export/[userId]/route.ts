import { isAdmin } from "@/lib/auth/admin";
import { accountExportResponse } from "@/lib/auth/export";
import { getSession } from "@/lib/auth/session";
import { isSuspended } from "@/lib/moderation/queries";

/**
 * A suspended account's data export, for an admin to send when its owner asks: the account cannot
 * sign in to download it. Anyone else, and any account that is not suspended, gets a 404.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession();
  if (!session || !isAdmin(session.user.id)) return new Response(null, { status: 404 });
  const { userId } = await params;
  if (!(await isSuspended(userId))) return new Response(null, { status: 404 });
  return accountExportResponse(userId);
}
