# Comprehensive Testing Design — E2E-First Approach

**Date:** 2026-02-25
**Status:** Approved
**Approach:** E2E-First (fix existing → expand E2E → API tests → unit tests)

## Overview

Full platform testing strategy for Red Pine OS. Prioritizes end-to-end tests that catch real user-facing bugs, then layers in API route tests and unit tests for business-critical logic.

## Current State

- **Framework:** Playwright only (`@playwright/test@^1.58.2`)
- **Existing tests:** `full-platform-audit.spec.ts` (40+ tests, 18 suites) + `debug-login.spec.ts`
- **Last run:** FAILED (login redirect test)
- **Test login:** `POST /api/auth/test-login` (dev-only, sets Supabase cookies)
- **Test account:** `luxe.nails.e2e@redpine.systems` / `TestNails2026!` (subdomain: `luxe-nails`)
- **No unit test framework** (no Jest/Vitest)

## Architecture

### Layer 1: Fix Existing Playwright Suite
- Debug and fix the failing login redirect test
- Ensure `test-login` API route works reliably with cookie propagation
- Verify all 40+ existing tests pass green
- Refactor shared helpers into `tests/helpers/`

### Layer 2: E2E — All Public Pages

| Flow | Spec File | Key Tests |
|------|-----------|-----------|
| **Onboarding** | `onboarding.spec.ts` | Chat loads, AI responds, signup modal (email+password step, Stripe card step), building animation, brand board redirect |
| **Portal** | `portal.spec.ts` | Login page renders, email input, all 8 sections (Account, History, Loyalty, Messages, Reviews, Cards, Notifications, Book), ChatWidget 3 states |
| **Booking** | `booking.spec.ts` | Service list, date picker, time slots, contact form, deposit display, confirmation |
| **Ordering** | `ordering.spec.ts` | Menu display, add to cart, cart totals, checkout form |
| **Forms** | `forms.spec.ts` | Form renders fields, validation errors, successful submission |
| **Reviews** | `reviews.spec.ts` | Review gate (star threshold), star rating input, text input, submission |
| **E-Signature** | `forms.spec.ts` | Document display, signature pad interaction, submission |
| **Website** | `website.spec.ts` | Page renders, navigation links, sections display, responsive |

### Layer 3: E2E — All Dashboard Tabs

| Tab | Key Tests |
|-----|-----------|
| **Dashboard** | StatCards render with numbers, ActivityFeed shows entries |
| **Clients** | Table view loads, search works, add client wizard, pipeline view, card view toggle |
| **Services** | Service list, add service wizard (progressive disclosure), pricing fields, categories |
| **Appointments** | Calendar renders, booking setup wizard (deposits, no-show), block time modal |
| **Staff** | Staff list, staff wizard (4 commission types), availability grid |
| **Payments** | Invoice list, quote builder (line items, convert to invoice), tip selector, coupon manager |
| **Gallery** | Upload button, album creation, image reorder |
| **Communications** | Unified inbox 3-panel, channel filter chips, conversation selection, canned responses |
| **Reviews** | Inbox sub-tab, requests sub-tab, gate config (progressive disclosure), widget builder (4 layouts + preview) |
| **Brand Board** | Brand Kit sub-tab (logo upload), Colors sub-tab (3 presets + swatches), Sections sub-tab, font pickers |
| **Website** | Blog list + editor, template marketplace, site editor launch |
| **Marketplace** | AI Agents sub-tab, Freelancers sub-tab |
| **Marketing** | Social media composer renders |
| **Settings** | Account info, profile edit |
| **Mobile** | Dashboard at 390x844, booking page responsive, portal responsive |

### Layer 4: API Route Tests

All API tests use Playwright's `request` context (no browser needed).

**Auth enforcement:**
- Every `/api/data/*` route returns 401 without session
- Every `/api/public/*` route works without auth
- Middleware redirects protected pages to `/login`

**CRUD operations** (`/api/data/*`):
- GET list returns array
- POST creates record, returns with id
- GET by id returns single record
- PATCH updates fields
- DELETE removes record
- All 60+ entity endpoints covered

**Stripe endpoints:**
- `POST /api/stripe/setup-intent` — returns clientSecret
- `POST /api/stripe/subscribe` — creates subscription
- `GET /api/credits/balance` — returns credit balance
- `POST /api/credits/consume` — deducts credits

