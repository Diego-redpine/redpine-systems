# Credit System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an AI credit system with 100 free monthly credits, purchasable credit packs ($5/100, $10/200, $15/300), a TopBar balance badge, and an embedded Stripe purchase modal.

**Architecture:** `user_credits` table tracks free and purchased balances separately. Free credits auto-reset monthly (lazy check on balance read). Three API routes handle balance, purchase, and consumption. TopBar badge always visible; clicking opens a CenterModal with tier selection and embedded Stripe payment.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind, Supabase, Stripe (PaymentIntents), @stripe/react-stripe-js

---

### Task 1: Database Migration — `user_credits` Table

**Files:**
- Modify: `supabase/LATEST_MIGRATIONS.sql` (append at end)

**Step 1: Add migration SQL**

Append to `supabase/LATEST_MIGRATIONS.sql`, before the final "DONE" comment:

```sql
-- ════════════════════════════════════════════════════════════════
-- Migration 040: Create user_credits table
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  free_balance INT NOT NULL DEFAULT 100,
  purchased_balance INT NOT NULL DEFAULT 0,
  free_reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own credits"
  ON public.user_credits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
```

Also update the final "DONE" comment to say `012-040`.

**Step 2: Apply migration via Supabase MCP**

Use `apply_migration` with name `create_user_credits_table`.

**Step 3: Commit**

```bash
git add supabase/LATEST_MIGRATIONS.sql
git commit -m "feat: Add user_credits table for AI credit system"
```

---

### Task 2: Credit Constants File

**Files:**
- Create: `dashboard/src/lib/credits.ts`

**Step 1: Create credit system constants**

```typescript
export const FREE_MONTHLY_CREDITS = 100;
export const FREE_RESET_DAYS = 30;

export interface CreditTier {
  id: string;
  credits: number;
  price: number; // in cents
  priceDisplay: string;
  label: string;
  popular?: boolean;
}

export const CREDIT_TIERS: CreditTier[] = [
  { id: 'starter', credits: 100, price: 500, priceDisplay: '$5', label: 'Starter' },
  { id: 'popular', credits: 200, price: 1000, priceDisplay: '$10', label: 'Popular', popular: true },
  { id: 'pro', credits: 300, price: 1500, priceDisplay: '$15', label: 'Pro' },
];

export interface CreditBalance {
  free_balance: number;
  purchased_balance: number;
  total: number;
  free_reset_at: string;
  next_reset: string;
}

/** Get badge color based on total credits remaining */
export function getCreditBadgeColor(total: number): string {
  if (total >= 50) return '#10B981'; // green
  if (total >= 10) return '#F59E0B'; // yellow
  return '#EF4444'; // red
}
```

**Step 2: Commit**

```bash
git add dashboard/src/lib/credits.ts
git commit -m "feat: Add credit tier constants and helpers"
```

---

### Task 3: API Route — GET `/api/credits/balance`

**Files:**
- Create: `dashboard/src/app/api/credits/balance/route.ts`

**Context:** Follow the exact pattern from `dashboard/src/app/api/stripe/checkout/route.ts` lines 1-38 for auth and Supabase setup. This route reads the user's credit balance, auto-creating a row if none exists, and auto-resetting free credits if expired.

