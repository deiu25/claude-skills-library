import { getSession } from "@/lib/auth/session";
import { rateLimit, visitorKey } from "@/lib/rate-limit";
import { zipResponse } from "@/lib/skills/archive";
import { findVersionArchive } from "@/lib/skills/queries";

/**
 * A version of a skill as a zip: the owner's latest, or `?version=<n>`, and for anyone else the
 * latest version of a published skill. A skill they cannot have answers 404 when signed in, the
 * same as one that does not exist, and 401 when signed out.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const refused = new Response(null, { status: session ? 404 : 401 });
  const version = new URL(request.url).searchParams.get("version");
  const found = await findVersionArchive(session?.user ?? null, (await params).id, version === null ? undefined : Number(version));
  if (!found) return refused;

  // Checked once the download is known to be allowed, so a visitor's request that fails anyway sends nothing to Upstash.
  const limit = await rateLimit("skill-download", session ? session.user.id : visitorKey(request));
  if (limit !== "ok") return new Response(null, { status: limit === "limited" ? 429 : 503 });
  const archive = await found.read();
  if (!archive) return refused;
  return zipResponse(archive);
}
