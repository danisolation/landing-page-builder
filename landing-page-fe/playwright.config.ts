import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // Start FE + BE servers before running tests
  webServer: [
    {
      command: 'cd ../landing-page-be && npm run start:dev',
      port: 3000,
      reuseExistingServer: true,
      timeout: 30000,
      env: {
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/landing_page_db',
        JWT_SECRET: process.env.JWT_SECRET || 'test-secret',
      },
    },
    {
      command: 'npm run dev',
      port: 3001,
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
});
