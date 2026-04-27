import { test, expect } from '@playwright/test';

test.describe('AI Stylist', () => {
  test('stylist page should load', async ({ page }) => {
    await page.goto('/stylist');
    await expect(page.locator('body')).toBeVisible();
  });
});
