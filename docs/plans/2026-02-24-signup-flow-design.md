# Sign-Up Flow Design

**Date:** 2026-02-24
**Source:** Sticky Note #10 — Templates & Industry Configuration
**Scope:** AI chat + sign-up modal + building animation (NOT Brand Board)

---

## Overview

Single-page onboarding at `/onboarding` with four phases driven by a React state machine. The user never leaves the page until the flow completes. Sign-up happens as a modal overlay on top of the dimmed chat — the user sees their conversation behind the modal, reinforcing that the system "knows" their business.

## Flow

```
CHAT → SIGNUP (modal over dimmed chat) → BUILDING (full screen) → COMPLETE (callback)
```

1. **CHAT** — Full-screen AI conversation. 3-5 messages back and forth. Uses existing `/api/onboarding/chat` route. When AI returns `READY_TO_BUILD`, the chat displays a final "Building your platform now..." message and transitions to SIGNUP.

2. **SIGNUP** — 2-step modal hovers over the dimmed chat background:
   - Step 1: Email + Password + Confirm Password → calls `supabase.auth.signUp()`
   - Step 2: Card on file via Stripe `<PaymentElement>` → "14-day free trial · Cancel anytime" · "You won't be charged today"

3. **BUILDING** — Full-screen progress animation. Does real work: saves config to DB, links config to user, creates Stripe subscription with trial. Theatrical pacing (~3-4 seconds minimum even if work is instant).

4. **COMPLETE** — Calls `onComplete` callback. The parent (or Brand Board terminal) decides where to go next.

---

## Architecture

### Page: `/onboarding/page.tsx`

Thin shell with state machine. No business logic — delegates everything to child components.

```tsx
type Phase = 'CHAT' | 'SIGNUP' | 'BUILDING' | 'COMPLETE'

// State held at page level:
// - phase: Phase
// - config: DashboardConfig | null (from /configure response)
// - configId: string | null (from /configure response)
// - chatMessages: ChatMessage[] (conversation history)
// - description: string (concatenated user messages for /configure)
```

During SIGNUP phase, both `<OnboardingChat>` and `<SignUpModal>` render simultaneously — the chat is visible but dimmed behind the modal.

### Component: `OnboardingChat`

Full-screen chat UI connected to three existing API routes:

| Route | When | Purpose |
|-------|------|---------|
| `POST /api/onboarding/chat` | Every message | Get AI response. Returns text or `READY_TO_BUILD` |
| `POST /api/onboarding/check-input` | Not needed — chat route already handles readiness via `READY_TO_BUILD` sentinel |
| `POST /api/onboarding/configure` | When AI returns `READY_TO_BUILD` | Generate the DashboardConfig. Fires in background. |

**Trigger sequence:**
1. AI response contains `READY_TO_BUILD`
2. Chat displays friendly final message: "I've got everything I need. Let me build your platform..."
3. Immediately call `/api/onboarding/configure` with concatenated user messages as `description`
4. Config generation starts in background (result stored in page state)
5. Transition phase to `SIGNUP`

**UI details:**
- Red Pine logo + "Tell me about your business" header
- Messages: AI on left (gray bubble), user on right (dark bubble)
- Input bar at bottom with Send button
- Auto-scroll to newest message
- Typing indicator while waiting for AI response
- Input disabled during AI response

### Component: `SignUpModal`

CenterModal with step dots (matching existing wizard pattern). Two steps, forward-only.

**Step 1 — Create Account:**
- Email input
- Password input (min 6 chars)
- Confirm Password input
- "Continue" button
- On submit: `supabase.auth.signUp({ email, password })` with `emailRedirectTo` disabled (no email confirmation during onboarding — user is already here)
- If email taken: inline error, stay on step 1
- On success: animate to step 2

**Step 2 — Card on File:**
- Header: "Start Your Free Trial"
- Subtext: "14-day free trial · Cancel anytime"
- Stripe `<PaymentElement>` for card input (rendered inside `<Elements>` provider)
- Footer: "You won't be charged today. Your trial starts now."
- "Start Building" button
- On submit: `stripe.confirmSetup()` with the clientSecret from SetupIntent
- On success: transition phase to `BUILDING`

**Stripe flow (step 2):**
1. When step 2 mounts, call `POST /api/stripe/setup-intent` (new route)
2. Route creates Stripe Customer (linked to new Supabase user), creates SetupIntent, returns `clientSecret`
3. Frontend renders `<PaymentElement>` with that clientSecret
4. On "Start Building", call `stripe.confirmSetup()` to save the card
5. Card is now on file. Subscription creation happens in BUILDING phase.

### New API Route: `POST /api/stripe/setup-intent`

```
Request: (authenticated — session cookie from signUp)
Response: { clientSecret: string, customerId: string }
```

