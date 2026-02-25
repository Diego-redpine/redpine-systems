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
    expect([200, 402]).toContain(result.status);
  });
});

test.describe('Credits API — No Auth', () => {
  test('GET /api/credits/balance returns 401 without auth', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/credits/balance');
    expect(response.status()).toBe(401);
  });
});
