'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Brand from '@/components/Brand';

function CancelContent() {
  const searchParams = useSearchParams();
  const configId = searchParams.get('config_id');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <Brand size="lg" showTagline linkToHome={false} />
        </div>

        <div className="w-16 h-16 border-2 border-black bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-muted">&lt;-</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">No worries!</h1>
        <p className="text-muted mb-8">
          Your checkout was cancelled. Your dashboard design is still saved.
        </p>

        <div className="space-y-4">
          <Link
            href={configId ? `/?config_id=${configId}` : '/'}
            className="block w-full py-3 px-6 bg-white text-primary border-2 border-black font-semibold hover:bg-primary hover:text-white transition-all duration-150"
          >
            Back to Preview
          </Link>

          <p className="text-sm text-muted">
            Questions? Contact us at{' '}
            <a href="mailto:support@redpine.io" className="text-primary hover:underline">
              support@redpine.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
