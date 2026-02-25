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
