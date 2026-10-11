import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { remove, where } = vi.hoisted(() => {
  const where = vi.fn();
  return { where, remove: vi.fn(() => ({ where })) };
});

vi.mock("@/lib/db", () => ({ db: { delete: remove } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("./auth", () => ({ auth: { api: {} } }));
vi.mock("./session", () => ({
  requireSession: vi.fn(async () => ({ session: { id: "current" }, user: { id: "user-1" } })),
}));

const { revokeOtherSessions, revokeSession } = await import("./actions");

/** The WHERE clause a delete ran with, as SQL text and parameters. */
const whereClause = () => new PgDialect().sqlToQuery(where.mock.calls[0][0]);

describe("revokeSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuses this browser's own session and anything that is not an id, before touching the database", async () => {
    for (const id of ["current", "", 42, null, { id: "x" }]) {
      expect(await revokeSession(id)).toEqual({ ok: false, error: "Choose one of your other sessions." });
    }
    expect(remove).not.toHaveBeenCalled();
  });

  it("deletes another session, scoped to the signed-in user", async () => {
    expect(await revokeSession("other")).toEqual({ ok: true });
    expect(remove).toHaveBeenCalledTimes(1);
    expect(whereClause()).toMatchObject({
      sql: '("session"."id" = $1 and "session"."user_id" = $2)',
      params: ["other", "user-1"],
    });
  });
});

describe("revokeOtherSessions", () => {
  it("deletes in one statement and reports success", async () => {
    vi.clearAllMocks();
    expect(await revokeOtherSessions()).toEqual({ ok: true });
    expect(remove).toHaveBeenCalledTimes(1);
    expect(whereClause()).toMatchObject({
      sql: '("session"."user_id" = $1 and "session"."id" <> $2)',
      params: ["user-1", "current"],
    });
  });
});
