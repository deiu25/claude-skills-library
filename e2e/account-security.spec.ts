import { expect, test } from "@playwright/test";

// The suite runs without a database, so these mock /api/auth and check the browser side of P3:
// where each step leads, what it sends, and what it shows. Alerts are looked up inside <main>,
// because Next.js renders its own role="alert" route announcer.

test("a password sign-in that needs a second factor goes to the code step", async ({ page }) => {
  await page.route("**/api/auth/sign-in/email", (route) =>
    route.fulfill({ json: { twoFactorRedirect: true, twoFactorMethods: ["totp"] } }),
  );
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password", { exact: true }).fill("a long enough password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/two-factor$/);
});

test("the code step explains a wrong code and takes a backup code in any case", async ({ page }) => {
  await page.route("**/api/auth/two-factor/verify-totp", (route) =>
    route.fulfill({ status: 401, json: { code: "INVALID_CODE", message: "Invalid code" } }),
  );
  await page.route("**/api/auth/two-factor/verify-backup-code", (route) =>
    route.fulfill({ status: 401, json: { code: "INVALID_BACKUP_CODE", message: "Invalid backup code" } }),
  );
  await page.goto("/two-factor");
  await page.getByLabel("Code from your authenticator app").fill("123456");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(/did not match/);

  await page.getByRole("button", { name: "Use a backup code instead" }).click();
  await page.getByLabel("Backup code").fill("ABCDE-FGHJK");
  const sent = page.waitForRequest("**/api/auth/two-factor/verify-backup-code");
  await page.getByRole("button", { name: "Continue" }).click();
  expect((await sent).postDataJSON()).toEqual({ code: "abcde-fghjk" });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(/already used/);
});

test("sign-up asks for no password and emails a link to choose one", async ({ page }) => {
  await page.route("**/api/auth/sign-up/email", (route) => route.fulfill({ json: { token: null, user: { id: "user-1" } } }));
  await page.route("**/api/auth/request-password-reset", (route) => route.fulfill({ json: { status: true } }));
  await page.goto("/sign-up");
  await expect(page.locator('input[type="password"]')).toHaveCount(0);

  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  const sent = page.waitForRequest("**/api/auth/request-password-reset");
  await page.getByRole("button", { name: "Create account" }).click();
  expect((await sent).postDataJSON()).toEqual({ email: "ada@example.com", redirectTo: "/reset-password?new=1" });
  await expect(page.getByText(/We sent a link to/)).toBeVisible();
});
