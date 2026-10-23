import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { TerminalBlock } from "@/components/TerminalBlock";
import { SITE_URL } from "@/lib/site";

interface ListingInstallProps {
  /** The skill's id, which its download address takes. */
  id: string;
}

/** A published skill's zip, and the command that unpacks it into Claude Code's skills folder. */
export function ListingInstall({ id }: ListingInstallProps) {
  const download = `/api/skills/${id}/download`;
  // A fresh temporary file, which no one else can plant in advance, and unzip asks before it
  // replaces a skill of the same name.
  const command = `zip=$(mktemp) && curl -fsSL ${SITE_URL}${download} -o "$zip" && unzip "$zip" -d ~/.claude/skills && rm "$zip"`;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Install</h2>
        {/* download: a refused request stays a failed download instead of replacing this page. */}
        <a href={download} download className="btn btn-ghost text-sm">
          <DownloadSimple size={16} aria-hidden />
          Download .zip
        </a>
      </div>
      <TerminalBlock title="install" copyText={command}>
        <p className="break-words">
          <span className="text-accent">$</span> {command}
        </p>
      </TerminalBlock>
      <p className="max-w-[65ch] text-sm text-muted">
        This puts it in <code className="font-mono text-[0.8125rem] text-foreground">~/.claude/skills</code>, for every
        project. For one project only, run it in that project&rsquo;s folder with{" "}
        <code className="font-mono text-[0.8125rem] text-foreground">.claude/skills</code> in its place.
      </p>
    </section>
  );
}
