import { expect, test } from "@playwright/test";

// The e2e build opens Community (ACCOUNTS_OPEN=true) with no database behind it.

test("Community builds and renders its empty state without a database", async ({ page }) => {
  await page.goto("/community");
  await expect(page.getByRole("heading", { level: 1, name: "Community" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No Community skills yet" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Your skills" })).toHaveAttribute("href", "/dashboard/skills");
});

test("the header links to Community once sign-up is open", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/skills");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Community", exact: true })).toBeVisible();
});

test("an address that cannot be a profile or a skill is a 404 without reading the database", async ({ request }) => {
  for (const path of ["/u/Not_A_Handle", "/u/ab", "/u/ada/Not_A_Skill", `/u/ada/${"a".repeat(65)}`]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test("a profile or skill whose read fails is an error, never a cached 404", async ({ request }) => {
  // ISR keeps serving the last page that rendered when a render throws; a 404 would be cached instead.
  expect((await request.get("/u/ada")).status()).toBe(500);
  expect((await request.get("/u/ada/pdf-forms")).status()).toBe(500);
});

test("the sitemap lists Community once it is open", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<loc>https://skillcellar.com/community</loc>");
});
