import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Public Forms Page', () => {
  test('form page loads', async ({ page }) => {
    const response = await page.goto(ROUTES.form);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'form-page');
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Public E-Signature Page', () => {
  test('signature page loads', async ({ page }) => {
    const response = await page.goto(ROUTES.sign);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'sign-page');
    expect(response?.status()).toBeLessThan(500);
  });
});
