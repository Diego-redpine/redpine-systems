import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Public Review Page', () => {
  test('review page loads', async ({ page }) => {
    const response = await page.goto(ROUTES.review);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'review-page');
    expect(response?.status()).toBeLessThan(500);
  });
});
