import { getSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { folderName, zipVersion } from "@/lib/skills/archive";
import { getVersionArchive } from "@/lib/skills/queries";

/**
 * A version of the signed-in user's own skill as a zip: the latest, or `?version=<n>`. Someone
 * else's skill answers 404, the same as one that does not exist.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });
  const limit = await rateLimit("skill-download", session.user.id);
  if (limit !== "ok") return new Response(null, { status: limit === "limited" ? 429 : 503 });

  const version = new URL(request.url).searchParams.get("version");
  const archive = await getVersionArchive(session.user.id, (await params).id, version === null ? undefined : Number(version));
  if (!archive) return new Response(null, { status: 404 });

  return new Response(Buffer.from(zipVersion(archive)), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${folderName(archive.name)}-v${archive.version}.zip"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
