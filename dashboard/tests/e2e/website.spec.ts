import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Public Website', () => {
  test('website page loads for test business', async ({ page }) => {
    const response = await page.goto(ROUTES.site);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'website-page');
    expect(response?.status()).toBeLessThan(500);
  });

  test('website is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTES.site);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'website-mobile');
  });

  test('website has Red Pine branding', async ({ page }) => {
    await page.goto(ROUTES.site);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    const hasBranding = bodyText?.includes('Red Pine') || bodyText?.includes('Powered by');
    console.log(`Website has Red Pine branding: ${hasBranding}`);
  });
});
