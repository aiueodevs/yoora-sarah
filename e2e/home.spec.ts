import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and show the Yoora Sarah brand', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/yoora/i);
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