**Step 1: Create balance route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { FREE_MONTHLY_CREDITS, FREE_RESET_DAYS } from '@/lib/credits';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get or create credit record
    let { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !credits) {
      // Auto-create on first access
      const { data: newCredits, error: insertError } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, free_balance: FREE_MONTHLY_CREDITS, purchased_balance: 0 })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create credits:', insertError);
        return NextResponse.json({ success: false, error: 'Failed to initialize credits' }, { status: 500 });
      }
      credits = newCredits;
    }

    // Check if free credits need reset
    const resetAt = new Date(credits.free_reset_at);
    const now = new Date();
    const daysSinceReset = (now.getTime() - resetAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= FREE_RESET_DAYS) {
      const { data: updated } = await supabase
        .from('user_credits')
        .update({ free_balance: FREE_MONTHLY_CREDITS, free_reset_at: now.toISOString(), updated_at: now.toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updated) credits = updated;
    }

    // Calculate next reset date
    const nextReset = new Date(credits.free_reset_at);
    nextReset.setDate(nextReset.getDate() + FREE_RESET_DAYS);

    return NextResponse.json({
      success: true,
      balance: {
        free_balance: credits.free_balance,
        purchased_balance: credits.purchased_balance,
        total: credits.free_balance + credits.purchased_balance,
        free_reset_at: credits.free_reset_at,
        next_reset: nextReset.toISOString(),
      },
    });
  } catch (e) {
    console.error('Credits balance error:', e);
    return NextResponse.json({ success: false, error: 'Failed to get balance' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add dashboard/src/app/api/credits/balance/route.ts
git commit -m "feat: Add GET /api/credits/balance route"
```

---

### Task 4: API Route — POST `/api/credits/consume`

**Files:**
- Create: `dashboard/src/app/api/credits/consume/route.ts`

**Context:** Deducts 1 credit. Uses free credits first, then purchased. Returns updated balance. Called by AI routes before making API calls.

**Step 1: Create consume route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { FREE_MONTHLY_CREDITS, FREE_RESET_DAYS } from '@/lib/credits';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const amount = body.amount ?? 1;

    const supabase = getSupabaseAdmin();

    // Get current balance
    let { data: credits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!credits) {
      // Auto-create
      const { data: newCredits } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, free_balance: FREE_MONTHLY_CREDITS, purchased_balance: 0 })
        .select()
        .single();
      credits = newCredits;
    }

    if (!credits) {
      return NextResponse.json({ success: false, error: 'Failed to access credits' }, { status: 500 });
    }

    // Check if free credits need reset
    const resetAt = new Date(credits.free_reset_at);
    const now = new Date();
    const daysSinceReset = (now.getTime() - resetAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReset >= FREE_RESET_DAYS) {
      credits.free_balance = FREE_MONTHLY_CREDITS;
      credits.free_reset_at = now.toISOString();
    }

    const total = credits.free_balance + credits.purchased_balance;
    if (total < amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        balance: { free_balance: credits.free_balance, purchased_balance: credits.purchased_balance, total },
      }, { status: 402 });
    }

    // Deduct: free first, then purchased
    let freeDeduct = Math.min(credits.free_balance, amount);
    let purchasedDeduct = amount - freeDeduct;

    const updates: Record<string, unknown> = {
      free_balance: credits.free_balance - freeDeduct,
      purchased_balance: credits.purchased_balance - purchasedDeduct,
      updated_at: now.toISOString(),
    };
    if (daysSinceReset >= FREE_RESET_DAYS) {
      updates.free_reset_at = now.toISOString();
    }

    const { data: updated, error } = await supabase
      .from('user_credits')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Credit deduction error:', error);
      return NextResponse.json({ success: false, error: 'Failed to deduct credits' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      consumed: amount,
      balance: {
        free_balance: updated.free_balance,
        purchased_balance: updated.purchased_balance,
        total: updated.free_balance + updated.purchased_balance,
      },
    });
  } catch (e) {
    console.error('Credits consume error:', e);
    return NextResponse.json({ success: false, error: 'Failed to consume credits' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add dashboard/src/app/api/credits/consume/route.ts
git commit -m "feat: Add POST /api/credits/consume route"
```

---

### Task 5: API Route — POST `/api/credits/purchase`

**Files:**
- Create: `dashboard/src/app/api/credits/purchase/route.ts`

**Context:** Creates a Stripe PaymentIntent for the selected tier. After successful payment on the frontend, adds credits to `purchased_balance`. Uses the same Stripe customer pattern from `dashboard/src/app/api/stripe/checkout/route.ts` lines 53-88 for customer lookup/creation.

**Step 1: Create purchase route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import { CREDIT_TIERS } from '@/lib/credits';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { tierId, paymentMethodId } = body;

    // Validate tier
    const tier = CREDIT_TIERS.find(t => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ success: false, error: 'Invalid credit tier' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', user.id);
    }

    // If paymentMethodId provided, attach to customer
    if (paymentMethodId) {
      try {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
      } catch {
        // May already be attached — ignore
      }
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tier.price,
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId || undefined,
      confirm: !!paymentMethodId,
      automatic_payment_methods: paymentMethodId ? undefined : { enabled: true },
      metadata: {
        userId: user.id,
        tierId: tier.id,
        credits: tier.credits.toString(),
        type: 'credit_purchase',
      },
    });

    // If payment succeeded immediately (saved card), add credits now
    if (paymentIntent.status === 'succeeded') {
      await supabase.rpc('add_purchased_credits', { p_user_id: user.id, p_amount: tier.credits }).catch(() => {
        // Fallback: manual update
        return supabase
          .from('user_credits')
          .update({
            purchased_balance: (profile as any)?.purchased_balance + tier.credits || tier.credits,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      });

      // Direct SQL increment as fallback
      await supabase.from('user_credits').select('purchased_balance').eq('user_id', user.id).single().then(async ({ data }) => {
        if (data) {
          await supabase
            .from('user_credits')
            .update({ purchased_balance: data.purchased_balance + tier.credits, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        }
      });

      return NextResponse.json({
        success: true,
        status: 'completed',
        credits_added: tier.credits,
      });
    }

    // Payment requires further action (3D Secure, etc.)
    return NextResponse.json({
      success: true,
      status: 'requires_action',
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (e) {
    console.error('Credits purchase error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Failed to process purchase' },
      { status: 500 },
    );
  }
}
```

**Step 2: Create confirm route for post-3D-Secure**

Create `dashboard/src/app/api/credits/confirm/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { paymentIntentId } = await request.json();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ success: false, error: 'Payment not completed' }, { status: 400 });
    }

    // Verify this payment is for this user
    if (paymentIntent.metadata.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const credits = parseInt(paymentIntent.metadata.credits, 10);
    const supabase = getSupabaseAdmin();

    // Add credits
    const { data } = await supabase
      .from('user_credits')
      .select('purchased_balance')
      .eq('user_id', user.id)
      .single();

    if (data) {
      await supabase
        .from('user_credits')
        .update({ purchased_balance: data.purchased_balance + credits, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, credits_added: credits });
  } catch (e) {
    console.error('Credits confirm error:', e);
    return NextResponse.json({ success: false, error: 'Failed to confirm purchase' }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add dashboard/src/app/api/credits/purchase/route.ts dashboard/src/app/api/credits/confirm/route.ts
git commit -m "feat: Add credit purchase and confirm API routes"
```

---

### Task 6: CreditBadge Component (TopBar)

**Files:**
- Create: `dashboard/src/components/CreditBadge.tsx`

**Context:** Small pill badge that shows credit balance in the TopBar. Fetches balance on mount. Color changes based on amount (green/yellow/red). Clicking opens purchase modal. Pattern: similar to `useNotificationCount` hook from `dashboard/src/components/NotificationPanel.tsx` line 7.

**Step 1: Create CreditBadge component**

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCreditBadgeColor, CreditBalance } from '@/lib/credits';

interface CreditBadgeProps {
  onClick: () => void;
}

export function useCreditBalance() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/credits/balance', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setBalance(json.balance);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return { balance, refetch: fetchBalance };
}

export default function CreditBadge({ onClick }: CreditBadgeProps) {
  const { balance } = useCreditBalance();

  if (!balance) return null;

  const badgeColor = getCreditBadgeColor(balance.total);
  const isLow = balance.total < 10;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80 ${isLow ? 'animate-pulse' : ''}`}
      style={{ backgroundColor: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
      title={`${balance.total} AI credits remaining (${balance.free_balance} free · ${balance.purchased_balance} purchased)`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
      {balance.total}
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add dashboard/src/components/CreditBadge.tsx
git commit -m "feat: Add CreditBadge component with balance hook"
```

---

### Task 7: CreditPurchaseModal Component

**Files:**
- Create: `dashboard/src/components/CreditPurchaseModal.tsx`

**Context:** CenterModal (from `dashboard/src/components/ui/CenterModal.tsx`) with 3 tier cards, current balance display, embedded Stripe PaymentElement, and purchase button. Pattern: follows `dashboard/src/components/onboarding/SignUpModal.tsx` for Stripe Elements embedding (`loadStripe`, `<Elements>`, `<PaymentElement>`).

**Step 1: Create CreditPurchaseModal component**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { CREDIT_TIERS, CreditTier, CreditBalance } from '@/lib/credits';
import CenterModal from './ui/CenterModal';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: DashboardColors;
  balance: CreditBalance | null;
  onPurchaseComplete: () => void;
}

// Inner form component (needs Stripe context)
function PurchaseForm({
  selectedTier,
  colors,
  onSuccess,
  onClose,
}: {
  selectedTier: CreditTier;
  colors: DashboardColors;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm credits on server
        await fetch('/api/credits/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        toast.success(`${selectedTier.credits} credits added!`);
        onSuccess();
        onClose();
      }
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        onClick={handleSubmit}
        disabled={!stripe || isProcessing}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{ backgroundColor: buttonColor, color: buttonText }}
      >
        {isProcessing ? 'Processing...' : `Purchase ${selectedTier.credits} credits for ${selectedTier.priceDisplay}`}
      </button>
    </div>
  );
}

export default function CreditPurchaseModal({
  isOpen,
  onClose,
  colors,
  balance,
  onPurchaseComplete,
}: CreditPurchaseModalProps) {
  const [selectedTier, setSelectedTier] = useState<CreditTier>(CREDIT_TIERS[1]); // Default: Popular
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const headingColor = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';

  // Create PaymentIntent when tier is selected
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      return;
    }

    const createIntent = async () => {
      setIsLoading(true);
      setClientSecret(null);
      try {
        const res = await fetch('/api/credits/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId: selectedTier.id }),
        });
        const json = await res.json();
        if (json.success && json.status === 'completed') {
          // Paid with saved card instantly
          toast.success(`${selectedTier.credits} credits added!`);
          onPurchaseComplete();
          onClose();
        } else if (json.client_secret) {
          setClientSecret(json.client_secret);
        } else {
          toast.error(json.error || 'Failed to start purchase');
        }
      } catch {
        toast.error('Failed to connect to payment service');
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [isOpen, selectedTier.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextReset = balance?.next_reset
    ? new Date(balance.next_reset).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '--';

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Buy AI Credits"
      subtitle={`${balance?.total ?? 0} credits remaining`}
      maxWidth="max-w-md"
      configColors={colors}
    >
      <div className="space-y-5">
        {/* Balance breakdown */}
        {balance && (
          <div className="flex gap-4 text-center">
            <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: `${borderColor}40` }}>
              <p className="text-lg font-bold" style={{ color: headingColor }}>{balance.free_balance}</p>
              <p className="text-xs" style={{ color: textMuted }}>Free</p>
            </div>
            <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: `${borderColor}40` }}>
              <p className="text-lg font-bold" style={{ color: headingColor }}>{balance.purchased_balance}</p>
              <p className="text-xs" style={{ color: textMuted }}>Purchased</p>
            </div>
          </div>
        )}

        {/* Tier selection */}
        <div className="grid grid-cols-3 gap-3">
          {CREDIT_TIERS.map(tier => {
            const isSelected = selectedTier.id === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className="relative rounded-xl p-4 text-center transition-all"
                style={{
                  backgroundColor: isSelected ? buttonColor : cardBg,
                  color: isSelected ? buttonText : headingColor,
                  border: `2px solid ${isSelected ? buttonColor : borderColor}`,
                }}
              >
                {tier.popular && (
                  <span
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                    style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
                  >
                    Best Value
                  </span>
                )}
                <p className="text-2xl font-bold">{tier.credits}</p>
                <p className="text-xs mt-0.5" style={{ opacity: 0.7 }}>credits</p>
                <p className="text-base font-semibold mt-2">{tier.priceDisplay}</p>
                <p className="text-[10px] mt-0.5" style={{ opacity: 0.5 }}>
                  ${(tier.price / tier.credits / 100).toFixed(2)}/credit
                </p>
              </button>
            );
          })}
        </div>

        {/* Stripe Payment Element */}
        {isLoading && (
          <div className="text-center py-6">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs mt-2" style={{ color: textMuted }}>Preparing payment...</p>
          </div>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: buttonColor } } }}
          >
            <PurchaseForm
              selectedTier={selectedTier}
              colors={colors}
              onSuccess={onPurchaseComplete}
              onClose={onClose}
            />
          </Elements>
        )}

        {/* Footer */}
        <p className="text-xs text-center" style={{ color: textMuted }}>
          100 free credits reset on {nextReset} · Purchased credits never expire
        </p>
      </div>
    </CenterModal>
  );
}
```

**Step 2: Commit**

```bash
git add dashboard/src/components/CreditPurchaseModal.tsx
git commit -m "feat: Add CreditPurchaseModal with embedded Stripe payment"
```

---

### Task 8: Wire CreditBadge + Modal into TopBar

**Files:**
- Modify: `dashboard/src/components/TopBar.tsx`

**Context:** Add the CreditBadge between the Messages icon and the Profile dropdown (around line 289-290). Add CreditPurchaseModal at the end of the component. Add state for modal open/close.

**Step 1: Add imports**

After line 8 (`import MessagePanel, { useMessageCount } from './MessagePanel';`), add:

```typescript
import CreditBadge, { useCreditBalance } from './CreditBadge';
import CreditPurchaseModal from './CreditPurchaseModal';
```

**Step 2: Add state and hook**

After line 36 (`const messageCount = useMessageCount();`), add:

```typescript
const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
const { balance: creditBalance, refetch: refetchCredits } = useCreditBalance();
```

**Step 3: Add CreditBadge in TopBar**

Insert between the Messages panel (line 288-289) and the Profile dropdown (line 290), add:

```tsx
{/* Credits badge */}
<CreditBadge onClick={() => setIsCreditModalOpen(true)} />
```

**Step 4: Add CreditPurchaseModal**

Before the final closing `</>` of the component, add:

```tsx
<CreditPurchaseModal
  isOpen={isCreditModalOpen}
  onClose={() => setIsCreditModalOpen(false)}
  colors={colors}
  balance={creditBalance}
  onPurchaseComplete={refetchCredits}
/>
```

**Step 5: Commit**

```bash
git add dashboard/src/components/TopBar.tsx
git commit -m "feat: Wire CreditBadge and purchase modal into TopBar"
```

---

### Task 9: Type Check & Build Verification

**Step 1: Run TypeScript check**

```bash
cd ~/redpine-os/dashboard && npx tsc --noEmit
```

Expected: Zero errors.

**Step 2: Run build**

```bash
cd ~/redpine-os/dashboard && npm run build
```

Expected: Build succeeds. Look for `/api/credits/balance`, `/api/credits/consume`, `/api/credits/purchase`, `/api/credits/confirm` in the route list.

**Step 3: Fix any issues found**

---

## Summary

| Task | Files | Lines |
|------|-------|-------|
| 1. DB Migration | LATEST_MIGRATIONS.sql | ~15 |
| 2. Credit Constants | credits.ts (new) | ~40 |
| 3. Balance API | balance/route.ts (new) | ~80 |
| 4. Consume API | consume/route.ts (new) | ~95 |
| 5. Purchase + Confirm API | purchase/route.ts, confirm/route.ts (new) | ~160 |
| 6. CreditBadge | CreditBadge.tsx (new) | ~55 |
| 7. PurchaseModal | CreditPurchaseModal.tsx (new) | ~200 |
| 8. TopBar wiring | TopBar.tsx (modified) | ~10 |
| 9. Verification | — | — |

**Total new code:** ~650 lines across 7 new files + 2 modifications + 1 migration.
