import type { Metadata } from "next";
import Link from "next/link";
import { SELLER_COUNTRIES } from "@/lib/market/countries";
import { formatPrice, PRICE_MAX_CENTS, PRICE_MIN_CENTS } from "@/lib/market/schemas";
import { OPERATOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "Marketplace terms (draft)",
  description: "The draft rules for selling skills on the Claude Skills Library, while selling runs in test mode.",
  // A draft that binds no sale: it is linked from the terms, not offered to search engines.
  robots: { index: false },
};

export default function MarketplaceTermsPage() {
  return (
    <>
      <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">Marketplace terms (draft)</h1>
      <p className="text-sm text-faint">Draft of 24 October 2026</p>
      <p>
        <strong>This is a draft.</strong> Selling runs in Stripe&rsquo;s test mode: nobody can buy a skill yet, and no
        money moves. These pages say how selling is meant to work, so that you can try it. Before real payments start we
        will publish the final marketplace terms, with the platform fee, taxes, refunds and what a buyer may do with a
        skill they bought, and email every account that set up selling at least two weeks before they apply. Until
        then, the <Link href="/terms">terms of use</Link> apply to everything you do here, selling included.
      </p>

      <h2>Who can sell</h2>
      <ul>
        <li>
          Any account holder can set up selling on the Sales page of their dashboard. You choose the country you or your
          business are based in, then open an account with Stripe, our payment provider, on Stripe&rsquo;s own pages.
        </li>
        <li>
          You can sell if you or your business are based in one of these countries, where Stripe opens seller accounts
          for a platform in Romania, where we are based: {SELLER_COUNTRIES.map(([, name]) => name).join(", ")}.
        </li>
        <li>
          Opening the account means you accept the{" "}
          <a href="https://stripe.com/legal/connect-account">Stripe Connected Account Agreement</a>, a contract between
          you and Stripe. Stripe decides what it needs to verify you, and whether to open, restrict or close your
          account. We cannot change its decisions.
        </li>
        <li>
          You can price your skills once Stripe can pay you. Your dashboard shows where your Stripe account stands, and
          links to your Stripe dashboard, where you see your payouts and change your details.
        </li>
      </ul>

      <h2>Prices</h2>
      <ul>
        <li>
          You set a price for each skill, in euros, from {formatPrice(PRICE_MIN_CENTS)} to {formatPrice(PRICE_MAX_CENTS)}.
          A skill without a price is free. You can change a price or make the skill free again at any time.
        </li>
        <li>
          While selling runs in test mode, a price is only stored with your skill and shown to you: it does not change
          who can download the skill.
        </li>
      </ul>

      <h2>How a sale is meant to work</h2>
      <p>None of this happens yet. When payments go live:</p>
      <ul>
        <li>
          A buyer pays us for your skill through Stripe&rsquo;s checkout, and we send the price to your Stripe account,
          less our fee. Stripe then pays it out to your bank account on its own schedule.
        </li>
        <li>
          Our fee, and how VAT applies to a sale, are not set yet. We will publish both before payments go live; nothing
          is charged before then.
        </li>
        <li>Paying taxes on what you earn from your sales is your responsibility.</li>
      </ul>

      <h2>Your skills</h2>
      <ul>
        <li>
          Everything the terms of use say about publishing a skill applies to a skill you sell: publish only what you
          have the right to publish, describe truthfully what it does, and keep within the rules under &ldquo;Publishing
          a skill&rdquo;.
        </li>
        <li>
          A skill is plain text and files that a buyer downloads. Once downloaded, it can be copied: nothing technical
          can stop that. Sell a skill only if you accept it.
        </li>
        <li>
          We may remove a skill or suspend an account that breaks the terms of use or the law, as those terms describe,
          and a removed skill cannot be sold.
        </li>
      </ul>

      <h2>Stopping</h2>
      <ul>
        <li>You can stop selling a skill by making it free again.</li>
        <li>Deleting your account deletes your skills and closes your Stripe account with us.</li>
      </ul>

      <h2>Questions</h2>
      <p>
        Write to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>. The{" "}
        <Link href="/privacy">privacy policy</Link> says what selling means for your data.
      </p>
    </>
  );
}
