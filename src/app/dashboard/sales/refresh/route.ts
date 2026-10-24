import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { siteOrigin } from "@/lib/auth/hosts";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sellerAccount } from "@/lib/db/schema";
import { createOnboardingLink } from "@/lib/market/stripe-accounts";
import { rateLimit } from "@/lib/rate-limit";
import { getStripe, stripeCode } from "@/lib/stripe";

/**
 * Where Stripe sends a seller whose onboarding link expired or was already opened: a new link for
 * their own account. A browser opens it, so a signed-out visitor, such as a link preview, is sent
 * to sign in, and anything that cannot make a link lands on the sales page, which says where things stand.
 */
export async function GET(request: Request) {
  const user = await requireUser();
  const stripe = getStripe();
  const origin = siteOrigin(request.headers.get("host"));
  const [row] = await db.select({ stripeAccountId: sellerAccount.stripeAccountId }).from(sellerAccount).where(eq(sellerAccount.userId, user.id));
  if (!stripe || !origin || !row || (await rateLimit("seller", user.id)) !== "ok") redirect("/dashboard/sales");

  let url: string;
  try {
    url = await createOnboardingLink(stripe, row.stripeAccountId, origin);
  } catch (error) {
    console.error("Seller onboarding link failed:", stripeCode(error));
    redirect("/dashboard/sales");
  }
  redirect(url);
}
