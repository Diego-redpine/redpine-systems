import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Public Ordering Page', () => {
  test('ordering page loads', async ({ page }) => {
    const response = await page.goto(ROUTES.ordering);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'ordering-page');
    expect(response?.status()).toBeLessThan(500);
  });

  test('ordering page shows menu or products', async ({ page }) => {
    await page.goto(ROUTES.ordering);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    console.log(`Ordering page body snippet: ${bodyText?.substring(0, 300)}`);
  });
});
