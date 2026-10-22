import { getSession } from "@/lib/auth/session";
import { zipVersion } from "@/lib/skills/archive";
import { getVersionArchive } from "@/lib/skills/queries";

/**
 * A version of the signed-in user's own skill as a zip: the latest, or `?version=<n>`. Someone
 * else's skill answers 404, the same as one that does not exist.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });

  const version = new URL(request.url).searchParams.get("version");
  const archive = await getVersionArchive(session.user.id, (await params).id, version === null ? undefined : Number(version));
  if (!archive) return new Response(null, { status: 404 });

  return new Response(Buffer.from(zipVersion(archive)), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${archive.name}-v${archive.version}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
