# Credit System UI Design

**Date:** 2026-02-24
**Source:** Locked decision — 100 free/mo, $5/100, $10/200, $15/300

## Goal

Add a credit system for AI messages. 100 free credits per month (expire), purchased credits never expire. TopBar badge shows balance, CenterModal for purchasing with embedded Stripe payment.

## Architecture

- **user_credits** table tracks free and purchased balances separately
- Free credits auto-reset monthly (lazy check on balance read)
- System uses free credits first, then purchased
- Stripe PaymentIntents for one-time credit purchases (not subscriptions)
- TopBar badge always visible, opens purchase modal on click

## Data Model

```sql
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  free_balance INT NOT NULL DEFAULT 100,
  purchased_balance INT NOT NULL DEFAULT 0,
  free_reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

- `free_balance`: resets to 100 when `free_reset_at` > 30 days ago
- `purchased_balance`: only increases on purchase, decreases on consumption
- Consumption order: free first, then purchased

## Credit Tiers

| Tier | Credits | Price | Per Credit |
|------|---------|-------|------------|
| Starter | 100 | $5 | $0.05 |
| Popular | 200 | $10 | $0.05 |
| Pro | 300 | $15 | $0.05 |

## UI Components

### TopBar Credit Badge
- Pill badge before profile icon: "73 credits"
- Color: green (50+), yellow (10-49), red (<10)
- Click opens purchase modal
- Subtle pulse animation when <10

### Purchase Modal (CenterModal)
- Header: "Buy AI Credits"
- Current balance breakdown (free + purchased)
- 3 tier cards in a row (grid-cols-3)
- Middle tier pre-selected with "Best Value" badge
- Embedded Stripe card input (reuses saved card if available)
- Purchase button with selected tier
- Footer: next free reset date

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/credits/balance` | GET | Return balances + reset date |
| `/api/credits/purchase` | POST | Create PaymentIntent, add credits |
| `/api/credits/consume` | POST | Deduct 1 credit (free first) |

## Consumption Flow

1. AI route receives request
2. Calls `POST /api/credits/consume`
3. If success → proceed with AI call
4. If insufficient → return error, frontend shows purchase modal

## What's NOT Included

- Usage history/analytics
- Admin credit gifting
- Wiring consume into existing AI routes (hook point only)
- Webhook for payment failures
