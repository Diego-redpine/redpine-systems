'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Which fields to highlight red based on error type
function getErrorFields(errorMsg: string): { email: boolean; password: boolean } {
  const msg = errorMsg.toLowerCase();
  if (msg.includes('email') && !msg.includes('password')) return { email: true, password: false };
  if (msg.includes('password') && !msg.includes('email')) return { email: false, password: true };
  // "Invalid login credentials" — email looks valid so most likely password
  if (msg.includes('invalid login')) return { email: false, password: true };
  return { email: true, password: true };
}

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const configIdParam = searchParams.get('config_id');
  const redirectTo = searchParams.get('redirectTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  // Store configId in sessionStorage when component mounts
  useEffect(() => {
    if (configIdParam) {
      sessionStorage.setItem('pendingConfigId', configIdParam);
    }
  }, [configIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabase();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!data.session) {
        throw new Error('Failed to sign in');
      }

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
          }
        } catch (linkError) {
          console.error('Failed to link config:', linkError);
        }
      }

      router.push(redirectTo || '/dashboard');

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const errorFields = error ? getErrorFields(error) : { email: false, password: false };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4" style={{ fontFamily: "'Fira Code', monospace" }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-4px); }
          30%, 70% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
      `}</style>

      <div className={`bg-white border border-gray-200 max-w-md w-full p-8 ${shaking ? 'shake' : ''}`}>
        <div className="flex flex-col items-center mb-10">
          <Link href="/">
            <Image src="/logo.png" alt="Red Pine" width={120} height={120} />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
              required
              className={`w-full px-4 py-2.5 border-2 focus:outline-none transition-colors ${
                errorFields.email ? 'border-[#ce0707]' : 'border-black focus:border-gray-400'
              }`}
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
              onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
              required
              className={`w-full px-4 py-2.5 border-2 focus:outline-none transition-colors ${
                errorFields.password ? 'border-[#ce0707]' : 'border-black focus:border-gray-400'
              }`}
              placeholder="Your password"
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-[#ce0707] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-white text-[#ce0707] border-2 border-black font-semibold hover:bg-[#ce0707] hover:text-white transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/"
              className="text-[#ce0707] hover:underline font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
