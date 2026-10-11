import { expect, test } from "@playwright/test";

// Public pages an anonymous visitor reaches. One skill page is added from the live catalog.
const PAGES = ["/", "/skills", "/recommend", "/report", "/privacy", "/terms"];

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
});

test("a failed GitHub sign-in is explained without echoing the URL", async ({ page }) => {
  await page.goto("/sign-in?error=SIGN_UP_CLOSED&error_description=Call%20this%20number");
  await expect(page.getByText(/^Sign-up is invite-only for now/)).toBeVisible();
  await expect(page.getByText("Call this number")).toHaveCount(0);
});
