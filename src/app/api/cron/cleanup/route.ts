import { deleteExpiredAuthRows } from "@/lib/auth/cleanup";
import { isCronRequest } from "@/lib/cron";

// Called once a day by Vercel Cron (vercel.json).
export async function GET(request: Request) {
  if (!isCronRequest(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return new Response(null, { status: 401 });
  }
  const deleted = await deleteExpiredAuthRows();
  console.info("Cleanup deleted:", deleted);
  return Response.json(deleted);
}
