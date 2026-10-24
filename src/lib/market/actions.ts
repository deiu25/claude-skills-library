"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { siteOrigin } from "@/lib/auth/hosts";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sellerAccount, skill } from "@/lib/db/schema";
import { rateLimit, type LimitName } from "@/lib/rate-limit";
import { OPERATOR } from "@/lib/site";
import type { SkillActionState } from "@/lib/skills/actions";
import { skillIdSchema } from "@/lib/skills/schemas";
import { errorCode, getStripe } from "@/lib/stripe";
import { sellerState } from "./queries";
import { countrySchema, CURRENCY, formatPrice, priceSchema } from "./schemas";
import { closeSellerAccount, createDashboardLink, createOnboardingLink, createSellerAccount } from "./stripe-accounts";

export type MarketActionState = SkillActionState;

const SIGNED_OUT = "You are signed out. Sign in again, then try once more.";
const NOT_SET_UP = "Selling is not available on this site yet.";
const TOO_MANY = "Too many requests in a short time. Wait a minute, then try again.";
const UNAVAILABLE = "This is unavailable for a moment. Try again shortly.";
const STRIPE_FAILED = "Stripe did not answer. Try again in a moment.";
const STRIPE_REFUSED = `Stripe could not set up your account. If this happens again, write to us at ${OPERATOR.email}.`;
const NOT_FOUND = "We could not find this skill. It may have been deleted.";

type SignedInUser = { id: string; email: string; name: string };

/** The signed-in user, after the named limit; anyone else gets a message, so an open form stays. */
async function signedIn(limit: LimitName): Promise<{ user: SignedInUser } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: SIGNED_OUT };
  const result = await rateLimit(limit, session.user.id);
  if (result !== "ok") return { error: result === "limited" ? TOO_MANY : UNAVAILABLE };
  return { user: session.user };
}

/** What a seller reads when a Stripe request fails: a refusal will fail again, a lost answer may not. */
const stripeFailure = (error: unknown) =>
  error instanceof Stripe.errors.StripeInvalidRequestError || error instanceof Stripe.errors.StripePermissionError ? STRIPE_REFUSED : STRIPE_FAILED;

/**
 * The user's Stripe account id, opening one in the country they chose when they have none. Stripe
 * is called outside any transaction: the row's key keeps one account per user, and an account
 * opened by a second request at the same moment, for another country, is closed again.
 */
async function sellerAccountFor(
  stripe: Stripe,
  user: SignedInUser,
  formData: FormData,
): Promise<{ id: string; opened: boolean } | { error: string }> {
  const [existing] = await db.select({ id: sellerAccount.stripeAccountId }).from(sellerAccount).where(eq(sellerAccount.userId, user.id));
  if (existing) return { id: existing.id, opened: false };
  const country = countrySchema.safeParse(formData.get("country"));
  if (!country.success) return { error: country.error.issues[0].message };
  const opened = await createSellerAccount(stripe, { userId: user.id, email: user.email, name: user.name, country: country.data });
  let stored: { id: string }[];
  try {
    stored = await db
      .insert(sellerAccount)
      .values({ userId: user.id, stripeAccountId: opened, country: country.data })
      .onConflictDoNothing({ target: sellerAccount.userId })
      .returning({ id: sellerAccount.stripeAccountId });
  } catch (error) {
    // Stripe opened it, but nothing here records it: the log is the only trace.
    console.error("Seller account not stored:", opened, errorCode(error));
    throw error;
  }
  if (stored.length) return { id: opened, opened: true };
  const [winner] = await db.select({ id: sellerAccount.stripeAccountId }).from(sellerAccount).where(eq(sellerAccount.userId, user.id));
  if (winner.id !== opened) {
    await closeSellerAccount(stripe, opened).catch((error) => console.error("Stripe account not closed:", opened, errorCode(error)));
  }
  return { id: winner.id, opened: false };
}

/**
 * Opens the user's Stripe account, once, in the country they choose, then sends them to Stripe to
 * fill it in. A user who has one already is sent straight back to Stripe's form, with a new link.
 */
