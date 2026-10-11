import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// The legal pages are plain headings, paragraphs and lists; their typography lives here.
const PROSE = [
  "max-w-[70ch] space-y-4 text-[0.9375rem] leading-relaxed text-muted",
  "[&_h2]:pt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-balance [&_h2]:text-foreground",
  "[&_h3]:pt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground",
  "[&_p]:text-pretty [&_strong]:font-medium [&_strong]:text-foreground",
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:pl-1 [&_li]:marker:text-faint",
  "[&_a]:text-foreground [&_a]:underline [&_a]:decoration-faint [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:hover:text-accent-strong",
].join(" ");

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <article className={PROSE}>{children}</article>
      </main>
      <SiteFooter />
    </>
  );
}
