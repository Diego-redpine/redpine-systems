'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { getTourContent } from '@/lib/tour-content';

interface SpotlightOverlayProps {
  targetRect: DOMRect | null;
  stepType: 'spotlight' | 'card';
  title: string;
  description: string;
  cardContent?: 'welcome' | 'import-data' | 'sync-calendar' | 'payments' | 'finish';
  step: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  showBack: boolean;
  isLastStep: boolean;
  colors: DashboardColors;
  businessName: string;
  subdomain: string;
  businessType: string;
}

// Padding around the spotlit element
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_GAP = 16;
const TOOLTIP_WIDTH = 340;

function computeTooltipPosition(
  targetRect: DOMRect,
  preferredSide?: 'top' | 'bottom' | 'left' | 'right',
): { top: number; left: number; placement: string } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padded = {
    top: targetRect.top - SPOTLIGHT_PADDING,
    left: targetRect.left - SPOTLIGHT_PADDING,
    right: targetRect.right + SPOTLIGHT_PADDING,
    bottom: targetRect.bottom + SPOTLIGHT_PADDING,
    width: targetRect.width + SPOTLIGHT_PADDING * 2,
    height: targetRect.height + SPOTLIGHT_PADDING * 2,
  };

  const tooltipHeight = 160; // estimated

  type Position = { top: number; left: number; placement: string; space: number };
  const positions: Position[] = [];

  // Below
  const belowTop = padded.bottom + TOOLTIP_GAP;
  if (belowTop + tooltipHeight < vh - 20) {
    positions.push({
      top: belowTop,
      left: Math.max(20, Math.min(padded.left, vw - TOOLTIP_WIDTH - 20)),
      placement: 'bottom',
      space: vh - belowTop,
    });
  }

  // Above
  const aboveTop = padded.top - TOOLTIP_GAP - tooltipHeight;
  if (aboveTop > 20) {
    positions.push({
      top: aboveTop,
      left: Math.max(20, Math.min(padded.left, vw - TOOLTIP_WIDTH - 20)),
      placement: 'top',
      space: padded.top,
    });
  }

  // Right
  const rightLeft = padded.right + TOOLTIP_GAP;
  if (rightLeft + TOOLTIP_WIDTH < vw - 20) {
    positions.push({
      top: Math.max(20, Math.min(padded.top, vh - tooltipHeight - 20)),
      left: rightLeft,
      placement: 'right',
      space: vw - padded.right,
    });
  }

  // Left
  const leftLeft = padded.left - TOOLTIP_GAP - TOOLTIP_WIDTH;
  if (leftLeft > 20) {
    positions.push({
      top: Math.max(20, Math.min(padded.top, vh - tooltipHeight - 20)),
      left: leftLeft,
      placement: 'left',
      space: padded.left,
    });
  }

  // Pick preferred side if available, otherwise most space
  if (preferredSide) {
    const preferred = positions.find(p => p.placement === preferredSide);
    if (preferred) return preferred;
  }

  if (positions.length > 0) {
    positions.sort((a, b) => b.space - a.space);
    return positions[0];
  }

  // Fallback: center below
  return {
    top: padded.bottom + TOOLTIP_GAP,
    left: Math.max(20, (vw - TOOLTIP_WIDTH) / 2),
    placement: 'bottom',
  };
}

// Data import options
const DATA_IMPORT_OPTIONS = [
  {
    label: 'Google Sheets',
    description: 'Import clients, products, and more from your spreadsheets.',
    connectUrl: '/api/integrations/google/connect',
  },
  {
    label: 'Notion',
    description: 'Pull in data from your Notion databases.',
    connectUrl: '/api/integrations/notion/connect',
  },
  {
    label: 'CSV Upload',
    description: 'Use the Import button on any table view to upload a CSV file.',
    connectUrl: '',
  },
];

