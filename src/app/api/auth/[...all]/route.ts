import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

type Handler = (request: Request) => Promise<Response>;

const handlers = toNextJsHandler(auth);

// auth.ts sets onAPIError.throw, so an unexpected error lands here. Left to Better Auth, a failed
// query is printed whole, parameters included: password hashes, reset tokens and session tokens.
function logWithoutParams(handler: Handler): Handler {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      const cause = error instanceof Error ? (error.cause as { code?: unknown } | undefined) : undefined;
      console.error("Auth request failed:", error instanceof Error ? error.name : typeof error, cause?.code ?? "");
      return new Response(null, { status: 500 });
    }
  };
}

export const GET = logWithoutParams(handlers.GET);
export const POST = logWithoutParams(handlers.POST);
