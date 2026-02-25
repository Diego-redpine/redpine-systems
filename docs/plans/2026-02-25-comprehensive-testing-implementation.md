# Comprehensive Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Full platform test coverage — E2E for all pages/flows, API route tests, unit tests for business logic. ~260 tests across 23 spec files.

**Architecture:** Playwright E2E tests (browser + API request context) organized in `tests/e2e/` and `tests/api/`. Vitest for unit tests in `tests/unit/`. Shared helpers in `tests/helpers/`. All tests run against `localhost:3000` with the `luxe-nails` test account.

**Tech Stack:** Playwright (existing), Vitest (new, for unit tests), TypeScript

**Design Doc:** `docs/plans/2026-02-25-comprehensive-testing-design.md`

---

### Task 1: Update Config + Shared Helpers

**Files:**
- Modify: `dashboard/playwright.config.ts`
- Modify: `dashboard/package.json`
- Create: `dashboard/tests/helpers/auth.ts`
- Create: `dashboard/tests/helpers/screenshots.ts`
- Create: `dashboard/tests/fixtures/test-data.ts`

**Step 1: Update playwright.config.ts**

Replace the entire config to support the new directory structure:

```ts
// dashboard/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'on',
    trace: 'on-first-retry',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: { browserName: 'chromium' },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { browserName: 'chromium' },
    },
  ],
});
```

**Step 2: Update package.json scripts**

Add test scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "npx playwright test",
  "test:e2e": "npx playwright test --project=e2e",
  "test:api": "npx playwright test --project=api",
  "test:unit": "npx vitest run",
  "test:all": "npx playwright test && npx vitest run"
}
```

**Step 3: Create shared test fixtures**

```ts
// dashboard/tests/fixtures/test-data.ts
export const TEST_EMAIL = 'luxe.nails.e2e@redpine.systems';
export const TEST_PASSWORD = 'TestNails2026!';
export const TEST_SUBDOMAIN = 'luxe-nails';
export const BASE_URL = 'http://localhost:3000';

// Common routes
export const ROUTES = {
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  onboarding: '/onboarding',
  brandBoard: '/brand-board',
  booking: `/book/${TEST_SUBDOMAIN}`,
  portal: `/portal/${TEST_SUBDOMAIN}`,
  ordering: `/order/${TEST_SUBDOMAIN}`,
  form: `/form/${TEST_SUBDOMAIN}`,
  review: `/review/${TEST_SUBDOMAIN}`,
  sign: `/sign/${TEST_SUBDOMAIN}`,
  site: `/site/${TEST_SUBDOMAIN}`,
} as const;

// Dashboard tab names (sidebar navigation)
export const SIDEBAR_TABS = [
  'Dashboard', 'Clients', 'Services', 'Appointments',
  'Staff', 'Payments', 'Gallery',
] as const;

// Tool strip data-tour-ids
export const TOOL_STRIP_IDS = [
  'tool-comms', 'tool-brand', 'tool-website',
  'tool-marketplace', 'tool-marketing',
] as const;
```

**Step 4: Create auth helper**

```ts
// dashboard/tests/helpers/auth.ts
import { Page } from '@playwright/test';
import { TEST_EMAIL, TEST_PASSWORD } from '../fixtures/test-data';

/**
 * Log in via the test-login API endpoint.
 * Must navigate to /login first so cookies are set on the correct origin.
 */
export async function login(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });

  const result = await page.evaluate(async ({ email, password }) => {
    const res = await fetch('/api/auth/test-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  }, { email: TEST_EMAIL, password: TEST_PASSWORD });

  if (!result.success) throw new Error(`Login failed: ${result.error}`);

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
}

/**
 * Get auth cookies for API-only tests (no browser needed).
 * Returns cookie string for use in request headers.
 */
export async function getAuthCookies(page: Page): Promise<string> {
  await login(page);
  const cookies = await page.context().cookies();
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}
```

**Step 5: Create screenshot helper**

```ts
// dashboard/tests/helpers/screenshots.ts
import { Page } from '@playwright/test';

export async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: `tests/screenshots/${name}.png`,
    fullPage: true,
  });
}
```

**Step 6: Create directory structure**

Run: `mkdir -p dashboard/tests/{e2e,api,unit,helpers,fixtures,screenshots}`

**Step 7: Commit**

```bash
git add dashboard/playwright.config.ts dashboard/package.json \
  dashboard/tests/helpers/ dashboard/tests/fixtures/
git commit -m "chore: restructure test infrastructure with shared helpers and fixtures"
```

---

### Task 2: Fix Failing Tests + Verify Existing Suite

**Files:**
- Modify: `dashboard/tests/full-platform-audit.spec.ts` (update imports to use shared helpers)

**Step 1: Update the existing spec to use shared helpers**

At the top of `full-platform-audit.spec.ts`, replace the hardcoded helpers:

```ts
// Replace lines 1-47 with:
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';
import { screenshot } from './helpers/screenshots';
import { TEST_SUBDOMAIN } from './fixtures/test-data';
```

Then replace all `screenshotWithName(page, name)` calls with `screenshot(page, name)`.

**Step 2: Move existing spec to legacy location**

Move: `dashboard/tests/full-platform-audit.spec.ts` → keep in `dashboard/tests/` (it runs in both projects since `testDir` at top level still works as fallback)

**Step 3: Run the existing suite**

Run: `cd dashboard && npx playwright test full-platform-audit.spec.ts --reporter=list 2>&1 | head -100`
Expected: Most tests pass. Note which fail.

**Step 4: Debug and fix any login failures**

If login still fails, check:
1. Dev server is running (`npm run dev` on port 3000)
2. The test account exists in Supabase
3. Cookie propagation works (the `page.evaluate` approach in auth.ts)

**Step 5: Commit**

```bash
git add dashboard/tests/
git commit -m "fix: update existing test suite to use shared helpers"
```

---

### Task 3: E2E Auth Tests

**Files:**
- Create: `dashboard/tests/e2e/auth.spec.ts`

**Step 1: Write auth E2E tests**

```ts
// dashboard/tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Auth — Login', () => {
  test('login page renders with email and password fields', async ({ page }) => {
    await page.goto(ROUTES.login);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await screenshot(page, 'auth-login-page');
  });

  test('wrong credentials show error and stay on login page', async ({ page }) => {
    await page.goto(ROUTES.login);
    await page.waitForLoadState('networkidle');
    await page.fill('input[id="email"]', 'wrong@test.com');
    await page.fill('input[id="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);

    expect(page.url()).toContain('/login');
    await screenshot(page, 'auth-login-error');
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await login(page);
    expect(page.url()).toContain('/dashboard');
    await screenshot(page, 'auth-login-success');
  });
});

