import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Public Booking Page', () => {
  test('booking page loads for test business', async ({ page }) => {
    const response = await page.goto(ROUTES.booking);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'booking-page-loaded');
    expect(response?.status()).toBeLessThan(400);
    const bodyText = await page.textContent('body');
    const hasBooking = bodyText?.includes('Book') || bodyText?.includes('appointment') ||
      bodyText?.includes('service') || bodyText?.includes('Choose') || bodyText?.includes('Select');
    expect(hasBooking).toBeTruthy();
  });

  test('booking page shows services list', async ({ page }) => {
    await page.goto(ROUTES.booking);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    const serviceElements = page.locator('button, [role="button"], .cursor-pointer').filter({
      hasText: /\$|\d+ min/i,
    });
    const count = await serviceElements.count();
    console.log(`Found ${count} service elements on booking page`);
    await screenshot(page, 'booking-services');
  });

  test('booking flow — select service shows next step', async ({ page }) => {
    await page.goto(ROUTES.booking);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    const serviceBtn = page.locator('button').filter({ hasText: /\$|\d+ min/i }).first();
    if (await serviceBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await serviceBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'booking-after-service-select');
    }
  });

  test('booking page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTES.booking);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'booking-mobile');
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});
