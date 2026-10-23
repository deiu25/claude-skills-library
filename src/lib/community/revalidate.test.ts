import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { revalidatePath } = await import("next/cache");
const { revalidateCommunity } = await import("./revalidate");

describe("revalidateCommunity", () => {
  it("marks every Community page stale: the browse page, every profile and every skill page", () => {
    revalidateCommunity();
    expect(vi.mocked(revalidatePath).mock.calls).toEqual([
      ["/community"],
      ["/u/[handle]", "page"],
      ["/u/[handle]/[slug]", "page"],
    ]);
  });
});
