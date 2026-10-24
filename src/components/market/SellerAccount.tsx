import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { FormMessage } from "@/components/auth/FormMessage";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { countryName } from "@/lib/market/countries";
import { getSeller, type Seller } from "@/lib/market/queries";
import { OPERATOR } from "@/lib/site";
import { StartSelling } from "./StartSelling";
import { StripeDashboardButton } from "./StripeDashboardButton";

const contact = (
  <a href={`mailto:${OPERATOR.email}`} className="text-foreground underline decoration-line underline-offset-4 hover:text-accent-strong">
    {OPERATOR.email}
  </a>
);

/**
 * Each state of a seller's Stripe account: what it is, what it means, and the way on. "continue"
 * is a primary button, "reopen" a ghost one for a seller who may still want Stripe's form.
 */
const STATES: Record<Seller["status"], { title: string; detail: ReactNode; action: "continue" | "reopen" | "dashboard" | null }> = {
  active: {
    title: "Ready to sell",
    detail: "Stripe has accepted your account. You can price your skills, and see your payouts and details on Stripe.",
    action: "dashboard",
  },
  pending: {
    title: "Stripe is checking your details",
    detail: "Stripe needs nothing more from you for now and is checking what you sent. This page shows the result once Stripe has it.",
    action: "reopen",
  },
  restricted: {
    title: "Stripe has not accepted your account yet",
    detail: "Continue on Stripe to see what it needs. It saves what you entered before.",
    action: "continue",
  },
  missing: {
    title: "This Stripe account can no longer be used",
    detail: <>It was closed, or it belongs to a Stripe setup this site no longer uses. Write to us at {contact} and we will help you set it up again.</>,
    action: null,
  },
  rejected: {
    title: "Stripe turned this account down",
    detail: <>Stripe will not pay out to this account. If you think that is a mistake, write to us at {contact}.</>,
    action: null,
  },
  unsupported: {
    title: "Stripe cannot pay this account",
    detail: <>Stripe does not pay out to this account&rsquo;s country or kind of business from here. Write to us at {contact}.</>,
    action: null,
  },
  unknown: {
    title: "We could not check with Stripe just now",
    detail: "Reload this page later to see where your account stands.",
    action: "reopen",
  },
};

/** The user's Stripe account: opening one, finishing it on Stripe, and its state. */
export async function SellerAccount({ userId }: { userId: string }) {
  const seller = await getSeller(userId);
  const state = seller ? STATES[seller.status] : null;

  return (
    <SettingsSection
      id="stripe"
      title="Stripe account"
      description="Stripe verifies who you are and, once payments go live, pays your sales out to your bank. You give your ID and bank details to Stripe; this site never stores them."
    >
      <div className="space-y-5">
        <FormMessage tone="warning">
          Selling runs in Stripe&rsquo;s test mode for now: give Stripe its test details, not real ones, and no money moves.
        </FormMessage>
        {!seller || !state ? (
          <>
            <p className="text-sm font-medium text-foreground">Not set up</p>
            <StartSelling hasAccount={false} label="Continue to Stripe" primary />
          </>
        ) : (
          <>
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                {seller.ready && <CheckCircle size={18} className="text-accent" aria-hidden />}
                {state.title}
              </p>
              <p className="text-pretty text-sm leading-relaxed text-muted">{state.detail}</p>
              <p className="text-xs text-faint">Account country: {countryName(seller.country)}</p>
            </div>
            {(state.action === "continue" || state.action === "reopen") && (
              <StartSelling hasAccount label="Continue on Stripe" primary={state.action === "continue"} />
            )}
            {state.action === "dashboard" && <StripeDashboardButton />}
          </>
        )}
      </div>
    </SettingsSection>
  );
}