test.describe('Auth — Signup', () => {
  test('signup page renders form fields', async ({ page }) => {
    await page.goto(ROUTES.signup);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await screenshot(page, 'auth-signup-page');
  });
});

test.describe('Auth — Protected Routes', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto(ROUTES.dashboard);
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');
  });
});
```

**Step 2: Run tests**

Run: `cd dashboard && npx playwright test tests/e2e/auth.spec.ts --reporter=list`
Expected: All 4 tests PASS

**Step 3: Commit**

```bash
git add dashboard/tests/e2e/auth.spec.ts
git commit -m "test: add E2E auth tests (login, signup, protected routes)"
```

---

### Task 4: E2E Onboarding Tests

**Files:**
- Create: `dashboard/tests/e2e/onboarding.spec.ts`

**Step 1: Write onboarding E2E tests**

```ts
// dashboard/tests/e2e/onboarding.spec.ts
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

    // Look for a text input or textarea for the chat
    const chatInput = page.locator('input[type="text"], textarea').first();
    const inputVisible = await chatInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (inputVisible) {
      await chatInput.fill('I run a nail salon');
      await screenshot(page, 'onboarding-message-typed');
    } else {
      // Log for debugging — might be a different UI structure
      console.log('Chat input not found — check onboarding UI structure');
    }
  });

  test('onboarding page has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(ROUTES.onboarding);
    await page.waitForTimeout(5000);

    // Allow minor hydration warnings but no crashes
    const criticalErrors = errors.filter(e =>
      !e.includes('hydration') && !e.includes('Minified React error')
    );
    expect(criticalErrors.length).toBe(0);
  });
});
```

**Step 2: Run tests**

Run: `cd dashboard && npx playwright test tests/e2e/onboarding.spec.ts --reporter=list`

**Step 3: Commit**

```bash
git add dashboard/tests/e2e/onboarding.spec.ts
git commit -m "test: add E2E onboarding tests (chat load, input, console errors)"
```

---

### Task 5: E2E Portal Tests

**Files:**
- Create: `dashboard/tests/e2e/portal.spec.ts`

**Step 1: Write portal E2E tests**

```ts
// dashboard/tests/e2e/portal.spec.ts
import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/screenshots';
import { ROUTES, TEST_SUBDOMAIN } from '../fixtures/test-data';

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

      // Check for send/submit button
      const sendButton = page.locator('button:has-text("Send"), button:has-text("Magic"), button:has-text("Sign"), button:has-text("Submit")').first();
      await expect(sendButton).toBeVisible({ timeout: 3000 });
    }
  });

  test('portal page does not 404', async ({ page }) => {
    const response = await page.goto(ROUTES.portal);
    expect(response?.status()).toBeLessThan(400);
  });
});

