import { skills } from "@/data/skills";
import { toLlmsTxt } from "@/lib/report";

// Prerender to a static file at build/revalidate — no runtime backend.
export const dynamic = "force-static";
export const revalidate = 21600;

export async function GET() {
  return new Response(toLlmsTxt(skills), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
