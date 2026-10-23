import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

const { revalidatePath, revalidateTag } = await import("next/cache");
const { COMMUNITY_TAG, revalidateCommunity } = await import("./revalidate");

describe("revalidateCommunity", () => {
  it("marks every Community page stale: the browse page, every profile and every skill page", () => {
    revalidateCommunity();
    expect(vi.mocked(revalidatePath).mock.calls).toEqual([
      ["/community"],
      ["/u/[handle]", "page"],
      ["/u/[handle]/[slug]", "page"],
    ]);
  });

  it("expires the sitemap's cached read at once, not on its next visit", () => {
    revalidateCommunity();
    expect(revalidateTag).toHaveBeenCalledWith(COMMUNITY_TAG, { expire: 0 });
  });
});
