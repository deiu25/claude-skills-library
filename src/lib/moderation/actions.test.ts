import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A stand-in for a drizzle query builder: every method records its call and returns the builder,
 * and awaiting it resolves to the next queued result, or rejects with a queued Error.
 */
const { calls, results, builder } = vi.hoisted(() => {
  const calls: { method: string; args: unknown[] }[] = [];
  const results: unknown[] = [];
  const builder: unknown = new Proxy(() => {}, {
    get(_target, property) {
      if (property === "then") {
        return (resolve: (value: unknown) => void, reject: (error: unknown) => void) => {
          const next = results.length ? results.shift() : [];
          return next instanceof Error ? reject(next) : resolve(next);
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

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => (builder as { select: (...a: unknown[]) => unknown }).select(...args),
    insert: (...args: unknown[]) => (builder as { insert: (...a: unknown[]) => unknown }).insert(...args),
    update: (...args: unknown[]) => (builder as { update: (...a: unknown[]) => unknown }).update(...args),
    transaction: async (run: (tx: unknown) => unknown) => run(builder),
  },
}));
vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ isAdmin: (id: string) => id === "admin-1" }));
vi.mock("@/lib/auth/auth", () => ({ auth: { api: { banUser: vi.fn(), unbanUser: vi.fn() } } }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(async () => "ok") }));
vi.mock("@/lib/community/revalidate", () => ({ revalidateCommunity: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers({ cookie: "session=admin" })) }));
vi.mock("@/lib/email", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/email")>()), sendEmail: vi.fn() }));
vi.mock("./queries", () => ({
  findReportTarget: vi.fn(),
  getAdminEmails: vi.fn(async () => ["admin@example.com"]),
  findSkillByAddress: vi.fn(),
  findUserByHandle: vi.fn(),
}));

const { getSession } = await import("@/lib/auth/session");
const { auth } = await import("@/lib/auth/auth");
const { rateLimit } = await import("@/lib/rate-limit");
const { revalidateCommunity } = await import("@/lib/community/revalidate");
const { sendEmail } = await import("@/lib/email");
const { findReportTarget, findUserByHandle } = await import("./queries");
const { decideReport, liftSuspension, submitReport, takeDown } = await import("./actions");

const REPORT_ID = "0d3b1f6e-5a7c-4e2b-8f9a-1c2d3e4f5a6b";
const SKILL_ID = "6f1c2a3e-8b4d-4f5a-9c7e-1d2b3c4d5e6f";
const NOT_ADMIN = { ok: false, error: "Only an admin can do this. If you are one, sign in again." };
const REASON = "install.sh uploads ~/.ssh to a remote server.";

const signedIn = (id: string, email = `${id}@example.com`) =>
  vi.mocked(getSession).mockResolvedValue({ user: { id, email } } as Awaited<ReturnType<typeof getSession>>);

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const REPORT_FORM = { targetType: "skill", targetKey: SKILL_ID, reason: "malware", details: REASON, goodFaith: "on" };

/** Every value an INSERT or an UPDATE … SET wrote. */
const written = (method: "values" | "set") => calls.filter((call) => call.method === method).map((call) => call.args[0]);
const emailsTo = () => vi.mocked(sendEmail).mock.calls.map(([message]) => [message.to, message.subject]);

beforeEach(() => {
  calls.length = 0;
  results.length = 0;
  vi.clearAllMocks();
  signedIn("admin-1", "admin@example.com");
});

describe("submitReport", () => {
  it("asks a signed-out visitor to sign in and stores nothing", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    expect(await submitReport(null, form(REPORT_FORM))).toEqual({ ok: false, error: "You are signed out. Sign in again, then send the report." });
    expect(calls).toEqual([]);
  });

  it("refuses past the rate limit", async () => {
    signedIn("ada");
    vi.mocked(rateLimit).mockResolvedValueOnce("limited");
    expect(await submitReport(null, form(REPORT_FORM))).toMatchObject({ ok: false, error: expect.stringMatching(/^Too many reports/) });
    expect(rateLimit).toHaveBeenCalledWith("report", "ada");
    expect(calls).toEqual([]);
  });

  it("needs the good-faith statement before anything is looked up", async () => {
    signedIn("ada");
    expect(await submitReport(null, form({ ...REPORT_FORM, goodFaith: "" }))).toMatchObject({ ok: false });
    expect(findReportTarget).not.toHaveBeenCalled();
  });

  it("refuses what the site no longer shows", async () => {
    signedIn("ada");
    vi.mocked(findReportTarget).mockResolvedValueOnce(null);
    expect(await submitReport(null, form(REPORT_FORM))).toMatchObject({ ok: false, error: expect.stringMatching(/no longer shown/) });
    expect(written("values")).toEqual([]);
  });

  it("stores the report as its sender's, then emails a receipt and every admin", async () => {
    signedIn("ada", "ada@example.com");
    vi.mocked(findReportTarget).mockResolvedValueOnce({ type: "skill", id: SKILL_ID, name: "pdf-forms", path: "/u/bob/pdf-forms" });
    // The sender's open reports, any other report waiting from the last hour, then the insert.
    results.push([{ open: 0 }], [], [{ id: REPORT_ID }]);
    expect(await submitReport(null, form(REPORT_FORM))).toMatchObject({ ok: true });
    expect(written("values")).toEqual([{ reporterId: "ada", targetType: "skill", targetId: SKILL_ID, reason: "malware", details: REASON }]);
    expect(emailsTo()).toEqual([
      ["ada@example.com", "We received your report"],
      ["admin@example.com", expect.stringMatching(/^A report is waiting/)],
    ]);
  });

  it("tells the admins at most once while reports from the last hour wait", async () => {
    signedIn("ada", "ada@example.com");
    vi.mocked(findReportTarget).mockResolvedValueOnce({ type: "skill", id: SKILL_ID, name: "pdf-forms", path: "/u/bob/pdf-forms" });
    results.push([{ open: 0 }], [{ id: "an-earlier-report" }], [{ id: REPORT_ID }]);
    expect(await submitReport(null, form(REPORT_FORM))).toMatchObject({ ok: true });
    expect(emailsTo()).toEqual([["ada@example.com", "We received your report"]]);
  });

  it("refuses a sixth waiting report from one sender, before storing or emailing", async () => {
    signedIn("ada");
    vi.mocked(findReportTarget).mockResolvedValueOnce({ type: "skill", id: SKILL_ID, name: "pdf-forms", path: "/u/bob/pdf-forms" });
    results.push([{ open: 5 }]);
    expect(await submitReport(null, form(REPORT_FORM))).toMatchObject({ ok: false, error: expect.stringMatching(/^5 of your reports are waiting/) });
    expect(written("values")).toEqual([]);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("answers a second open report of the same target without storing it or emailing", async () => {
    signedIn("ada");
    vi.mocked(findReportTarget).mockResolvedValueOnce({ type: "skill", id: SKILL_ID, name: "pdf-forms", path: "/u/bob/pdf-forms" });
    results.push([{ open: 1 }], [], Object.assign(new Error("duplicate"), { cause: { code: "23505" } }));
    expect(await submitReport(null, form(REPORT_FORM))).toMatchObject({ ok: true, message: expect.stringMatching(/^You already reported this/) });
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

/** A skill as describeTarget reads it: still shown on the site unless the overrides say otherwise. */
const SHOWN_SKILL = { name: "pdf-forms", slug: "pdf-forms", status: "published", visibility: "public", handle: "bob", suspended: false };
const emailText = (to: string) => vi.mocked(sendEmail).mock.calls.find(([message]) => message.to === to)?.[0].text ?? "";

describe("moderation actions", () => {
  it("refuse anyone who is not an admin before touching anything", async () => {
    signedIn("ada");
    const decision = form({ decision: "remove", ground: "terms", explanation: REASON });
    expect(await decideReport(REPORT_ID, null, decision)).toEqual(NOT_ADMIN);
    expect(await takeDown(null, form({ target: "@bob", ground: "terms", explanation: REASON }))).toEqual(NOT_ADMIN);
    expect(await liftSuspension("bob-id")).toEqual(NOT_ADMIN);
    expect(calls).toEqual([]);
    expect(auth.api.banUser).not.toHaveBeenCalled();
    expect(auth.api.unbanUser).not.toHaveBeenCalled();
  });

  it("dismiss a report and tell its sender, with nothing else changed", async () => {
    results.push([{ targetType: "skill", targetId: SKILL_ID }], [SHOWN_SKILL], [{ reporterId: "ada" }], [{ email: "ada@example.com" }]);
    expect(await decideReport(REPORT_ID, null, form({ decision: "dismiss" }))).toMatchObject({ ok: true });
    expect(written("set")).toEqual([{ status: "dismissed", resolvedBy: "admin-1", resolvedAt: expect.any(Date) }]);
    expect(emailsTo()).toEqual([["ada@example.com", "Our decision on your report"]]);
    expect(emailText("ada@example.com")).toMatch(/decided not to act/);
    expect(revalidateCommunity).not.toHaveBeenCalled();
  });

  it("tell a report's sender that its target was gone, not that it broke nothing", async () => {
    results.push([{ targetType: "skill", targetId: SKILL_ID }], [], [{ reporterId: "ada" }], [{ email: "ada@example.com" }]);
    expect(await decideReport(REPORT_ID, null, form({ decision: "dismiss" }))).toMatchObject({ ok: true });
    expect(emailText("ada@example.com")).toMatch(/no longer on Claude Skills Library when we reviewed it/);
  });

  it("remove a reported skill with its stated reason, then email its owner and the report's sender", async () => {
    results.push(
      [{ targetType: "skill", targetId: SKILL_ID }],
      [SHOWN_SKILL],
      [{ name: "pdf-forms", ownerId: "bob-id" }],
      [{ email: "bob@example.com" }],
      [{ reporterId: "ada" }],
      [{ email: "ada@example.com" }],
    );
    const result = await decideReport(REPORT_ID, null, form({ decision: "remove", ground: "terms", explanation: REASON }));
    expect(result).toMatchObject({ ok: true });
    expect(written("set")).toEqual([
      { status: "removed", removalReason: `Breaks the terms of use: ${REASON}` },
      { status: "actioned", resolvedBy: "admin-1", resolvedAt: expect.any(Date) },
    ]);
    expect(revalidateCommunity).toHaveBeenCalled();
    expect(emailsTo()).toEqual([
      ["bob@example.com", "Your skill pdf-forms was removed from Claude Skills Library"],
      ["ada@example.com", "Our decision on your report"],
    ]);
  });

  it("do not remove a profile: an account is suspended instead", async () => {
    results.push([{ targetType: "user", targetId: "bob-id" }]);
    expect(await decideReport(REPORT_ID, null, form({ decision: "remove", ground: "terms", explanation: REASON }))).toMatchObject({
      ok: false,
      error: expect.stringMatching(/cannot be removed/),
    });
    expect(written("set")).toEqual([]);
  });

  it("never suspend an admin's account", async () => {
    vi.mocked(findUserByHandle).mockResolvedValueOnce({ id: "admin-1" });
    expect(await takeDown(null, form({ target: "@admin-handle", ground: "terms", explanation: REASON }))).toEqual({
      ok: false,
      error: "An admin's account cannot be suspended here.",
    });
    expect(auth.api.banUser).not.toHaveBeenCalled();
  });

  it("suspend through Better Auth with the admin's session, and hide the account's skills", async () => {
    vi.mocked(findUserByHandle).mockResolvedValueOnce({ id: "bob-id" });
    vi.mocked(auth.api.banUser).mockResolvedValueOnce({ user: { email: "bob@example.com" } } as Awaited<ReturnType<typeof auth.api.banUser>>);
    // The account, then describeTarget's read, then the reports about it and its skills: none open.
    results.push([{ handle: "bob", suspended: false }], [{ handle: "bob", suspended: false, hasPublic: true }], []);
    expect(await takeDown(null, form({ target: "@bob", ground: "illegal", explanation: REASON }))).toMatchObject({
      ok: true,
      message: expect.stringMatching(/^Suspended @bob/),
    });
    const [[call]] = vi.mocked(auth.api.banUser).mock.calls as unknown as [[{ body: unknown; headers: Headers }]];
    expect(call.body).toEqual({ userId: "bob-id", banReason: `Illegal content: ${REASON}` });
    expect(call.headers.get("cookie")).toBe("session=admin");
    expect(revalidateCommunity).toHaveBeenCalled();
    expect(emailsTo()).toEqual([["bob@example.com", "Your Claude Skills Library account is suspended"]]);
  });

  it("close the reports about an account already suspended, without suspending or emailing it again", async () => {
    results.push(
      [{ targetType: "skill", targetId: SKILL_ID }],
      [{ ownerId: "bob-id" }],
      [{ handle: "bob", suspended: true }],
      [{ handle: "bob", suspended: true, hasPublic: true }],
      [{ reporterId: "cy" }],
      [{ email: "cy@example.com" }],
    );
    expect(await decideReport(REPORT_ID, null, form({ decision: "suspend", ground: "terms", explanation: REASON }))).toMatchObject({
      ok: true,
      message: "@bob was already suspended; 1 report was closed.",
    });
    expect(auth.api.banUser).not.toHaveBeenCalled();
    expect(emailsTo()).toEqual([["cy@example.com", "Our decision on your report"]]);
  });

  it("refuse a take-down that names neither a skill's address nor an @username", async () => {
    for (const target of ["not a user", "bob", "https://skillcellar.com/u/bob"]) {
      expect(await takeDown(null, form({ target, ground: "terms", explanation: REASON }))).toMatchObject({
        ok: false,
        error: expect.stringMatching(/^Paste a skill's address/),
      });
    }
    expect(calls).toEqual([]);
  });

  it("lift a suspension and show the account's skills again", async () => {
    expect(await liftSuspension("bob-id")).toMatchObject({ ok: true });
    expect(vi.mocked(auth.api.unbanUser).mock.calls[0][0]).toMatchObject({ body: { userId: "bob-id" } });
    expect(revalidateCommunity).toHaveBeenCalled();
  });
});
