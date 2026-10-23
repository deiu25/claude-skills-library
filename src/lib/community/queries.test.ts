import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** A stand-in for a drizzle query builder, as in actions.test.ts: calls are recorded, results queued; a queued Error fails the query. */
const { calls, results, builder } = vi.hoisted(() => {
  const calls: { method: string; args: unknown[] }[] = [];
  const results: unknown[] = [];
  const builder: unknown = new Proxy(() => {}, {
    get(_target, property) {
      if (property === "then") {
        return (resolve: (value: unknown) => void, reject: (error: unknown) => void) => {
          const next = results.length ? results.shift() : [];
          if (next instanceof Error) reject(next);
          else resolve(next);
        };
      }
      return (...args: unknown[]) => {
        calls.push({ method: String(property), args });
        return builder;
      };
    },
  });
  return { calls, results, builder };
});

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_cache: <T>(read: T) => read }));
vi.mock("@/lib/db", () => ({ db: { select: (...args: unknown[]) => (builder as { select: (...a: unknown[]) => unknown }).select(...args) } }));

const { getCommunitySkills, getListing, getProfile, getSitemapSkills } = await import("./queries");

/** The SQL of every WHERE clause run so far. */
const wheres = () => calls.filter((call) => call.method === "where").map((call) => new PgDialect().sqlToQuery(call.args[0] as SQL).sql);
const PUBLISHED = '"skill"."status" = $';
const HAS_USERNAME = '"user"."username" is not null';
const PUBLIC = '"skill"."visibility" = $';

beforeEach(() => {
  calls.length = 0;
  results.length = 0;
});

describe("Community reads", () => {
  it("list only published public skills whose owner has a username", async () => {
    await getCommunitySkills();
    await getSitemapSkills();
    for (const where of wheres()) {
      expect(where).toContain(PUBLISHED);
      expect(where).toContain(HAS_USERNAME);
      expect(where).toContain(PUBLIC);
    }
    expect(wheres()).toHaveLength(2);
  });

  it("show a skill's page only when it is published, public or unlisted", async () => {
    await getListing("ada", "pdf-forms");
    const [where] = wheres();
    expect(where).toContain(PUBLISHED);
    expect(where).toContain(HAS_USERNAME);
    expect(where).toContain('"skill"."visibility" in ($');
  });

  it("give a profile only through a public skill", async () => {
    results.push([{ id: "user-a", bio: null }], []);
    expect(await getProfile("ada")).toBeNull();
    expect(wheres()[1]).toContain(PUBLIC);
  });

  it("answer an address that cannot be a handle or a skill without a query", async () => {
    for (const [handle, slug] of [["Ada", "pdf-forms"], ["ab", "pdf-forms"], ["ada", "PDF"], ["ada", "a".repeat(65)]]) {
      expect(await getListing(handle, slug)).toBeNull();
    }
    expect(await getProfile("not_a_handle")).toBeNull();
    expect(calls).toEqual([]);
  });

  it("throw a failed read at request time, so ISR keeps the last page that rendered", async () => {
    results.push(new Error("connection refused"));
    await expect(getCommunitySkills()).rejects.toThrow("connection refused");
  });

  it("render empty when a read fails during next build, which has no database", async () => {
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    results.push(new Error("connection refused"));
    expect(await getCommunitySkills()).toEqual([]);
    vi.unstubAllEnvs();
  });
});
