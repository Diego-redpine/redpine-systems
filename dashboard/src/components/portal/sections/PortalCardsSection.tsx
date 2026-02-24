'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

interface PortalCardsSectionProps {
  clientId: string;
  accentColor: string;
  accentTextColor: string;
  portalToken: string;
}

// Card brand colors and labels
const BRAND_STYLES: Record<string, { bg: string; gradient: string; label: string }> = {
  visa: {
    bg: '#1A1F71',
    gradient: 'linear-gradient(135deg, #1A1F71 0%, #2E3B8C 100%)',
    label: 'Visa',
  },
  mastercard: {
    bg: '#EB001B',
    gradient: 'linear-gradient(135deg, #EB001B 0%, #FF5F00 100%)',
    label: 'Mastercard',
  },
  amex: {
    bg: '#006FCF',
    gradient: 'linear-gradient(135deg, #006FCF 0%, #00A5E5 100%)',
    label: 'American Express',
  },
  discover: {
    bg: '#FF6600',
    gradient: 'linear-gradient(135deg, #FF6600 0%, #FF9B47 100%)',
    label: 'Discover',
  },
  unknown: {
    bg: '#374151',
    gradient: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)',
    label: 'Card',
  },
};

function CardVisual({
  card,
  onSetDefault,
  onRemove,
}: {
  card: SavedCard;
  onSetDefault: () => void;
  onRemove: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const brandStyle = BRAND_STYLES[card.brand] || BRAND_STYLES.unknown;

  return (
    <div className="relative group">
      <div
        className="rounded-2xl p-6 text-white shadow-lg transition-transform hover:scale-[1.02]"
        style={{ background: brandStyle.gradient, minHeight: '180px' }}
        onClick={() => setShowActions(!showActions)}
      >
        {/* Brand */}
        <div className="flex items-start justify-between mb-8">
          <span className="text-sm font-bold opacity-90 tracking-wide uppercase">
            {brandStyle.label}
          </span>
          {card.is_default && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm">
              Default
            </span>
          )}
        </div>

        {/* Card Number */}
        <div className="mb-6">
          <div className="flex items-center gap-3 text-lg tracking-[0.2em] font-mono">
            <span className="opacity-50">****</span>
            <span className="opacity-50">****</span>
            <span className="opacity-50">****</span>
            <span>{card.last4}</span>
          </div>
        </div>

        {/* Expiry */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">
              Expires
            </p>
            <p className="text-sm font-medium">
              {String(card.exp_month).padStart(2, '0')}/{String(card.exp_year).slice(-2)}
            </p>
          </div>

          {/* Chip icon */}
          <div className="w-10 h-7 rounded-md bg-white/20 border border-white/30" />
        </div>
      </div>

      {/* Action overlay */}
      {showActions && (
        <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3 z-10">
          {!card.is_default && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetDefault(); setShowActions(false); }}
              className="px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Set as Default
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); setShowActions(false); }}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
            className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export function PortalCardsSection({
  clientId,
  accentColor,
  accentTextColor,
  portalToken,
}: PortalCardsSectionProps) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      const res = await fetch('/api/portal/cards', {
        headers: { 'x-portal-token': portalToken },
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [portalToken]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleSetDefault = useCallback(async (cardId: string) => {
    setActionLoading(true);
    try {
      await fetch('/api/portal/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({ action: 'set_default', payment_method_id: cardId }),
      });
      await loadCards();
    } catch {
      // Silently fail
    }
    setActionLoading(false);
  }, [portalToken, loadCards]);

  const handleRemove = useCallback(async (cardId: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/portal/cards?id=${cardId}`, {
        method: 'DELETE',
        headers: { 'x-portal-token': portalToken },
      });
      setCards(prev => prev.filter(c => c.id !== cardId));
    } catch {
      // Silently fail
    }
    setActionLoading(false);
  }, [portalToken]);

  const handleAddCard = useCallback(async () => {
    // Create SetupIntent and get client_secret
    // In production, this would open Stripe Elements
    setActionLoading(true);
    try {
      const res = await fetch('/api/portal/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        // In a full implementation, this client_secret would be used with
        // Stripe.js confirmCardSetup() via a CardElement modal.
        // For now, we log it and show a placeholder.
        console.log('[Portal Cards] SetupIntent created:', data.setup_intent_id);
        // TODO: Open Stripe Elements modal with data.client_secret
        alert('Card setup initiated. Stripe Elements integration will open here.');
      }
    } catch {
      // Silently fail
    }
    setActionLoading(false);
  }, [portalToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Payment Methods</h2>
        <button
          onClick={handleAddCard}
          disabled={actionLoading}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: accentColor, color: accentTextColor }}
        >
          + Add Card
        </button>
      </div>

      {/* Card Stack */}
      {cards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
          </svg>
          <p className="text-gray-500 font-medium">No saved cards</p>
          <p className="text-sm text-gray-400 mt-1">
            Add a card to speed up checkout
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map(card => (
            <CardVisual
              key={card.id}
              card={card}
              onSetDefault={() => handleSetDefault(card.id)}
              onRemove={() => handleRemove(card.id)}
            />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500">
          Your cards are securely stored by Stripe. We never store your full card number.
          Cards can be used for booking deposits, invoices, and product purchases.
        </p>
      </div>
    </div>
  );
}
