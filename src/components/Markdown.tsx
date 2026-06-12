import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  content: string;
}

/** Renders curated skill markdown with the site's typography. */
export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-muted [&_strong]:text-foreground">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="max-w-[65ch]">{children}</p>,
          ol: ({ children }) => (
            <ol className="ml-5 max-w-[65ch] list-decimal space-y-1.5">{children}</ol>
          ),
          ul: ({ children }) => (
            <ul className="ml-5 max-w-[65ch] list-disc space-y-1.5">{children}</ul>
          ),
          code: ({ children, className }) => {
            const isBlock = typeof className === "string";
            if (isBlock) {
              return <code className="font-mono text-[13px]">{children}</code>;
            }
            return (
              <code className="rounded-[6px] border border-line bg-surface-raised px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-[14px] border border-line bg-terminal-bg p-4 text-terminal-fg">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
