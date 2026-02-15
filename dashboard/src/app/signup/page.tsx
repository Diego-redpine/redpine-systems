'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Brand from '@/components/Brand';
import { createBrowserClient } from '@supabase/ssr';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const configIdParam = searchParams.get('config_id');
  const inviteToken = searchParams.get('invite');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Store configId and invite token in sessionStorage when component mounts
  useEffect(() => {
    if (configIdParam) {
      sessionStorage.setItem('pendingConfigId', configIdParam);
    }
    if (inviteToken) {
      sessionStorage.setItem('pendingInviteToken', inviteToken);
    }
  }, [configIdParam, inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabase();

      // 1. Create user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create account');
      }

      // 2. If user was created and confirmed (or email confirmation disabled)
      if (authData.session) {
        // Check for team invite token first
        const token = sessionStorage.getItem('pendingInviteToken') || inviteToken;
        if (token) {
          try {
            const acceptRes = await fetch('/api/team/accept', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
            const acceptData = await acceptRes.json();
            if (acceptData.success) {
              sessionStorage.removeItem('pendingInviteToken');
              router.push('/dashboard');
              return;
            }
          } catch (acceptError) {
            console.error('Failed to accept invite:', acceptError);
          }
        }

        // Link the config to the new user (owner flow)
        const configId = sessionStorage.getItem('pendingConfigId') || configIdParam;
        if (configId) {
          try {
            const linkResponse = await fetch('/api/config/link', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ configId }),
            });

            const linkData = await linkResponse.json();

            if (linkData.success) {
              sessionStorage.removeItem('pendingConfigId');
              router.push('/dashboard');
              return;
            }
          } catch (linkError) {
            console.error('Failed to link config:', linkError);
          }
        }
      }

      // If email confirmation is required, show success message
      setIsSuccess(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✉️</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Check Your Email!</h1>
          <p className="text-muted mb-8">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
            Click the link to activate your account and access your dashboard.
          </p>

          <Link
            href="/"
            className="text-primary hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex flex-col items-center mb-8">
          <Brand size="lg" showTagline linkToHome={false} />
          {inviteToken ? (
            <p className="text-muted mt-2">You&apos;ve been invited to join a team</p>
          ) : (
            <p className="text-muted mt-2">Create your account</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted">
            Already have an account?{' '}
            <Link
              href={configIdParam ? `/login?config_id=${configIdParam}` : '/login'}
              className="text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
