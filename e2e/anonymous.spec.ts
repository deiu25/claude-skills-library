import { expect, test } from "@playwright/test";

// Public pages an anonymous visitor reaches. One skill page is added from the live catalog.
const PAGES = ["/", "/skills", "/community", "/recommend", "/report", "/privacy", "/terms", "/terms/marketplace"];

test("anonymous pages set no cookie and never call /api/auth", async ({ page, context }) => {
  const authRequests: string[] = [];
  const setCookies: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/auth")) authRequests.push(request.url());
  });
  page.on("response", async (response) => {
    const header = await response.headerValue("set-cookie");
    if (header) setCookies.push(`${response.url()}: ${header}`);
  });

  const { skills } = await (await page.request.get("/skills.json")).json();
  for (const path of [...PAGES, `/skills/${skills[0].slug}`]) {
    await page.goto(path);
    // Bring the footer into view so its links prefetch as well, then let the network settle.
    await page.mouse.wheel(0, 20_000);
    await page.waitForLoadState("networkidle");
  }

  expect(authRequests).toEqual([]);
  expect(setCookies).toEqual([]);
  expect(await context.cookies()).toEqual([]);
});

test("the header offers sign-in, not an account menu, to a new visitor", async ({ page }) => {
  await page.goto("/skills");
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Account", exact: true })).toHaveCount(0);
});

test("the dashboard sends an anonymous visitor to sign in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("button", { name: "Continue with GitHub" })).toBeVisible();
  for (const path of [
    "/dashboard/settings",
    "/dashboard/skills",
    "/dashboard/skills/new",
    "/dashboard/skills/6f1c2a3e-8b4d-4f5a-9c7e-1d2b3c4d5e6f",
    "/dashboard/admin",
    "/dashboard/sales",
    "/dashboard/sales/refresh",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/sign-in$/);
  }
});

test("account data endpoints refuse a request without a session", async ({ request }) => {
  expect((await request.get("/api/me/export")).status()).toBe(401);
  expect((await request.get("/api/cron/cleanup")).status()).toBe(401);
  // Signed out, only a published skill downloads; an id that cannot exist is refused before any read.
  expect((await request.get("/api/skills/not-a-skill/download")).status()).toBe(401);
});

test("a failed GitHub sign-in is explained without echoing the URL", async ({ page }) => {
  await page.goto("/sign-in?error=SIGN_UP_CLOSED&error_description=Call%20this%20number");
  await expect(page.getByText(/^Sign-up is invite-only for now/)).toBeVisible();
  await expect(page.getByText("Call this number")).toHaveCount(0);
});
