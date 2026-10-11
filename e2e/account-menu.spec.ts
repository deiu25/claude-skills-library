import { expect, test, type Page } from "@playwright/test";

const SESSION = {
  session: {
    id: "session-1",
    token: "token-1",
    userId: "user-1",
    expiresAt: "2099-01-01T00:00:00.000Z",
    createdAt: "2026-10-11T00:00:00.000Z",
    updatedAt: "2026-10-11T00:00:00.000Z",
    ipAddress: null,
    userAgent: null,
  },
  user: {
    id: "user-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    emailVerified: true,
    image: null,
    createdAt: "2026-10-11T00:00:00.000Z",
    updatedAt: "2026-10-11T00:00:00.000Z",
  },
};

/** Loads `path` as a browser that has signed in before, with the session endpoint answering `session`. */
async function openSignedIn(page: Page, path: string, session: typeof SESSION | null) {
  await page.route("**/api/auth/get-session*", (route) => route.fulfill({ json: session }));
  await page.goto(path);
  await page.evaluate(() => localStorage.setItem("signedIn", "1"));
  await page.reload();
}

const flag = (page: Page) => page.evaluate(() => localStorage.getItem("signedIn"));

test("a browser that has signed in before gets the account menu", async ({ page }) => {
  await openSignedIn(page, "/", SESSION);

  const account = page.getByRole("button", { name: "Account", exact: true });
  await expect(account).toHaveText("A");
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveCount(0);

  await account.click();
  await expect(account).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("ada@example.com")).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toHaveCount(0);
  await expect(account).toBeFocused();
});

test("an empty session clears the flag and brings back the sign-in link", async ({ page }) => {
  await openSignedIn(page, "/", null);

  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Account", exact: true })).toHaveCount(0);
  expect(await flag(page)).toBeNull();
});

test("signing out from the menu clears the flag and lands on the home page", async ({ page }) => {
  await openSignedIn(page, "/report", SESSION);

  await page.getByRole("button", { name: "Account", exact: true }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
  expect(await flag(page)).toBeNull();
});
