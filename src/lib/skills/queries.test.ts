import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** A stand-in for a drizzle query builder, as in actions.test.ts: calls are recorded, results queued. */
const { calls, results, builder } = vi.hoisted(() => {
  const calls: { method: string; args: unknown[] }[] = [];
  const results: unknown[] = [];
  const builder: unknown = new Proxy(() => {}, {
    get(_target, property) {
      if (property === "then") return (resolve: (value: unknown) => void) => resolve(results.length ? results.shift() : []);
      return (...args: unknown[]) => {
        calls.push({ method: String(property), args });
        return builder;
      };
    },
  });
  return { calls, results, builder };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: { select: (...args: unknown[]) => (builder as { select: (...a: unknown[]) => unknown }).select(...args) } }));
vi.mock("@/lib/auth/session", () => ({ requireUser: vi.fn() }));

const { findVersionArchive } = await import("./queries");

const SKILL = "6f1c2a3e-8b4d-4f5a-9c7e-1d2b3c4d5e6f";
const owner = { id: "user-a" };
const stranger = { id: "user-b" };
const row = (visibility: string, status: string) => [{ ownerId: owner.id, visibility, status }];
/** The SQL of every WHERE clause run so far. */
const wheres = () => calls.filter((call) => call.method === "where").map((call) => new PgDialect().sqlToQuery(call.args[0] as SQL).sql);

beforeEach(() => {
  calls.length = 0;
  results.length = 0;
  vi.stubEnv("ACCOUNTS_OPEN", "true");
});
afterEach(() => vi.unstubAllEnvs());

describe("findVersionArchive", () => {
  it("refuses anyone signed out before Community opens, without reading anything", async () => {
    vi.stubEnv("ACCOUNTS_OPEN", "false");
    expect(await findVersionArchive(null, SKILL)).toBeNull();
    expect(calls).toEqual([]);
  });

  it("refuses an id that is not a skill's before reading anything", async () => {
    expect(await findVersionArchive(null, "not-a-skill")).toBeNull();
    expect(await findVersionArchive(owner, SKILL, 0)).toBeNull();
    expect(calls).toEqual([]);
  });

  it("refuses others a skill that is not published, or not visible to them", async () => {
    for (const [visibility, status] of [["private", "draft"], ["public", "draft"], ["public", "removed"], ["private", "published"]]) {
      results.push(row(visibility, status));
      expect(await findVersionArchive(stranger, SKILL), `${visibility} ${status}`).toBeNull();
    }
  });

  it("refuses others an older version, even of a published skill", async () => {
    results.push(row("public", "published"));
    expect(await findVersionArchive(null, SKILL, 1)).toBeNull();
  });

  it("refuses others before Community opens, signed in or not", async () => {
    vi.stubEnv("ACCOUNTS_OPEN", "false");
    results.push(row("public", "published"));
    expect(await findVersionArchive(stranger, SKILL)).toBeNull();
  });

  it("gives others the latest version, picked in a statement that checks the skill is still published", async () => {
    results.push(row("unlisted", "published"));
    const found = await findVersionArchive(null, SKILL);
    expect(found).not.toBeNull();
    results.push([]); // unpublished meanwhile: the guarded statement finds no version
    expect(await found?.read()).toBeNull();
    const picked = wheres().at(-1) ?? "";
    expect(picked).toContain('"skill"."status" = $');
    expect(picked).toContain('"skill"."visibility" in ($');
    expect(picked).toContain('"user"."username" is not null');
  });

  it("gives the owner any kept version, private or not", async () => {
    results.push(row("private", "draft"));
    const found = await findVersionArchive(owner, SKILL, 3);
    expect(found).not.toBeNull();
    results.push([]);
    await found?.read();
    expect(wheres().at(-1)).not.toContain('"skill"."status"');
  });
});
