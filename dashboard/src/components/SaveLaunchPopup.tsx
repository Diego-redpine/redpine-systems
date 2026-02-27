'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Brand from './Brand';
import { toast } from '@/components/ui/Toaster';

interface SaveLaunchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  configId?: string;
  businessName?: string;
}

export default function SaveLaunchPopup({
  isOpen,
  onClose,
  configId,
  businessName,
}: SaveLaunchPopupProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSaveDesign = () => {
    router.push('/');
  };

  const handleLaunchNow = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configId,
          businessName,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Unable to start checkout. Please try again or contact support.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - non-dismissable */}
      <div className="absolute inset-0 bg-black/60 animate-fadeIn" />

      {/* Modal */}
      <div className="relative bg-white border-2 border-black max-w-md w-full mx-4 animate-scaleIn">
        {/* Content */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Brand size="md" linkToHome={false} />
          </div>

          <div className="w-14 h-14 border-2 border-black bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2">Unlock Your Platform</h2>
          <p className="text-muted mb-6">
            Your dashboard is ready. Try it free for 14 days — no charge until you're sure.
          </p>

          {/* Options */}
          <div className="space-y-4">
            {/* Launch Now - Primary CTA */}
            <button
              onClick={handleLaunchNow}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-black text-white border-2 border-black font-semibold text-lg hover:bg-gray-900 transition-all duration-150 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-pulse">...</span>
                  <span>Starting checkout</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <span>Start Free Trial</span>
                    <span>-&gt;</span>
                  </div>
                  <p className="text-sm font-normal mt-1 opacity-80">
                    14 days free, then $29/month
                  </p>
                </>
              )}
            </button>

            {/* Save Design - Secondary */}
            <button
              onClick={handleSaveDesign}
              disabled={isLoading}
              className="w-full py-3 px-6 bg-white border-2 border-black font-semibold hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Save &amp; Decide Later</span>
              </div>
              <p className="text-sm text-muted font-normal mt-1">
                Free account - Your design is saved
              </p>
            </button>
          </div>

          {/* Features preview */}
          <div className="mt-8 pt-6 border-t-2 border-black">
            <p className="text-sm text-muted mb-3">Everything included:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-left">
                <span className="text-primary font-bold">[x]</span>
                <span>Unlimited edits</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <span className="text-primary font-bold">[x]</span>
                <span>Custom domain</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <span className="text-primary font-bold">[x]</span>
                <span>Online bookings</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <span className="text-primary font-bold">[x]</span>
                <span>Payment processing</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <span className="text-primary font-bold">[x]</span>
                <span>Client management</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <span className="text-primary font-bold">[x]</span>
                <span>Analytics &amp; reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
