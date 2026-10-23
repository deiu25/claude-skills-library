import { randomUUID } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

// Runs against a production build: static rendering and link prefetching only behave as in
// production there. No database is needed; tests that need a session mock /api/auth/get-session.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  use: {
    // Port 3000: the only local host the auth config accepts.
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      // Renders the "Sign in" link and the GitHub button, so the tests cover their prefetches too.
      NEXT_PUBLIC_ACCOUNTS_OPEN: "true",
      // Opens the Community pages, so the build proves they render without a database.
      ACCOUNTS_OPEN: "true",
      // A port nothing listens on: every database read fails at once, as in an outage.
      DATABASE_URL: "postgres://e2e:e2e@127.0.0.1:1/e2e",
      GITHUB_CLIENT_ID: "e2e",
      GITHUB_CLIENT_SECRET: "e2e",
      BETTER_AUTH_SECRET: randomUUID() + randomUUID(),
    },
  },
});
