/**
 * Red Pine OS — Full Platform Audit
 *
 * Acts as a real user: login, navigate every tab, check every tool strip button,
 * test public pages, and report what's broken, missing, or confusing.
 */
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';
import { screenshot } from './helpers/screenshots';
import { TEST_SUBDOMAIN } from './fixtures/test-data';

// ─── 1. LOGIN PAGE ─────────────────────────────────────────

test.describe('1. Login Page', () => {
  test('renders login form correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '01-login-page');

    // Check essential elements exist
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const signInButton = page.locator('button:has-text("Sign In")');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signInButton).toBeVisible();
  });

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[id="email"]', 'wrong@test.com');
    await page.fill('input[id="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    await screenshot(page, '01-login-error');

    // Should still be on login page (not redirected)
    expect(page.url()).toContain('/login');
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await login(page);
    await screenshot(page, '01-login-success');
    expect(page.url()).toContain('/dashboard');
  });
});

// ─── 2. SIGNUP PAGE ────────────────────────────────────────

test.describe('2. Signup Page', () => {
  test('renders signup form', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '02-signup-page');

    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const createButton = page.locator('button:has-text("Create Account")');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(createButton).toBeVisible();
  });
});

// ─── 3. DASHBOARD — Tab Navigation ────────────────────────

test.describe('3. Dashboard Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
  });

  test('dashboard loads with tabs visible', async ({ page }) => {
    await screenshot(page, '03-dashboard-loaded');

    // Check that some tabs rendered
    const tabButtons = page.locator('button, [role="tab"], a').filter({ hasText: /Dashboard|Clients|Appointments|Services/i });
    const count = await tabButtons.count();
    console.log(`Found ${count} navigation tab-like elements`);

    // At minimum, we should see navigation elements
    expect(count).toBeGreaterThan(0);
  });

  test('click through each sidebar tab', async ({ page }) => {
    // Get all tab-like elements in the sidebar/topbar
    // Try clicking common tab names and screenshot each
    const tabNames = ['Dashboard', 'Clients', 'Appointments', 'Services', 'Gallery', 'Staff', 'Payments'];

    for (const tabName of tabNames) {
      const tab = page.locator(`text="${tabName}"`).first();
      if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1500);
        await screenshot(page, `03-tab-${tabName.toLowerCase()}`);
        console.log(`Tab "${tabName}": VISIBLE and clickable`);
      } else {
        console.log(`Tab "${tabName}": NOT FOUND`);
      }
    }
  });

  test('Dashboard tab content renders', async ({ page }) => {
    const dashTab = page.locator('text="Dashboard"').first();
    if (await dashTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dashTab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '03-dashboard-tab-content');

      // Check for StatCards or PineTreeWidget or any content
      const bodyText = await page.textContent('body');
      const hasContent = bodyText?.includes('Goal') || bodyText?.includes('Activity') ||
                         bodyText?.includes('Stat') || bodyText?.includes('coming soon') ||
                         bodyText?.includes('Welcome');
      console.log(`Dashboard tab has content: ${hasContent}`);
      console.log(`Dashboard body snippet: ${bodyText?.substring(0, 500)}`);
    }
  });

  test('Clients tab — table or empty state', async ({ page }) => {
    const tab = page.locator('text="Clients"').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '03-clients-tab');

      const bodyText = await page.textContent('body');
      const hasTable = bodyText?.includes('Name') || bodyText?.includes('Email') || bodyText?.includes('No clients');
      console.log(`Clients tab has data/empty state: ${hasTable}`);
    }
  });

  test('Services tab — catalog items', async ({ page }) => {
    const tab = page.locator('text="Services"').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '03-services-tab');

      // Check for add button or service list
      const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
      const addVisible = await addButton.first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`Services tab "Add" button visible: ${addVisible}`);
    }
  });

  test('Appointments tab — calendar or empty', async ({ page }) => {
    const tab = page.locator('text="Appointments"').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '03-appointments-tab');
    }
  });

  test('Staff tab — staff list or wizard', async ({ page }) => {
    const tab = page.locator('text="Staff"').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '03-staff-tab');
    }
  });

  test('Payments tab — invoices or empty', async ({ page }) => {
    const tab = page.locator('text="Payments"').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '03-payments-tab');
    }
  });

  test('Gallery tab', async ({ page }) => {
    const tab = page.locator('text="Gallery"').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '03-gallery-tab');
    }
  });
});

