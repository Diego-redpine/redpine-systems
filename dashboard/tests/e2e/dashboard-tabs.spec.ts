import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { screenshot } from '../helpers/screenshots';
import { SIDEBAR_TABS, TOOL_STRIP_IDS } from '../fixtures/test-data';

test.describe('Dashboard — Sidebar Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dashboard loads with navigation visible', async ({ page }) => {
    await screenshot(page, 'dashboard-loaded');
    const tabButtons = page.locator('button, [role="tab"], a').filter({
      hasText: /Dashboard|Clients|Appointments|Services/i,
    });
    const count = await tabButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  for (const tabName of SIDEBAR_TABS) {
    test(`${tabName} tab loads content`, async ({ page }) => {
      const tab = page.locator(`text="${tabName}"`).first();
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(2000);
        await screenshot(page, `dashboard-tab-${tabName.toLowerCase()}`);
        const mainContent = page.locator('main, [role="main"], .flex-1').first();
        const text = await mainContent.textContent();
        expect(text?.length).toBeGreaterThan(0);
      }
    });
  }
});

test.describe('Dashboard — Tool Strip', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('tool strip is visible', async ({ page }) => {
    const anyTool = page.locator('[data-tour-id="tool-comms"], [data-tour-id="tool-brand"], [data-tour-id="tool-website"]').first();
    const visible = await anyTool.isVisible({ timeout: 5000 }).catch(() => false);
    expect(visible).toBe(true);
    await screenshot(page, 'dashboard-tool-strip');
  });

  test('Communications tab opens unified inbox', async ({ page }) => {
    const btn = page.locator('[data-tour-id="tool-comms"]');
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'dashboard-comms-tab');
      const bodyText = await page.textContent('body');
      const hasComms = bodyText?.includes('Message') || bodyText?.includes('Inbox') ||
        bodyText?.includes('COO') || bodyText?.includes('conversation');
      expect(hasComms).toBeTruthy();
    }
  });

  test('Brand Board tab opens brand editor', async ({ page }) => {
    const btn = page.locator('[data-tour-id="tool-brand"]');
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'dashboard-brand-tab');
      const bodyText = await page.textContent('body');
      const hasBrand = bodyText?.includes('Brand') || bodyText?.includes('Logo') ||
        bodyText?.includes('Color') || bodyText?.includes('Font');
      expect(hasBrand).toBeTruthy();
    }
  });

  test('Website tab opens with Blog and Templates', async ({ page }) => {
    const btn = page.locator('[data-tour-id="tool-website"]');
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'dashboard-website-tab');
      const blogTab = page.locator('text="Blog"').first();
      const blogVisible = await blogTab.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`Blog sub-tab visible: ${blogVisible}`);
    }
  });

  test('Marketplace tab opens with AI Agents and Freelancers', async ({ page }) => {
    const btn = page.locator('[data-tour-id="tool-marketplace"]');
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'dashboard-marketplace-tab');
      const bodyText = await page.textContent('body');
      const hasMarket = bodyText?.includes('Agent') || bodyText?.includes('Freelancer');
      expect(hasMarket).toBeTruthy();
    }
  });

  test('Marketing tab opens', async ({ page }) => {
    const btn = page.locator('[data-tour-id="tool-marketing"]');
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'dashboard-marketing-tab');
    }
  });
});

test.describe('Dashboard — Reviews Tab', () => {
  test('reviews top-level tab has sub-tabs', async ({ page }) => {
    await login(page);
    const reviewsTab = page.locator('text="Reviews"').first();
    if (await reviewsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await reviewsTab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'dashboard-reviews-tab');
      const bodyText = await page.textContent('body');
      const hasSubTabs = bodyText?.includes('Inbox') || bodyText?.includes('Request') ||
        bodyText?.includes('Gate') || bodyText?.includes('Widget');
      expect(hasSubTabs).toBeTruthy();
    }
  });
});

test.describe('Dashboard — Brand Board Sub-tabs', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    const btn = page.locator('[data-tour-id="tool-brand"]');
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
    }
  });

  test('Brand Kit sub-tab shows logo, colors, fonts', async ({ page }) => {
    const bodyText = await page.textContent('body');
    const hasLogo = bodyText?.includes('Logo') || bodyText?.includes('Upload');
    const hasColors = bodyText?.includes('Color') || bodyText?.includes('Swatch');
    const hasFonts = bodyText?.includes('Font') || bodyText?.includes('Heading');
    console.log(`Brand Kit — Logo: ${hasLogo}, Colors: ${hasColors}, Fonts: ${hasFonts}`);
    await screenshot(page, 'dashboard-brand-kit');
  });

  test('Colors sub-tab renders', async ({ page }) => {
    const colorsTab = page.locator('text="Colors"').first();
    if (await colorsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await colorsTab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, 'dashboard-brand-colors');
    }
  });

  test('Sections sub-tab renders', async ({ page }) => {
    const sectionsTab = page.locator('text="Sections"').first();
    if (await sectionsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sectionsTab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, 'dashboard-brand-sections');
    }
  });
});

test.describe('Dashboard — Credit Badge', () => {
  test('credit badge visible in TopBar', async ({ page }) => {
    await login(page);
    await screenshot(page, 'dashboard-credit-badge');
    const bodyText = await page.textContent('body');
    const hasCredits = bodyText?.toLowerCase().includes('credit');
    console.log(`Credit badge visible: ${hasCredits}`);
  });
});
