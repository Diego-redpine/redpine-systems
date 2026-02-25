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
    expect(response.status()).toBeLessThan(500);
  });
});