Steps:
1. Get authenticated user from request cookies
2. Create Stripe Customer with user's email + userId metadata
3. Save `stripe_customer_id` to `profiles` table
4. Create SetupIntent with `customer` and `usage: 'off_session'`
5. Return `clientSecret`

This follows the same pattern as the existing `/api/stripe/checkout/route.ts` — reuses `getAuthenticatedUser()` and `getSupabaseAdmin()` helpers.

### Component: `BuildingAnimation`

Full-screen takeover with progress steps. Does real work behind the scenes.

**Visual:**
- Red Pine logo centered
- "Building your platform..." header
- Progress bar (animated, paced)
- Checklist of steps that tick off:
  1. "Setting up your dashboard" — links config to user via `/api/config/link`
  2. "Configuring your services" — waits for config generation if still running
  3. "Adding your booking system" — creates Stripe subscription with 14-day trial
  4. "Finalizing" — updates profile with `plan: 'trialing'`

**Real work mapped to steps:**
- Step 1: `POST /api/config/link` with the `configId` from the configure response
- Step 2: Wait for config promise to resolve (if it hasn't already from the CHAT phase)
- Step 3: `POST /api/stripe/subscribe` (new route — creates subscription using saved payment method)
- Step 4: Verify profile has `plan: 'trialing'`, brief pause for visual effect

**Pacing:** Minimum 3 seconds total even if all API calls finish instantly. Each step gets at least 600ms before ticking off. This prevents the "wait, what happened?" feeling.

### New API Route: `POST /api/stripe/subscribe`

```
Request: (authenticated)
Response: { subscriptionId: string, status: 'trialing' }
```

Steps:
1. Get authenticated user
2. Fetch `stripe_customer_id` from profile
3. List customer's payment methods, get the default one (from SetupIntent)
4. Create subscription: `stripe.subscriptions.create({ customer, items: [{ price: STRIPE_PRICE_ID }], default_payment_method, trial_period_days: 14 })`
5. Update profile: `plan: 'trialing'`, `stripe_subscription_id`
6. Return subscription info

This separates card collection (SetupIntent) from subscription creation — cleaner than doing both at once, and lets us show the subscription creation as a visible "building" step.

---

## File Structure

```
dashboard/src/
├── app/
│   ├── onboarding/
│   │   └── page.tsx                    # State machine shell
│   └── api/stripe/
│       ├── setup-intent/
│       │   └── route.ts                # NEW — create SetupIntent
│       └── subscribe/
│           └── route.ts                # NEW — create subscription with trial
├── components/onboarding/
│   ├── OnboardingChat.tsx              # Chat UI
│   ├── SignUpModal.tsx                 # 2-step modal (auth + card)
│   └── BuildingAnimation.tsx           # Progress animation
```

## Dependencies

**New npm package:** `@stripe/react-stripe-js` (React wrapper for Stripe Elements)

**Existing (no changes):**
- `@stripe/stripe-js` — client-side Stripe loader
- `stripe` — server-side SDK
- `@supabase/ssr` — auth

## Data Flow

```
                    ┌─ configId ─────────────────────────────┐
                    │                                         │
CHAT ──configPromise──> SIGNUP ──userId──> BUILDING ──────> COMPLETE
         │                │                   │
         │                │                   ├─ /api/config/link (configId + userId)
         │                │                   ├─ /api/stripe/subscribe (payment method)
         │                │                   └─ profile.plan = 'trialing'
         │                │
         │                ├─ Step 1: supabase.auth.signUp()
         │                └─ Step 2: /api/stripe/setup-intent → stripe.confirmSetup()
         │
         └─ /api/onboarding/configure (returns config + configId)
```

Config generation starts during CHAT (after READY_TO_BUILD) and runs in parallel with SIGNUP. By the time the user finishes entering email + password + card, the config is likely already generated. The BUILDING phase waits for it if not.

## Edge Cases

- **Email already taken:** Inline error on step 1, user can correct
- **Card declined:** Stripe PaymentElement shows inline error, user can retry
- **Config generation fails:** BUILDING phase shows error with "Try again" button that re-calls /configure
- **Network failure mid-signup:** Modal shows generic error, user can retry current step
- **User closes tab:** No state is persisted — they restart from CHAT. Config (if generated) sits in DB with `user_id: null`, eventually cleaned up
- **Supabase email confirmation:** Disabled for onboarding flow (user is already present). Enabled for standalone `/signup` page (which remains for invite links, etc.)

## What's NOT in Scope

- **Brand Board** — separate sticky note, separate terminal building it
- **COO introduction/tour** — happens on dashboard, not part of this flow
- **Goal Forest** — dashboard feature
- **OAuth/social login** — future enhancement
- **Existing `/signup` page** — remains unchanged for invite/team flows
