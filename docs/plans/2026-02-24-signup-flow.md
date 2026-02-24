# Sign-Up Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the onboarding sign-up flow — AI chat, 2-step sign-up modal, and building animation — as a single-page state machine at `/onboarding`.

**Architecture:** Single page (`/onboarding`) with a React state machine driving four phases: CHAT, SIGNUP, BUILDING, COMPLETE. All components are client-side. Two new API routes handle Stripe card collection and subscription creation. The chat connects to three existing API routes.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind, Supabase Auth, Stripe Elements (`@stripe/react-stripe-js`), existing `stripe` + `@stripe/stripe-js` packages.

**Design doc:** `docs/plans/2026-02-24-signup-flow-design.md`

---

### Task 1: Install @stripe/react-stripe-js

**Files:**
- Modify: `dashboard/package.json`

**Step 1: Install the package**

Run from `dashboard/`:
```bash
npm install @stripe/react-stripe-js
```

**Step 2: Verify installation**

Run: `grep react-stripe-js dashboard/package.json`
Expected: `"@stripe/react-stripe-js": "^X.X.X"`

**Step 3: Commit**

```bash
git add dashboard/package.json dashboard/package-lock.json
git commit -m "feat: add @stripe/react-stripe-js for embedded card collection"
```

---

### Task 2: Create POST /api/stripe/setup-intent

Creates a Stripe Customer + SetupIntent so the frontend can collect a card without charging.

**Files:**
- Create: `dashboard/src/app/api/stripe/setup-intent/route.ts`

**Step 1: Write the route**

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
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// POST /api/stripe/setup-intent — create customer + setup intent for card collection
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check for existing Stripe customer
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create SetupIntent for saving card
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      metadata: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (error) {
    console.error('SetupIntent error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create setup intent' },
      { status: 500 },
    );
  }
}
```

**Step 2: Verify it compiles**

Run: `cd dashboard && npx tsc --noEmit src/app/api/stripe/setup-intent/route.ts 2>&1 | head -20`

If TypeScript errors appear, fix imports. The route follows the exact same pattern as `src/app/api/stripe/checkout/route.ts`.

**Step 3: Commit**

```bash
git add dashboard/src/app/api/stripe/setup-intent/route.ts
git commit -m "feat: add setup-intent API route for card collection"
```

---

### Task 3: Create POST /api/stripe/subscribe

Creates a subscription with 14-day trial using the saved payment method.

**Files:**
- Create: `dashboard/src/app/api/stripe/subscribe/route.ts`

**Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';

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
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// POST /api/stripe/subscribe — create subscription with trial using saved payment method
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { success: false, error: 'No Stripe customer found. Complete card setup first.' },
        { status: 400 },
      );
    }

    // Get the customer's default payment method (saved by SetupIntent)
    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: 'card',
      limit: 1,
    });

    if (paymentMethods.data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No payment method found. Complete card setup first.' },
        { status: 400 },
      );
    }

    const paymentMethodId = paymentMethods.data[0].id;

    // Create subscription with 14-day trial
    const subscription = await stripe.subscriptions.create({
      customer: profile.stripe_customer_id,
      items: [{ price: STRIPE_PRICE_ID }],
      default_payment_method: paymentMethodId,
      trial_period_days: 14,
      metadata: { userId: user.id },
    });

    // Update profile with subscription info
    await supabaseAdmin
      .from('profiles')
      .update({
        plan: 'trialing',
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: 'trialing',
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 },
    );
  }
}
```

**Step 2: Verify it compiles**

Run: `cd dashboard && npx tsc --noEmit src/app/api/stripe/subscribe/route.ts 2>&1 | head -20`

**Step 3: Commit**

```bash
git add dashboard/src/app/api/stripe/subscribe/route.ts
git commit -m "feat: add subscribe API route for trial subscription creation"
```

---

### Task 4: Create OnboardingChat component

Full-screen chat UI connected to existing `/api/onboarding/chat` and `/api/onboarding/configure`.

**Files:**
- Create: `dashboard/src/components/onboarding/OnboardingChat.tsx`

**Context you need:**
- `POST /api/onboarding/chat` accepts `{ messages: { role, content }[] }`, returns `{ success, response }`. Response may contain `READY_TO_BUILD` sentinel.
- `POST /api/onboarding/configure` accepts `{ description: string }`, returns `{ success, config, config_id }`.
- Chat system prompt asks 4-6 questions before signaling READY_TO_BUILD.
- Rate limited: 30 req/min for chat, 5 req/min for configure.

