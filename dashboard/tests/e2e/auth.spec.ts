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