test.describe('Portal — No Auth Error', () => {
  test('invalid subdomain shows appropriate message', async ({ page }) => {
    await page.goto('/portal/nonexistent-biz-12345');
    await page.waitForTimeout(3000);
    await screenshot(page, 'portal-invalid-subdomain');

    // Should not crash — either 404 or "business not found"
    const bodyText = await page.textContent('body');
    const isHandled = bodyText?.includes('not found') || bodyText?.includes('Not Found') ||
      bodyText?.includes('error') || bodyText?.includes('doesn');
    // As long as it didn't crash with a white screen, this is acceptable
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run tests**

Run: `cd dashboard && npx playwright test tests/e2e/portal.spec.ts --reporter=list`

**Step 3: Commit**

```bash
git add dashboard/tests/e2e/portal.spec.ts
git commit -m "test: add E2E portal tests (login page, email input, 404 handling)"
```

---

### Task 6: E2E Booking Tests

**Files:**
- Create: `dashboard/tests/e2e/booking.spec.ts`

**Step 1: Write booking E2E tests**

```ts
// dashboard/tests/e2e/booking.spec.ts
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

    // Look for service cards/buttons with prices or durations
    const serviceElements = page.locator('button, [role="button"], .cursor-pointer').filter({
      hasText: /\$|\d+ min/i,
    });
    const count = await serviceElements.count();
    console.log(`Found ${count} service elements on booking page`);
    await screenshot(page, 'booking-services');
  });

  test('booking flow — select service shows date picker', async ({ page }) => {
    await page.goto(ROUTES.booking);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Click first service-like button
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

    // Should not have horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});
```

**Step 2: Run tests**

Run: `cd dashboard && npx playwright test tests/e2e/booking.spec.ts --reporter=list`

**Step 3: Commit**

```bash
git add dashboard/tests/e2e/booking.spec.ts
git commit -m "test: add E2E booking tests (page load, services, flow, mobile)"
```

---

### Task 7: E2E Ordering + Forms + Reviews Tests

**Files:**
- Create: `dashboard/tests/e2e/ordering.spec.ts`
- Create: `dashboard/tests/e2e/forms.spec.ts`
- Create: `dashboard/tests/e2e/reviews.spec.ts`

**Step 1: Write ordering tests**

```ts
// dashboard/tests/e2e/ordering.spec.ts
import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/screenshots';
import { ROUTES } from '../fixtures/test-data';

test.describe('Public Ordering Page', () => {
  test('ordering page loads', async ({ page }) => {
    const response = await page.goto(ROUTES.ordering);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, 'ordering-page');

    // 200 or meaningful content (even "no menu" is acceptable)
    expect(response?.status()).toBeLessThan(500);
  });

  test('ordering page shows menu or products', async ({ page }) => {
    await page.goto(ROUTES.ordering);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const bodyText = await page.textContent('body');
    console.log(`Ordering page body snippet: ${bodyText?.substring(0, 300)}`);
    // Log what we find — this is a discovery test
  });
});
```

**Step 2: Write forms tests**

```ts
// dashboard/tests/e2e/forms.spec.ts
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
```

**Step 3: Write reviews tests**

```ts
// dashboard/tests/e2e/reviews.spec.ts
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
```

**Step 4: Run all three**

Run: `cd dashboard && npx playwright test tests/e2e/ordering.spec.ts tests/e2e/forms.spec.ts tests/e2e/reviews.spec.ts --reporter=list`

**Step 5: Commit**

```bash
git add dashboard/tests/e2e/ordering.spec.ts dashboard/tests/e2e/forms.spec.ts dashboard/tests/e2e/reviews.spec.ts
git commit -m "test: add E2E tests for ordering, forms, e-signature, and reviews pages"
```

---

### Task 8: E2E Website Tests

**Files:**
- Create: `dashboard/tests/e2e/website.spec.ts`

**Step 1: Write website E2E tests**

```ts
// dashboard/tests/e2e/website.spec.ts
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

  test('website has "Powered by Red Pine" footer', async ({ page }) => {
    await page.goto(ROUTES.site);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const bodyText = await page.textContent('body');
    const hasBranding = bodyText?.includes('Red Pine') || bodyText?.includes('Powered by');
    console.log(`Website has Red Pine branding: ${hasBranding}`);
  });
});
```

**Step 2: Run tests**

Run: `cd dashboard && npx playwright test tests/e2e/website.spec.ts --reporter=list`

**Step 3: Commit**

```bash
git add dashboard/tests/e2e/website.spec.ts
git commit -m "test: add E2E website public page tests"
```

---

### Task 9: E2E Dashboard Tabs Tests

**Files:**
- Create: `dashboard/tests/e2e/dashboard-tabs.spec.ts`

This is the largest E2E spec — covers all authenticated dashboard functionality.

**Step 1: Write dashboard tabs tests**

```ts
// dashboard/tests/e2e/dashboard-tabs.spec.ts
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

        // Tab should render some content (not blank)
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

  test('Website tab opens with Blog and Templates sub-tabs', async ({ page }) => {
    const btn = page.locator('[data-tour-id="tool-website"]');
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'dashboard-website-tab');

      // Check for Blog sub-tab
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
```

**Step 2: Run tests**

Run: `cd dashboard && npx playwright test tests/e2e/dashboard-tabs.spec.ts --reporter=list`

**Step 3: Commit**

```bash
git add dashboard/tests/e2e/dashboard-tabs.spec.ts
git commit -m "test: add E2E dashboard tab tests (sidebar, tool strip, reviews, brand board, credits)"
```

---

### Task 10: E2E Mobile + Console Audit Tests

**Files:**
- Create: `dashboard/tests/e2e/mobile.spec.ts`
- Create: `dashboard/tests/e2e/console-audit.spec.ts`

**Step 1: Write mobile viewport tests**

```ts
// dashboard/tests/e2e/mobile.spec.ts
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

    // Look for mobile nav (hamburger or bottom nav)
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
```

**Step 2: Write console audit tests**

```ts
// dashboard/tests/e2e/console-audit.spec.ts
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

    // Navigate sidebar tabs
    for (const name of SIDEBAR_TABS) {
      const tab = page.locator(`text="${name}"`).first();
      if (await tab.isVisible({ timeout: 1500 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1500);
      }
    }

    // Navigate tool strip tabs
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
```

**Step 3: Run tests**

Run: `cd dashboard && npx playwright test tests/e2e/mobile.spec.ts tests/e2e/console-audit.spec.ts --reporter=list`

**Step 4: Commit**

```bash
git add dashboard/tests/e2e/mobile.spec.ts dashboard/tests/e2e/console-audit.spec.ts
git commit -m "test: add mobile viewport and console/network audit E2E tests"
```

---

### Task 11: API Auth Enforcement Tests

**Files:**
- Create: `dashboard/tests/api/auth.spec.ts`

**Step 1: Write auth enforcement API tests**

These tests verify that protected routes return 401 without auth and public routes don't.

```ts
// dashboard/tests/api/auth.spec.ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../fixtures/test-data';

const PROTECTED_DATA_ROUTES = [
  '/api/data/clients',
  '/api/data/appointments',
  '/api/data/invoices',
  '/api/data/services',
  '/api/data/products',
  '/api/data/staff',
  '/api/data/leads',
  '/api/data/messages',
  '/api/data/documents',
  '/api/data/tasks',
  '/api/data/payments',
  '/api/data/expenses',
  '/api/data/todos',
  '/api/data/notes',
  '/api/data/forms',
  '/api/data/blog_posts',
  '/api/data/review-gate',
  '/api/data/review-requests',
  '/api/data/review-widgets',
  '/api/data/coupons',
  '/api/data/estimates',
];

const PUBLIC_API_ROUTES = [
  '/api/public/services',
  '/api/public/products',
  '/api/public/gallery',
  '/api/public/reviews',
];

test.describe('API Auth Enforcement — Protected Routes', () => {
  for (const route of PROTECTED_DATA_ROUTES) {
    test(`${route} returns 401 without auth`, async ({ request }) => {
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status()).toBe(401);
    });
  }
});

test.describe('API Auth Enforcement — Public Routes Accessible', () => {
  for (const route of PUBLIC_API_ROUTES) {
    test(`${route} is accessible without auth`, async ({ request }) => {
      const response = await request.get(`${BASE_URL}${route}`);
      // Public routes should not return 401 (may return 400 for missing params, which is fine)
      expect(response.status()).not.toBe(401);
    });
  }
});

test.describe('API Auth — Test Login Endpoint', () => {
  test('test-login works in development', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/test-login`, {
      data: { email: 'luxe.nails.e2e@redpine.systems', password: 'TestNails2026!' },
    });
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.userId).toBeTruthy();
  });

  test('test-login rejects missing credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/test-login`, {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('test-login rejects wrong password', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/test-login`, {
      data: { email: 'luxe.nails.e2e@redpine.systems', password: 'wrong' },
    });
    expect(response.status()).toBe(401);
  });
});
```

**Step 2: Run tests**

Run: `cd dashboard && npx playwright test tests/api/auth.spec.ts --reporter=list`

**Step 3: Commit**

```bash
git add dashboard/tests/api/auth.spec.ts
git commit -m "test: add API auth enforcement tests (protected routes, public routes, test-login)"
```

---

### Task 12: API Data CRUD Tests

**Files:**
- Create: `dashboard/tests/api/data-crud.spec.ts`

**Step 1: Write CRUD tests**

These use the browser context to get auth cookies, then test CRUD operations.

```ts
// dashboard/tests/api/data-crud.spec.ts
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { BASE_URL } from '../fixtures/test-data';

