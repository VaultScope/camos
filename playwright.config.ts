import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for VaultScope Admin E2E tests
 * Tests run against Docker containers at localhost:3001
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially (auth state dependencies)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid auth conflicts
  timeout: 60000, // 60 seconds per test (includes login time)
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000, // 15 seconds for individual actions
    navigationTimeout: 20000, // 20 seconds for navigation
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'echo "Tests expect Docker containers to be running"',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 5000,
  },
});
