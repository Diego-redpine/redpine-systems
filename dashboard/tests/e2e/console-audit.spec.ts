import { test } from '@playwright/test';
import { login } from '../helpers/auth';
import { ROUTES, SIDEBAR_TABS, TOOL_STRIP_IDS } from '../fixtures/test-data';

test.describe('Console Error Audit', () => {
  test('dashboard — collect console errors across all tabs', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

    await login(page);

    for (const name of SIDEBAR_TABS) {
      const tab = page.locator(`text="${name}"`).first();
      if (await tab.isVisible({ timeout: 1500 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1500);
      }
    }

    for (const tourId of TOOL_STRIP_IDS) {
      const btn = page.locator(`[data-tour-id="${tourId}"]`);
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(2000);
      }
    }

    console.log(`\n=== DASHBOARD CONSOLE ERRORS (${errors.length}) ===`);
    for (const err of errors.slice(0, 30)) {
      console.log(`  ERROR: ${err.substring(0, 200)}`);
    }
    console.log(`=== END ===\n`);
  });

  test('public pages — collect console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

    const publicRoutes = [ROUTES.booking, ROUTES.portal, ROUTES.onboarding, ROUTES.ordering];
    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForTimeout(3000);
    }

    console.log(`\n=== PUBLIC PAGE ERRORS (${errors.length}) ===`);
    for (const err of errors.slice(0, 30)) {
      console.log(`  ERROR: ${err.substring(0, 200)}`);
    }
    console.log(`=== END ===\n`);
  });
});

test.describe('Network Failure Audit', () => {
  test('dashboard — catch failed API calls', async ({ page }) => {
    const failedRequests: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    await login(page);

    for (const name of SIDEBAR_TABS) {
      const tab = page.locator(`text="${name}"`).first();
      if (await tab.isVisible({ timeout: 1500 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(2000);
      }
    }

    for (const tourId of TOOL_STRIP_IDS) {
      const btn = page.locator(`[data-tour-id="${tourId}"]`);
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(2000);
      }
    }

    console.log(`\n=== FAILED API CALLS (${failedRequests.length}) ===`);
    for (const req of failedRequests) {
      console.log(`  FAIL: ${req}`);
    }
    console.log(`=== END ===\n`);
  });
});
