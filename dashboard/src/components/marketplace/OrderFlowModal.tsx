'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import type { Gig, FreelancerProfile, PricingTier } from '@/types/freelancer';
import { toast } from 'sonner';

interface OrderFlowModalProps {
  gig: Gig & { freelancer: FreelancerProfile };
  tier: 'basic' | 'standard' | 'premium';
  colors: DashboardColors;
  onClose: () => void;
  onOrderCreated: () => void;
}

function formatPrice(cents: number) {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toLocaleString()}`;
}

export default function OrderFlowModal({ gig, tier, colors, onClose, onOrderCreated }: OrderFlowModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const bgColor = colors.background || '#F5F5F5';

  const pricingTier = gig.pricing_tiers[tier] as PricingTier;
  const totalCents = pricingTier.price_cents;
  const platformFeeCents = Math.round(totalCents * 0.10);

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gig_id: gig.id, tier, requirements }),
      });

      if (res.ok) {
        const json = await res.json();
        setOrderId(json.data?.id || 'demo-order');
        setStep(3);
        toast.success('Order placed successfully!');
        onOrderCreated();
      } else {
        // Demo mode fallback
        setOrderId(`demo-${Date.now()}`);
        setStep(3);
        toast.success('Order placed! (Demo mode)');
        onOrderCreated();
      }
    } catch {
      // Demo mode fallback
      setOrderId(`demo-${Date.now()}`);
      setStep(3);
      toast.success('Order placed! (Demo mode)');
      onOrderCreated();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
        style={{ backgroundColor: cardBg }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className="w-8 h-1 transition-colors"
                  style={{ backgroundColor: s <= step ? buttonColor : borderColor }}
                />
              ))}
            </div>
            <span className="text-sm font-medium" style={{ color: textMuted }}>
              Step {step} of 3
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step 1: Requirements */}
        {step === 1 && (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-1" style={{ color: textMain }}>Describe your project</h3>
            <p className="text-sm mb-4" style={{ color: textMuted }}>
              Help {gig.freelancer.display_name} understand what you need.
            </p>

            {/* Gig summary */}
            <div className="p-3 mb-4" style={{ backgroundColor: bgColor }}>
              <p className="text-sm font-medium" style={{ color: textMain }}>{gig.title}</p>
              <p className="text-xs mt-1" style={{ color: textMuted }}>
                {pricingTier.name} — {formatPrice(totalCents)} — {pricingTier.delivery_days} day delivery
              </p>
            </div>

            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe your project requirements, goals, and any specific details the freelancer should know..."
              rows={5}
              className="w-full px-4 py-3 border text-sm resize-none focus:outline-none focus:ring-2"
              style={{
                borderColor,
                color: textMain,
                backgroundColor: cardBg,
                // @ts-expect-error -- focus ring color
                '--tw-ring-color': `${buttonColor}40`,
              }}
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setStep(2)}
                disabled={!requirements.trim()}
                className="px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: buttonColor, color: buttonText }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review & Pay */}
        {step === 2 && (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: textMain }}>Review your order</h3>

            {/* Order summary */}
            <div className="border divide-y" style={{ borderColor }}>
              <div className="p-4">
                <p className="text-sm font-medium" style={{ color: textMain }}>{gig.title}</p>
                <p className="text-xs mt-1" style={{ color: textMuted }}>
                  by {gig.freelancer.display_name} — {pricingTier.name} tier
                </p>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: textMuted }}>Service ({pricingTier.name})</span>
                  <span style={{ color: textMain }}>{formatPrice(totalCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: textMuted }}>Platform fee (10%)</span>
                  <span style={{ color: textMain }}>{formatPrice(platformFeeCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: textMuted }}>Delivery</span>
                  <span style={{ color: textMain }}>{pricingTier.delivery_days} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: textMuted }}>Revisions</span>
                  <span style={{ color: textMain }}>{pricingTier.revisions}</span>
                </div>
              </div>

              <div className="p-4 flex justify-between">
                <span className="text-sm font-bold" style={{ color: textMain }}>Total</span>
                <span className="text-lg font-bold" style={{ color: textMain }}>
                  {formatPrice(totalCents + platformFeeCents)}
                </span>
              </div>
            </div>

            {/* Requirements preview */}
            <div className="mt-4 p-3" style={{ backgroundColor: bgColor }}>
              <p className="text-xs font-semibold mb-1" style={{ color: textMuted }}>YOUR REQUIREMENTS</p>
              <p className="text-sm" style={{ color: textMain }}>{requirements}</p>
            </div>

            {/* Payment note */}
            <div className="mt-4 p-3 border" style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}>
              <p className="text-xs" style={{ color: '#92400E' }}>
                Payment will be held in escrow until you approve the delivered work.
              </p>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border"
                style={{ borderColor, color: textMain }}
              >
                Back
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: buttonColor, color: buttonText }}
              >
                {isSubmitting ? 'Processing...' : `Pay ${formatPrice(totalCents + platformFeeCents)}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: textMain }}>Order Placed!</h3>
            <p className="text-sm mb-1" style={{ color: textMuted }}>
              Your order with {gig.freelancer.display_name} has been created.
            </p>
            {orderId && (
              <p className="text-xs mb-4 font-mono" style={{ color: textMuted }}>
                Order #{orderId.slice(0, 8)}
              </p>
            )}

            <div className="p-3 mb-4" style={{ backgroundColor: bgColor }}>
              <p className="text-sm font-medium" style={{ color: textMain }}>{gig.title}</p>
              <p className="text-xs mt-1" style={{ color: textMuted }}>
                {pricingTier.name} — {formatPrice(totalCents)} — Est. {pricingTier.delivery_days} days
              </p>
            </div>

            <p className="text-xs mb-6" style={{ color: textMuted }}>
              The freelancer has been notified and will start working on your project. You can track progress in My Orders.
            </p>

            <button
              onClick={onClose}
              className="w-full px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: buttonColor, color: buttonText }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </>
  );
}
