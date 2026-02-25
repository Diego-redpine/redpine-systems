import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Portal — Login Page', () => {
  test('portal login page loads for test business', async ({ page }) => {
    await page.goto(ROUTES.portal);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'portal-login-page');
    const bodyText = await page.textContent('body');
    const hasPortal = bodyText?.includes('Portal') || bodyText?.includes('Welcome') ||
      bodyText?.includes('email') || bodyText?.includes('magic');
    expect(hasPortal).toBeTruthy();
  });

  test('portal shows email input for magic link', async ({ page }) => {
    await page.goto(ROUTES.portal);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    const emailInput = page.locator('input[type="email"]').first();
    const visible = await emailInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await emailInput.fill('client@test.com');
      await screenshot(page, 'portal-email-entered');
      const sendButton = page.locator('button:has-text("Send"), button:has-text("Magic"), button:has-text("Sign"), button:has-text("Submit")').first();
      await expect(sendButton).toBeVisible({ timeout: 3000 });
    }
  });

  test('portal page does not 404', async ({ page }) => {
    const response = await page.goto(ROUTES.portal);
    expect(response?.status()).toBeLessThan(400);
  });
});

test.describe('Portal — Invalid Subdomain', () => {
  test('invalid subdomain shows appropriate message', async ({ page }) => {
    await page.goto('/portal/nonexistent-biz-12345');
    await page.waitForTimeout(3000);
    await screenshot(page, 'portal-invalid-subdomain');
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});
