import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:4173');
  const header = page.locator('h1');
  await expect(header).toHaveText('工作時間記錄器');
});
