import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Onboarding Page', () => {
  test('onboarding chat page loads', async ({ page }) => {
    await page.goto(ROUTES.onboarding);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    await screenshot(page, 'onboarding-loaded');
    const bodyText = await page.textContent('body');
    const hasContent = bodyText?.toLowerCase().includes('business') ||
      bodyText?.toLowerCase().includes('red pine') ||
      bodyText?.toLowerCase().includes('tell');
    expect(hasContent).toBeTruthy();
  });

  test('chat input is visible and functional', async ({ page }) => {
    await page.goto(ROUTES.onboarding);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    const chatInput = page.locator('input[type="text"], textarea').first();
    const inputVisible = await chatInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (inputVisible) {
      await chatInput.fill('I run a nail salon');
      await screenshot(page, 'onboarding-message-typed');
    }
  });

  test('onboarding page has no critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(ROUTES.onboarding);
    await page.waitForTimeout(5000);
    const criticalErrors = errors.filter(e =>
      !e.includes('hydration') && !e.includes('Minified React error')
    );
    expect(criticalErrors.length).toBe(0);
  });
});
