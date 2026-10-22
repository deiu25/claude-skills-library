import type { Icon } from "@phosphor-icons/react";
import { CheckCircle, Info, Warning, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import type { Risk } from "@/lib/skills/scan";

// One accent only: emerald marks a scan with nothing to flag, and the levels above it climb in
// weight, border and fill, up to inverted for critical. The label always names the level.
const LEVELS: Record<Risk, { label: string; className: string; Icon: Icon; fill?: boolean }> = {
  none: { label: "No findings", className: "border-accent/40 bg-accent-soft text-accent-strong", Icon: CheckCircle },
  low: { label: "Low risk", className: "border-line bg-surface text-muted", Icon: Info },
  medium: { label: "Medium risk", className: "border-faint bg-surface text-foreground", Icon: Warning },
  high: { label: "High risk", className: "border-foreground bg-surface-raised font-semibold text-foreground", Icon: Warning, fill: true },
  critical: { label: "Critical risk", className: "border-foreground bg-foreground font-semibold text-background", Icon: WarningOctagon, fill: true },
};

/** The highest severity the security scan found in a version of a skill. */
export function RiskBadge({ risk }: { risk: Risk }) {
  const { label, className, Icon, fill } = LEVELS[risk];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${className}`}>
      <Icon size={14} weight={fill ? "fill" : "regular"} aria-hidden />
      {label}
    </span>
  );
}