**Step 1: Write the component**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Brand from '@/components/Brand';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OnboardingChatProps {
  /** Called when AI signals READY_TO_BUILD. Passes config promise + configId resolver. */
  onReady: (configPromise: Promise<{ config: any; configId: string }>) => void;
  /** Whether the chat should be dimmed (modal is showing over it) */
  dimmed?: boolean;
}

export default function OnboardingChat({ onReady, dimmed = false }: OnboardingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send initial greeting
  useEffect(() => {
    const greet = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/onboarding/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [] }),
        });
        const data = await res.json();
        if (data.success && data.response) {
          setMessages([{ role: 'assistant', content: data.response }]);
        }
      } catch {
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm excited to help you set up your platform. Tell me about your business — what do you do?",
        }]);
      }
      setIsLoading(false);
    };
    greet();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || hasTriggered) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();

      if (!data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Sorry, I had a hiccup. Could you try that again?",
        }]);
        setIsLoading(false);
        return;
      }

      // Check for READY_TO_BUILD signal
      if (data.response.includes('READY_TO_BUILD')) {
        setHasTriggered(true);

        // Show friendly final message instead of the sentinel
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I've got everything I need. Let me build your platform...",
        }]);

        // Build description from all user messages
        const description = updatedMessages
          .filter(m => m.role === 'user')
          .map(m => m.content)
          .join('\n');

        // Fire config generation in background, pass promise to parent
        const configPromise = fetch('/api/onboarding/configure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description }),
        })
          .then(r => r.json())
          .then(data => {
            if (!data.success) throw new Error(data.error || 'Config generation failed');
            return { config: data.config, configId: data.config_id };
          });

        // Short delay so user sees the final message before modal appears
        setTimeout(() => onReady(configPromise), 1200);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Something went wrong. Could you try sending that again?",
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-gray-50 transition-opacity duration-300 ${dimmed ? 'opacity-30 pointer-events-none' : ''}`}>
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-6">
        <Brand size="lg" linkToHome={false} />
        <h1 className="text-xl font-semibold mt-4 text-gray-900">Tell me about your business</h1>
        <p className="text-sm text-gray-500 mt-1">I'll build your platform from scratch</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-md'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-400 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading || hasTriggered}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || hasTriggered}
            className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd dashboard && npx tsc --noEmit src/components/onboarding/OnboardingChat.tsx 2>&1 | head -20`

**Step 3: Commit**

```bash
git add dashboard/src/components/onboarding/OnboardingChat.tsx
git commit -m "feat: add OnboardingChat component connected to AI chat API"
```

---

### Task 5: Create SignUpModal component

2-step modal: email+password (step 1) → card on file via Stripe Elements (step 2).

**Files:**
- Create: `dashboard/src/components/onboarding/SignUpModal.tsx`

