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

// Apple Wallet-style brand gradients
const BRAND_STYLES: Record<string, { gradient: string; logo: string; label: string }> = {
  visa: {
    gradient: 'linear-gradient(135deg, #1A1F71 0%, #0A1045 40%, #2E3B8C 100%)',
    logo: 'VISA',
    label: 'Visa',
  },
  mastercard: {
    gradient: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 40%, #0F3460 100%)',
    logo: 'MC',
    label: 'Mastercard',
  },
  amex: {
    gradient: 'linear-gradient(135deg, #006FCF 0%, #004A8F 40%, #00A5E5 100%)',
    logo: 'AMEX',
    label: 'American Express',
  },
  discover: {
    gradient: 'linear-gradient(135deg, #FF6600 0%, #CC5200 40%, #FF9B47 100%)',
    logo: 'DISC',
    label: 'Discover',
  },
  unknown: {
    gradient: 'linear-gradient(135deg, #374151 0%, #1F2937 40%, #6B7280 100%)',
    logo: 'CARD',
    label: 'Card',
  },
};

function WalletCard({
  card,
  index,
  isExpanded,
  onExpand,
  onSetDefault,
  onRemove,
}: {
  card: SavedCard;
  index: number;
  isExpanded: boolean;
  onExpand: () => void;
  onSetDefault: () => void;
  onRemove: () => void;
}) {
  const brandStyle = BRAND_STYLES[card.brand] || BRAND_STYLES.unknown;

  // Apple Wallet stack offset — each card peeks 20px below the one above
  const stackOffset = isExpanded ? 0 : index * 20;

  return (
    <div
      className="relative transition-all duration-300 ease-out"
      style={{
        marginTop: index === 0 ? 0 : isExpanded ? 16 : -140,
        zIndex: 10 + index,
      }}
    >
      <div
        className="p-6 text-white shadow-xl cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
        style={{
          background: brandStyle.gradient,
          minHeight: '190px',
          transform: !isExpanded ? `translateY(${stackOffset}px)` : undefined,
        }}
        onClick={onExpand}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5" />
          <div className="absolute -left-6 bottom-4 w-24 h-24 bg-white/5" />
          <div className="absolute right-1/3 top-1/2 w-16 h-16 bg-white/5" />
        </div>

        <div className="relative z-10">
          {/* Brand + Default */}
          <div className="flex items-start justify-between mb-10">
            <span className="text-base font-black tracking-[0.15em] opacity-90">
              {brandStyle.logo}
            </span>
            {card.is_default && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm uppercase tracking-wider">
                Default
              </span>
            )}
          </div>

          {/* Card Number — Dots + Last 4 */}
          <div className="mb-6">
            <div className="flex items-center gap-4 font-mono tracking-[0.25em] text-lg">
              <span className="flex gap-1 opacity-40">
                {'••••'.split('').map((d, i) => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full inline-block" />)}
              </span>
              <span className="flex gap-1 opacity-40">
                {'••••'.split('').map((d, i) => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full inline-block" />)}
              </span>
              <span className="flex gap-1 opacity-40">
                {'••••'.split('').map((d, i) => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full inline-block" />)}
              </span>
              <span className="font-semibold text-xl tracking-[0.2em]">{card.last4}</span>
            </div>
          </div>

          {/* Expiry + Chip */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mb-0.5">
                Valid Thru
              </p>
              <p className="text-sm font-medium tracking-wider">
                {String(card.exp_month).padStart(2, '0')}/{String(card.exp_year).slice(-2)}
              </p>
            </div>

            {/* Chip */}
            <div className="w-10 h-7 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/80 to-yellow-500/60 border border-yellow-600/30" />
              <div className="absolute inset-[3px] border border-yellow-700/20" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-yellow-700/20" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-yellow-700/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="flex gap-2 mt-3 px-2">
          {!card.is_default && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetDefault(); }}
              className="flex-1 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Set as Default
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="flex-1 py-2.5 bg-white border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Remove Card
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
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
    setExpandedIndex(null);
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
    setExpandedIndex(null);
  }, [portalToken]);

  const handleAddCard = useCallback(async () => {
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
        // TODO: Open Stripe Elements sheet for card entry
        // const data = await res.json();
        // Use data.setup_intent_id with PaymentElement
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
        <h2 className="text-lg font-bold text-gray-900">Wallet</h2>
        <button
          onClick={handleAddCard}
          disabled={actionLoading}
          className="px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: accentColor, color: accentTextColor }}
        >
          + Add Card
        </button>
      </div>

      {/* Apple Wallet-Style Card Stack */}
      {cards.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No saved cards</p>
          <p className="text-sm text-gray-400 mt-1">
            Add a card to speed up checkout
          </p>
        </div>
      ) : (
        <div
          className="relative"
          style={{ minHeight: expandedIndex !== null ? undefined : `${190 + (cards.length - 1) * 20}px` }}
        >
          {cards.map((card, i) => (
            <WalletCard
              key={card.id}
              card={card}
              index={i}
              isExpanded={expandedIndex === i}
              onExpand={() => setExpandedIndex(expandedIndex === i ? null : i)}
              onSetDefault={() => handleSetDefault(card.id)}
              onRemove={() => handleRemove(card.id)}
            />
          ))}
        </div>
      )}

      {/* Tap hint */}
      {cards.length > 1 && expandedIndex === null && (
        <p className="text-xs text-gray-400 text-center">
          Tap a card to manage it
        </p>
      )}

      {/* Security Info */}
      <div className="bg-gray-50 p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
        <p className="text-xs text-gray-500">
          Your cards are securely stored by Stripe. We never store your full card number.
          Cards can be used for booking deposits, invoices, and product purchases.
        </p>
      </div>
    </div>
  );
}
