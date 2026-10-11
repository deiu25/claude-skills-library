import type { ReactNode } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

interface FormMessageProps {
  /** "warning" is a standing caution present on load, so it is not announced like a result. */
  tone: "error" | "success" | "warning";
  children: ReactNode;
}

const ROLE = { error: "alert", success: "status", warning: undefined } as const;

/** Inline form feedback. Errors stay neutral: the One Accent Rule allows no second hue. */
export function FormMessage({ tone, children }: FormMessageProps) {
  const Icon = tone === "success" ? CheckCircle : WarningCircle;
  return (
    <div
      role={ROLE[tone]}
      className="flex gap-3 rounded-[8px] border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed text-foreground"
    >
      <Icon
        size={18}
        className={`mt-0.5 shrink-0 ${tone === "success" ? "text-accent" : "text-foreground"}`}
        aria-hidden
      />
      <div>{children}</div>
    </div>
  );
}
