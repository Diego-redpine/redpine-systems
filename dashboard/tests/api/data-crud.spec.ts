import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

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
    if (result.body?.id) {
      await authFetch(page, 'DELETE', `/api/data/clients/${result.body.id}`);
    }
  });
});

test.describe('API CRUD — Services', () => {
  test.beforeEach(async ({ page }) => { await login(page); });
  test('GET /api/data/services returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/services');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Appointments', () => {
  test.beforeEach(async ({ page }) => { await login(page); });
  test('GET /api/data/appointments returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/appointments');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Invoices', () => {
  test.beforeEach(async ({ page }) => { await login(page); });
  test('GET /api/data/invoices returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/invoices');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Staff', () => {
  test.beforeEach(async ({ page }) => { await login(page); });
  test('GET /api/data/staff returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/staff');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Blog Posts', () => {
  test.beforeEach(async ({ page }) => { await login(page); });
  test('GET /api/data/blog_posts returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/blog_posts');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Forms', () => {
  test.beforeEach(async ({ page }) => { await login(page); });
  test('GET /api/data/forms returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/forms');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Review Gate', () => {
  test.beforeEach(async ({ page }) => { await login(page); });
  test('GET /api/data/review-gate returns config', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/review-gate');
    expect([200, 404]).toContain(result.status);
  });
});

test.describe('API CRUD — Products', () => {
  test.beforeEach(async ({ page }) => { await login(page); });
  test('GET /api/data/products returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/products');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});

test.describe('API CRUD — Leads', () => {
  test.beforeEach(async ({ page }) => { await login(page); });
  test('GET /api/data/leads returns array', async ({ page }) => {
    const result = await authFetch(page, 'GET', '/api/data/leads');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });
});
