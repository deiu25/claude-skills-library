import { describe, expect, it } from "vitest";
import { isCronRequest } from "./cron";

const SECRET = "s3cret-value-of-some-length";

describe("isCronRequest", () => {
  it("accepts the bearer token Vercel Cron sends", () => {
    expect(isCronRequest(`Bearer ${SECRET}`, SECRET)).toBe(true);
  });

  it("refuses a missing, wrong or differently sized header", () => {
    expect(isCronRequest(null, SECRET)).toBe(false);
    expect(isCronRequest(SECRET, SECRET)).toBe(false);
    expect(isCronRequest(`Bearer ${SECRET}x`, SECRET)).toBe(false);
    expect(isCronRequest(`Bearer ${SECRET.replace("s", "S")}`, SECRET)).toBe(false);
  });

  it("refuses everything while the secret is unset", () => {
    expect(isCronRequest("Bearer ", undefined)).toBe(false);
    expect(isCronRequest("Bearer ", "")).toBe(false);
  });
});
