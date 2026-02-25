'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import CenterModal from '@/components/ui/CenterModal';

// ---------------------------------------------------------------------------
// Supabase browser client
// ---------------------------------------------------------------------------
function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ---------------------------------------------------------------------------
// Stripe promise (singleton)
// ---------------------------------------------------------------------------
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface SignUpModalProps {
  isOpen: boolean;
  onComplete: () => void; // Called after card is successfully saved
}

// ---------------------------------------------------------------------------
// Step indicator dots
// ---------------------------------------------------------------------------
function StepDots({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {/* Dot 1 */}
      <div
        className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
          currentStep >= 1 ? 'bg-gray-900' : 'bg-gray-300'
        }`}
      />
      {/* Connector line */}
      <div
        className={`w-8 h-0.5 transition-colors duration-300 ${
          currentStep >= 2 ? 'bg-gray-900' : 'bg-gray-300'
        }`}
      />
      {/* Dot 2 */}
      <div
        className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
          currentStep >= 2 ? 'bg-gray-900' : 'bg-gray-300'
        }`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner card form (must be inside <Elements> provider)
// ---------------------------------------------------------------------------
function CardForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { error: setupError } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (setupError) {
        setError(setupError.message || 'Failed to save card. Please try again.');
        setIsSubmitting(false);
        return;
      }

      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !stripe || !elements}
        className="w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Start Building'}
      </button>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        You won&apos;t be charged today. Your trial starts now.
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// SignUpModal
// ---------------------------------------------------------------------------
export default function SignUpModal({ isOpen, onComplete }: SignUpModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Step 2 state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [setupError, setSetupError] = useState('');
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);

  // -------------------------------------------------------------------------
  // Step 2: Fetch SetupIntent on mount
  // -------------------------------------------------------------------------
  const fetchSetupIntent = useCallback(async () => {
    setIsLoadingSetup(true);
    setSetupError('');

    try {
      const res = await fetch('/api/stripe/setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!data.success || !data.clientSecret) {
        throw new Error(data.error || 'Failed to initialize payment setup');
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setSetupError(
        err instanceof Error ? err.message : 'Failed to initialize payment setup',
      );
    } finally {
      setIsLoadingSetup(false);
    }
  }, []);

  // Trigger SetupIntent fetch when entering step 2
  useEffect(() => {
    if (step === 2 && !clientSecret && !isLoadingSetup) {
      fetchSetupIntent();
    }
  }, [step, clientSecret, isLoadingSetup, fetchSetupIntent]);

  // -------------------------------------------------------------------------
  // Step 1: Create account
  // -------------------------------------------------------------------------
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Client-side validation
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsCreating(true);

    try {
      const supabase = getSupabase();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { source: 'onboarding' },
        },
      });

      if (error) {
        // Supabase returns "User already registered" for duplicate emails
        setAuthError(error.message);
        setIsCreating(false);
        return;
      }

      // If email confirmation is required and no session is returned
      if (!data.session) {
        setNeedsConfirmation(true);
        setIsCreating(false);
        return;
      }

      // Success — animate to step 2
      setStep(2);
    } catch {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // -------------------------------------------------------------------------
  // Step 2: Card saved successfully
  // -------------------------------------------------------------------------
  const handleCardSaved = () => {
    onComplete();
  };

  // -------------------------------------------------------------------------
  // No-op close handler (user must complete signup)
  // -------------------------------------------------------------------------
  const noop = useCallback(() => {}, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <CenterModal isOpen={isOpen} onClose={noop} maxWidth="max-w-md" noPadding>
      <div className="p-6">
        <StepDots currentStep={step} />

        {/* -------- Step 1: Create Account -------- */}
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Create Your Account
              </h2>
              <p className="text-sm text-gray-500">
                Quick setup, then we&apos;ll finish building your platform.
              </p>
            </div>

            {needsConfirmation ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We sent a confirmation link to{' '}
                  <span className="font-medium text-gray-700">{email}</span>.
                  <br />
                  Please confirm your email, then come back here.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {authError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-confirm"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating account...' : 'Continue'}
                </button>

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </form>
            )}
          </div>
        )}

        {/* -------- Step 2: Card on File -------- */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Start Your Free Trial
              </h2>
              <p className="text-sm text-gray-500">
                14-day free trial &middot; Cancel anytime
              </p>
            </div>

            {isLoadingSetup && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500">Setting up payment...</p>
              </div>
            )}

            {setupError && !isLoadingSetup && (
              <div className="text-center py-8">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                  {setupError}
                </div>
                <button
                  onClick={() => {
                    setClientSecret(null);
                    fetchSetupIntent();
                  }}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {clientSecret && !isLoadingSetup && !setupError && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#111827',
                      borderRadius: '12px',
                      fontFamily: 'inherit',
                      fontSizeBase: '14px',
                    },
                    rules: {
                      '.Input': {
                        border: '1px solid #E5E7EB',
                        boxShadow: 'none',
                        padding: '10px 16px',
                      },
                      '.Input:focus': {
                        border: '1px solid #D1D5DB',
                        boxShadow: '0 0 0 2px rgba(17,24,39,0.1)',
                      },
                      '.Label': {
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '4px',
                      },
                    },
                  },
                }}
              >
                <CardForm onSuccess={handleCardSaved} />
              </Elements>
            )}
          </div>
        )}
      </div>
    </CenterModal>
  );
}
