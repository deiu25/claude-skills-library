import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

/**
 * The current session, or null. Reads the request's cookie, so the calling route renders per request.
 * A suspension deletes the account's sessions; one created in the instant before it counts as none.
 */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.banned ? null : session;
});

/** The signed-in session and its user; anyone else is sent to sign in. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

/** The signed-in user; anyone else is sent to sign in. Call it in every page, action and handler that needs a user. */
export async function requireUser() {
  return (await requireSession()).user;
}
