import type { Metadata } from "next";
import { LiftSuspension } from "@/components/moderation/LiftSuspension";
import { ModerationForm } from "@/components/moderation/ModerationForm";
import { ReportItem } from "@/components/moderation/ReportItem";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getOpenReports, getSuspendedAccounts, requireAdmin } from "@/lib/moderation/queries";

export const metadata: Metadata = {
  title: "Moderation",
  robots: { index: false },
};

const EMPTY = "rounded-[8px] border border-line bg-surface px-4 py-3 text-sm text-muted";
const ROW_LINK =
  "inline-flex min-h-11 shrink-0 items-center rounded-[8px] px-3 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground";

/** Reports and decisions, for the ids in ADMIN_USER_IDS. Anyone else gets a 404. */
export default async function AdminPage() {
  await requireAdmin();
  const [reports, suspended] = await Promise.all([getOpenReports(), getSuspendedAccounts()]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">Moderation</h1>
          <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-muted sm:text-base">
            Reports from people who use the site, and what you decide about them. A decision emails its reason to the
            account it affects, and the outcome to whoever reported it.
          </p>
        </div>

        <div className="mt-10 divide-y divide-line border-t border-line">
          <SettingsSection
            id="reports"
            title="Reports"
            description={reports.length === 1 ? "1 open report, oldest first." : `${reports.length} open reports, oldest first.`}
          >
            {reports.length ? (
              <ul className="divide-y divide-line">
                {reports.map((report) => (
                  <li key={report.id} className="py-8 first:pt-0 last:pb-0">
                    <ReportItem report={report} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={EMPTY}>No open reports.</p>
            )}
          </SettingsSection>
          <SettingsSection id="take-down" title="Take down" description="Remove a skill or suspend an account on your own review, without a report.">
            <ModerationForm />
          </SettingsSection>
          <SettingsSection
            id="suspended"
            title="Suspended accounts"
            description="They cannot sign in, and their published skills stay hidden until you lift the suspension."
          >
            {suspended.length ? (
              <ul className="divide-y divide-line rounded-[8px] border border-line bg-surface">
                {suspended.map((account) => (
                  <li key={account.id} className="flex items-start justify-between gap-4 py-2 pl-4 pr-2">
                    <div className="min-w-0 py-1">
                      <p className="truncate font-mono text-sm font-medium text-foreground">{account.handle ?? account.email}</p>
                      {account.handle && <p className="truncate text-xs text-faint">{account.email}</p>}
                      {account.reason && <p className="mt-1 text-pretty text-xs leading-relaxed text-muted">{account.reason}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end sm:flex-row sm:items-start">
                      {/* An <a>, not <Link>: a prefetch would download the export. */}
                      <a
                        href={`/api/admin/export/${encodeURIComponent(account.id)}`}
                        aria-label={`Download the data of ${account.handle ?? account.email}`}
                        className={ROW_LINK}
                      >
                        Download its data
                      </a>
                      <LiftSuspension userId={account.id} name={account.handle ?? account.email} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={EMPTY}>No suspended accounts.</p>
            )}
          </SettingsSection>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
