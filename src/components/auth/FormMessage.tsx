import type { ReactNode } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

interface FormMessageProps {
  tone: "error" | "success";
  children: ReactNode;
}

/** Inline form feedback. Errors stay neutral: the One Accent Rule allows no second hue. */
export function FormMessage({ tone, children }: FormMessageProps) {
  const Icon = tone === "error" ? WarningCircle : CheckCircle;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="flex gap-3 rounded-[8px] border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed text-foreground"
    >
      <Icon
        size={18}
        className={`mt-0.5 shrink-0 ${tone === "error" ? "text-foreground" : "text-accent"}`}
        aria-hidden
      />
      <div>{children}</div>
    </div>
  );
}
