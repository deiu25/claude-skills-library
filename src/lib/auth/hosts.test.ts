import { afterEach, describe, expect, it, vi } from "vitest";

// allowedHosts is read once, when the module loads, so each case loads it again under its own env.
async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  return import("./hosts");
}

afterEach(() => vi.unstubAllEnvs());

describe("siteOrigin", () => {
  it("accepts only localhost:3000, over http, off Vercel", async () => {
    const { siteOrigin } = await load({ VERCEL_ENV: "" });
    expect(siteOrigin("localhost:3000")).toBe("http://localhost:3000");
    expect(siteOrigin("localhost:3001")).toBeNull();
    expect(siteOrigin("skillcellar.com")).toBeNull();
  });

  it("accepts Vercel's own hosts for the deployment, over https, and nothing else", async () => {
    const { siteOrigin } = await load({
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "skillcellar.com",
      VERCEL_BRANCH_URL: "app-git-feat-x.vercel.app",
      VERCEL_URL: "app-abc123.vercel.app",
    });
    expect(siteOrigin("skillcellar.com")).toBe("https://skillcellar.com");
    expect(siteOrigin("app-git-feat-x.vercel.app")).toBe("https://app-git-feat-x.vercel.app");
    expect(siteOrigin("app-abc123.vercel.app")).toBe("https://app-abc123.vercel.app");
    for (const host of ["evil.example", "SKILLCELLAR.COM", "skillcellar.com:443", "skillcellar.com.evil.example", "localhost:3000", "", null]) {
      expect(siteOrigin(host)).toBeNull();
    }
  });
});
