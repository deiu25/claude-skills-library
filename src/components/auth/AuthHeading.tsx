import type { ReactNode } from "react";

/** Title and one-line intro shared by the sign-in, sign-up and password pages. */
export function AuthHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-balance text-3xl font-semibold text-foreground">{title}</h1>
      <p className="text-pretty text-sm leading-relaxed text-muted sm:text-base">{children}</p>
    </div>
  );
}
