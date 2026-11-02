import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:4311';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: 'list',
  expect: { timeout: 15_000 },
  use: { baseURL },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx serve@14.2.4 .output/public -l 4311',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
