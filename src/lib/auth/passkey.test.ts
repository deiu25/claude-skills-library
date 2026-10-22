import { passkey } from "@better-auth/passkey";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { describe, expect, it } from "vitest";
import { requirePasskeyUserVerification } from "./passkey";

const BASE = "http://localhost:3000";

function authWith(hooks: BetterAuthOptions["hooks"]) {
  return betterAuth({
    baseURL: BASE,
    secret: "passkey-test-secret-at-least-32-characters",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [], passkey: [] }),
    plugins: [passkey()],
    hooks,
  });
}

async function signInOptions(hooks: BetterAuthOptions["hooks"]) {
  const response = await authWith(hooks).handler(
    new Request(`${BASE}/api/auth/passkey/generate-authenticate-options`),
  );
  return { status: response.status, options: await response.json(), cookie: response.headers.get("set-cookie") ?? "" };
}

describe("requirePasskeyUserVerification", () => {
  it("makes the sign-in options require user verification and keeps the challenge cookie", async () => {
    const { status, options, cookie } = await signInOptions({ after: requirePasskeyUserVerification });
    expect(status).toBe(200);
    expect(options.userVerification).toBe("required");
    expect(options.challenge).toEqual(expect.any(String));
    expect(cookie).toContain("better-auth-passkey=");
  });

  it("leaves other endpoints alone", async () => {
    const response = await authWith({ after: requirePasskeyUserVerification }).handler(new Request(`${BASE}/api/auth/ok`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("is still needed: the plugin alone asks for 'preferred' (when this fails, the hook can go)", async () => {
    const { options } = await signInOptions({});
    expect(options.userVerification).toBe("preferred");
  });
});
