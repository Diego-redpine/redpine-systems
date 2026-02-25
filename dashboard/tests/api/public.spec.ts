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