**Context you need:**
- Uses `CenterModal` from `@/components/ui/CenterModal` (see `dashboard/src/components/ui/CenterModal.tsx` for props).
- Step 1 calls `supabase.auth.signUp()` — same pattern as `dashboard/src/app/signup/page.tsx`.
- Step 2 calls `POST /api/stripe/setup-intent` (Task 2), then renders Stripe `<PaymentElement>`.
- Supabase browser client: `createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`.
- Stripe publishable key: `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

**Step 1: Write the component**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CenterModal from '@/components/ui/CenterModal';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SignUpModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ── Step 2: Card Form (rendered inside <Elements>) ──────────────────────

function CardForm({ onComplete }: { onComplete: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Card setup failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Card saved successfully
      onComplete();
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Start Your Free Trial</h2>
        <p className="text-sm text-gray-500 mt-1">14-day free trial &middot; Cancel anytime</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        You won't be charged today. Your trial starts now.
      </p>

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Setting up...' : 'Start Building'}
      </button>
    </form>
  );
}

// ── Main Modal ──────────────────────────────────────────────────────────

export default function SignUpModal({ isOpen, onComplete }: SignUpModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create SetupIntent when entering step 2
  const initStripe = async () => {
    try {
      const res = await fetch('/api/stripe/setup-intent', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        setError(data.error || 'Failed to initialize payment. Please try again.');
      }
    } catch {
      setError('Failed to connect to payment service.');
    }
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // No email redirect — user is already here in onboarding
          data: { source: 'onboarding' },
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.');
        setIsLoading(false);
        return;
      }

      // If email confirmation is required and no session yet
      if (!authData.session) {
        setError('Please check your email to confirm your account, then try again.');
        setIsLoading(false);
        return;
      }

      // Account created + session active — move to card step
      setStep(2);
      await initStripe();
    } catch {
      setError('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <CenterModal isOpen={isOpen} onClose={() => {}} maxWidth="max-w-md">
      {/* Step dots */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className={`w-2 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-gray-900' : 'bg-gray-300'}`} />
        <div className="w-8 h-px bg-gray-300" />
        <div className={`w-2 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-gray-900' : 'bg-gray-300'}`} />
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create Your Account</h2>
            <p className="text-sm text-gray-500 mt-1">Just a few details to get started</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="onboard-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="onboard-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="onboard-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="onboard-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="onboard-confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="onboard-confirm"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Continue'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      )}

      {step === 2 && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <CardForm onComplete={onComplete} />
        </Elements>
      )}

      {step === 2 && !clientSecret && !error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-500">Setting up payment...</div>
        </div>
      )}

      {step === 2 && !clientSecret && error && (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
          <button
            onClick={initStripe}
            className="w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </CenterModal>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd dashboard && npx tsc --noEmit src/components/onboarding/SignUpModal.tsx 2>&1 | head -20`

**Step 3: Commit**

```bash
git add dashboard/src/components/onboarding/SignUpModal.tsx
git commit -m "feat: add SignUpModal with 2-step auth + Stripe card collection"
```

---

### Task 6: Create BuildingAnimation component

Full-screen progress animation that does real work: links config, creates subscription.

**Files:**
- Create: `dashboard/src/components/onboarding/BuildingAnimation.tsx`

**Context you need:**
- `POST /api/config/link` accepts `{ configId }` (authenticated), links config to user. See `dashboard/src/app/api/config/link/route.ts`.
- `POST /api/stripe/subscribe` (Task 3) creates subscription with trial.
- `configPromise` resolves to `{ config, configId }` — may already be resolved or still pending.

**Step 1: Write the component**

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Brand from '@/components/Brand';

interface BuildingStep {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

interface BuildingAnimationProps {
  configPromise: Promise<{ config: any; configId: string }>;
  onComplete: (configId: string) => void;
}

const STEP_LABELS = [
  'Setting up your dashboard',
  'Configuring your services',
  'Adding your booking system',
  'Finalizing',
];

const MIN_STEP_DURATION = 700; // ms — minimum time each step is visible

export default function BuildingAnimation({ configPromise, onComplete }: BuildingAnimationProps) {
  const [steps, setSteps] = useState<BuildingStep[]>(
    STEP_LABELS.map((label, i) => ({ label, status: i === 0 ? 'active' : 'pending' })),
  );
  const [error, setError] = useState('');
  const configRef = useRef<{ config: any; configId: string } | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    runSteps();
  }, []);

  const updateStep = (index: number, status: BuildingStep['status']) => {
    setSteps(prev => prev.map((s, i) => {
      if (i === index) return { ...s, status };
      if (i === index + 1 && status === 'done') return { ...s, status: 'active' };
      return s;
    }));
  };

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runSteps = async () => {
    try {
      // Step 0: "Setting up your dashboard" — wait for config + link it
      const start0 = Date.now();
      const configResult = await configPromise;
      configRef.current = configResult;

      await fetch('/api/config/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId: configResult.configId }),
      });

      await wait(Math.max(0, MIN_STEP_DURATION - (Date.now() - start0)));
      updateStep(0, 'done');

      // Step 1: "Configuring your services" — theatrical pause
      await wait(MIN_STEP_DURATION);
      updateStep(1, 'done');

      // Step 2: "Adding your booking system" — create subscription
      const start2 = Date.now();
      const subRes = await fetch('/api/stripe/subscribe', { method: 'POST' });
      const subData = await subRes.json();

      if (!subData.success) {
        console.error('Subscription creation failed:', subData.error);
        // Non-fatal — user can subscribe later from dashboard
      }

      await wait(Math.max(0, MIN_STEP_DURATION - (Date.now() - start2)));
      updateStep(2, 'done');

      // Step 3: "Finalizing" — brief pause
      await wait(MIN_STEP_DURATION);
      updateStep(3, 'done');

      // Done — small pause before transition
      await wait(500);
      onComplete(configResult.configId);
    } catch (err) {
      console.error('Building error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const progress = steps.filter(s => s.status === 'done').length / steps.length;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <Brand size="lg" linkToHome={false} />

      <h1 className="text-xl font-semibold text-gray-900 mt-6">
        Building your platform...
      </h1>

      {/* Progress bar */}
      <div className="w-72 h-2 bg-gray-200 rounded-full mt-8 overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Steps checklist */}
      <div className="mt-8 space-y-3 w-72">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            {step.status === 'done' && (
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {step.status === 'active' && (
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
              </div>
            )}
            {step.status === 'pending' && (
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
              </div>
            )}
            {step.status === 'error' && (
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={step.status === 'done' ? 'text-gray-500' : step.status === 'active' ? 'text-gray-900 font-medium' : 'text-gray-400'}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd dashboard && npx tsc --noEmit src/components/onboarding/BuildingAnimation.tsx 2>&1 | head -20`

**Step 3: Commit**

```bash
git add dashboard/src/components/onboarding/BuildingAnimation.tsx
git commit -m "feat: add BuildingAnimation with real config linking + subscription creation"
```

---

### Task 7: Create /onboarding/page.tsx (state machine)

The thin shell that orchestrates everything.

**Files:**
- Create: `dashboard/src/app/onboarding/page.tsx`

**Context you need:**
- Middleware at `dashboard/src/middleware.ts` already allows `/onboarding` as a public route (no auth required).
- The state machine drives: CHAT → SIGNUP → BUILDING → COMPLETE.
- During SIGNUP phase, the chat stays visible but dimmed.
- COMPLETE phase redirects to `/dashboard` (or calls a callback for Brand Board integration later).

**Step 1: Write the page**

```tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingChat from '@/components/onboarding/OnboardingChat';
import SignUpModal from '@/components/onboarding/SignUpModal';
import BuildingAnimation from '@/components/onboarding/BuildingAnimation';

type Phase = 'CHAT' | 'SIGNUP' | 'BUILDING' | 'COMPLETE';

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('CHAT');
  const configPromiseRef = useRef<Promise<{ config: any; configId: string }> | null>(null);

  const handleChatReady = (configPromise: Promise<{ config: any; configId: string }>) => {
    configPromiseRef.current = configPromise;
    setPhase('SIGNUP');
  };

  const handleSignUpComplete = () => {
    setPhase('BUILDING');
  };

  const handleBuildingComplete = (configId: string) => {
    setPhase('COMPLETE');
    // Redirect to dashboard (Brand Board integration point — replace this redirect later)
    router.push(`/dashboard?config_id=${configId}`);
  };

  return (
    <div className="relative min-h-screen">
      {/* Chat layer — visible during CHAT and SIGNUP (dimmed) */}
      {(phase === 'CHAT' || phase === 'SIGNUP') && (
        <OnboardingChat
          onReady={handleChatReady}
          dimmed={phase === 'SIGNUP'}
        />
      )}

      {/* Sign-up modal — overlays the dimmed chat */}
      {phase === 'SIGNUP' && (
        <SignUpModal
          isOpen={true}
          onComplete={handleSignUpComplete}
        />
      )}

      {/* Building animation — replaces everything */}
      {phase === 'BUILDING' && configPromiseRef.current && (
        <BuildingAnimation
          configPromise={configPromiseRef.current}
          onComplete={handleBuildingComplete}
        />
      )}
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd dashboard && npx tsc --noEmit src/app/onboarding/page.tsx 2>&1 | head -20`

**Step 3: Verify /onboarding is a public route in middleware**

Open `dashboard/src/middleware.ts` and confirm `/onboarding` is in the PUBLIC_ROUTES array. If not, add it.

**Step 4: Commit**

```bash
git add dashboard/src/app/onboarding/page.tsx
git commit -m "feat: add onboarding page with CHAT → SIGNUP → BUILDING state machine"
```

---

### Task 8: End-to-end verification

**Step 1: Start the dev server**

Run: `cd dashboard && npm run dev`

**Step 2: Navigate to /onboarding**

Open `http://localhost:3000/onboarding` in a browser.

**Step 3: Verify each phase**

1. **CHAT phase**: AI greeting appears. Type a business description. AI asks follow-up questions. After 4-5 exchanges, AI signals READY_TO_BUILD and shows "I've got everything I need. Let me build your platform..."
2. **SIGNUP phase**: Modal appears over dimmed chat. Step 1 shows email/password form. Fill in and click Continue. Step 2 shows Stripe card input (requires real `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`).
3. **BUILDING phase**: Progress animation plays. Steps tick off. Config is linked.
4. **COMPLETE**: Redirects to `/dashboard`.

**Note:** For step 2 to work with Stripe, you need real test API keys in `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Test card number: `4242 4242 4242 4242`, any future expiry, any CVC.

**Step 4: Final commit**

If any fixes were needed during verification:
```bash
git add -A
git commit -m "fix: onboarding flow end-to-end fixes"
```
