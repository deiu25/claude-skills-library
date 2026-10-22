// Scan v1. The rules are written here in TypeScript, so they run the same in the editor and on the
// server. Their targets, lists and severities follow existing agent-skill scanners, compared on
// 2026-10-22: NVIDIA SkillSpector, Cisco AI Defense skill-scanner and Agent Threat Rules for hidden
// Unicode, pipe-to-shell, credential and base64 patterns; agentshield and Claude Code's permission
// docs for allowed-tools; anti-trojan-source for the bidirectional controls. A finding is a flag to
// read, never a verdict: a skill with no findings is not proven safe.

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

// ── Unicode ──────────────────────────────────────────────────────────────────────────────────

const codepoint = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;

// The England, Scotland and Wales flags are the one legitimate use of tag characters.
const SUBDIVISION_FLAG_RE = /\u{1F3F4}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{2,6}\u{E007F}/gu;
const IGNORABLE_RE = new RegExp("[\\p{Default_Ignorable_Code_Point}\\u2028\\u2029]", "u");

type Hidden = "bidi" | "tag" | "selector" | "joiner" | "invisible";

function classify(cp: number, char: string): Hidden | null {
  // Trojan Source (CVE-2021-42574): embeddings, overrides and isolates reorder what is displayed.
  if ((cp >= 0x202a && cp <= 0x202e) || (cp >= 0x2066 && cp <= 0x2069)) return "bidi";
  if (cp >= 0xe0000 && cp <= 0xe007f) return "tag";
  if ((cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef)) return "selector";
  // Joiners shape emoji sequences and Persian or Indic words, so only a run of them counts.
  if (cp === 0x200c || cp === 0x200d) return "joiner";
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
  const chars = (line === 1 ? text.replace(/^﻿/, "") : text).replace(SUBDIVISION_FLAG_RE, "");
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
      if (cp >= 0xe0020 && cp <= 0xe007e) hiddenText += String.fromCharCode(cp - 0xe0000);
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
    const shown = hiddenText.trim().slice(0, 80);
    findings.push({
      rule: "hidden-unicode",
      severity: "critical",
      line,
      message: shown
        ? `Text hidden in ${plural(tags, "invisible tag character")}, which Claude reads and people cannot see: “${shown}${hiddenText.trim().length > 80 ? "…" : ""}”`
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
      message: `Invisible character${names.length === 1 ? "" : "s"} (${names.length ? names.join(", ") : "zero-width joiners in a row"})${
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
  pattern: RegExp;
  message: string;
}

const SHELL = String.raw`(?:sudo\s+(?:-\S+\s+)*)?(?:ba|da|fi|k|z|tc|c|a)?sh\b`;
const INTERPRETER = String.raw`(?:sudo\s+)?(?:python[0-9.]*|perl|ruby|node|php|deno|bun|pwsh|powershell)\b`;
const DOWNLOAD = String.raw`\b(?:curl|wget|fetch)\b`;
const BASE64_DECODE = String.raw`\bbase64\s+(?:-d|--decode|-D)\b`;
// Root, system folders and home, alone or with /* after them.
const ROOT_OR_HOME = String.raw`["']?(?:\/(?:(?:bin|boot|dev|etc|home|lib|lib64|opt|proc|root|sbin|srv|sys|usr|var)\/?)?\*?|~\/?\*?|\$\{?HOME\}?\/?\*?)["']?(?=\s|$|[;&|)])`;

const RUNS_DOWNLOAD = "Downloads a script and runs it at once, with no chance to read it first.";
const RUNS_ENCODED = "Decodes base64 and runs the result, so it cannot be read before it runs.";

const LINE_RULES: LineRule[] = [
  {
    rule: "pipe-to-shell",
    severity: "high",
    pattern: new RegExp(String.raw`${DOWNLOAD}[^|\n]*\|\s*(?:${SHELL}|${INTERPRETER})`, "i"),
    message: RUNS_DOWNLOAD,
  },
  {
    rule: "pipe-to-shell",
    severity: "high",
    pattern: new RegExp(String.raw`(?:${SHELL}|${INTERPRETER}|\bsource|(?:^|[\s;&|])\.)\s+(?:-c\s+)?["']?(?:<\(|\$\()\s*(?:curl|wget)\b`, "i"),
    message: RUNS_DOWNLOAD,
  },
  {
    rule: "pipe-to-shell",
    severity: "high",
    pattern: new RegExp(String.raw`\b(?:curl|wget)\b[^&\n]*\s(?:-o|-O|--output)\s*\S+[^&\n]*&&\s*(?:${SHELL}|${INTERPRETER}|chmod\s+\+x)`, "i"),
    message: RUNS_DOWNLOAD,
  },
  {
    rule: "pipe-to-shell",
    severity: "high",
    pattern: /\b(?:iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^|\n]*\|\s*(?:iex|Invoke-Expression|pwsh|powershell)\b|\b(?:iex|Invoke-Expression)\b[\s(]*(?:\(?\s*New-Object\s+(?:System\.)?Net\.WebClient\)?\.DownloadString|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b/i,
    message: RUNS_DOWNLOAD,
  },
  {
    rule: "pipe-to-shell",
    severity: "high",
    pattern: /\b(?:eval|Function)\s*\([^\n]*\bfetch\s*\(/,
    message: "Downloads code and runs it at once, with no chance to read it first.",
  },
  {
    rule: "base64-execution",
    severity: "critical",
    pattern: new RegExp(String.raw`${BASE64_DECODE}[^\n]*\|\s*(?:${SHELL}|${INTERPRETER}|\beval\b)`, "i"),
    message: RUNS_ENCODED,
  },
  {
    rule: "base64-execution",
    severity: "critical",
    pattern: new RegExp(String.raw`\beval\b[\s"'(]*\$\([^)\n]*${BASE64_DECODE}`, "i"),
    message: RUNS_ENCODED,
  },
  {
    rule: "base64-execution",
    severity: "critical",
    pattern: /\b(?:eval|exec|Function)\s*\([^\n]*?(?:\batob\s*\(|Buffer\.from\s*\([^)\n]*["']base64["']|\b(?:b64decode|b32decode|a85decode|decodebytes)\s*\(|\bmarshal\.loads\s*\()/,
    message: RUNS_ENCODED,
  },
  {
    rule: "base64-execution",
    severity: "critical",
    // PowerShell takes any prefix of -EncodedCommand: -e, -ec, -enc and so on.
    pattern: /\b(?:powershell|pwsh)(?:\.exe)?\b[^\n]*\s-e[a-z]*\s+[A-Za-z0-9+/]{16,}={0,2}(?=\s|$|["'])/i,
    message: "Runs a base64-encoded PowerShell command, which cannot be read before it runs.",
  },
  {
    rule: "base64-execution",
    severity: "critical",
    pattern: /FromBase64String[^\n]*\b(?:iex|Invoke-Expression)\b|\b(?:iex|Invoke-Expression)\b[^\n]*FromBase64String/i,
    message: RUNS_ENCODED,
  },
  {
    rule: "destructive-command",
    severity: "critical",
    pattern: new RegExp(
      String.raw`\brm\s+(?:-[a-zA-Z]+\s+|--[a-z-]+\s+)*(?:-[a-zA-Z]*(?:r[a-zA-Z]*f|f[a-zA-Z]*r)[a-zA-Z]*|-[rR]\s+-f|-f\s+-[rR]|--recursive\s+--force|--force\s+--recursive)\s+(?:--no-preserve-root\s+)?${ROOT_OR_HOME}`,
    ),
    message: "Deletes everything under the root, a system folder or the home folder.",
  },
  {
    rule: "destructive-command",
    severity: "critical",
    pattern: /--no-preserve-root/,
    message: "Turns off the safeguard that stops rm from deleting the whole disk.",
  },
  {
    rule: "destructive-command",
    severity: "high",
    pattern: /\bmkfs(?:\.\w+)?\s|\bwipefs\b|\bdd\b[^\n]*\bof=\/dev\/(?:sd|hd|nvme|disk|mmcblk|xvd|vd)|>\s*\/dev\/(?:sd|hd|nvme|disk|mmcblk)[a-z0-9]*\b|\bformat\s+[a-z]:|\b(?:rd|rmdir)\s+\/s\s+\/q\s+[a-z]:\\?(?:\s|$)/i,
    message: "Overwrites or formats a disk.",
  },
  {
    rule: "destructive-command",
    severity: "high",
    pattern: /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,
    message: "A fork bomb, which freezes the machine.",
  },
  {
    rule: "destructive-command",
    severity: "high",
    pattern: /\bchmod\s+(?:-R\s+)?0?777\s+\/(?:\s|$)|\bchown\s+-R\s+\S+\s+\/(?:\s|$)|\bfind\s+(?:\/|~)\s[^\n]*-delete\b|\bkill\s+-9\s+-1\b/,
    message: "Changes or deletes files across the whole system, or kills every process.",
  },
  {
    rule: "destructive-command",
    severity: "medium",
    pattern: /\bchmod\s+(?:-R\s+)?(?:0?777|0?666|a\+w|o\+w)\s+["']?(?:\/(?:etc|usr|bin|sbin|boot|var|root)\b|~|\$\{?HOME\}?)/,
    message: "Makes system or home files writable by every user.",
  },
  {
    rule: "destructive-command",
    severity: "medium",
    pattern: /\bgit\s+push\b[^\n]*\s(?:--force(?!-with-lease)\b|-f\b)/,
    message: "Force-pushes, which rewrites the remote branch's history.",
  },
  {
    rule: "destructive-command",
    severity: "medium",
    pattern: /\b(?:DROP\s+(?:DATABASE|SCHEMA|TABLE)|TRUNCATE\s+TABLE)\b/i,
    message: "Drops or empties a database, schema or table.",
  },
  {
    rule: "destructive-command",
    severity: "low",
    pattern: /\bgit\s+reset\s+--hard\b|\bgit\s+clean\s+-[a-zA-Z]*f/,
    message: "Discards uncommitted changes for good.",
  },
];

// ── Credentials sent over the network ────────────────────────────────────────────────────────

// Stores that hold secrets, and dumps of every environment variable. Public keys (.pub) are not secret.
const SECRET_STORE_RE = new RegExp(
  [
    String.raw`\.ssh\/(?!\S*\.pub\b)\S*(?:id_\w+|_key|\.pem)\b`,
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
    String.raw`\S+\.(?:p12|pfx|kdbx)\b`,
    String.raw`(?:Chrome|Chromium|Firefox|Safari|Brave|Edge)\/[^\n]*?(?:Cookies|Login Data|key4\.db|logins\.json)`,
    String.raw`\bsecurity\s+find-(?:generic|internet)-password\b`,
    String.raw`\bsecret-tool\s+lookup\b`,
    String.raw`\bgh\s+auth\s+token\b`,
    String.raw`\bgcloud\s+auth\s+print-access-token\b`,
    String.raw`\bprintenv\b`,
    String.raw`\benv\s*(?:\||>)`,
    String.raw`\b(?:json\.dumps|dict|str)\(\s*os\.environ\s*\)`,
    String.raw`JSON\.stringify\(\s*process\.env\s*\)`,
  ].join("|"),
  "i",
);
// Reading a project's .env file. Loading it with `source` before a deploy is common, and example
// files hold placeholders, so neither counts.
const DOTENV_READ_RE =
  /\b(?:cat|less|more|head|tail|type|Get-Content|readFileSync|readFile|open)\b[\s("'`]*[^\s"'`]*\.env(?!\.(?:example|sample|template|dist)\b)(?:\.\w+)?\b/i;

const NETWORK_RE =
  /\b(?:curl|wget|nc|ncat|netcat|socat|scp|sftp|rsync|ftp|telnet|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b|\/dev\/(?:tcp|udp)\/|\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\b|\brequests\.(?:get|post|put|patch)\b|\burllib\.request\b|\bhttpx\.|\baxios\b|\bsmtplib\b|\bWebClient\b/i;

/** How far apart, in lines, a credential read and a network call still count as one step. */
const NEARBY_LINES = 5;

function credentialFindings(lines: string[]): Finding[] {
  const network = lines.flatMap((line, index) => (NETWORK_RE.test(line) ? [index] : []));
  if (!network.length) return [];
  return lines.flatMap((line, index): Finding[] => {
    if (!network.some((n) => Math.abs(n - index) <= NEARBY_LINES)) return [];
    const store = SECRET_STORE_RE.exec(line)?.[0].trim();
    const dotenv = !store && DOTENV_READ_RE.test(line);
    if (!store && !dotenv) return [];
    const what = !store ? "a .env file" : /environ|process\.env|printenv|^env/i.test(store) ? "every environment variable" : store;
    return [
      {
        rule: "credential-exfiltration",
        severity: store ? "critical" : "high",
        line: index + 1,
        message: `Reads credentials (${what}) next to a network call, which could send them off the machine.`,
      },
    ];
  });
}

// ── allowed-tools ────────────────────────────────────────────────────────────────────────────

/** Splits "Read, Bash(git status:*) Grep" or a YAML list into entries, keeping spaces inside parentheses. */
export function allowedToolEntries(value: unknown): string[] {
  const items = Array.isArray(value) ? value.filter((item) => typeof item === "string") : typeof value === "string" ? [value] : [];
  return items.flatMap((item) => item.match(/[^\s,(]+(?:\([^)]*\))?/g) ?? []);
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
    return found ? [{ ...found, text: `${entry} ${found.problem}` }] : [];
  });
  if (!problems.length) return [];
  const line = lines.findIndex((text) => /^allowed-tools\s*:/.test(text)) + 1 || 1;
  const severity = problems.reduce<Severity>((worst, { severity }) => (rank(severity) > rank(worst) ? severity : worst), "low");
  return [{ rule: "broad-allowed-tools", severity, line, message: `allowed-tools: ${problems.map((p) => p.text).join("; ")}.` }];
}

// ── Scan ─────────────────────────────────────────────────────────────────────────────────────

/** At most this many findings are kept per rule, the most severe first, so a file full of one problem stays readable. */
const MAX_PER_RULE = 20;

const bySeverity = (a: Finding, b: Finding) => rank(b.severity) - rank(a.severity) || a.line - b.line;

/**
 * Flags hidden or bidirectional Unicode, downloads run as scripts, credentials read next to a
 * network call, base64 decoded into a shell, broad allowed-tools and destructive commands. Pure
 * and synchronous, so the editor runs it on every change and the server again on save.
 */
export function scanSkillMd(source: string, frontmatter?: Record<string, unknown>): Finding[] {
  const lines = source.split("\n");
  const findings = [
    ...lines.flatMap((text, index) => [
      ...unicodeFindings(text, index + 1),
      ...LINE_RULES.filter((rule) => rule.pattern.test(text)).map(({ rule, severity, message }) => ({
        rule,
        severity,
        line: index + 1,
        message,
      })),
    ]),
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
    .sort((a, b) => a.line - b.line);
}