// ─── 4. TOOLS STRIP BUTTONS ───────────────────────────────

test.describe('4. Tools Strip', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
  });

  test('tools strip is visible', async ({ page }) => {
    // Look for the floating tools strip
    const toolsStrip = page.locator('[data-tour-id="tool-comms"], [data-tour-id="tool-brand"], [data-tour-id="tool-website"]').first();
    const visible = await toolsStrip.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`Tools strip visible: ${visible}`);
    await screenshot(page, '04-tools-strip');
  });

  test('Messages (comms) button opens communications', async ({ page }) => {
    const commsBtn = page.locator('[data-tour-id="tool-comms"]');
    if (await commsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commsBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '04-comms-tab');

      const bodyText = await page.textContent('body');
      const hasComms = bodyText?.includes('Message') || bodyText?.includes('Inbox') || bodyText?.includes('COO') || bodyText?.includes('conversation');
      console.log(`Communications tab content: ${hasComms}`);
    } else {
      // Try by text
      const btn = page.locator('button:has-text("Messages"), button:has-text("Comms")').first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, '04-comms-tab-alt');
      } else {
        console.log('Messages button: NOT FOUND');
      }
    }
  });

  test('Brand & Design button opens Brand Board', async ({ page }) => {
    const brandBtn = page.locator('[data-tour-id="tool-brand"]');
    if (await brandBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await brandBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '04-brand-board');

      const bodyText = await page.textContent('body');
      const hasBrand = bodyText?.includes('Brand') || bodyText?.includes('Logo') || bodyText?.includes('Colors') || bodyText?.includes('Font');
      console.log(`Brand Board content: ${hasBrand}`);
    } else {
      console.log('Brand & Design button: NOT FOUND');
    }
  });

  test('Website button opens site editor', async ({ page }) => {
    const websiteBtn = page.locator('[data-tour-id="tool-website"]');
    if (await websiteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await websiteBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '04-website-tab');

      const bodyText = await page.textContent('body');
      const hasSite = bodyText?.includes('Website') || bodyText?.includes('Blog') || bodyText?.includes('Template') || bodyText?.includes('Editor') || bodyText?.includes('Page');
      console.log(`Website tab content: ${hasSite}`);
    } else {
      console.log('Website button: NOT FOUND');
    }
  });

  test('Marketplace button opens marketplace', async ({ page }) => {
    const marketBtn = page.locator('[data-tour-id="tool-marketplace"]');
    if (await marketBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await marketBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '04-marketplace-tab');

      const bodyText = await page.textContent('body');
      const hasMarket = bodyText?.includes('Marketplace') || bodyText?.includes('Agent') || bodyText?.includes('Freelancer');
      console.log(`Marketplace content: ${hasMarket}`);
    } else {
      console.log('Marketplace button: NOT FOUND');
    }
  });

  test('Marketing button opens marketing', async ({ page }) => {
    const marketingBtn = page.locator('[data-tour-id="tool-marketing"]');
    if (await marketingBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await marketingBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '04-marketing-tab');
    } else {
      console.log('Marketing button: NOT FOUND');
    }
  });
});

// ─── 5. WEBSITE SUB-TABS (Blog, Templates) ────────────────

test.describe('5. Website Sub-tabs', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    // Navigate to website
    const websiteBtn = page.locator('[data-tour-id="tool-website"]');
    if (await websiteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await websiteBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test('Blog sub-tab renders', async ({ page }) => {
    const blogTab = page.locator('text="Blog"').first();
    if (await blogTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await blogTab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '05-blog-subtab');
      console.log('Blog sub-tab: VISIBLE');
    } else {
      console.log('Blog sub-tab: NOT FOUND');
    }
  });

  test('Templates sub-tab renders', async ({ page }) => {
    const templatesTab = page.locator('text="Templates"').first();
    if (await templatesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await templatesTab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '05-templates-subtab');
      console.log('Templates sub-tab: VISIBLE');
    } else {
      console.log('Templates sub-tab: NOT FOUND');
    }
  });
});

// ─── 6. BRAND BOARD EDITOR ────────────────────────────────

