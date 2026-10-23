import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** A stand-in for a drizzle query builder that records each call and resolves to the next queued result. */
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

vi.mock("@/lib/db", () => ({
  db: new Proxy({}, { get: (_target, property) => (...args: unknown[]) => (builder as Record<string, (...a: unknown[]) => unknown>)[property as string](...args) }),
}));

const { HOLDS_PER_ACCOUNT, holdEnds, holdUsername, isUsernameHeld, USERNAME_HOLD_DAYS } = await import("./username-hold");

const NOW = new Date("2026-10-23T12:00:00Z");
const whereSql = () => {
  const where = calls.filter((call) => call.method === "where").map((call) => new PgDialect().sqlToQuery(call.args[0] as SQL));
  return where.map(({ sql, params }) => ({ sql, params }));
};

beforeEach(() => {
  calls.length = 0;
  results.length = 0;
});

describe("isUsernameHeld", () => {
  it("counts every live hold at sign-up, when there is no account yet", async () => {
    results.push([{ username: "ada" }]);
    expect(await isUsernameHeld("ada", null, NOW)).toBe(true);
    const [where] = whereSql();
    expect(where.sql).not.toContain("user_id");
    expect(where.params).toEqual(["ada", NOW.toISOString()]);
  });

  it("lets the account that gave a name up take it back, and nobody else", async () => {
    results.push([]);
    expect(await isUsernameHeld("ada", "user-1", NOW)).toBe(false);
    const [where] = whereSql();
    expect(where.sql).toContain(`("username_hold"."user_id" is null or "username_hold"."user_id" <> $3)`);
    expect(where.params).toEqual(["ada", NOW.toISOString(), "user-1"]);
  });
});

describe("holdUsername", () => {
  it(`holds a name for ${USERNAME_HOLD_DAYS} days, then keeps only the account's newest ${HOLDS_PER_ACCOUNT}`, async () => {
    await holdUsername("ada", "user-1", NOW);
    const [values] = calls.filter((call) => call.method === "values").map((call) => call.args[0]);
    expect(values).toEqual({ username: "ada", userId: "user-1", heldUntil: holdEnds(NOW) });
    expect(holdEnds(NOW).toISOString()).toBe("2027-01-21T12:00:00.000Z");
    // The newest holds are a subquery of the delete, which the stand-in builder cannot render, so
    // the calls are read in order instead.
    expect(calls.map((call) => call.method)).toEqual([
      "insert", "values", "onConflictDoUpdate",
      "select", "from", "where", "orderBy", "limit",
      "delete", "where",
    ]);
    const newestWhere = new PgDialect().sqlToQuery(calls.find((call) => call.method === "where")!.args[0] as SQL);
    expect(newestWhere).toMatchObject({ sql: `"username_hold"."user_id" = $1`, params: ["user-1"] });
    expect(calls.find((call) => call.method === "limit")?.args).toEqual([HOLDS_PER_ACCOUNT]);
  });
});
