import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { atLeast } from "./timing";

describe("atLeast", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("holds a fast result until the floor has passed", async () => {
    let settled = false;
    const result = atLeast(500, Promise.resolve("done")).then((value) => {
      settled = true;
      return value;
    });
    await vi.advanceTimersByTimeAsync(499);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toBe("done");
  });

  it("holds a failure until the floor has passed too", async () => {
    let settled = false;
    const result = atLeast(500, Promise.reject(new Error("boom"))).catch((error: Error) => {
      settled = true;
      return error.message;
    });
    await vi.advanceTimersByTimeAsync(499);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toBe("boom");
  });

  it("adds nothing to work that takes longer than the floor", async () => {
    const slow = new Promise((resolve) => setTimeout(() => resolve("slow"), 800));
    const result = atLeast(500, slow);
    await vi.advanceTimersByTimeAsync(800);
    await expect(result).resolves.toBe("slow");
  });
});