test.describe('6. Brand Board', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    const brandBtn = page.locator('[data-tour-id="tool-brand"]');
    if (await brandBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await brandBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test('Brand Kit sub-tab shows logo + colors + fonts', async ({ page }) => {
    await screenshot(page, '06-brand-board-default');

    const bodyText = await page.textContent('body');
    const hasLogo = bodyText?.includes('Logo') || bodyText?.includes('Upload');
    const hasColors = bodyText?.includes('Color') || bodyText?.includes('Palette') || bodyText?.includes('Swatch');
    const hasFonts = bodyText?.includes('Font') || bodyText?.includes('Heading') || bodyText?.includes('Body');

    console.log(`Brand Board — Logo section: ${hasLogo}`);
    console.log(`Brand Board — Colors section: ${hasColors}`);
    console.log(`Brand Board — Fonts section: ${hasFonts}`);
  });

  test('Colors sub-tab', async ({ page }) => {
    const colorsTab = page.locator('text="Colors"').first();
    if (await colorsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await colorsTab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '06-brand-colors');
    }
  });

  test('Sections sub-tab', async ({ page }) => {
    const sectionsTab = page.locator('text="Sections"').first();
    if (await sectionsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sectionsTab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '06-brand-sections');
    }
  });
});

// ─── 7. REVIEWS TAB ───────────────────────────────────────

test.describe('7. Reviews Tab', () => {
  test('reviews tab exists and has sub-tabs', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Reviews should be a top-level tab (star icon)
    const reviewsTab = page.locator('text="Reviews"').first();
    if (await reviewsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await reviewsTab.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '07-reviews-tab');

      const bodyText = await page.textContent('body');
      const hasInbox = bodyText?.includes('Inbox');
      const hasRequests = bodyText?.includes('Request');
      const hasGate = bodyText?.includes('Gate');
      const hasWidgets = bodyText?.includes('Widget');

      console.log(`Reviews — Inbox: ${hasInbox}, Requests: ${hasRequests}, Gate: ${hasGate}, Widgets: ${hasWidgets}`);
    } else {
      console.log('Reviews tab: NOT FOUND in top-level tabs');
    }
  });
});

// ─── 8. PUBLIC BOOKING PAGE ───────────────────────────────

test.describe('8. Public Booking Page', () => {
  test('booking page loads for test business', async ({ page }) => {
    await page.goto(`/book/${TEST_SUBDOMAIN}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, '08-booking-page');

    const bodyText = await page.textContent('body');
    const hasBooking = bodyText?.includes('Book') || bodyText?.includes('appointment') || bodyText?.includes('service') || bodyText?.includes('Choose');
    const hasError = bodyText?.includes('Not Found') || bodyText?.includes('Error') || bodyText?.includes('404');

    console.log(`Booking page loaded: ${hasBooking}`);
    console.log(`Booking page error: ${hasError}`);
    console.log(`Booking body snippet: ${bodyText?.substring(0, 300)}`);
  });

  test('booking flow — select service, date, time', async ({ page }) => {
    await page.goto(`/book/${TEST_SUBDOMAIN}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Step 1: Select a service (if services exist)
    const serviceButton = page.locator('button').filter({ hasText: /\$|\d+ min/i }).first();
    if (await serviceButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await serviceButton.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '08-booking-service-selected');
      console.log('Service selected');
    } else {
      console.log('No service buttons found (might skip to date)');
    }

    // Step 2: Select a date
    await page.waitForTimeout(1000);
    const dateButtons = page.locator('button').filter({ hasText: /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i });
    const dateCount = await dateButtons.count();
    console.log(`Date buttons found: ${dateCount}`);

    if (dateCount > 0) {
      await dateButtons.first().click();
      await page.waitForTimeout(1500);
      await screenshot(page, '08-booking-date-selected');
    }

    // Step 3: Select a time
    const timeButtons = page.locator('button').filter({ hasText: /^\d{1,2}:\d{2}\s*(AM|PM)/i });
    const timeCount = await timeButtons.count();
    console.log(`Time buttons found: ${timeCount}`);

    if (timeCount > 0) {
      await timeButtons.first().click();
      await page.waitForTimeout(1500);
      await screenshot(page, '08-booking-time-selected');
    }

    // Step 4: Fill contact details
    const nameInput = page.locator('input[placeholder*="Jane"], input[placeholder*="Name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill('Test User');

      const emailInput = page.locator('input[type="email"], input[placeholder*="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('testuser@test.com');
      }

      await screenshot(page, '08-booking-details-filled');

      // Find confirm button
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Book")').first();
      const confirmVisible = await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`Confirm button visible: ${confirmVisible}`);
    }
  });
});

// ─── 9. PUBLIC PORTAL PAGE ────────────────────────────────