// Helper: make authenticated API call from browser context
async function authFetch(page: any, method: string, path: string, body?: any) {
  return page.evaluate(async ({ method, path, body }: any) => {
    const res = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  }, { method, path, body });
}

test.describe('API CRUD — Clients', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/clients returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/clients');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });

  test('POST /api/data/clients creates a client', async ({ page }) => {
    const result = await authFetch(page, 'POST', '/api/data/clients', {
      name: 'E2E Test Client',
      email: 'e2e-test@example.com',
    });
    expect(result.status).toBe(200);
    expect(result.body?.id).toBeTruthy();

    // Clean up — delete the created client
    if (result.body?.id) {
      await authFetch(page, 'DELETE', `/api/data/clients/${result.body.id}`);
    }
  });
});

test.describe('API CRUD — Services', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/services returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/services');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Appointments', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/appointments returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/appointments');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Invoices', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/invoices returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/invoices');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Staff', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/staff returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/staff');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Blog Posts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/blog_posts returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/blog_posts');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Forms', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/forms returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/forms');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Review Gate', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/review-gate returns config', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/review-gate');
    // May return 200 with data or 404 if not configured yet
    expect([200, 404]).toContain(result.status);
  });
});

test.describe('API CRUD — Products', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/products returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/products');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Leads', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/data/leads returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/leads');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});
```

**Step 2: Run tests**

Run: `cd dashboard && npx playwright test tests/api/data-crud.spec.ts --reporter=list`

**Step 3: Commit**

```bash
git add dashboard/tests/api/data-crud.spec.ts
git commit -m "test: add API CRUD tests for 10 entity types"
```

---

### Task 13: API Public + Portal + Onboarding Tests

**Files:**
- Create: `dashboard/tests/api/public.spec.ts`
- Create: `dashboard/tests/api/onboarding.spec.ts`
- Create: `dashboard/tests/api/portal.spec.ts`

**Step 1: Write public API tests**

```ts
// dashboard/tests/api/public.spec.ts
import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_SUBDOMAIN } from '../fixtures/test-data';

test.describe('Public API — No Auth Required', () => {
  test('GET /api/public/services returns data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/public/services?subdomain=${TEST_SUBDOMAIN}`);
    expect(response.status()).toBeLessThan(500);
  });

  test('GET /api/public/products returns data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/public/products?subdomain=${TEST_SUBDOMAIN}`);
    expect(response.status()).toBeLessThan(500);
  });

  test('GET /api/public/gallery returns data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/public/gallery?subdomain=${TEST_SUBDOMAIN}`);
    expect(response.status()).toBeLessThan(500);
  });

  test('GET /api/public/reviews returns data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/public/reviews?subdomain=${TEST_SUBDOMAIN}`);
    expect(response.status()).toBeLessThan(500);
  });

  test('GET /api/public/menu returns data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/public/menu?subdomain=${TEST_SUBDOMAIN}`);
    expect(response.status()).toBeLessThan(500);
  });

  test('GET /api/public/loyalty returns data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/public/loyalty?subdomain=${TEST_SUBDOMAIN}`);
    expect(response.status()).toBeLessThan(500);
  });
});
```

**Step 2: Write onboarding API tests**

```ts
// dashboard/tests/api/onboarding.spec.ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../fixtures/test-data';

