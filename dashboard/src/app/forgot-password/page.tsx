'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabase();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setIsSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4" style={{ fontFamily: "'Fira Code', monospace" }}>
        <div className="bg-white border border-gray-200 max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image src="/logo.png" alt="Red Pine" width={120} height={120} />
            </Link>
          </div>

          <svg className="w-12 h-12 mx-auto mb-4 text-[#ce0707]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>

          <h1 className="text-xl font-bold mb-2">Check Your Email</h1>
          <p className="text-gray-500 text-sm mb-8">
            We&apos;ve sent a password reset link to <strong className="text-black">{email}</strong>.
            Click the link in your email to reset your password.
          </p>

          <Link
            href="/login"
            className="text-[#ce0707] hover:underline font-semibold text-sm"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

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
                error ? 'border-[#ce0707]' : 'border-black focus:border-gray-400'
              }`}
              placeholder="you@example.com"
            />
          </div>

          <p className="text-sm text-gray-500">
            Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-white text-[#ce0707] border-2 border-black font-semibold hover:bg-[#ce0707] hover:text-white transition-all disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-[#ce0707] hover:underline font-semibold"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
