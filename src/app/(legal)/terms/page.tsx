import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR, SITE_REPO_URL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "Who runs the Claude Skills Library, what it offers, and the rules for using the site and an account.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">Terms of use</h1>
      <p className="text-sm text-faint">Last updated 23 October 2026</p>
      <p>
        These terms apply when you use the Claude Skills Library at {SITE_URL.replace("https://", "")}.
        How we handle personal data is in the <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Who runs the site</h2>
      <p>
        The Claude Skills Library is run by {OPERATOR.name} ({OPERATOR.brand}), a company registered in
        Romania:
      </p>
      <ul>
        <li>Registered office: {OPERATOR.locality}</li>
        <li>
          Trade register number: {OPERATOR.tradeRegister} (EUID {OPERATOR.euid})
        </li>
        <li>Tax identification number (CUI): {OPERATOR.cui}</li>
        <li>Share capital: {OPERATOR.shareCapital}</li>
        <li>
          Email: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
        </li>
        <li>
          Phone: <a href={`tel:${OPERATOR.phone.replaceAll(" ", "")}`}>{OPERATOR.phone}</a>
        </li>
      </ul>

      <h2>What the site offers</h2>
      <p>
        A free, hand-curated catalog of Claude Code skills, plugins and MCP servers made by other people:
        what each one does, when to use it and how to install it, with exports of the catalog for people
        and for agents. Account holders can also keep their own skills and publish them in Community, apart
        from the catalog. Browsing needs no account. Accounts are invite-only for now.
      </p>

      <h2>Skills made by others</h2>
      <ul>
        <li>
          Every entry describes software that other people make and publish. Its name, description and
          content belong to its authors, under their own licences.
        </li>
        <li>
          Skills in Community are published by account holders, not chosen by us, and nobody reviews them
          before they appear. An automated check flags some risky patterns in each version; it cannot show
          that a skill is safe.
        </li>
        <li>
          Install and update commands are copied from each project’s own documentation on the day the
          entry was written. Projects change after that, so check the source before you run a command.
        </li>
        <li>
          Skills, plugins and MCP servers run code and follow instructions on your computer, with the
          permissions you give Claude Code. You choose what to install and run.
        </li>
        <li>
          An entry is an editorial choice. It is not an endorsement, a security review or a guarantee of
          the software.
        </li>
      </ul>

      <h2>Accounts</h2>
      <ul>
        <li>Creating an account, with an email address or with GitHub, means you accept these terms.</li>
        <li>
          Keep your password, your GitHub account, your passkey devices and your backup codes secure. If you
          think someone else has used your account, sign out of your other sessions in your account settings
          and write to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
        </li>
        <li>
          We may suspend or close an account that breaks these terms or the law, or that puts the site or
          other people at risk, and we email you the reason and how to contest it. A suspended account
          cannot sign in, and the skills it published are hidden until we lift the suspension.
        </li>
        <li>An account whose email address is not confirmed within 7 days of sign-up is deleted.</li>
        <li>
          When you change your username or delete your account, the old username stays reserved for 90
          days. In that time only your account can take it back, so its old addresses never lead to someone
          else.
        </li>
        <li>You can stop using your account at any time, and delete it yourself in your account settings.</li>
      </ul>

      <h2>Publishing a skill</h2>
      <ul>
        <li>
          Your skills are private until you publish one, as unlisted or public. You keep every right you have
          in it. While it is published, you give us a free, worldwide, non-exclusive licence to store, copy,
          show and distribute it on this site: on its page, as a download, in Community and on your profile.
          The licence ends when you make the skill private or delete it.
        </li>
        <li>
          A skill keeps the licence its files give it, if any. We give no one any right in it beyond
          downloading it from this site.
        </li>
        <li>
          Publish only what you have the right to publish, and describe truthfully what it does. A published
          skill must not contain malware, harm a computer in ways its description does not disclose, hide
          instructions from the people who read it, carry anyone’s secrets, credentials or personal data,
          infringe anyone’s rights, or break the law.
        </li>
        <li>
          An automated security check runs on every saved version. A version with a critical finding cannot
          be published, and saving one makes a published skill private again. The check is not a review:
          passing it does not make a skill safe or lawful.
        </li>
        <li>
          We may remove a skill that breaks these terms or the law: its page and its download go, and its
          author can no longer publish it. We email its author the reason and how to contest it. How to
          report a skill is under “Reports and moderation”.
        </li>
      </ul>

      <h2>Reports and moderation</h2>
      <p>Anyone can tell us about a skill or a profile that breaks these terms or the law:</p>
      <ul>
        <li>Signed in, use “Report this skill” on a skill’s page, or “Report this profile” on a profile.</li>
        <li>
          Without an account, write to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a> with the
          page’s address, what is wrong with it and why, your name and email address, and a statement that
          your report is accurate and complete to the best of your knowledge.
        </li>
      </ul>
      <p>What happens next:</p>
      <ul>
        <li>We confirm every report by email. A person reviews each one; no automated system decides it.</li>
        <li>
          If the skill or profile breaks these terms or the law, we remove the skill or suspend the account,
          everywhere and with no end date. Its author gets an email saying what we did, why, under which
          rule or law, whether it followed a report, and how to contest it. We never tell them who reported it.
        </li>
        <li>Whoever reported gets our decision by email, whether we acted or not.</li>
        <li>
          To contest a decision, write to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a> and say
          why, and we review it again. You can also take the matter to the courts (see “Law and disputes”).
        </li>
        <li>
          Separately, the automated check described under “Publishing a skill” blocks publishing a version
          with a critical finding. It does not decide reports.
        </li>
      </ul>

      <h2>Contact point</h2>
      <p>
        Our single point of contact under the EU Digital Services Act (Regulation (EU) 2022/2065, art. 11 and
        12), for people who use the site, for the authorities of the Member States, for the European
        Commission and for the European Board for Digital Services, is{" "}
        <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>. Write to us in English or Romanian.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not attack or overload the site, test its security without our written permission, or try to
        reach accounts or data that are not yours. Reading the catalog automatically is welcome through{" "}
        <a href="/skills.json">/skills.json</a>, <a href="/llms.txt">/llms.txt</a> and{" "}
        <a href="/install-all.txt">/install-all.txt</a>.
      </p>

      <h2>Licences</h2>
      <p>
        The site’s source code, catalog entries included, is published under the MIT licence on{" "}
        <a href={SITE_REPO_URL}>GitHub</a>. The skills themselves keep their own authors’ licences.
      </p>

      <h2>Liability</h2>
      <ul>
        <li>
          The site is free and provided as it is. We work to keep entries accurate and the site available,
          but we cannot promise either at every moment.
        </li>
        <li>
          We are not responsible for software made by others that you install from a link, command or
          download found here, or for what it does on your computer.
        </li>
        <li>
          Nothing in these terms limits liability that the law does not allow us to limit, such as for harm
          caused on purpose or through gross negligence, or for death or personal injury, and nothing takes
          away your rights as a consumer.
        </li>
      </ul>

      <h2>Changes to these terms</h2>
      <p>
        We may change these terms as the site changes, and the date at the top shows the current version.
        If a change affects account holders, we email them at least two weeks before it applies, and you
        can close your account if you do not agree.
      </p>

      <h2>Law and disputes</h2>
      <p>
        Romanian law applies. A dispute with a business goes to the competent courts for our registered
        office in Prahova county. If you use the site as a consumer, you keep the protection of the
        mandatory rules of the country where you live, and you can also take a dispute to the courts there.
      </p>
    </>
  );
}