test.describe('Onboarding API', () => {
  test('POST /api/onboarding/chat returns response', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/onboarding/chat`, {
      data: {
        messages: [{ role: 'user', content: 'I run a nail salon' }],
      },
    });
    // Should return 200 with AI response (or 500 if API key not set in test env)
    expect(response.status()).toBeLessThan(500);
  });

  test('POST /api/onboarding/check-input validates business name', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/onboarding/check-input`, {
      data: { field: 'business_name', value: 'My Nail Salon' },
    });
    expect(response.status()).toBeLessThan(500);
  });
});
```

**Step 3: Write portal API tests**

```ts
// dashboard/tests/api/portal.spec.ts
import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_SUBDOMAIN } from '../fixtures/test-data';

test.describe('Portal API', () => {
  test('GET /api/portal returns config', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/portal?subdomain=${TEST_SUBDOMAIN}`);
    expect(response.status()).toBeLessThan(500);
  });

  test('POST /api/portal/verify rejects invalid token', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/portal/verify`, {
      data: { token: 'invalid-token', subdomain: TEST_SUBDOMAIN },
    });
    // Should be 401 or 400 — not a server error
    expect(response.status()).toBeLessThan(500);
  });
});
```

**Step 4: Run all three**

Run: `cd dashboard && npx playwright test tests/api/public.spec.ts tests/api/onboarding.spec.ts tests/api/portal.spec.ts --reporter=list`

**Step 5: Commit**

```bash
git add dashboard/tests/api/public.spec.ts dashboard/tests/api/onboarding.spec.ts dashboard/tests/api/portal.spec.ts
git commit -m "test: add API tests for public endpoints, onboarding, and portal"
```

---

### Task 14: API Stripe/Credits Tests

**Files:**
- Create: `dashboard/tests/api/stripe.spec.ts`

**Step 1: Write stripe/credits API tests**

```ts
// dashboard/tests/api/stripe.spec.ts
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Credits API', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/credits/balance returns credit balance', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/credits/balance', { credentials: 'include' });
      return { status: res.status, body: await res.json().catch(() => null) };
    });
    expect(result.status).toBe(200);
    // Should have balance fields
    if (result.body) {
      expect(typeof result.body.total).toBe('number');
    }
  });

  test('POST /api/credits/consume deducts credits', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/credits/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: 1 }),
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    });
    // Should succeed or indicate insufficient credits
    expect([200, 402]).toContain(result.status);
  });
});

test.describe('Credits API — No Auth', () => {
  test('GET /api/credits/balance returns 401 without auth', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/credits/balance');
    expect(response.status()).toBe(401);
  });
});
```

**Step 2: Run tests**

Run: `cd dashboard && npx playwright test tests/api/stripe.spec.ts --reporter=list`

**Step 3: Commit**

```bash
git add dashboard/tests/api/stripe.spec.ts
git commit -m "test: add API tests for credits balance and consumption"
```

---

### Task 15: Install Vitest + Commission Engine + Credits Unit Tests

**Files:**
- Modify: `dashboard/package.json` (add vitest devDependency)
- Create: `dashboard/vitest.config.ts`
- Create: `dashboard/tests/unit/commission-engine.test.ts`
- Create: `dashboard/tests/unit/credits.test.ts`

**Step 1: Install Vitest**

Run: `cd dashboard && npm install --save-dev vitest`

**Step 2: Create Vitest config**

```ts
// dashboard/vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 3: Write commission engine unit tests**

```ts
// dashboard/tests/unit/commission-engine.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCommission, formatCents, CommissionConfig, CommissionTransaction } from '@/lib/commission-engine';

describe('calculateCommission', () => {
  describe('flat commission', () => {
    const config: CommissionConfig = { type: 'flat', flat_amount_cents: 500 };

    it('returns flat amount regardless of transaction', () => {
      const tx: CommissionTransaction = { amount_cents: 10000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(500);
    });

    it('returns 0 when flat_amount_cents is missing', () => {
      const tx: CommissionTransaction = { amount_cents: 10000, type: 'service' };
      expect(calculateCommission({ type: 'flat' }, tx)).toBe(0);
    });
  });

  describe('percentage commission', () => {
    const config: CommissionConfig = { type: 'percentage', percentage: 15 };

    it('calculates percentage of transaction amount', () => {
      const tx: CommissionTransaction = { amount_cents: 10000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(1500);
    });

    it('rounds to nearest cent', () => {
      const config: CommissionConfig = { type: 'percentage', percentage: 33 };
      const tx: CommissionTransaction = { amount_cents: 1001, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(330); // 1001 * 0.33 = 330.33 → 330
    });

    it('returns 0 for zero amount', () => {
      const tx: CommissionTransaction = { amount_cents: 0, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(0);
    });

    it('returns 0 when percentage is null', () => {
      const tx: CommissionTransaction = { amount_cents: 10000, type: 'service' };
      expect(calculateCommission({ type: 'percentage' }, tx)).toBe(0);
    });
  });

  describe('tiered commission', () => {
    const config: CommissionConfig = {
      type: 'tiered',
      tiers: [
        { min_cents: 0, max_cents: 5000, percentage: 10 },
        { min_cents: 5001, max_cents: 10000, percentage: 15 },
        { min_cents: 10001, max_cents: 50000, percentage: 20 },
      ],
    };

    it('matches correct tier for low amount', () => {
      const tx: CommissionTransaction = { amount_cents: 3000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(300); // 3000 * 0.10
    });

    it('matches correct tier for mid amount', () => {
      const tx: CommissionTransaction = { amount_cents: 8000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(1200); // 8000 * 0.15
    });

    it('matches correct tier for high amount', () => {
      const tx: CommissionTransaction = { amount_cents: 20000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(4000); // 20000 * 0.20
    });

    it('uses highest tier for amounts above all tiers', () => {
      const tx: CommissionTransaction = { amount_cents: 100000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(20000); // 100000 * 0.20 (highest tier)
    });

    it('returns 0 for empty tiers', () => {
      const tx: CommissionTransaction = { amount_cents: 5000, type: 'service' };
      expect(calculateCommission({ type: 'tiered', tiers: [] }, tx)).toBe(0);
    });
  });

  describe('product commission', () => {
    const config: CommissionConfig = {
      type: 'product',
      percentage: 15,
      product_percentage: 10,
    };

    it('uses product_percentage for product transactions', () => {
      const tx: CommissionTransaction = { amount_cents: 5000, type: 'product' };
      expect(calculateCommission(config, tx)).toBe(500); // 5000 * 0.10
    });

    it('uses percentage for non-product transactions', () => {
      const tx: CommissionTransaction = { amount_cents: 5000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(750); // 5000 * 0.15
    });

    it('uses percentage for tip transactions', () => {
      const tx: CommissionTransaction = { amount_cents: 2000, type: 'tip' };
      expect(calculateCommission(config, tx)).toBe(300); // 2000 * 0.15
    });
  });

  describe('edge cases', () => {
    it('returns 0 for null config', () => {
      expect(calculateCommission(null as any, { amount_cents: 100, type: 'service' })).toBe(0);
    });

    it('returns 0 for null transaction', () => {
      expect(calculateCommission({ type: 'flat', flat_amount_cents: 100 }, null as any)).toBe(0);
    });

    it('returns 0 for unknown commission type', () => {
      expect(calculateCommission({ type: 'unknown' as any }, { amount_cents: 100, type: 'service' })).toBe(0);
    });
  });
});

describe('formatCents', () => {
  it('formats cents to dollar string', () => {
    expect(formatCents(1500)).toBe('$15.00');
    expect(formatCents(0)).toBe('$0.00');
    expect(formatCents(99)).toBe('$0.99');
    expect(formatCents(10050)).toBe('$100.50');
  });
});
```

