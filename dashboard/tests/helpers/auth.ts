import { Page } from '@playwright/test';
import { TEST_EMAIL, TEST_PASSWORD } from '../fixtures/test-data';

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
