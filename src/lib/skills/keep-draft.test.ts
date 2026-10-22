import { redirect } from "next/navigation";
import { describe, expect, it } from "vitest";
import { OFFLINE_MESSAGE } from "@/lib/auth/errors";
import { keepDraftOnFailure } from "./keep-draft";

describe("keepDraftOnFailure", () => {
  it("passes the action's result through", async () => {
    const action = keepDraftOnFailure(async (id: string) => ({ ok: true as const, message: `saved ${id}` }));
    expect(await action("a")).toEqual({ ok: true, message: "saved a" });
  });

  it("turns a failed request into a message the form can show", async () => {
    const action = keepDraftOnFailure(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(await action()).toEqual({ ok: false, error: OFFLINE_MESSAGE });
  });

  it("lets a redirect through to the router", async () => {
    const action = keepDraftOnFailure(async () => redirect("/dashboard/skills"));
    await expect(action()).rejects.toMatchObject({ digest: expect.stringMatching(/^NEXT_REDIRECT/) });
  });
});