**Onboarding endpoints:**
- `POST /api/onboarding/chat` — returns AI response
- `POST /api/onboarding/check-input` — validates input
- `POST /api/onboarding/configure` — creates config

**Portal endpoints:**
- `POST /api/portal/verify` — magic link verification
- `GET /api/portal/chat` — returns chat history
- `GET /api/portal/cards` — returns saved cards
- `GET /api/portal/notifications` — returns notifications

### Layer 5: Unit Tests for Business Logic

Install Vitest for unit tests (fast, TypeScript-native, compatible with Playwright).

| File | Tests |
|------|-------|
| `commission-engine.ts` | Flat fee calc, percentage calc, tiered brackets, product-type commission, zero values, negative guards |
| `credits.ts` | Tier pricing, badge color thresholds (green/yellow/red), free vs purchased consumption order |
| `onboarding/registry.ts` | All 9 template families resolve, alias matching (longest-first), unknown input fallback |
| `onboarding/validation.ts` | Valid/invalid business names, email formats, phone patterns |
| `portal-templates.ts` | All 20+ industry configs return valid structure, getPortalConfig() with unknown type |
| `form-templates.ts` | All 15+ templates have required fields, category grouping |

## File Structure

```
dashboard/tests/
├── e2e/
│   ├── auth.spec.ts              # Login, signup, logout, forgot-password
│   ├── dashboard-tabs.spec.ts    # All 14+ dashboard tabs
│   ├── onboarding.spec.ts        # Full onboarding flow
│   ├── portal.spec.ts            # Portal login + 8 sections
│   ├── booking.spec.ts           # Public booking flow
│   ├── ordering.spec.ts          # Public ordering flow
│   ├── forms.spec.ts             # Public forms + e-signature
│   ├── reviews.spec.ts           # Public review submission
│   ├── website.spec.ts           # Public site rendering
│   ├── mobile.spec.ts            # Responsive viewport tests
│   └── console-audit.spec.ts     # Console error + network failure collection
├── api/
│   ├── data-crud.spec.ts         # All entity CRUD endpoints
│   ├── auth.spec.ts              # Auth enforcement on all routes
│   ├── public.spec.ts            # Unauthenticated endpoint access
│   ├── stripe.spec.ts            # Payment-related endpoints
│   ├── onboarding.spec.ts        # Onboarding API routes
│   └── portal.spec.ts            # Portal API routes
├── unit/
│   ├── commission-engine.test.ts
│   ├── credits.test.ts
│   ├── registry.test.ts
│   ├── validation.test.ts
│   ├── portal-templates.test.ts
│   └── form-templates.test.ts
├── helpers/
│   ├── auth.ts                   # Shared login helper (reusable across specs)
│   └── screenshots.ts            # Screenshot naming helper
├── fixtures/
│   └── test-data.ts              # Shared constants (test account, subdomain, URLs)
└── full-platform-audit.spec.ts   # (existing — keep as legacy/reference)
```

## Test Count Estimate

| Layer | Spec Files | Tests |
|-------|-----------|-------|
| E2E — Public pages | 8 | ~50 |
| E2E — Dashboard tabs | 1 (large) | ~45 |
| E2E — Mobile + audits | 2 | ~10 |
| API — All routes | 6 | ~80 |
| Unit — Business logic | 6 | ~60 |
| **Total** | **23 files** | **~260 tests** |

## Execution Order

1. Fix existing failing tests (Layer 1)
2. Extract helpers + fixtures from existing spec
3. Write E2E public page tests (Layer 2)
4. Write E2E dashboard tab tests (Layer 3)
5. Write API route tests (Layer 4)
6. Install Vitest, write unit tests (Layer 5)

## Dependencies

- Dev server running on `localhost:3000`
- Test Supabase account (`luxe.nails.e2e@redpine.systems`) with seeded data
- Playwright installed (`npx playwright install chromium`)
- Vitest (to be installed for Layer 5)

## Config Updates Needed

- `playwright.config.ts`: Update `testDir` to include `e2e/` and `api/` subdirs
- `package.json`: Add `"test"`, `"test:e2e"`, `"test:api"`, `"test:unit"` scripts
- `vitest.config.ts`: New file for unit test configuration
