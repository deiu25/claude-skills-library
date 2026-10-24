"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { siteOrigin } from "@/lib/auth/hosts";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sellerAccount, skill } from "@/lib/db/schema";
import { rateLimit, type LimitName } from "@/lib/rate-limit";
import type { SkillActionState } from "@/lib/skills/actions";
import { skillIdSchema } from "@/lib/skills/schemas";
import { getStripe, stripeCode } from "@/lib/stripe";
import { isReadySeller } from "./queries";
import { countrySchema, CURRENCY, formatPrice, priceSchema } from "./schemas";
import { createDashboardLink, createOnboardingLink, createSellerAccount } from "./stripe-accounts";

export type MarketActionState = SkillActionState;

const SIGNED_OUT = "You are signed out. Sign in again, then try once more.";
const NOT_SET_UP = "Selling is not available on this site yet.";
const TOO_MANY = "Too many requests in a short time. Wait a minute, then try again.";
const UNAVAILABLE = "This is unavailable for a moment. Try again shortly.";
const STRIPE_FAILED = "Stripe did not answer. Try again in a moment.";
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

/**
 * Opens the user's Stripe account, once, in the country they choose, then sends them to Stripe to
 * fill it in. A user who has one already is sent straight back to Stripe's form, with a new link.
 */
export async function startSelling(_previous: MarketActionState, formData: FormData): Promise<MarketActionState> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: NOT_SET_UP };
  const signed = await signedIn("seller");
  if ("error" in signed) return { ok: false, error: signed.error };
  const { user } = signed;
  const origin = siteOrigin((await headers()).get("host"));
  if (!origin) return { ok: false, error: UNAVAILABLE };

  let url: string;
  try {
    const account = await db.transaction(async (tx): Promise<{ id: string } | { error: string }> => {
      // One Stripe account per user: a second request at the same moment waits here, then finds the first's.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`seller:${user.id}`}, 0))`);
      const [existing] = await tx
        .select({ stripeAccountId: sellerAccount.stripeAccountId })
        .from(sellerAccount)
        .where(eq(sellerAccount.userId, user.id));
      if (existing) return { id: existing.stripeAccountId };
      const country = countrySchema.safeParse(formData.get("country"));
      if (!country.success) return { error: country.error.issues[0].message };
      const id = await createSellerAccount(stripe, { userId: user.id, email: user.email, name: user.name, country: country.data });
      await tx.insert(sellerAccount).values({ userId: user.id, stripeAccountId: id, country: country.data });
      return { id };
    });
    if ("error" in account) return { ok: false, error: account.error };
    // Outside the transaction, so the account is kept when only the link fails.
    url = await createOnboardingLink(stripe, account.id, origin);
  } catch (error) {
    console.error("Seller onboarding failed:", stripeCode(error));
    return { ok: false, error: STRIPE_FAILED };
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
    console.error("Stripe dashboard link failed:", stripeCode(error));
    return { ok: false, error: STRIPE_FAILED };
  }
  if (!url) return { ok: false, error: "Finish setting up selling first." };
  redirect(url);
}

/** Sets what a buyer pays for one of the user's skills, in euros. Only a ready seller can. */
export async function setSkillPrice(skillId: unknown, _previous: MarketActionState, formData: FormData): Promise<MarketActionState> {
  const id = skillIdSchema.safeParse(skillId);
  if (!id.success) return { ok: false, error: NOT_FOUND };
  const signed = await signedIn("skill-write");
  if ("error" in signed) return { ok: false, error: signed.error };
  const price = priceSchema.safeParse(formData.get("price"));
  if (!price.success) return { ok: false, error: price.error.issues[0].message };

  let priced: { id: string }[];
  try {
    if (!(await isReadySeller(signed.user.id))) return { ok: false, error: "Set up selling before you price a skill." };
    // A removed skill can never be sold again, so it takes no price.
    priced = await db
      .update(skill)
      .set({ priceCents: price.data, currency: CURRENCY })
      .where(and(eq(skill.id, id.data), eq(skill.ownerId, signed.user.id), ne(skill.status, "removed")))
      .returning({ id: skill.id });
  } catch (error) {
    console.error("Skill price change failed:", stripeCode(error));
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
    console.error("Skill price change failed:", stripeCode(error));
    return { ok: false, error: "The price did not change. Try again in a moment." };
  }
  if (!freed.length) return { ok: false, error: NOT_FOUND };
  revalidatePath(`/dashboard/skills/${id.data}`);
  return { ok: true, message: "The skill has no price." };
}
