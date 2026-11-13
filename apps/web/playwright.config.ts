import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "pnpm --filter @calendar/api dev",
      reuseExistingServer: true,
      timeout: 60_000,
      url: "http://127.0.0.1:3000/api/health",
    },
    {
      command: "pnpm --filter @calendar/web dev",
      reuseExistingServer: true,
      timeout: 60_000,
      url: "http://127.0.0.1:5173",
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