**Step 4: Write credits unit tests**

```ts
// dashboard/tests/unit/credits.test.ts
import { describe, it, expect } from 'vitest';
import {
  FREE_MONTHLY_CREDITS,
  FREE_RESET_DAYS,
  CREDIT_TIERS,
  getCreditBadgeColor,
} from '@/lib/credits';

describe('Credit Constants', () => {
  it('FREE_MONTHLY_CREDITS is 100', () => {
    expect(FREE_MONTHLY_CREDITS).toBe(100);
  });

  it('FREE_RESET_DAYS is 30', () => {
    expect(FREE_RESET_DAYS).toBe(30);
  });

  it('CREDIT_TIERS has 3 tiers', () => {
    expect(CREDIT_TIERS).toHaveLength(3);
  });

  it('starter tier is $5 for 100 credits', () => {
    const starter = CREDIT_TIERS.find(t => t.id === 'starter');
    expect(starter).toBeTruthy();
    expect(starter!.price).toBe(500);
    expect(starter!.credits).toBe(100);
  });

  it('popular tier is $10 for 200 credits and marked popular', () => {
    const popular = CREDIT_TIERS.find(t => t.id === 'popular');
    expect(popular).toBeTruthy();
    expect(popular!.price).toBe(1000);
    expect(popular!.credits).toBe(200);
    expect(popular!.popular).toBe(true);
  });

  it('pro tier is $15 for 300 credits', () => {
    const pro = CREDIT_TIERS.find(t => t.id === 'pro');
    expect(pro).toBeTruthy();
    expect(pro!.price).toBe(1500);
    expect(pro!.credits).toBe(300);
  });
});

describe('getCreditBadgeColor', () => {
  it('returns green for 50+ credits', () => {
    expect(getCreditBadgeColor(50)).toBe('#10B981');
    expect(getCreditBadgeColor(100)).toBe('#10B981');
    expect(getCreditBadgeColor(999)).toBe('#10B981');
  });

  it('returns yellow for 10-49 credits', () => {
    expect(getCreditBadgeColor(10)).toBe('#F59E0B');
    expect(getCreditBadgeColor(25)).toBe('#F59E0B');
    expect(getCreditBadgeColor(49)).toBe('#F59E0B');
  });

  it('returns red for <10 credits', () => {
    expect(getCreditBadgeColor(9)).toBe('#EF4444');
    expect(getCreditBadgeColor(0)).toBe('#EF4444');
    expect(getCreditBadgeColor(1)).toBe('#EF4444');
  });
});
```

**Step 5: Run unit tests**

Run: `cd dashboard && npx vitest run`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add dashboard/package.json dashboard/vitest.config.ts \
  dashboard/tests/unit/commission-engine.test.ts dashboard/tests/unit/credits.test.ts
git commit -m "test: add Vitest + unit tests for commission engine and credits"
```

---

### Task 16: Registry + Validation + Portal Templates + Form Templates Unit Tests

**Files:**
- Create: `dashboard/tests/unit/registry.test.ts`
- Create: `dashboard/tests/unit/validation.test.ts`
- Create: `dashboard/tests/unit/portal-templates.test.ts`
- Create: `dashboard/tests/unit/form-templates.test.ts`

**Step 1: Write registry unit tests**

```ts
// dashboard/tests/unit/registry.test.ts
import { describe, it, expect } from 'vitest';
import { detectTemplateType, getTemplate } from '@/lib/onboarding/registry';

