import { test, expect } from '@playwright/test';
import { argosScreenshot } from "@argos-ci/playwright";

test('has title', async ({ page }) => {
  await page.goto('/');
  await argosScreenshot(page, "homepage");
  const header = page.locator('h1');
  await expect(header).toHaveText('工作時間記錄器');
});
