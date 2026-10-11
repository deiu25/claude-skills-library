"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { session } from "@/lib/db/schema";
import { auth } from "./auth";
import { requireSession } from "./session";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

// Session rows are deleted by id, never through Better Auth's revoke endpoint, which takes the
// session's token: the settings page never sends a token to the browser.

/** Signs out one of the user's other sessions. */
export async function revokeSession(sessionId: unknown): Promise<ActionResult> {
  const current = await requireSession();
  if (typeof sessionId !== "string" || !sessionId || sessionId === current.session.id) {
    return { ok: false, error: "Choose one of your other sessions." };
  }
  await db.delete(session).where(and(eq(session.id, sessionId), eq(session.userId, current.user.id)));
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

/** Signs out every session of the user except this one. */
export async function revokeOtherSessions(): Promise<ActionResult> {
  const current = await requireSession();
  await db.delete(session).where(and(eq(session.userId, current.user.id), ne(session.id, current.session.id)));
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