test.describe('9. Portal Page', () => {
  test('portal login page loads', async ({ page }) => {
    await page.goto(`/portal/${TEST_SUBDOMAIN}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, '09-portal-login');

    const bodyText = await page.textContent('body');
    const hasPortal = bodyText?.includes('Portal') || bodyText?.includes('Welcome') || bodyText?.includes('email');
    const hasError = bodyText?.includes('Not Found') || bodyText?.includes('Error');

    console.log(`Portal page loaded: ${hasPortal}`);
    console.log(`Portal page error: ${hasError}`);
  });

  test('portal email input works', async ({ page }) => {
    await page.goto(`/portal/${TEST_SUBDOMAIN}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('client@test.com');
      await screenshot(page, '09-portal-email-entered');

      const sendButton = page.locator('button:has-text("Send"), button:has-text("Magic"), button:has-text("Sign")').first();
      const sendVisible = await sendButton.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`Send Magic Link button: ${sendVisible}`);
    } else {
      console.log('Portal email input: NOT FOUND');
    }
  });
});

// ─── 10. ONBOARDING PAGE ──────────────────────────────────

test.describe('10. Onboarding Page', () => {
  test('onboarding chat loads', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    await screenshot(page, '10-onboarding-page');

    const bodyText = await page.textContent('body');
    const hasChat = bodyText?.includes('business') || bodyText?.includes('tell') || bodyText?.includes('chat') || bodyText?.includes('Red Pine');
    console.log(`Onboarding page content: ${hasChat}`);
    console.log(`Onboarding body snippet: ${bodyText?.substring(0, 500)}`);
  });
});

// ─── 11. MARKETPLACE SUB-TABS ─────────────────────────────

test.describe('11. Marketplace Sub-tabs', () => {
  test('marketplace has AI Agents and Freelancers tabs', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    const marketBtn = page.locator('[data-tour-id="tool-marketplace"]');
    if (await marketBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await marketBtn.click();
      await page.waitForTimeout(2000);

      const bodyText = await page.textContent('body');
      const hasAgents = bodyText?.includes('Agent') || bodyText?.includes('AI');
      const hasFreelancers = bodyText?.includes('Freelancer') || bodyText?.includes('Designer');

      console.log(`Marketplace — AI Agents: ${hasAgents}, Freelancers: ${hasFreelancers}`);

      // Try clicking Freelancers sub-tab
      const freelancerTab = page.locator('text="Freelancers"').first();
      if (await freelancerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await freelancerTab.click();
        await page.waitForTimeout(1500);
        await screenshot(page, '11-marketplace-freelancers');
      }

      // Try clicking AI Agents sub-tab
      const agentsTab = page.locator('text="AI Agents"').first();
      if (await agentsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await agentsTab.click();
        await page.waitForTimeout(1500);
        await screenshot(page, '11-marketplace-agents');
      }
    }
  });
});

// ─── 12. BOOKING SETUP WIZARD ─────────────────────────────

test.describe('12. Booking Setup Wizard', () => {
  test('booking setup wizard opens and has deposit controls', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Navigate to Appointments tab
    const apptTab = page.locator('text="Appointments"').first();
    if (await apptTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await apptTab.click();
      await page.waitForTimeout(2000);

      // Look for settings/setup button
      const setupBtn = page.locator('button:has-text("Setup"), button:has-text("Settings"), button:has-text("Configure"), button:has-text("Booking")').first();
      if (await setupBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await setupBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, '12-booking-wizard');

        const bodyText = await page.textContent('body');
        const hasDeposit = bodyText?.includes('Deposit') || bodyText?.includes('deposit');
        const hasNoShow = bodyText?.includes('No-show') || bodyText?.includes('no-show') || bodyText?.includes('No Show');
        console.log(`Booking Wizard — Deposit: ${hasDeposit}, No-show: ${hasNoShow}`);
      } else {
        console.log('Booking setup button: NOT FOUND');
      }
    }
  });
});

// ─── 13. ADD SERVICE WIZARD ───────────────────────────────

test.describe('13. Add Service Wizard', () => {
  test('service wizard opens with progressive disclosure', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    const servicesTab = page.locator('text="Services"').first();
    if (await servicesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await servicesTab.click();
      await page.waitForTimeout(2000);

      // Find add button
      const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
      if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, '13-add-service-wizard');

        const bodyText = await page.textContent('body');
        const hasAdvanced = bodyText?.includes('Advanced') || bodyText?.includes('More options');
        console.log(`Service wizard progressive disclosure: ${hasAdvanced}`);
      } else {
        console.log('Add service button: NOT FOUND');
      }
    }
  });
});

