// Scan v1. The rules are written here in TypeScript, so they run the same in the editor and on the
// server. Their targets, lists and severities follow existing agent-skill scanners, compared on
// 2026-10-22: NVIDIA SkillSpector, Cisco AI Defense skill-scanner and Agent Threat Rules for hidden
// Unicode, pipe-to-shell, credential and base64 patterns; agentshield and Claude Code's permission
// docs for allowed-tools; anti-trojan-source for the bidirectional controls. A finding is a flag to
// read, never a verdict: a skill with no findings is not proven safe.
//
// Every quantifier that can repeat is bounded, because the scan runs on every keystroke in the
// browser and on every save on the server, over up to 100,000 characters an author controls.

export type Severity = "low" | "medium" | "high" | "critical";
export type Risk = "none" | Severity;

export type RuleId =
  | "bidi-unicode"
  | "hidden-unicode"
  | "pipe-to-shell"
  | "credential-exfiltration"
  | "base64-execution"
  | "broad-allowed-tools"
  | "destructive-command";

export interface Finding {
  rule: RuleId;
  severity: Severity;
  /** 1-based line in SKILL.md. */
  line: number;
  message: string;
}

export const RULE_LABELS: Record<RuleId, string> = {
  "bidi-unicode": "Bidirectional text",
  "hidden-unicode": "Hidden characters",
  "pipe-to-shell": "Download run as a script",
  "credential-exfiltration": "Credentials near a network call",
  "base64-execution": "Encoded command",
  "broad-allowed-tools": "Broad tool access",
  "destructive-command": "Destructive command",
};

const SEVERITY_ORDER: Risk[] = ["none", "low", "medium", "high", "critical"];
const rank = (risk: Risk) => SEVERITY_ORDER.indexOf(risk);

/** The highest severity among the findings, or "none". */
export function riskOf(findings: Finding[]): Risk {
  return findings.reduce<Risk>((risk, finding) => (rank(finding.severity) > rank(risk) ? finding.severity : risk), "none");
}

/** Text from the file quoted in a message, cut short so a finding never outgrows its line. */
const quote = (text: string, max = 60) => (text.length > max ? `${text.slice(0, max)}…` : text);

/** "a, b, c and 4 more" */
function listSome(items: string[], max: number): string {
  return items.length > max ? `${items.slice(0, max).join(", ")} and ${items.length - max} more` : items.join(", ");
}

// ── Unicode ──────────────────────────────────────────────────────────────────────────────────

const codepoint = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;

// The England, Scotland and Wales flags are the only legitimate use of tag characters.
const SUBDIVISION_FLAG_RE = /\u{1F3F4}\u{E0067}\u{E0062}(?:\u{E0065}\u{E006E}\u{E0067}|\u{E0073}\u{E0063}\u{E0074}|\u{E0077}\u{E006C}\u{E0073})\u{E007F}/gu;
const IGNORABLE_RE = new RegExp("\\p{Default_Ignorable_Code_Point}", "u");
// Ordinary in real text: the soft hyphen in pasted prose, and the direction marks of Arabic and Hebrew.
const ORDINARY = new Set([0x00ad, 0x061c, 0x200e, 0x200f]);

type Hidden = "bidi" | "tag" | "selector" | "joiner" | "invisible";

