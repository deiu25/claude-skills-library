import { RULE_LABELS, type Finding } from "@/lib/skills/scan";

const SEVERITY_LABELS: Record<Finding["severity"], string> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };

interface FindingListProps {
  findings: Finding[];
  /** Makes each finding a button that shows its line in the editor. */
  onSelect?: (line: number) => void;
}

/** The scan's findings, in line order: what was found, where, and why it matters. */
export function FindingList({ findings, onSelect }: FindingListProps) {
  return (
    <ul className="divide-y divide-line">
      {findings.map((finding) => {
        const content = (
          <>
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className={`text-sm text-foreground ${finding.severity === "high" || finding.severity === "critical" ? "font-semibold" : "font-medium"}`}>
                {RULE_LABELS[finding.rule]}
              </span>
              <span className="text-xs tabular-nums text-faint">
                Line {finding.line} · {SEVERITY_LABELS[finding.severity]}
              </span>
            </span>
            <span className="mt-1 block text-pretty text-sm leading-relaxed text-muted">{finding.message}</span>
          </>
        );
        return (
          <li key={`${finding.rule}-${finding.line}-${finding.message}`}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(finding.line)}
                className="block w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-surface-raised"
              >
                <span className="sr-only">Go to line {finding.line}: </span>
                {content}
              </button>
            ) : (
              <div className="px-4 py-3">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
