import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";
import { atLeast } from "@/lib/timing";

type Handler = (request: Request) => Promise<Response>;

const handlers = toNextJsHandler(auth);

// These answer the same whether or not the address has an account, but not in the same time: a
// new account's inserts, or a known address's reset token, took longer. Each request now takes at
// least this long, which hides the difference.
const FLOOR_MS: Record<string, number> = {
  "/api/auth/request-password-reset": 500,
  "/api/auth/sign-up/email": 1000,
};

function padAccountLookups(handler: Handler): Handler {
  return (request) => {
    const response = handler(request);
    const floor = FLOOR_MS[new URL(request.url).pathname];
    return floor ? atLeast(floor, response) : response;
  };
}

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
export const POST = padAccountLookups(logWithoutParams(handlers.POST));