const PAYMENT_PROVIDERS = [
  { label: 'Stripe', connectUrl: '/api/integrations/stripe/connect', description: 'Accept credit cards, Apple Pay, Google Pay, and more' },
  { label: 'Square', connectUrl: '/api/integrations/square/connect', description: 'In-person and online payments with Square' },
];

export default function SpotlightOverlay({
  targetRect,
  stepType,
  title,
  description,
  cardContent,
  step,
  totalSteps,
  onNext,
  onBack,
  showBack,
  isLastStep,
  colors,
  businessName,
  subdomain,
  businessType,
}: SpotlightOverlayProps) {
  const [paymentConnected, setPaymentConnected] = useState(false);

  const buttonBg = colors.buttons || '#4F46E5';
  const buttonText = getContrastText(buttonBg);
  const textColor = colors.text || '#1A1A1A';
  const mutedColor = colors.text ? `${colors.text}99` : '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  const tourContent = useMemo(() => getTourContent(businessType), [businessType]);

  // Poll for payment connection on payments card
  useEffect(() => {
    if (cardContent !== 'payments') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/integrations/status');
        if (res.ok) {
          const json = await res.json();
          const payments = json.data?.paymentConnections || [];
          if (payments.some((c: { isActive: boolean }) => c.isActive)) {
            setPaymentConnected(true);
            clearInterval(interval);
          }
        }
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [cardContent]);

  const tooltipPos = useMemo(() => {
    if (!targetRect || stepType === 'card') return null;
    return computeTooltipPosition(targetRect);
  }, [targetRect, stepType]);

  // Step progress dots
  const progressDots = (
    <div className="flex items-center justify-center gap-1.5 mb-4">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === step ? 24 : 8,
            backgroundColor: i <= step ? buttonBg : `${borderColor}`,
          }}
        />
      ))}
    </div>
  );

  // Navigation footer
  const navFooter = (
    <div className="flex items-center justify-between mt-5 pt-4 border-t" style={{ borderColor }}>
      <div>
        {showBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
            style={{ borderColor, color: textColor }}
          >
            Back
          </button>
        )}
      </div>
      <button
        onClick={isLastStep ? onNext : onNext}
        className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: buttonBg, color: buttonText }}
      >
        {isLastStep ? 'Get Started' : 'Next'}
      </button>
    </div>
  );

  // Render card content for card-type steps
  const renderCardContent = useCallback(() => {
    switch (cardContent) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center text-center py-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: `${buttonBg}15` }}
            >
              <svg className="w-8 h-8" style={{ color: buttonBg }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>
              Welcome to {businessName}!
            </h3>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: mutedColor }}>
              {description}
            </p>
          </div>
        );

      case 'import-data':
        return (
          <div className="space-y-3">
            <p className="text-sm mb-4" style={{ color: mutedColor }}>{description}</p>
            {DATA_IMPORT_OPTIONS.map((opt, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border"
                style={{ borderColor }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: textColor }}>{opt.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: mutedColor }}>{opt.description}</p>
                </div>
                {opt.connectUrl ? (
                  <a
                    href={opt.connectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 flex-shrink-0"
                    style={{ backgroundColor: buttonBg, color: buttonText }}
                  >
                    Connect
                  </a>
                ) : (
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border flex-shrink-0"
                    style={{ borderColor, color: mutedColor }}
                  >
                    Built-in
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      case 'sync-calendar':
        return (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: mutedColor }}>{description}</p>
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: textColor }}>Outlook Calendar</p>
                <p className="text-xs mt-0.5" style={{ color: mutedColor }}>Sync events from your Outlook calendar</p>
              </div>
              <a
                href="/api/integrations/outlook/connect"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 flex-shrink-0"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                Connect Outlook
              </a>
            </div>
            <p className="text-xs" style={{ color: mutedColor }}>
              You can also connect Google Calendar and other providers from Settings later.
            </p>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: mutedColor }}>{description}</p>
            {paymentConnected && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: '#ECFDF5' }}>
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-emerald-700">Payment processor connected!</span>
              </div>
            )}
            {PAYMENT_PROVIDERS.map((provider, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: textColor }}>{provider.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: mutedColor }}>{provider.description}</p>
                </div>
                {paymentConnected ? (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 flex-shrink-0">
                    Connected
                  </span>
                ) : (
                  <a
                    href={provider.connectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 flex-shrink-0"
                    style={{ backgroundColor: buttonBg, color: buttonText }}
                  >
                    Connect
                  </a>
                )}
              </div>
            ))}
          </div>
        );

      case 'finish':
        return (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: mutedColor }}>{description}</p>
            <div className="space-y-2">
              {tourContent.checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor }}>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2"
                    style={{ borderColor: buttonBg }}
                  >
                    <span className="text-xs font-bold" style={{ color: buttonBg }}>{i + 1}</span>
                  </div>
                  <p className="text-sm" style={{ color: textColor }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [cardContent, description, businessName, buttonBg, buttonText, textColor, mutedColor, borderColor, paymentConnected, tourContent]);

  // ── CARD TYPE: centered overlay card ──
  if (stepType === 'card') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <div
          className="relative w-full max-w-xl mx-4 rounded-2xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: cardBg }}
        >
          <div className="px-6 pt-5">
            {progressDots}
            <h2 className="text-lg font-bold mb-1" style={{ color: textColor }}>{title}</h2>
          </div>
          <div className="px-6 pb-2 max-h-[60vh] overflow-y-auto">
            {renderCardContent()}
          </div>
          <div className="px-6 pb-5">
            {navFooter}
          </div>
        </div>
      </div>
    );
  }

  // ── SPOTLIGHT TYPE: cutout overlay ──
  if (!targetRect) {
    // Target not found — show as card fallback
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <div className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6" style={{ backgroundColor: cardBg }}>
          {progressDots}
          <h2 className="text-lg font-bold mb-2" style={{ color: textColor }}>{title}</h2>
          <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>{description}</p>
          {navFooter}
        </div>
      </div>
    );
  }

  const cutout = {
    top: targetRect.top - SPOTLIGHT_PADDING,
    left: targetRect.left - SPOTLIGHT_PADDING,
    width: targetRect.width + SPOTLIGHT_PADDING * 2,
    height: targetRect.height + SPOTLIGHT_PADDING * 2,
  };

  return (
    <>
      {/* Dark overlay with cutout via box-shadow */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ pointerEvents: 'none' }}
      >
        {/* Clickable dark areas — prevent interaction with background */}
        <div
          className="absolute inset-0"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Cutout — allows clicking the highlighted element through */}
        <div
          className="absolute rounded-xl"
          style={{
            top: cutout.top,
            left: cutout.left,
            width: cutout.width,
            height: cutout.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            pointerEvents: 'none',
            transition: 'top 0.4s ease-out, left 0.4s ease-out, width 0.4s ease-out, height 0.4s ease-out',
          }}
        />

        {/* Pulsing ring around spotlight */}
        <div
          className="absolute rounded-xl"
          style={{
            top: cutout.top - 3,
            left: cutout.left - 3,
            width: cutout.width + 6,
            height: cutout.height + 6,
            border: `2px solid ${buttonBg}`,
            opacity: 0.6,
            animation: 'spotlight-pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
            transition: 'top 0.4s ease-out, left 0.4s ease-out, width 0.4s ease-out, height 0.4s ease-out',
          }}
        />
      </div>

      {/* Tooltip */}
      {tooltipPos && (
        <div
          className="fixed z-[102] rounded-2xl shadow-2xl p-5"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            width: TOOLTIP_WIDTH,
            backgroundColor: cardBg,
            pointerEvents: 'auto',
            transition: 'top 0.4s ease-out, left 0.4s ease-out',
          }}
        >
          {progressDots}
          <h3 className="text-base font-bold mb-1.5" style={{ color: textColor }}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>
            {description}
          </p>
          {navFooter}
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes spotlight-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.01); }
        }
      `}</style>
    </>
  );
}
