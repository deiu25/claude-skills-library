import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SellerAccount } from "@/components/market/SellerAccount";
import { requireUser } from "@/lib/auth/session";
import { isSellingAvailable } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Sales",
  robots: { index: false },
};

// Stripe sends a seller back here when they finish or leave its onboarding form.
export default async function SalesPage() {
  const user = await requireUser();
  if (!isSellingAvailable()) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">Sales</h1>
          <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-muted sm:text-base">
            Sell your skills through Stripe, which will pay you once checkout opens. Nobody can buy a skill yet: set up your
            account and your prices now.
          </p>
        </div>
        <div className="mt-10 divide-y divide-line border-t border-line">
          <SellerAccount userId={user.id} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
