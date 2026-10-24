import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { SkillPrice } from "@/components/market/SkillPrice";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { isSignUpOpen } from "@/lib/auth/allowlist";
import { requireUser } from "@/lib/auth/session";
import { listingPath } from "@/lib/community/links";
import { formatRelativeDate } from "@/lib/github";
import { sellerState } from "@/lib/market/queries";
import { formatPrice, PRICE_MAX_CENTS, PRICE_MIN_CENTS, priceInputValue } from "@/lib/market/schemas";
import { SITE_URL } from "@/lib/site";
import { visibilityProblem } from "@/lib/skills/access";
import { getOwnedSkill } from "@/lib/skills/queries";
import { VERSIONS_KEPT } from "@/lib/skills/schemas";
import { isSellingAvailable } from "@/lib/stripe";
import { DeleteSkill } from "./DeleteSkill";
import { RiskBadge } from "./RiskBadge";
import { SkillEditor } from "./SkillEditor";
import { SkillVisibility } from "./SkillVisibility";

const ago = (date: Date) => formatRelativeDate(date.toISOString());

/** One of the user's skills: its editor, who can see it, its versions and its deletion. Others get a 404. */
export async function SkillWorkspace({ skillId }: { skillId: string }) {
  const skill = await getOwnedSkill(skillId);
  const [latest] = skill.versions;
  const blocked = visibilityProblem("public", { status: skill.status, version: latest.version, risk: latest.risk, username: skill.username });
  const selling = isSellingAvailable();
  const seller = selling ? await sellerState((await requireUser()).id) : "none";

  return (
    <>
      <div className="space-y-3">
        <Link href="/dashboard/skills" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={14} aria-hidden />
          Your skills
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0 space-y-3">
            <h1 className="break-all font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{skill.name}</h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
              <span>
                Version {latest.version}, saved {ago(latest.createdAt)}
              </span>
              <RiskBadge risk={latest.risk} />
            </p>
          </div>
          {/* download: a failed request stays a failed download instead of replacing the editor and its unsaved text. */}
          <a href={`/api/skills/${skill.id}/download`} download className="btn btn-ghost text-sm">
            <DownloadSimple size={16} aria-hidden />
            Download .zip
          </a>
        </div>
      </div>

      <div className="mt-10">
        <SkillEditor
          skillId={skill.id}
          initial={{
            skillMd: skill.skillMd,
            category: skill.category,
            tags: skill.tags.join(", "),
            files: skill.files,
            fileFindings: skill.findings.filter((finding) => finding.path),
          }}
        />
      </div>

      <div className="mt-14 divide-y divide-line border-t border-line">
        <SettingsSection
          id="visibility"
          title="Visibility"
          description="Who can open and download the skill. Publishing needs a username, and a latest version without a critical finding."
        >
          <SkillVisibility
            skillId={skill.id}
            visibility={skill.visibility}
            status={skill.status}
            removalReason={skill.removalReason}
            address={skill.username ? `${SITE_URL.replace("https://", "")}${listingPath(skill.username, skill.slug)}` : null}
            blocked={blocked}
            communityOpen={isSignUpOpen()}
          />
        </SettingsSection>
        {selling && (
          <SettingsSection
            id="pricing"
            title="Price"
            description="What a buyer pays for the skill, in euros. Checkout is not open yet, so nobody can buy it so far."
          >
            {skill.status === "removed" ? (
              <p className="text-pretty text-sm leading-relaxed text-muted">A removed skill cannot be sold.</p>
            ) : seller === "ready" ? (
              <SkillPrice
                skillId={skill.id}
                price={skill.priceCents === null ? null : formatPrice(skill.priceCents)}
                inputValue={skill.priceCents === null ? "" : priceInputValue(skill.priceCents)}
                hint={`From ${formatPrice(PRICE_MIN_CENTS)} to ${formatPrice(PRICE_MAX_CENTS)}, such as 9 or 9.99.`}
              />
            ) : (
              <div className="space-y-4">
                <p className="text-pretty text-sm leading-relaxed text-muted">
                  {seller === "none"
                    ? "Set up selling first, so that Stripe can pay you for the skill."
                    : "You can price it once Stripe has accepted your account. Sales shows where it stands."}
                </p>
                <Link href="/dashboard/sales" className="btn btn-ghost text-sm">
                  {seller === "none" ? "Set up selling" : "Open Sales"}
                </Link>
              </div>
            )}
          </SettingsSection>
        )}
        <SettingsSection
          id="versions"
          title="Versions"
          description={`The latest ${VERSIONS_KEPT} saves that changed SKILL.md or the files, each with the scan it got then.`}
        >
          <ul className="divide-y divide-line rounded-[8px] border border-line bg-surface">
            {skill.versions.map((version, index) => (
              <li key={version.version}>
                <Link
                  href={`/dashboard/skills/${skill.id}/versions/${version.version}`}
                  className="flex min-h-11 items-center justify-between gap-4 py-2.5 pl-4 pr-3 transition-colors hover:bg-surface-raised"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      Version {version.version}
                      {index === 0 && <span className="ml-2 text-xs font-normal text-accent-strong">Current</span>}
                    </span>
                    <span className="block text-xs text-faint">
                      saved {ago(version.createdAt)}, {version.findingCount === 1 ? "1 finding" : `${version.findingCount} findings`}
                    </span>
                  </span>
                  <RiskBadge risk={version.risk} />
                </Link>
              </li>
            ))}
          </ul>
        </SettingsSection>
        <SettingsSection id="delete" title="Delete skill" description="Removes the skill and every version, for good.">
          <DeleteSkill skillId={skill.id} name={skill.name} versionCount={skill.versions.length} />
        </SettingsSection>
      </div>
    </>
  );
}
