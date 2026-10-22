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
      <p className="text-sm text-faint">Last updated 22 October 2026</p>
      <p>
        This page says what the Claude Skills Library does with personal data. In short: browsing sets
        no cookies and tracks nothing, and an account keeps only what it needs to sign you in safely and
        the skills you write.
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
          when the account was created and last changed, and the username and one-line bio you set, if
          any. None of it is shown to other people yet.
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
          <strong>Two-factor authentication,</strong> if you turn it on: the key your authenticator app
          shares with us and your backup codes, both encrypted, and a count of wrong codes, which pauses the
          check for 15 minutes after 10 in a row.
        </li>
        <li>
          <strong>Your passkeys,</strong> if you add any: each one’s public key and identifier, the name you
          give it, when you added it, whether it syncs between your devices, and which kind of authenticator
          made it. The private key never leaves your device.
        </li>
        <li>
          <strong>Your sessions:</strong> for each browser you sign in on, a random session token, its
          expiry, the IP address and the browser’s user agent. The token sits in one cookie, which keeps
          you signed in. A few steps set a second cookie that expires within 10 minutes: a GitHub sign-in,
          to check that the sign-in you return from is the one you started, a sign-in that asks for your
          two-factor code, and signing in with or adding a passkey.
        </li>
        <li>
          <strong>Sign-in attempts:</strong> a counter per IP address and sign-in endpoint, used only to
          slow down repeated attempts.
        </li>
        <li>
          <strong>Your skills,</strong> if you write any: the latest 20 saved versions of each SKILL.md, the
          category and tags you choose, and the security check that ran on each version. They are private:
          only you can open them.
        </li>
        <li>
          <strong>Skill saves:</strong> your account’s id and a count of your recent saves, used only to slow
          down repeated saves.
        </li>
        <li>
          <strong>Email links:</strong> the links that finish a new account, reset your password, change
          your email address or delete your account. The links to finish an account, reset a password or
          delete an account are stored only as a hash; the links for an email change are not stored.
        </li>
      </ul>

      <h3>Why, and on what legal basis</h3>
      <ul>
        <li>
          To create your account, sign you in the ways you choose, keep the skills you write, and send the
          emails an account needs:
          finishing your account, resetting your password, confirming a change of address or a deletion,
          telling you when a passkey is added, and telling you when someone tries to register your address
          again. This is the service you asked
          for (performance of a contract, GDPR art. 6(1)(b)).
        </li>
        <li>
          To protect accounts from takeover and abuse, through the IP address and user agent on your
          sessions, the sign-in attempt counters, the count of wrong two-factor codes and the record of
          skill saves. This is our
          legitimate interest in keeping accounts
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
          Your profile and sign-in methods (password hash, GitHub link, two-factor settings, passkeys):
          until your account is deleted. You can delete it yourself in your account settings, or email us
          and we delete it within one month.
        </li>
        <li>
          A session: deleted when you sign out, or sign it out from your account settings. A session you
          never sign out of stops working after 7 days without use, and is deleted within a day after that.
        </li>
        <li>
          Email links stop working after one hour, and a link to delete your account after 24 hours. Stored
          links are deleted within a day after that, and with your account.
        </li>
        <li>
          Your skills: until you delete them, or your account, which deletes them with it. A version is
          deleted when a newer save leaves it outside the latest 20.
        </li>
        <li>
          Sign-in attempt counters: deleted once a counter has gone unused for a day. The record of skill
          saves expires on its own within two days.
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
          <strong>Upstash, Inc.</strong> (United States): keeps the record of skill saves, provided through
          the Vercel Marketplace.
        </li>
        <li>
          <strong>GitHub, Inc.</strong> (United States), only if you sign in with GitHub. GitHub shares
          your profile with us when you allow it, and its own privacy statement covers what GitHub does.
        </li>
      </ul>
      <p>
        Vercel, Neon, Resend and Upstash process data in the United States. These transfers rely on the
        European Commission’s Standard Contractual Clauses in each provider’s data processing terms, and
        on the EU–US Data Privacy Framework where the provider is certified under it.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us for a copy of your data, to correct it, to delete it, to restrict its use, or to
        receive it in a portable format, and you can object to processing based on our legitimate
        interest. Write to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>; we answer within
        one month. Signed in, you can also download a copy of your data and delete your account yourself,
        in your account settings.
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
