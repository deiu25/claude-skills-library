import { formatDate, revealBidi } from "@/lib/community/format";
import type { OpenReport } from "@/lib/moderation/queries";
import { REASON_LABELS } from "@/lib/moderation/schemas";
import { ModerationForm } from "./ModerationForm";

const STATE: Record<NonNullable<OpenReport["target"]>["state"], string | null> = {
  shown: null,
  removed: "already removed",
  hidden: "no longer published",
  suspended: "its account is suspended",
};

/** One open report: what it names and why, the sender's words as text, and the decision form. */
export function ReportItem({ report }: { report: OpenReport }) {
  const { target } = report;
  const kind = report.targetType === "skill" ? "Skill" : "Profile";
  const state = target ? STATE[target.state] : "no longer exists";

  return (
    <article className="space-y-4">
      <header className="space-y-1">
        <h3 className="text-pretty text-sm font-medium text-foreground">{REASON_LABELS[report.reason]}</h3>
        <p className="text-pretty text-xs leading-relaxed text-faint">
          {kind}{" "}
          {target?.path && target.state === "shown" ? (
            <a href={target.path} className="break-all font-mono text-muted underline decoration-line underline-offset-4 hover:text-foreground">
              {target.name}
            </a>
          ) : (
            <span className="break-all font-mono text-muted">{target?.name}</span>
          )}
          {state && `, ${state}`}. Reported {formatDate(report.createdAt)} by {report.reporterEmail ?? "an account since deleted"}.
        </p>
      </header>
      {/* The sender's words, as text: bidirectional controls are written out, as on a skill's page. */}
      <p className="whitespace-pre-wrap break-words rounded-[8px] border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
        {revealBidi(report.details)}
      </p>
      <ModerationForm report={{ id: report.id, targetType: report.targetType }} />
    </article>
  );
}
