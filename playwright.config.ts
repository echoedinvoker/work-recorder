import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:4173',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173/',
    timeout: 120 * 1000
  }
});
