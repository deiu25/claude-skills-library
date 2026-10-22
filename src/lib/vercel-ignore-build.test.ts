import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * Vercel runs `vercel.json`'s `ignoreCommand` before every build, with the exit codes
 * inverted from the usual sense: 0 cancels the build, 1 runs it. Each test runs the script
 * in a throwaway repository, as Vercel runs it in its clone.
 */

const root = process.cwd();
const script = join(root, "scripts/vercel-ignore-build.sh");

// Git without the developer's global config, hooks or commit signing.
const env: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  PATH: process.env.PATH,
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "test",
  GIT_COMMITTER_EMAIL: "test@example.com",
};

let repo = "";

function git(...args: string[]): string {
  const run = spawnSync("git", args, { cwd: repo, env, encoding: "utf8" });
  if (run.status !== 0) throw new Error(`git ${args.join(" ")}: ${run.stderr}`);
  return run.stdout.trim();
}

/** Writes the files, commits them and returns the new HEAD. */
function commit(files: Record<string, string>): string {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), body);
  }
  git("add", ".");
  git("commit", "--quiet", "--message", "change");
  return git("rev-parse", "HEAD");
}

function ignoreBuild(previousSha: string, vercelEnv = "production"): number | null {
  return spawnSync("bash", [script], {
    cwd: repo,
    env: { ...env, VERCEL_ENV: vercelEnv, VERCEL_GIT_PREVIOUS_SHA: previousSha },
  }).status;
}

describe("scripts/vercel-ignore-build.sh", () => {
  let deployed = "";

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), "vercel-ignore-build-"));
    git("init", "--quiet");
    deployed = commit({
      "src/app/page.tsx": "1",
      "README.md": "1",
      "e2e/home.spec.ts": "1",
    });
  });

  afterEach(() => rmSync(repo, { recursive: true, force: true }));

  it("builds when the branch has no previous deployment", () => {
    commit({ "README.md": "2" });
    expect(ignoreBuild("")).toBe(1);
  });

  it("builds when the previous deployment is missing from the clone", () => {
    commit({ "README.md": "2" });
    expect(ignoreBuild("deadbeef".repeat(5))).toBe(1);
  });

  it("builds a redeploy of the deployed commit", () => {
    expect(ignoreBuild(deployed)).toBe(1);
  });

  it.each(["preview", "production"])(
    "skips a %s push that changes only docs, e2e tests, agent config and GitHub templates",
    (vercelEnv) => {
      commit({
        "README.md": "2",
        "ROADMAP.md": "1",
        "e2e/home.spec.ts": "2",
        ".claude/rules/docs.md": "1",
        ".github/ISSUE_TEMPLATE/fix-entry.yml": "1",
      });
      expect(ignoreBuild(deployed, vercelEnv)).toBe(0);
    },
  );

  it.each(["preview", "production"])("builds a %s push that changes the app", (vercelEnv) => {
    commit({ "src/app/page.tsx": "2" });
    expect(ignoreBuild(deployed, vercelEnv)).toBe(1);
  });

  it.each([
    ["a migration", { "drizzle/0001_change.sql": "1" }],
    ["Markdown outside the repository root", { "src/data/notes.md": "1" }],
    ["a shipped file beside a Markdown one", { "README.md": "2", "public/icon.svg": "1" }],
  ])("builds a push that changes %s", (_, files) => {
    commit(files);
    expect(ignoreBuild(deployed)).toBe(1);
  });
});

it("vercel.json runs the script as its ignoreCommand", () => {
  const config = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8")) as {
    ignoreCommand?: string;
  };
  expect(config.ignoreCommand).toBe("bash scripts/vercel-ignore-build.sh");
});
