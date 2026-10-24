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
      <p className="text-sm text-faint">Last updated 24 October 2026</p>
      <p>
        This page says what the Claude Skills Library does with personal data. In short: browsing sets
        no cookies and tracks nothing, and an account keeps only what this page lists and shows other
        people only what you publish.
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
        <li>
          Downloading a skill that someone published, without an account, sends Upstash a keyed hash of
          your IP address (for an IPv6 address, of the network it belongs to), which Upstash cannot turn
          back into the address, and a count of your recent downloads. It is used only to slow down repeated downloads, which is our legitimate interest in
          keeping the service available (art. 6(1)(f)), and it expires on its own no more than two days and
          one second after your last download.
        </li>
      </ul>

      <h2>Your account</h2>
      <p>Accounts are invite-only for now, and browsing never needs one.</p>

      <h3>What we keep</h3>
      <ul>
        <li>
          <strong>Your profile:</strong> your name, your email address, whether you have confirmed it,
          when the account was created and last changed, and the username and one-line bio you set, if
          any. Your name and email address are never shown to other people; your username and bio are
          once you publish a skill (see “What you publish”).
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
          <strong>Your skills,</strong> if you write or upload any: the latest 20 saved versions of each
          skill, each with its SKILL.md and its files, the category and tags you choose, who can see it,
          and the security check that ran on each version. A skill is private, so only you can open or
          download it, until you publish it.
        </li>
        <li>
          <strong>Selling,</strong> if you set it up: the id of the Stripe account we open for you, the
          country you choose for it, whether Stripe has accepted it, when you set it up and when that last
          changed, and the price you give each skill. Selling runs in Stripe’s test mode for now, so no money
          moves.
        </li>
        <li>
          <strong>Skill saves, downloads, reports and selling:</strong> your account’s id and a count of your
          recent saves (price changes included), skill downloads, reports and requests to Stripe about your
          seller account, used only to slow down repeated ones.
        </li>
        <li>
          <strong>Email links:</strong> the links that finish a new account, reset your password, change
          your email address or delete your account. The links to finish an account, reset a password or
          delete an account are stored only as a hash; the links for an email change are not stored.
        </li>
        <li>
          <strong>Reports you send:</strong> the skill or profile you report, the reason you choose, what you
          write about it, your account, and what we decided and when. We never tell the account you report
          who reported it.
        </li>
        <li>
          <strong>If we act on your skill or account:</strong> the reason we gave for removing a skill, and
          whether your account is suspended and why.
        </li>
        <li>
          <strong>Reports about your skills or profile:</strong> what the person who reported them chose and
          wrote, and what we decided. They come from other people.
        </li>
        <li>
          <strong>Old usernames:</strong> when you change your username, the old one stays reserved for
          your account. When you delete your account, its username, and up to two earlier ones still reserved
          for it, stay reserved, no longer tied to any account. Nobody else can take a username while it is
          reserved.
        </li>
      </ul>

      <h3>What you publish</h3>
      <p>
        You can publish a skill as unlisted or public, and make it private again or delete it at any time.
        Until sign-up opens to everyone, nothing you publish is shown to anyone. After that, a published
        skill’s page shows anyone, with or without an account:
      </p>
      <ul>
        <li>
          its name, description, category and tags, its latest SKILL.md and the names and sizes of its
          files, what the security check found in that version, its version number and when it last
          changed, and a download of the skill with its files;
        </li>
        <li>your username, as its author.</li>
      </ul>
      <p>
        A public skill is also listed in Community and in the sitemap we give search engines, and your
        profile page shows your username, your bio and your public skills. An unlisted skill appears only at
        its own address, and the page asks search engines not to index it. A skill you make private or
        delete, or that we remove or hide with a suspended account, normally leaves its page the next time
        the page is opened, and within an hour at the latest, and its download stops at once. Copies that others made while it was
        published, such as a download or a search engine’s cached page, are out of our reach.
      </p>

      <h3>Why, and on what legal basis</h3>
      <ul>
        <li>
          To create your account, sign you in the ways you choose, keep the skills you write or upload, show
          the ones you publish, and send the emails an account needs:
          finishing your account, resetting your password, confirming a change of address or a deletion,
          telling you when a passkey is added, and telling you when someone tries to register your address
          again. This is the service you asked
          for (performance of a contract, GDPR art. 6(1)(b)).
        </li>
        <li>
          To let you set up selling and price your skills, if you choose to: opening your Stripe account,
          sending you to Stripe to finish it, showing you where it stands, keeping your prices, and asking
          Stripe to close it when you delete your account. This is the service you asked for (art. 6(1)(b)).
        </li>
        <li>
          To receive reports, decide them, act on what we find ourselves, tell whoever reported what we
          decided, tell whoever is affected what we decided and why, and keep a record of reports and
          decisions. Receiving and answering reports of illegal content, and the reasons we send with every
          removal or suspension, whether for illegal content or for a breach of the terms, are legal
          obligations under the EU Digital Services Act (Regulation (EU) 2022/2065, art. 16 and 17; GDPR art.
          6(1)(c)). Receiving, deciding and answering reports of other breaches of the terms, acting on our
          own review, and keeping the record are our legitimate interest in a safe service (art. 6(1)(f)), and you can object to
          them.
        </li>
        <li>
          To keep a username from passing to someone else while links to its pages are still around, through
          the reserved old usernames. This is our legitimate interest in preventing impersonation (art.
          6(1)(f)), and you can object to it.
        </li>
        <li>
          To protect accounts from takeover and abuse, through the IP address and user agent on your
          sessions, the sign-in attempt counters, the count of wrong two-factor codes and the record of
          skill saves, downloads, reports and requests to Stripe. This is our
          legitimate interest in keeping accounts
          secure and the service available (art. 6(1)(f)), and you can object to it.
        </li>
        <li>
          To find out why a change failed against the real database, on a copy of it, so that the fix does
          not break your account or lose your skills. We test changes before they go live on a database of
          made-up accounts, never on a copy of yours. This is our legitimate interest in a working service
          (art. 6(1)(f)), and you can object to it.
        </li>
        <li>
          Nothing about you is used for advertising, sold, or used to make automated decisions about you.
          The security check reads a skill’s files, not you: it stops a version with a critical finding
          from being published, and you can fix the file and publish again.
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
          and we delete it within one month. An account whose email address is not confirmed within 7 days
          of sign-up is deleted then, within a day.
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
          Selling: a skill’s price until you remove it, delete the skill, or we remove the skill, and the
          record of your Stripe account until you delete your account. Deleting your account also asks
          Stripe to close your Stripe account. Stripe keeps the closed account’s record, with the email
          address, name and account id we sent and what it collected itself, as its own privacy policy and
          the law require.
        </li>
        <li>
          Sign-in attempt counters: deleted once a counter has gone unused for a day. The record of skill
          saves, downloads, reports and requests to Stripe expires on its own no more than two days and one
          second after your last one.
        </li>
        <li>
          Reports: until a year after we decide them, then deleted within a day; a report we have not
          decided yet stays until we do. A report stays if the skill or account it names is deleted, and if
          you delete your account, it stays without the link to your account.
        </li>
        <li>
          The reason for removing a skill: until the skill is deleted. A suspension and its reason: until we
          lift it, or the account is deleted.
        </li>
        <li>
          An old username: reserved for 90 days, or until your account gives up three newer ones, then deleted
          within a day.
        </li>
        <li>
          Copies: our email provider keeps each email it sends for 30 days, and our database provider keeps
          a 6-hour restore history, so deleted data leaves its backups within 6 hours. Only when we need to
          find out why a change failed against the real database does our database provider make a full
          copy of it. Data changed or deleted after the copy is made, a deleted account included, stays in
          the copy as it was until we delete the copy, within a day after the fix goes live or is dropped.
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
          holds accounts, their skills and the files uploaded with them, provided through the Vercel
          Marketplace.
        </li>
        <li>
          <strong>Resend</strong> (United States): sends account emails. Resend also keeps data on how its
          own service is used, as a controller in its own right.
        </li>
        <li>
          <strong>Upstash, Inc.</strong> (United States): keeps the record of skill saves, downloads,
          reports and requests to Stripe, by account, or by a keyed hash of the IP address for a download
          without an account, provided through the Vercel Marketplace.
        </li>
        <li>
          <strong>GitHub, Inc.</strong> (United States), only if you sign in with GitHub. GitHub shares
          your profile with us when you allow it, and its own privacy statement covers what GitHub does.
        </li>
        <li>
          <strong>Stripe Payments Europe, Limited</strong> (Ireland), our payment provider, only if you set up
          selling. To open your Stripe account we send Stripe your email address, your name, the country you
          choose and your account’s id. On Stripe’s own pages you then give Stripe what it asks for to verify
          you and to pay you, such as your identity and your bank account. This site never stores those
          details, though Stripe may share some of them with us, as the agreement you accept there allows.
          Stripe uses them as a controller in its own right, under that agreement, the Stripe Connected
          Account Agreement, and Stripe’s privacy policy. From Stripe we keep only your Stripe account’s id
          and whether Stripe has accepted it; we also read where your account stands, to show it to you.
        </li>
      </ul>
      <p>
        Vercel, Neon, Resend and Upstash process data in the United States. These transfers rely on the
        European Commission’s Standard Contractual Clauses in each provider’s data processing terms, and
        on the EU–US Data Privacy Framework where the provider is certified under it. Stripe also transfers
        data outside the EEA, including to the United States and India, relying on the Standard Contractual
        Clauses and, for Stripe, LLC in the United States, on the Data Privacy Framework.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us for a copy of your data, to correct it, to delete it, to restrict its use, or to
        receive it in a portable format, and you can object to processing based on our legitimate
        interest. Write to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>; we answer within
        one month. Signed in, you can also download a copy of what your account holds and delete your account yourself,
        in your account settings; a suspended account cannot sign in, so it writes to us instead. For every
        saved version of a skill, the copy gives the address where it downloads as a zip with its files;
        the skill&rsquo;s pages have the same downloads. A suspended account, which cannot sign in to use
        those addresses, gets the zips with its copy.
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