export async function startSelling(_previous: MarketActionState, formData: FormData): Promise<MarketActionState> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: NOT_SET_UP };
  const signed = await signedIn("seller");
  if ("error" in signed) return { ok: false, error: signed.error };
  const origin = siteOrigin((await headers()).get("host"));
  if (!origin) return { ok: false, error: UNAVAILABLE };

  let url: string;
  let account: { id: string; opened: boolean } | { error: string } | null = null;
  try {
    account = await sellerAccountFor(stripe, signed.user, formData);
    if ("error" in account) return { ok: false, error: account.error };
    url = await createOnboardingLink(stripe, account.id, origin);
  } catch (error) {
    console.error("Seller onboarding failed:", errorCode(error));
    // An account stored before the link failed: the page then offers to continue, not to pick a country.
    if (account && "opened" in account && account.opened) revalidatePath("/dashboard/sales");
    return { ok: false, error: stripeFailure(error) };
  }
  redirect(url);
}

/** Signs a ready seller in to their Express Dashboard on Stripe, with a link made for this click. */
export async function openStripeDashboard(): Promise<MarketActionState> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: NOT_SET_UP };
  const signed = await signedIn("seller");
  if ("error" in signed) return { ok: false, error: signed.error };

  let url: string | null;
  try {
    const [row] = await db
      .select({ stripeAccountId: sellerAccount.stripeAccountId, ready: sellerAccount.ready })
      .from(sellerAccount)
      .where(eq(sellerAccount.userId, signed.user.id));
    url = row?.ready ? await createDashboardLink(stripe, row.stripeAccountId) : null;
  } catch (error) {
    console.error("Stripe dashboard link failed:", errorCode(error));
    return { ok: false, error: stripeFailure(error) };
  }
  if (!url) return { ok: false, error: "Finish setting up selling first." };
  redirect(url);
}

/** Sets what a buyer pays for one of the user's skills, in euros. Only a ready seller can. */
export async function setSkillPrice(skillId: unknown, _previous: MarketActionState, formData: FormData): Promise<MarketActionState> {
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  if (!getStripe()) return { ok: false, error: NOT_SET_UP };
  const signed = await signedIn("skill-write");
  if ("error" in signed) return { ok: false, error: signed.error };
  const price = priceSchema.safeParse(formData.get("price"));
  if (!price.success) return { ok: false, error: price.error.issues[0].message };

  let priced: { id: string }[];
  try {
    if ((await sellerState(signed.user.id)) !== "ready") return { ok: false, error: "Set up selling before you price a skill." };
    // A removed skill can never be sold again, so it takes no price.
    priced = await db
      .update(skill)
      .set({ priceCents: price.data, currency: CURRENCY })
      .where(and(eq(skill.id, id.data), eq(skill.ownerId, signed.user.id), ne(skill.status, "removed")))
      .returning({ id: skill.id });
  } catch (error) {
    console.error("Skill price change failed:", errorCode(error));
    return { ok: false, error: "The price did not change. Try again in a moment." };
  }
  if (!priced.length) return { ok: false, error: NOT_FOUND };
  revalidatePath(`/dashboard/skills/${id.data}`);
  return { ok: true, message: `Priced at ${formatPrice(price.data)}.` };
}

/** Makes one of the user's skills free again. */
export async function removeSkillPrice(skillId: unknown): Promise<MarketActionState> {
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  const signed = await signedIn("skill-write");
  if ("error" in signed) return { ok: false, error: signed.error };

  let freed: { id: string }[];
  try {
    freed = await db
      .update(skill)
      .set({ priceCents: null, currency: null })
      .where(and(eq(skill.id, id.data), eq(skill.ownerId, signed.user.id)))
      .returning({ id: skill.id });
  } catch (error) {
    console.error("Skill price change failed:", errorCode(error));
    return { ok: false, error: "The price did not change. Try again in a moment." };
  }
  if (!freed.length) return { ok: false, error: NOT_FOUND };
  revalidatePath(`/dashboard/skills/${id.data}`);
  return { ok: true, message: "The skill has no price." };
}