// ─── 14. STAFF WIZARD ─────────────────────────────────────

test.describe('14. Staff Wizard', () => {
  test('staff wizard opens', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    const staffTab = page.locator('text="Staff"').first();
    if (await staffTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await staffTab.click();
      await page.waitForTimeout(2000);

      const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Invite")').first();
      if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, '14-staff-wizard');

        const bodyText = await page.textContent('body');
        const hasCommission = bodyText?.includes('Commission') || bodyText?.includes('commission');
        console.log(`Staff wizard commission: ${hasCommission}`);
      }
    }
  });
});

// ─── 15. CREDIT BADGE ─────────────────────────────────────

test.describe('15. Credit System', () => {
  test('credit badge visible in TopBar', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent('body');
    const hasCredits = bodyText?.includes('credit') || bodyText?.includes('Credit');
    console.log(`Credit badge text found: ${hasCredits}`);

    // Look for credit badge element
    const creditBadge = page.locator('[class*="credit"], [class*="Credit"]').first();
    const badgeVisible = await creditBadge.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Credit badge element visible: ${badgeVisible}`);
    await screenshot(page, '15-credit-badge');
  });
});

// ─── 16. MOBILE VIEWPORT ──────────────────────────────────

test.describe('16. Mobile Viewport', () => {
  test('dashboard renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await login(page);
    await page.waitForTimeout(2000);
    await screenshot(page, '16-mobile-dashboard');

    // Check if mobile nav exists
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [class*="hamburger"], [class*="mobile"]').first();
    const hasHamburger = await hamburger.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Mobile hamburger menu: ${hasHamburger}`);
  });

  test('booking page on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/book/${TEST_SUBDOMAIN}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, '16-mobile-booking');
  });

  test('portal on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/portal/${TEST_SUBDOMAIN}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, '16-mobile-portal');
  });
});

// ─── 17. CONSOLE ERRORS ───────────────────────────────────

test.describe('17. Console Error Audit', () => {
  test('dashboard — collect console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      errors.push(`PAGE ERROR: ${err.message}`);
    });

    await login(page);
    await page.waitForTimeout(3000);

    // Navigate through a few tabs to trigger errors
    const tabNames = ['Clients', 'Appointments', 'Services', 'Staff', 'Payments'];
    for (const name of tabNames) {
      const tab = page.locator(`text="${name}"`).first();
      if (await tab.isVisible({ timeout: 1500 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1500);
      }
    }

    console.log(`\n=== CONSOLE ERRORS (${errors.length}) ===`);
    for (const err of errors.slice(0, 30)) {
      console.log(`  ERROR: ${err.substring(0, 200)}`);
    }
    console.log(`=== END ERRORS ===\n`);

    await screenshot(page, '17-console-errors-final');
  });

  test('public pages — collect console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

    // Booking page
    await page.goto(`/book/${TEST_SUBDOMAIN}`);
    await page.waitForTimeout(3000);

    // Portal page
    await page.goto(`/portal/${TEST_SUBDOMAIN}`);
    await page.waitForTimeout(3000);

    // Onboarding page
    await page.goto('/onboarding');
    await page.waitForTimeout(3000);

    console.log(`\n=== PUBLIC PAGE ERRORS (${errors.length}) ===`);
    for (const err of errors.slice(0, 30)) {
      console.log(`  ERROR: ${err.substring(0, 200)}`);
    }
    console.log(`=== END PUBLIC ERRORS ===\n`);
  });
});

// ─── 18. NETWORK FAILURES ─────────────────────────────────

test.describe('18. Network/API Audit', () => {
  test('dashboard — catch failed API calls', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    await login(page);
    await page.waitForTimeout(3000);

    // Navigate tabs
    const tabNames = ['Dashboard', 'Clients', 'Appointments', 'Services', 'Staff', 'Payments', 'Gallery'];
    for (const name of tabNames) {
      const tab = page.locator(`text="${name}"`).first();
      if (await tab.isVisible({ timeout: 1500 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(2000);
      }
    }

    // Navigate tool strip tabs
    for (const tourId of ['tool-comms', 'tool-brand', 'tool-website', 'tool-marketplace', 'tool-marketing']) {
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
    console.log(`=== END FAILED CALLS ===\n`);
  });
});