function classify(cp: number, char: string): Hidden | null {
  // Trojan Source (CVE-2021-42574): embeddings, overrides and isolates reorder what is displayed.
  if ((cp >= 0x202a && cp <= 0x202e) || (cp >= 0x2066 && cp <= 0x2069)) return "bidi";
  if (cp >= 0xe0000 && cp <= 0xe007f) return "tag";
  if ((cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef)) return "selector";
  // Joiners shape emoji sequences and Persian or Indic words, so only a run of them counts.
  if (cp === 0x200c || cp === 0x200d) return "joiner";
  if (ORDINARY.has(cp)) return null;
  // Control characters other than tab and line breaks, such as the escape that starts a terminal
  // sequence able to hide text when the file is printed.
  if ((cp < 0x20 && cp !== 0x09 && cp !== 0x0a && cp !== 0x0d) || (cp >= 0x7f && cp <= 0x9f)) return "invisible";
  if (cp === 0x2028 || cp === 0x2029) return "invisible";
  return IGNORABLE_RE.test(char) ? "invisible" : null;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

function unicodeFindings(text: string, line: number): Finding[] {
  const findings: Finding[] = [];
  const bidi = new Set<number>();
  const invisible = new Set<number>();
  let hiddenText = "";
  let tags = 0;
  let selectorRun = 0;
  let longestSelectorRun = 0;
  let joinerRun = 0;
  let longestJoinerRun = 0;
  let hiddenRun = 0;
  let longestHiddenRun = 0;

  // A byte-order mark is allowed as the file's first character.
  const chars = (line === 1 ? text.replace(/^\uFEFF/, "") : text).replace(SUBDIVISION_FLAG_RE, "");
  for (const char of chars) {
    const cp = char.codePointAt(0)!;
    const kind = classify(cp, char);
    selectorRun = kind === "selector" ? selectorRun + 1 : 0;
    joinerRun = kind === "joiner" ? joinerRun + 1 : 0;
    hiddenRun = kind === "joiner" || kind === "invisible" ? hiddenRun + 1 : 0;
    longestSelectorRun = Math.max(longestSelectorRun, selectorRun);
    longestJoinerRun = Math.max(longestJoinerRun, joinerRun);
    longestHiddenRun = Math.max(longestHiddenRun, hiddenRun);
    if (kind === "bidi") bidi.add(cp);
    if (kind === "invisible") invisible.add(cp);
    if (kind === "tag") {
      tags++;
      if (cp >= 0xe0020 && cp <= 0xe007e && hiddenText.length <= 80) hiddenText += String.fromCharCode(cp - 0xe0000);
    }
  }

  if (bidi.size) {
    findings.push({
      rule: "bidi-unicode",
      severity: "high",
      line,
      message: `Bidirectional control character (${[...bidi].map(codepoint).join(", ")}): the text can read differently than it displays.`,
    });
  }
  if (tags) {
    const shown = hiddenText.trim();
    findings.push({
      rule: "hidden-unicode",
      severity: "critical",
      line,
      message: shown
        ? `Text hidden in ${plural(tags, "invisible tag character")}, which Claude reads and people cannot see: “${quote(shown, 80)}”`
        : `${plural(tags, "invisible tag character")}, which can carry text Claude reads and people cannot see.`,
    });
  }
  if (longestSelectorRun >= 2) {
    findings.push({
      rule: "hidden-unicode",
      severity: "high",
      line,
      message: `A run of ${longestSelectorRun} variation selectors, which can hide data inside one visible character.`,
    });
  }
  if (invisible.size || longestJoinerRun >= 2) {
    const names = [...invisible].map(codepoint);
    findings.push({
      rule: "hidden-unicode",
      // A long run can spell a message in binary.
      severity: longestHiddenRun >= 10 ? "high" : "medium",
      line,
      message: `Invisible character${names.length === 1 ? "" : "s"} (${names.length ? listSome(names, 8) : "zero-width joiners in a row"})${
        longestHiddenRun >= 10 ? `, ${longestHiddenRun} in a row, which can encode hidden text` : ""
      }: text that looks the same can differ.`,
    });
  }
  return findings;
}

// ── Commands ─────────────────────────────────────────────────────────────────────────────────

interface LineRule {
  rule: RuleId;
  severity: Severity;
  matches: (text: string) => boolean;
  message: string;
}

const re = (pattern: RegExp) => (text: string) => pattern.test(text);

const SHELL = String.raw`(?:sudo\s{1,5}(?:-\S{1,20}\s{1,5}){0,5})?(?:ba|da|fi|k|z|tc|c|a)?sh\b`;
const INTERPRETER = String.raw`(?:python[0-9.]{0,4}|perl|ruby|node|php|deno|bun|pwsh|powershell)\b`;
// An interpreter that reads its program from the pipe; with -c, -e or -m it runs code from its own
// arguments and only reads data, as in `curl … | python3 -m json.tool`.
const STDIN_INTERPRETER = String.raw`(?:sudo\s{1,5})?${INTERPRETER}(?!\s{1,5}(?:-[cem]\b|--eval\b))`;
const DOWNLOAD = String.raw`\b(?:curl|wget)\b`;
const BASE64_DECODE = String.raw`\bbase64\s{1,5}(?:-d|--decode|-D)\b`;

const RUNS_DOWNLOAD = "Downloads a script and runs it at once, with no chance to read it first.";
const RUNS_ENCODED = "Decodes base64 and runs the result, so it cannot be read before it runs.";

// rm with both a recursive and a force option, and root, a system folder or home among its operands.
const ROOT_OR_HOME = /^["']?(?:\/(?:(?:bin|boot|dev|etc|home|lib|lib64|opt|proc|root|sbin|srv|sys|usr|var)\/?)?\*?|~\/?\*?|\$\{?HOME\}?\/?\*?)["']?$/;
function deletesRootOrHome(text: string): boolean {
  for (const match of text.matchAll(/\brm\s+([^;&|\n]{1,300})/g)) {
    let recursive = false;
    let force = false;
    const operands: string[] = [];
    for (const word of match[1].trim().split(/\s+/).slice(0, 20)) {
      if (word === "--recursive") recursive = true;
      else if (word === "--force") force = true;
      else if (/^-[a-zA-Z]+$/.test(word)) {
        recursive ||= /[rR]/.test(word);
        force ||= word.includes("f");
      } else if (!word.startsWith("-")) operands.push(word);
    }
    if (recursive && force && operands.some((operand) => ROOT_OR_HOME.test(operand))) return true;
  }
  return false;
}

const LINE_RULES: LineRule[] = [
  {
    rule: "pipe-to-shell",
    severity: "high",
    matches: re(new RegExp(String.raw`${DOWNLOAD}[^|\n]{0,300}\|\s{0,10}(?:${SHELL}|${STDIN_INTERPRETER})`)),
    message: RUNS_DOWNLOAD,
  },
  {
    rule: "pipe-to-shell",
    severity: "high",
    matches: re(
      new RegExp(
        String.raw`(?:${SHELL}|(?:sudo\s{1,5})?${INTERPRETER}|\beval|\bsource|(?:^|[\s;&|])\.)\s{1,10}(?:-[ce]\s{1,10})?["']?(?:<\(|\$\()\s{0,10}(?:curl|wget)\b`,
      ),
    ),
    message: RUNS_DOWNLOAD,
  },
  {
    rule: "pipe-to-shell",
    severity: "high",
    matches: re(
      new RegExp(String.raw`${DOWNLOAD}[^&\n]{0,200}\s(?:-o|-O|--output)\s{0,5}\S{1,200}[^&\n]{0,200}&&\s{0,10}(?:${SHELL}|${STDIN_INTERPRETER}|chmod\s{1,5}\+x)`),
    ),
    message: RUNS_DOWNLOAD,
  },
  {
    rule: "pipe-to-shell",
    severity: "high",
    matches: re(
      /\b(?:iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^|\n]{0,300}\|\s{0,10}(?:iex|Invoke-Expression|pwsh|powershell)\b|\b(?:iex|Invoke-Expression)\b[\s(]{0,10}(?:\(?\s{0,5}New-Object\s{1,5}(?:System\.)?Net\.WebClient\)?\.DownloadString|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b/i,
    ),
    message: RUNS_DOWNLOAD,
  },
  {
    rule: "pipe-to-shell",
    severity: "high",
    matches: re(/\b(?:eval|Function)\s{0,5}\([^\n]{0,200}?\bfetch\s{0,5}\(/),
    message: "Downloads code and runs it at once, with no chance to read it first.",
  },
  {
    rule: "base64-execution",
    severity: "critical",
    matches: re(new RegExp(String.raw`${BASE64_DECODE}[^\n]{0,200}\|\s{0,10}(?:${SHELL}|${STDIN_INTERPRETER}|\beval\b)`, "i")),
    message: RUNS_ENCODED,
  },
  {
    rule: "base64-execution",
    severity: "critical",
    matches: re(new RegExp(String.raw`\beval\b[\s"'(]{0,10}\$\([^)\n]{0,200}${BASE64_DECODE}`, "i")),
    message: RUNS_ENCODED,
  },
  {
    rule: "base64-execution",
    severity: "critical",
    matches: re(
      /\b(?:eval|exec|Function)\s{0,5}\([^\n]{0,200}?(?:\batob\s{0,5}\(|Buffer\.from\s{0,5}\([^)\n]{0,200}["']base64["']|\b(?:b64decode|b32decode|a85decode|decodebytes)\s{0,5}\(|\bmarshal\.loads\s{0,5}\()/,
    ),
    message: RUNS_ENCODED,
  },
  {
    rule: "base64-execution",
    severity: "critical",
    // PowerShell takes any prefix of -EncodedCommand: -e, -ec, -enc and so on.
    matches: re(/\b(?:powershell|pwsh)(?:\.exe)?\b[^\n]{0,200}\s-e[a-z]{0,20}\s{1,5}[A-Za-z0-9+/]{16,4000}={0,2}(?=\s|$|["'])/i),
    message: "Runs a base64-encoded PowerShell command, which cannot be read before it runs.",
  },
  {
    rule: "base64-execution",
    severity: "critical",
    matches: re(/FromBase64String[^\n]{0,300}\b(?:iex|Invoke-Expression)\b|\b(?:iex|Invoke-Expression)\b[^\n]{0,300}FromBase64String/i),
    message: RUNS_ENCODED,
  },
  {
    rule: "destructive-command",
    severity: "critical",
    matches: deletesRootOrHome,
    message: "Deletes everything under the root, a system folder or the home folder.",
  },
  {
    rule: "destructive-command",
    severity: "critical",
    matches: re(/--no-preserve-root/),
    message: "Turns off the safeguard that stops rm from deleting the whole disk.",
  },
  {
    rule: "destructive-command",
    severity: "high",
    matches: re(
      /\bmkfs(?:\.\w{1,10})?\s|\bwipefs\b|\bdd\b[^\n]{0,200}\bof=\/dev\/(?:sd|hd|nvme|disk|mmcblk|xvd|vd)|>\s{0,5}\/dev\/(?:sd|hd|nvme|disk|mmcblk)[a-z0-9]{0,10}\b|\bformat\s{1,5}[a-z]:|\b(?:rd|rmdir)\s{1,5}\/s\s{1,5}\/q\s{1,5}[a-z]:\\?(?:\s|$)/i,
    ),
    message: "Overwrites or formats a disk.",
  },
  {
    rule: "destructive-command",
    severity: "high",
    matches: re(/:\s{0,5}\(\s{0,5}\)\s{0,5}\{\s{0,5}:\s{0,5}\|\s{0,5}:\s{0,5}&\s{0,5}\}\s{0,5};\s{0,5}:/),
    message: "A fork bomb, which freezes the machine.",
  },
  {
    rule: "destructive-command",
    severity: "high",
    matches: re(/\bchmod\s{1,5}(?:-R\s{1,5})?0?777\s{1,5}\/(?:\s|$)|\bchown\s{1,5}-R\s{1,5}\S{1,100}\s{1,5}\/(?:\s|$)|\bfind\s{1,5}(?:\/|~)\s[^\n]{0,200}-delete\b|\bkill\s{1,5}-9\s{1,5}-1\b/),
    message: "Changes or deletes files across the whole system, or kills every process.",
  },
  {
    rule: "destructive-command",
    severity: "medium",
    matches: re(/\bchmod\s{1,5}(?:-R\s{1,5})?(?:0?777|0?666|a\+w|o\+w)\s{1,5}["']?(?:\/(?:etc|usr|bin|sbin|boot|var|root)\b|~|\$\{?HOME\}?)/),
    message: "Makes system or home files writable by every user.",
  },
  {
    rule: "destructive-command",
    severity: "medium",
    matches: re(/\bgit\s{1,5}push\b[^\n]{0,200}\s(?:--force(?!-with-lease)\b|-f\b)/),
    message: "Force-pushes, which rewrites the remote branch's history.",
  },
  {
    rule: "destructive-command",
    severity: "medium",
    matches: re(/\b(?:DROP\s{1,5}(?:DATABASE|SCHEMA|TABLE)|TRUNCATE\s{1,5}TABLE)\b/i),
    message: "Drops or empties a database, schema or table.",
  },
  {
    rule: "destructive-command",
    severity: "low",
    matches: re(/\bgit\s{1,5}reset\s{1,5}--hard\b|\bgit\s{1,5}clean\s{1,5}-[a-zA-Z]{0,10}f/),
    message: "Discards uncommitted changes for good.",
  },
];

/** Lines joined across a trailing backslash, the way a shell reads them, each with its first line's number. */
function commandLines(lines: string[]): { text: string; line: number }[] {
  const result: { text: string; line: number }[] = [];
  for (let index = 0; index < lines.length; index++) {
    const start = index;
    let text = lines[index];
    while (text.trimEnd().endsWith("\\") && index + 1 < lines.length && index - start < 20 && text.length < 4000) {
      text = `${text.trimEnd().slice(0, -1)} ${lines[++index]}`;
    }
    result.push({ text, line: start + 1 });
  }
  return result;
}

// ── Credentials sent over the network ────────────────────────────────────────────────────────

// Stores that hold secrets. Public keys (.pub) are not secret.
const SECRET_STORE_RE = new RegExp(
  [
    String.raw`\.ssh\/(?![^\s"'\`]{0,100}\.pub\b)[^\s"'\`]{0,100}?(?:id_\w{1,40}|_key|\.pem)\b`,
    String.raw`\bid_(?:rsa|dsa|ecdsa|ed25519)\b(?!\.pub)`,
    String.raw`\.aws\/credentials`,
    String.raw`\.config\/gcloud\/(?:application_default_credentials\.json|credentials\.db|access_tokens\.db)`,
    String.raw`\.azure\/(?:accessTokens\.json|msal_token_cache)`,
    String.raw`\.netrc\b`,
    String.raw`\.npmrc\b`,
    String.raw`\.pypirc\b`,
    String.raw`\.docker\/config\.json`,
    String.raw`\.kube\/config`,
    String.raw`\.git-credentials`,
    String.raw`\.config\/gh\/hosts\.yml`,
    String.raw`\.claude\/\.credentials\.json`,
    String.raw`\/etc\/shadow\b`,
    String.raw`[\w-]\.(?:p12|pfx|kdbx)\b`,
    String.raw`(?:Chrome|Chromium|Firefox|Safari|Brave|Edge)\/[^\n]{0,200}?(?:Cookies|Login Data|key4\.db|logins\.json)`,
    String.raw`\bsecurity\s{1,5}find-(?:generic|internet)-password\b`,
    String.raw`\bsecret-tool\s{1,5}lookup\b`,
    String.raw`\bgh\s{1,5}auth\s{1,5}token\b`,
    String.raw`\bgcloud\s{1,5}auth\s{1,5}print-access-token\b`,
  ].join("|"),
  "i",
);
// Every environment variable at once: env or printenv run alone, or a whole environment serialized.
const ENV_DUMP_RE =
  /(?:^|[;&|(`]|\$\()\s{0,10}(?:printenv|env)\s{0,10}(?:$|[|>;)&`])|\b(?:json\.dumps|dict|str)\(\s{0,5}os\.environ\s{0,5}\)|JSON\.stringify\(\s{0,5}process\.env\s{0,5}\)/;
// Something on the line that reads a file's contents.
const READS_RE =
  /\b(?:cat|less|more|head|tail|base64|xxd|od|strings|cp|tar|zip|gpg|openssl|Get-Content|readFileSync|readFile|open|read_text|read_bytes)\b|\$\(|<\s{0,3}["']?[~/$]|@~?\//;
// Reading a project's .env file. Loading it with `source` before a deploy is common, and example
// files hold placeholders, so neither counts.
const DOTENV_READ_RE =
  /\b(?:cat|less|more|head|tail|type|Get-Content|readFileSync|readFile|open)\b[\s("'`]{0,10}[^\s"'`]{0,200}\.env(?!\.(?:example|sample|template|dist)\b)(?:\.\w{1,20})?\b/i;

const NETWORK_RE =
  /\b(?:curl|wget|nc|ncat|netcat|socat|scp|sftp|rsync|ftp|telnet|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b|\/dev\/(?:tcp|udp)\/|\bfetch\s{0,5}\(|\bXMLHttpRequest\b|\bsendBeacon\b|\brequests\.(?:get|post|put|patch)\b|\burllib\.request\b|\bhttpx\.|\baxios\b|\bsmtplib\b|\bWebClient\b/i;

/** How far apart, in lines, a credential read and a network call still count as one step. */
const NEARBY_LINES = 5;

function credentialFindings(lines: string[]): Finding[] {
  const network = lines.map((text) => NETWORK_RE.test(text));
  const near = network.map(() => false);
  network.forEach((isNetwork, index) => {
    if (!isNetwork) return;
    for (let at = Math.max(0, index - NEARBY_LINES); at <= Math.min(lines.length - 1, index + NEARBY_LINES); at++) near[at] = true;
  });

  return lines.flatMap((text, index): Finding[] => {
    if (!near[index]) return [];
    const line = index + 1;
    const message = (what: string) => `Reads credentials (${what}) next to a network call, which could send them off the machine.`;
    if (ENV_DUMP_RE.test(text)) {
      return [{ rule: "credential-exfiltration", severity: "critical", line, message: message("every environment variable") }];
    }
    const store = SECRET_STORE_RE.exec(text)?.[0].trim();
    if (store) {
      // A path that is read, or sent from this very line, is the exfiltration shape; a path that is
      // only mentioned near a request is worth reading, no more.
      if (network[index] || READS_RE.test(text)) {
        return [{ rule: "credential-exfiltration", severity: "critical", line, message: message(quote(store)) }];
      }
      return [
        {
          rule: "credential-exfiltration",
          severity: "medium",
          line,
          message: `Mentions credentials (${quote(store)}) next to a network call.`,
        },
      ];
    }
    if (DOTENV_READ_RE.test(text)) {
      return [{ rule: "credential-exfiltration", severity: "high", line, message: message("a .env file") }];
    }
    return [];
  });
}

// ── allowed-tools ────────────────────────────────────────────────────────────────────────────

/** Splits "Read, Bash(git status:*) Grep" or a YAML list into entries, keeping spaces inside parentheses. */
export function allowedToolEntries(value: unknown): string[] {
  const items = Array.isArray(value) ? value.filter((item) => typeof item === "string") : typeof value === "string" ? [value] : [];
  return items.flatMap((item) => item.match(/[^\s,(]{1,200}(?:\([^)]{0,200}\))?/g) ?? []).slice(0, 100);
}

// Programs that run whatever they are given, so a wildcard after them allows every command.
// Claude Code matches a Bash rule's text before the `*` literally and does not look through
// environment runners such as `devbox run` or `docker exec`.
const RUNS_ANYTHING =
  /^(?:sudo|su|doas|sh|bash|zsh|fish|dash|ksh|env|eval|exec|xargs|nohup|python[0-9.]*|node|deno|bun|perl|ruby|php|npx|bunx|pnpx|pnpm dlx|yarn dlx|uvx|pwsh|powershell|direnv exec|devbox run|mise exec|docker exec|docker run|ssh)$/;
const NETWORK_COMMAND = /^(?:curl|wget|nc|ncat|scp|rsync)$/;
const SECRET_PATH = /(?:^|\/)\.(?:ssh|aws|gnupg|kube|docker|config\/gh|azure)\b|\.env\b|credentials/;

function broadToolProblem(entry: string): { severity: Severity; problem: string } | null {
  if (entry === "*") return { severity: "high", problem: "allows every tool" };
  const match = /^(\w+)(?:\((.*)\))?$/.exec(entry);
  if (!match) return null;
  const [, tool, inside] = match;
  const rule = inside?.trim() ?? "";

  if (tool === "Bash" || tool === "PowerShell") {
    if (!rule || /^:?\*$/.test(rule)) return { severity: "high", problem: "lets Claude run any command without asking" };
    if (rule.startsWith("*")) return { severity: "high", problem: "matches any program" };
    const prefix = rule.replace(/(?::\*|\s+\*)$/, "");
    if (prefix === rule) return null;
    if (RUNS_ANYTHING.test(prefix)) return { severity: "high", problem: `lets Claude run anything through ${prefix} without asking` };
    if (prefix === "rm") return { severity: "high", problem: "lets Claude delete any file without asking" };
    if (NETWORK_COMMAND.test(prefix)) return { severity: "medium", problem: `lets Claude send data anywhere with ${prefix} without asking` };
    if (/^(?:chmod|chown|kill|pkill)$/.test(prefix)) return { severity: "medium", problem: `lets Claude run any ${prefix} command without asking` };
    return null;
  }
  if (tool === "WebFetch" && (!rule || rule === "domain:*")) {
    return { severity: "low", problem: "lets Claude fetch any URL without asking" };
  }
  if (tool === "Read" || tool === "Edit" || tool === "Write") {
    if (SECRET_PATH.test(rule)) return { severity: "high", problem: "reaches files that hold credentials" };
    if (/^(?:\/\/|~)(?:\/\*\*|\/)?$/.test(rule)) return { severity: "medium", problem: "covers the whole disk or home folder" };
  }
  return null;
}

function allowedToolsFindings(lines: string[], frontmatter: Record<string, unknown> | undefined): Finding[] {
  if (!frontmatter || !("allowed-tools" in frontmatter)) return [];
  const problems = allowedToolEntries(frontmatter["allowed-tools"]).flatMap((entry) => {
    const found = broadToolProblem(entry);
    return found ? [{ ...found, text: `${quote(entry)} ${found.problem}` }] : [];
  });
  if (!problems.length) return [];
  const line = lines.findIndex((text) => /^allowed-tools\s{0,5}:/.test(text)) + 1 || 1;
  const severity = problems.reduce<Severity>((worst, { severity }) => (rank(severity) > rank(worst) ? severity : worst), "low");
  const shown = problems.slice(0, 5).map((p) => p.text);
  const more = problems.length > 5 ? `; and ${problems.length - 5} more` : "";
  return [{ rule: "broad-allowed-tools", severity, line, message: `allowed-tools: ${shown.join("; ")}${more}.` }];
}

// ── Scan ─────────────────────────────────────────────────────────────────────────────────────

/** The most findings kept, most severe first: per rule, so one repeated problem stays readable, and in all. */
const MAX_PER_RULE = 20;
export const MAX_FINDINGS = 50;

const bySeverity = (a: Finding, b: Finding) => rank(b.severity) - rank(a.severity) || a.line - b.line;

/**
 * Flags hidden or bidirectional Unicode, downloads run as scripts, credentials read next to a
 * network call, base64 decoded into a shell, broad allowed-tools and destructive commands. Pure
 * and synchronous, so the editor runs it on every change and the server again on save.
 */
export function scanSkillMd(source: string, frontmatter?: Record<string, unknown>): Finding[] {
  const lines = source.split("\n");
  const findings = [
    ...lines.flatMap((text, index) => unicodeFindings(text, index + 1)),
    ...commandLines(lines).flatMap(({ text, line }) =>
      LINE_RULES.filter((rule) => rule.matches(text)).map(({ rule, severity, message }) => ({ rule, severity, line, message })),
    ),
    ...credentialFindings(lines),
    ...allowedToolsFindings(lines, frontmatter),
  ];
  const seen = new Set<string>();
  const perRule = new Map<RuleId, number>();
  return findings
    .sort(bySeverity)
    .filter((finding) => {
      const key = `${finding.rule}:${finding.line}:${finding.message}`;
      const count = (perRule.get(finding.rule) ?? 0) + 1;
      if (seen.has(key) || count > MAX_PER_RULE) return false;
      seen.add(key);
      perRule.set(finding.rule, count);
      return true;
    })
    .slice(0, MAX_FINDINGS)
    .sort((a, b) => a.line - b.line);
}
