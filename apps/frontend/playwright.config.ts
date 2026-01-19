import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config optimized for fast smoke tests.
 * - Single browser (Chromium) for speed
 * - Parallel execution enabled
 * - Short timeouts for quick failure detection
 * - Runs against local dev server
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start dev server before tests
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },

  // Fast timeouts - smoke tests should be quick
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});
