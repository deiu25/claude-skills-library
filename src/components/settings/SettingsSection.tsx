import type { ReactNode } from "react";

interface SettingsSectionProps {
  id: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}

/** One group of settings: its title and purpose beside its controls from md, above them below. */
export function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="grid scroll-mt-24 gap-5 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] md:gap-12"
    >
      <div className="space-y-1.5">
        <h2 id={titleId} className="text-xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-pretty text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