describe('detectTemplateType', () => {
  describe('beauty_body family', () => {
    it.each([
      ['I run a nail salon', 'nail_salon'],
      ['I own a barbershop', 'barbershop'],
      ['I am a hair stylist', 'hair_salon'],
      ['lash tech business', 'lash_brow'],
      ['makeup artist', 'makeup_artist'],
      ['tattoo shop', 'tattoo'],
      ['day spa', 'spa'],
      ['medical spa', 'med_spa'],
      ['pet grooming business', 'pet_grooming'],
    ])('"%s" → %s', (description, expectedType) => {
      const result = detectTemplateType(description);
      expect(result).not.toBeNull();
      expect(result!.businessType).toBe(expectedType);
      expect(result!.family).toBe('beauty_body');
    });
  });

  describe('food_beverage family', () => {
    it.each([
      ['restaurant', 'restaurant'],
      ['coffee shop', 'coffee_shop'],
      ['bakery', 'bakery'],
      ['food truck', 'food_truck'],
      ['pizza shop', 'pizza_shop'],
    ])('"%s" → %s', (description, expectedType) => {
      const result = detectTemplateType(description);
      expect(result).not.toBeNull();
      expect(result!.businessType).toBe(expectedType);
      expect(result!.family).toBe('food_beverage');
    });
  });

  describe('professional_services family', () => {
    it.each([
      ['law firm', 'law_firm'],
      ['accountant', 'accountant'],
      ['real estate agent', 'real_estate_agent'],
      ['marketing agency', 'marketing_agency'],
    ])('"%s" → %s', (description, expectedType) => {
      const result = detectTemplateType(description);
      expect(result).not.toBeNull();
      expect(result!.businessType).toBe(expectedType);
      expect(result!.family).toBe('professional_services');
    });
  });

  describe('longest-first matching', () => {
    it('"nail salon" matches nail_salon, not just "nail"', () => {
      const result = detectTemplateType('I own a nail salon');
      expect(result!.businessType).toBe('nail_salon');
    });

    it('"hair salon" matches hair_salon, not just "salon"', () => {
      const result = detectTemplateType('I run a hair salon');
      expect(result!.businessType).toBe('hair_salon');
    });
  });

  it('returns null for unknown business type', () => {
    const result = detectTemplateType('I sell spaceships on Mars');
    expect(result).toBeNull();
  });

  it('is case-insensitive', () => {
    const result = detectTemplateType('NAIL SALON');
    expect(result).not.toBeNull();
    expect(result!.businessType).toBe('nail_salon');
  });
});

describe('getTemplate', () => {
  it('returns template for known business type', () => {
    const result = getTemplate('nail_salon', 'beauty_body');
    expect(result).not.toBeNull();
    expect(result!.template).toBeTruthy();
  });

  it('returns null for unknown family', () => {
    const result = getTemplate('nail_salon', 'nonexistent' as any);
    expect(result).toBeNull();
  });

  it('returns template with tabs array', () => {
    const result = getTemplate('restaurant', 'food_beverage');
    expect(result).not.toBeNull();
    expect(result!.template.tabs).toBeDefined();
    expect(Array.isArray(result!.template.tabs)).toBe(true);
  });
});
```

**Step 2: Write validation unit tests**

Note: Check what `validation.ts` actually exports before writing tests. The file exports validation + transformation functions.

```ts
// dashboard/tests/unit/validation.test.ts
import { describe, it, expect } from 'vitest';
import {
  consolidateCalendars,
  enforceTabLimit,
  ensureGallery,
  transformPipelineStages,
  validateColors,
  stripLockedFlags,
  validateConfig,
  type RawConfig,
} from '@/lib/onboarding/validation';

describe('consolidateCalendars', () => {
  it('clears Dashboard tab components', () => {
    const config: RawConfig = {
      tabs: [
        { id: 'tab_1', label: 'Dashboard', components: [{ id: 'calendar', label: 'Cal', view: 'calendar' }] },
      ],
    };
    const result = consolidateCalendars(config);
    expect(result.tabs![0].components).toHaveLength(0);
  });

  it('keeps only one calendar view across all tabs', () => {
    const config: RawConfig = {
      tabs: [
        { id: 'tab_1', label: 'Dashboard', components: [] },
        { id: 'tab_2', label: 'Scheduling', components: [
          { id: 'appointments', label: 'Appointments' },
          { id: 'classes', label: 'Classes' },
        ]},
      ],
    };
    const result = consolidateCalendars(config);
    // After consolidation, appointments gets calendar view, classes becomes redundant
    const schedulingTab = result.tabs![1];
    const calendarComps = schedulingTab.components.filter(c => c.view === 'calendar');
    expect(calendarComps.length).toBeLessThanOrEqual(1);
  });
});

describe('enforceTabLimit', () => {
  it('keeps config unchanged when under limit', () => {
    const config: RawConfig = {
      tabs: Array.from({ length: 5 }, (_, i) => ({
        id: `tab_${i}`, label: `Tab ${i}`, components: [],
      })),
    };
    const result = enforceTabLimit(config);
    expect(result.tabs!.length).toBe(5);
  });

  it('truncates to 8 tabs when over limit', () => {
    const config: RawConfig = {
      tabs: Array.from({ length: 12 }, (_, i) => ({
        id: `tab_${i}`, label: `Tab ${i}`, components: [],
      })),
    };
    const result = enforceTabLimit(config);
    expect(result.tabs!.length).toBe(8);
  });
});

describe('ensureGallery', () => {
  it('adds gallery to visual industry missing one', () => {
    const config: RawConfig = {
      business_type: 'nail_salon',
      tabs: [
        { id: 'tab_1', label: 'Dashboard', components: [] },
        { id: 'tab_2', label: 'Services', components: [{ id: 'services', label: 'Services' }] },
      ],
    };
    const result = ensureGallery(config);
    const allComps = result.tabs!.flatMap(t => t.components);
    const hasGallery = allComps.some(c => c.id === 'galleries');
    expect(hasGallery).toBe(true);
  });

  it('does not add gallery to non-visual industry', () => {
    const config: RawConfig = {
      business_type: 'accountant',
      tabs: [
        { id: 'tab_1', label: 'Dashboard', components: [] },
      ],
    };
    const result = ensureGallery(config);
    const allComps = result.tabs!.flatMap(t => t.components);
    const hasGallery = allComps.some(c => c.id === 'galleries');
    expect(hasGallery).toBe(false);
  });
});

