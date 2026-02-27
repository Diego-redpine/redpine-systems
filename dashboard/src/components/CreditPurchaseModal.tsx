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
        className="w-full py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
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
  const textMuted = colors.icons || '#6B7280';

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
            <div className="flex-1 p-3" style={{ backgroundColor: `${borderColor}40` }}>
              <p className="text-lg font-bold" style={{ color: headingColor }}>{balance.free_balance}</p>
              <p className="text-xs" style={{ color: textMuted }}>Free</p>
            </div>
            <div className="flex-1 p-3" style={{ backgroundColor: `${borderColor}40` }}>
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
                className="relative p-4 text-center transition-all"
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
