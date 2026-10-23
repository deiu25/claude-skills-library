import ReactMarkdown, { type Components } from "react-markdown";

interface MarkdownProps {
  content: string;
  /**
   * Text a user wrote, such as a SKILL.md: its headings nest under the page's, its links carry
   * rel="nofollow ugc", and its images are linked, never loaded.
   */
  userContent?: boolean;
}

const COMPONENTS: Components = {
  p: ({ children }) => <p className="max-w-[65ch] text-pretty">{children}</p>,
  ol: ({ children }) => <ol className="ml-5 max-w-[65ch] list-decimal space-y-1.5">{children}</ol>,
  ul: ({ children }) => <ul className="ml-5 max-w-[65ch] list-disc space-y-1.5">{children}</ul>,
  code: ({ children, className }) => {
    const isBlock = typeof className === "string";
    if (isBlock) {
      return <code className="font-mono text-[0.8125rem]">{children}</code>;
    }
    return (
      <code className="rounded-[6px] border border-line bg-surface-raised px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-[14px] border border-line bg-terminal-bg p-4 text-terminal-fg">{children}</pre>
  ),
};

const HEADING = "max-w-[65ch] text-balance font-semibold tracking-tight text-foreground";
const LINK = "text-foreground underline decoration-line underline-offset-4 transition-colors hover:text-accent-strong";
const isWebUrl = (url: unknown): url is string => typeof url === "string" && /^https?:\/\//i.test(url);

const USER_COMPONENTS: Components = {
  ...COMPONENTS,
  // The page's own section title is an h2, so a SKILL.md's "#" becomes an h3.
  h1: ({ children }) => <h3 className={`pt-2 text-lg ${HEADING}`}>{children}</h3>,
  h2: ({ children }) => <h4 className={`pt-2 text-base ${HEADING}`}>{children}</h4>,
  h3: ({ children }) => <h5 className={`text-[0.9375rem] ${HEADING}`}>{children}</h5>,
  h4: ({ children }) => <h6 className={`text-[0.9375rem] ${HEADING}`}>{children}</h6>,
  h5: ({ children }) => <h6 className={`text-[0.9375rem] ${HEADING}`}>{children}</h6>,
  h6: ({ children }) => <h6 className={`text-[0.9375rem] ${HEADING}`}>{children}</h6>,
  blockquote: ({ children }) => <blockquote className="max-w-[65ch] border-l border-line pl-4">{children}</blockquote>,
  hr: () => <hr className="max-w-[65ch] border-line" />,
  // A relative link would point at this site, where the skill's other files have no page.
  a: ({ href, children }) =>
    isWebUrl(href) ? (
      <a href={href} rel="nofollow ugc noopener noreferrer" className={LINK}>
        {children}
      </a>
    ) : (
      <>{children}</>
    ),
  // Loading an image would tell its server who reads the page, so it stays a link.
  img: ({ src, alt }) =>
    isWebUrl(src) ? (
      <a href={src} rel="nofollow ugc noopener noreferrer" className={LINK}>
        {alt ? `Image: ${alt}` : "Image"}
      </a>
    ) : (
      <>{alt}</>
    ),
};

/** Renders skill Markdown with the site's typography: curated entries, or a user's SKILL.md. */
export function Markdown({ content, userContent = false }: MarkdownProps) {
  return (
    <div className="space-y-4 text-[0.9375rem] leading-relaxed text-muted [&_strong]:text-foreground">
      <ReactMarkdown components={userContent ? USER_COMPONENTS : COMPONENTS}>{content}</ReactMarkdown>
    </div>
  );
}
