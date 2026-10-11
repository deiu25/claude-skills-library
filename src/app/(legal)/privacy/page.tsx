import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What the Claude Skills Library does with personal data: no cookies or tracking for visitors, and what an account keeps, why and for how long.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">Privacy policy</h1>
      <p className="text-sm text-faint">Last updated 11 October 2026</p>
      <p>
        This page says what the Claude Skills Library does with personal data. In short: browsing sets
        no cookies and tracks nothing, and an account keeps only what it needs to sign you in safely.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {OPERATOR.name} runs this site and decides what happens to the data described here: it is the
        controller. It is registered in Romania with CUI {OPERATOR.cui} and trade register number{" "}
        {OPERATOR.tradeRegister}, in {OPERATOR.locality}. For anything on this page, including the
        requests under “Your rights”, write to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
      </p>

      <h2>Browsing the site</h2>
      <ul>
        <li>No cookies, analytics, advertising or tracking. Every visitor gets the same prebuilt pages.</li>
        <li>
          Your browser keeps two notes in its own storage, and they never leave it: your choice of light
          or dark theme, and, once you have signed in, a note that you have, so the header knows to load
          your account menu. Clearing this site’s data in your browser removes both.
        </li>
        <li>
          Fonts and icons are served from this site, and GitHub statistics are fetched by our servers
          ahead of time, so viewing a page sends nothing to anyone but our hosting provider.
        </li>
        <li>
          Like any web server, our hosting provider receives your IP address and the address of the page
          you ask for. It needs them to deliver pages and protect the service, which is our legitimate
          interest (GDPR art. 6(1)(f)). The request logs we can see are kept for one hour.
        </li>
      </ul>

      <h2>Your account</h2>
      <p>Accounts are invite-only for now, and browsing never needs one.</p>

      <h3>What we keep</h3>
      <ul>
        <li>
          <strong>Your profile:</strong> your name, your email address, whether you have confirmed it,
          and when the account was created and last changed.
        </li>
        <li>
          <strong>Your password,</strong> if you set one, only as a one-way hash, never the password itself.
        </li>
        <li>
          <strong>Your GitHub link,</strong> if you sign in with GitHub: your GitHub account number, the
          access token GitHub issues, stored encrypted, and the name, email address and profile picture
          address GitHub shares. We use them only to sign you in, and never act on GitHub for you.
        </li>
        <li>
          <strong>Your sessions:</strong> for each browser you sign in on, a random session token, its
          expiry, the IP address and the browser’s user agent. The token sits in one cookie, which keeps
          you signed in. During a GitHub sign-in, a second, short-lived cookie checks that the sign-in you
          return from is the one you started.
        </li>
        <li>
          <strong>Sign-in attempts:</strong> a counter per IP address and sign-in endpoint, used only to
          slow down repeated attempts.
        </li>
        <li>
          <strong>Email links:</strong> the links that confirm your address or reset your password. A
          reset link is stored only as a hash.
        </li>
      </ul>

      <h3>Why, and on what legal basis</h3>
      <ul>
        <li>
          To create your account, sign you in, and send the emails an account needs: confirming your
          address, resetting your password, and telling you when someone tries to register it again. This
          is the service you asked for (performance of a contract, GDPR art. 6(1)(b)).
        </li>
        <li>
          To protect accounts from takeover and abuse, through the IP address and user agent on your
          sessions and the sign-in attempt counters. This is our legitimate interest in keeping accounts
          secure (art. 6(1)(f)), and you can object to it.
        </li>
        <li>
          Nothing about you is used for advertising, sold, or used to make automated decisions about you.
        </li>
        <li>
          An account needs a name and an email address, or a GitHub account. Without an account you can
          still use the whole catalog.
        </li>
      </ul>

      <h3>How long we keep it</h3>
      <ul>
        <li>
          Your profile, password hash and GitHub link: until your account is deleted. Deleting it yourself
          is coming; until then, email us and we delete it within one month.
        </li>
        <li>
          A session: deleted when you sign out. A session you never sign out of stops working after 7 days
          without use, and its record stays until the account is deleted.
        </li>
        <li>Email links stop working after one hour.</li>
        <li>
          Sign-in attempt counters: the next attempt from the same address and endpoint overwrites its
          counter. Old counters are not yet deleted automatically; until a cleanup ships, they are used for
          nothing else.
        </li>
        <li>
          Copies: our email provider keeps each email it sends for 30 days, and our database provider keeps
          a 6-hour restore history, so deleted data leaves its backups within 6 hours.
        </li>
      </ul>

      <h2>Who else handles the data</h2>
      <p>These companies run parts of the site for us, under their data processing terms:</p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> (United States): hosting. Pages are served from its network, and the
          code behind accounts runs in the United States.
        </li>
        <li>
          <strong>Neon</strong> (United States, Amazon Web Services region us-east-1): the database that
          holds accounts, provided through the Vercel Marketplace.
        </li>
        <li>
          <strong>Resend</strong> (United States): sends account emails. Resend also keeps data on how its
          own service is used, as a controller in its own right.
        </li>
        <li>
          <strong>GitHub, Inc.</strong> (United States), only if you sign in with GitHub. GitHub shares
          your profile with us when you allow it, and its own privacy statement covers what GitHub does.
        </li>
      </ul>
      <p>
        Vercel, Neon and Resend process data in the United States. These transfers rely on the European
        Commission’s Standard Contractual Clauses in each provider’s data processing terms, and on the
        EU–US Data Privacy Framework where the provider is certified under it.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us for a copy of your data, to correct it, to delete it, to restrict its use, or to
        receive it in a portable format, and you can object to processing based on our legitimate
        interest. Write to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>; we answer within
        one month.
      </p>
      <p>
        If you think we handle your data unlawfully, you can complain to the Romanian data protection
        authority, ANSPDCP, at B-dul G-ral. Gheorghe Magheru 28–30, Sector 1, 010336 Bucharest (
        <a href="https://www.dataprotection.ro">dataprotection.ro</a>), or to the authority where you live.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        When what the site does with data changes, this page changes with it, and the date at the top
        shows when. If a change affects account holders, we email them before it applies. The{" "}
        <Link href="/terms">terms of use</Link> cover the rest of the rules for using the site.
      </p>
    </>
  );
}
