import { test, expect } from '@playwright/test';
import { BASE_URL } from '../fixtures/test-data';

test.describe('Onboarding API', () => {
  test('POST /api/onboarding/chat returns response', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/onboarding/chat`, {
      data: {
        messages: [{ role: 'user', content: 'I run a nail salon' }],
      },
    });
    expect(response.status()).toBeLessThan(500);
  });

  test('POST /api/onboarding/check-input validates business name', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/onboarding/check-input`, {
      data: { field: 'business_name', value: 'My Nail Salon' },
    });
    expect(response.status()).toBeLessThan(500);
  });
});
