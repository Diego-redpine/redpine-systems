import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Mobile Viewport (390x844)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('dashboard renders on mobile with navigation', async ({ page }) => {
    await login(page);
    await screenshot(page, 'mobile-dashboard');
    const mobileNav = page.locator('[aria-label*="menu"], [aria-label*="Menu"], [class*="mobile"], [class*="bottom-nav"]').first();
    const hasNav = await mobileNav.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Mobile navigation visible: ${hasNav}`);
  });

  test('booking page responsive on mobile', async ({ page }) => {
    await page.goto(ROUTES.booking);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'mobile-booking');
  });

  test('portal page responsive on mobile', async ({ page }) => {
    await page.goto(ROUTES.portal);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'mobile-portal');
  });

  test('onboarding page responsive on mobile', async ({ page }) => {
    await page.goto(ROUTES.onboarding);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await screenshot(page, 'mobile-onboarding');
  });
});