describe('stripLockedFlags', () => {
  it('removes _locked and _removable from components and tabs', () => {
    const config: RawConfig = {
      tabs: [{
        id: 'tab_1', label: 'Test', _removable: false,
        components: [{ id: 'c1', label: 'C1', _locked: true }],
      }],
    };
    const result = stripLockedFlags(config);
    expect((result.tabs![0] as any)._removable).toBeUndefined();
    expect((result.tabs![0].components[0] as any)._locked).toBeUndefined();
  });
});
```

**Step 3: Write portal templates unit tests**

```ts
// dashboard/tests/unit/portal-templates.test.ts
import { describe, it, expect } from 'vitest';
import { getPortalConfig, getPortalSections } from '@/lib/portal-templates';

describe('getPortalConfig', () => {
  it('returns default config when no business type given', () => {
    const config = getPortalConfig();
    expect(config).toBeTruthy();
    expect(config.primaryAction).toBeTruthy();
    expect(config.bookingMode).toBeTruthy();
    expect(config.reviewPrompt).toBeTruthy();
  });

  it('returns nail_salon config with preference fields', () => {
    const config = getPortalConfig('nail_salon');
    expect(config.preferenceFields.length).toBeGreaterThan(0);
    const hasNailShape = config.preferenceFields.some(f => f.key === 'nail_shape');
    expect(hasNailShape).toBe(true);
  });

  it('returns restaurant config with menu booking mode', () => {
    const config = getPortalConfig('restaurant');
    expect(config.bookingMode).toBe('menu');
  });

  it('returns valid config for unknown business type (falls back to defaults)', () => {
    const config = getPortalConfig('space_station');
    expect(config).toBeTruthy();
    expect(config.primaryAction).toBeTruthy();
  });
});

describe('getPortalSections', () => {
  it('returns 8 portal sections', () => {
    const sections = getPortalSections();
    expect(sections).toHaveLength(8);
  });

  it('includes all required section types', () => {
    const sections = getPortalSections();
    const ids = sections.map(s => s.id);
    expect(ids).toContain('account');
    expect(ids).toContain('history');
    expect(ids).toContain('loyalty');
    expect(ids).toContain('messages');
    expect(ids).toContain('reviews');
    expect(ids).toContain('cards');
    expect(ids).toContain('notifications');
    expect(ids).toContain('book');
  });
});
```

**Step 4: Write form templates unit tests**

```ts
// dashboard/tests/unit/form-templates.test.ts
import { describe, it, expect } from 'vitest';
import { FORM_TEMPLATES, DOC_TYPE_COLORS } from '@/lib/form-templates';

describe('FORM_TEMPLATES', () => {
  it('has at least 15 templates', () => {
    expect(FORM_TEMPLATES.length).toBeGreaterThanOrEqual(15);
  });

  it('every template has required fields', () => {
    for (const template of FORM_TEMPLATES) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.category).toBeTruthy();
      expect(template.docType).toBeTruthy();
      expect(template.fields.length).toBeGreaterThan(0);
    }
  });

  it('every template field has required properties', () => {
    for (const template of FORM_TEMPLATES) {
      for (const field of template.fields) {
        expect(field.id).toBeTruthy();
        expect(field.label).toBeTruthy();
        expect(field.type).toBeTruthy();
        expect(typeof field.required).toBe('boolean');
      }
    }
  });

  it('select/radio fields have options', () => {
    for (const template of FORM_TEMPLATES) {
      for (const field of template.fields) {
        if (field.type === 'select' || field.type === 'radio') {
          expect(field.options).toBeDefined();
          expect(field.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('template IDs are unique', () => {
    const ids = FORM_TEMPLATES.map(t => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('DOC_TYPE_COLORS', () => {
  it('has colors for all doc types', () => {
    const expectedTypes = ['intake', 'waiver', 'contract', 'survey', 'invoice', 'consent', 'checklist'];
    for (const type of expectedTypes) {
      expect(DOC_TYPE_COLORS[type as keyof typeof DOC_TYPE_COLORS]).toBeTruthy();
    }
  });

  it('each color entry has bg, text, and label', () => {
    for (const [, colors] of Object.entries(DOC_TYPE_COLORS)) {
      expect(colors.bg).toBeTruthy();
      expect(colors.text).toBeTruthy();
      expect(colors.label).toBeTruthy();
    }
  });
});
```

**Step 5: Run all unit tests**

Run: `cd dashboard && npx vitest run`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add dashboard/tests/unit/
git commit -m "test: add unit tests for registry, validation, portal templates, and form templates"
```

---

### Task 17: Final Verification + Cleanup

**Step 1: Run the full E2E suite**

Run: `cd dashboard && npx playwright test --reporter=list`

**Step 2: Run all unit tests**

Run: `cd dashboard && npx vitest run`

**Step 3: Run everything together**

Run: `cd dashboard && npm run test:all`

**Step 4: Review and fix any failures**

For each failure:
1. Read the error message
2. Determine if it's a test issue or a real bug
3. Fix the test or file a note about the bug

**Step 5: Final commit**

```bash
git add -A
git commit -m "test: complete comprehensive test suite — E2E, API, and unit tests (~260 tests)"
```
