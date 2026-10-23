import { isAdmin } from "@/lib/auth/admin";
import { accountExportResponse } from "@/lib/auth/export";
import { getSession } from "@/lib/auth/session";
import { isSuspended } from "@/lib/moderation/queries";
import { zipResponse } from "@/lib/skills/archive";
import { findVersionArchive } from "@/lib/skills/queries";

/**
 * A suspended account's data export, for an admin to send when its owner asks: the account cannot
 * sign in to download it. With `?skill=<id>&version=<n>`, one saved version of its skills as a zip,
 * as its owner would download it, since the export's download addresses need the owner signed in.
 * Anyone else, and any account that is not suspended, gets a 404.
 */
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession();
  if (!session || !isAdmin(session.user.id)) return new Response(null, { status: 404 });
  const { userId } = await params;
  if (!(await isSuspended(userId))) return new Response(null, { status: 404 });
  const search = new URL(request.url).searchParams;
  const skillId = search.get("skill");
  if (skillId === null) return accountExportResponse(userId);
  const found = await findVersionArchive({ id: userId }, skillId, Number(search.get("version")));
  const archive = await found?.read();
  return archive ? zipResponse(archive) : new Response(null, { status: 404 });
}
