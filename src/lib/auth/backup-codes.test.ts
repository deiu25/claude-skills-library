import { describe, expect, it } from "vitest";
import { generateBackupCodes } from "./backup-codes";

describe("generateBackupCodes", () => {
  it("makes ten distinct codes of two lowercase groups, without look-alike characters", () => {
    const codes = generateBackupCodes();
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    for (const code of codes) expect(code).toMatch(/^[a-hj-km-np-z2-9]{5}-[a-hj-km-np-z2-9]{5}$/);
  });
});
