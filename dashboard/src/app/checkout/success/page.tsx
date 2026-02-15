'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Brand from '@/components/Brand';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const configId = searchParams.get('config_id');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <Brand size="lg" showTagline linkToHome={false} />
        </div>

        <div className="w-16 h-16 border-2 border-black bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-primary font-bold">[x]</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
        <p className="text-muted mb-8">
          Your payment was successful. Your dashboard is now fully activated.
        </p>

        <div className="border-2 border-black bg-gray-50 p-4 mb-8 text-left">
          <h3 className="font-semibold mb-2">What&apos;s next?</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <span className="text-primary font-bold">[x]</span>
              Unlimited dashboard edits
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-bold">[x]</span>
              Connect your custom domain
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-bold">[x]</span>
              Set up online booking
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-bold">[x]</span>
              Enable payment processing
            </li>
          </ul>
        </div>

        <Link
          href={configId ? `/dashboard?config_id=${configId}` : '/dashboard'}
          className="block w-full py-3 px-6 bg-white text-primary border-2 border-black font-semibold hover:bg-primary hover:text-white transition-all duration-150"
        >
          Go to Dashboard
        </Link>

        {sessionId && (
          <p className="mt-4 text-xs text-muted">
            Session: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
