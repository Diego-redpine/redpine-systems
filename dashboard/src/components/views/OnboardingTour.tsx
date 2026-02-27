'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { getTourContent } from '@/lib/tour-content';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessType: string;
  subdomain: string;
  tabs: { label: string }[];
  colors: DashboardColors;
}

const TOTAL_STEPS = 9;

// SVG icons for the toolkit step
const TOOLKIT_ITEMS = [
  {
    label: 'Chat',
    description: 'Talk to your AI assistant to make changes, add tabs, or get help.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    label: 'Editor',
    description: 'Customize colors, rearrange tabs, and tweak your dashboard layout.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    label: 'Website',
    description: 'View and edit your public-facing website that customers see.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    label: 'Marketplace',
    description: 'Add AI agents to automate tasks like review responses and content writing.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.992 2.992 0 00.79-2.082 3 3 0 01.607-1.61L6.007 3h11.986l1.61 2.657a3 3 0 01.607 1.61 2.992 2.992 0 00.79 2.082" />
      </svg>
    ),
  },
  {
    label: 'Marketing',
    description: 'Tools to grow your business -- email campaigns, social media, and more.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811V8.69zM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061a1.125 1.125 0 01-1.683-.977V8.69z" />
      </svg>
    ),
  },
];

// Data import options for step 3
const DATA_IMPORT_OPTIONS = [
  {
    label: 'Google Sheets',
    description: 'Import clients, products, and more from your spreadsheets.',
    connectUrl: '/api/integrations/google/connect',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125M12 15.375c0 .621.504 1.125 1.125 1.125" />
      </svg>
    ),
  },
  {
    label: 'Notion',
    description: 'Pull in data from your Notion databases.',
    connectUrl: '/api/integrations/notion/connect',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: 'CSV Upload',
    description: 'Use the Import button on any table view to upload a CSV file.',
    connectUrl: '',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
];

export default function OnboardingTour({
  isOpen,
  onClose,
  businessName,
  businessType,
  subdomain,
  tabs,
  colors,
}: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [paymentConnected, setPaymentConnected] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const tourContent = getTourContent(businessType);

  const buttonBg = colors.buttons || '#4F46E5';
  const buttonText = getContrastText(buttonBg);
  const textColor = colors.text || '#1A1A1A';
  const mutedColor = colors.text ? `${colors.text}99` : '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';
  const pageBg = colors.background || '#F5F5F5';

  // Poll for payment connection on step 5
  useEffect(() => {
    if (step !== 5) return;
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
        // ignore polling errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);

  const handleClose = useCallback(() => {
    localStorage.setItem('redpine_tour_completed', 'true');
    setStep(0);
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      handleClose();
    }
  }, [step, handleClose]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const handleCopyUrl = useCallback(() => {
    const url = `https://${subdomain}.redpine.systems`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  }, [subdomain]);

  const stepTitles = [
    `Welcome to ${businessName}!`,
    'Your Dashboard Tabs',
    'Your Toolkit',
    'Import Your Data',
    'Sync Your Calendar',
    'Set Up Payments',
    `Add Your First ${tourContent.primaryEntity.charAt(0).toUpperCase() + tourContent.primaryEntity.slice(1)}`,
    'Your Calendar & Booking',
    'You\'re All Set!',
  ];

  // Steps that have a "Skip" link
  const skippableSteps = [3, 4, 5];

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Onboarding Tour"
      subtitle={`Step ${step + 1} of ${TOTAL_STEPS} -- ${stepTitles[step]}`}
      maxWidth="max-w-2xl"
      configColors={colors}
      noPadding
    >
      <div className="flex flex-col" style={{ minHeight: 420 }}>
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5 px-5 pt-4 pb-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 transition-all"
              style={{
                width: i === step ? 28 : 12,
                backgroundColor: i <= step ? buttonBg : borderColor,
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">

          {/* STEP 0: Welcome */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center py-6">
              <div
                className="w-16 h-16 flex items-center justify-center mb-5"
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
                Your custom platform is ready. Here is a quick tour of what has been built for you.
                It will only take a couple of minutes.
              </p>
            </div>
          )}

          {/* STEP 1: Dashboard Tabs */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm mb-4" style={{ color: mutedColor }}>
                Your dashboard has been set up with tabs tailored to your business. Here is what each one does:
              </p>
              <div className="space-y-2">
                {tabs.map((tab, i) => {
                  const desc = tourContent.tabDescriptions[tab.label] || 'Manage your ' + tab.label.toLowerCase();
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 border"
                      style={{ borderColor }}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${buttonBg}12` }}
                      >
                        <span className="text-xs font-bold" style={{ color: buttonBg }}>
                          {tab.label.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold" style={{ color: textColor }}>
                          {tab.label}
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: mutedColor }}>
                          {desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Toolkit */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm mb-4" style={{ color: mutedColor }}>
                On the left edge of your screen, you will find your toolkit. These tools let you customize and extend your platform:
              </p>
              <div className="space-y-2">
                {TOOLKIT_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 border"
                    style={{ borderColor }}
                  >
                    <div
                      className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${buttonBg}12`, color: buttonBg }}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: textColor }}>
                        {item.label}
                      </p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: mutedColor }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Import Data */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm mb-4" style={{ color: mutedColor }}>
                Already have data somewhere? Connect a source to import it automatically, or use CSV upload on any table.
              </p>
              <div className="space-y-3">
                {DATA_IMPORT_OPTIONS.map((opt, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border"
                    style={{ borderColor }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${buttonBg}10`, color: buttonBg }}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: textColor }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: mutedColor }}>{opt.description}</p>
                      </div>
                    </div>
                    {opt.connectUrl ? (
                      <a
                        href={opt.connectUrl}
                        className="px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 flex-shrink-0"
                        style={{ backgroundColor: buttonBg, color: buttonText }}
                      >
                        Connect
                      </a>
                    ) : (
                      <span
                        className="px-3 py-1.5 text-xs font-medium border flex-shrink-0"
                        style={{ borderColor, color: mutedColor }}
                      >
                        Built-in
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Sync Calendar */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                Using Outlook for scheduling? Connect it to sync your existing calendar events into your dashboard.
              </p>
              <div
                className="flex items-center justify-between p-4 border"
                style={{ borderColor }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${buttonBg}10`, color: buttonBg }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: textColor }}>Outlook Calendar</p>
                    <p className="text-xs mt-0.5" style={{ color: mutedColor }}>Sync events from your Outlook calendar</p>
                  </div>
                </div>
                <a
                  href="/api/integrations/outlook/connect"
                  className="px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90 flex-shrink-0"
                  style={{ backgroundColor: buttonBg, color: buttonText }}
                >
                  Connect Outlook
                </a>
              </div>
              <p className="text-xs" style={{ color: mutedColor }}>
                You can also connect Google Calendar and other providers from Settings later.
              </p>
            </div>
          )}

          {/* STEP 5: Payments */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                Accept payments from your clients. Connect Stripe or Square to get started.
              </p>

              {paymentConnected && (
                <div
                  className="flex items-center gap-2 p-3"
                  style={{ backgroundColor: '#ECFDF5' }}
                >
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-emerald-700">
                    Payment processor connected successfully!
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {([
                  { label: 'Stripe', connectUrl: '/api/integrations/stripe/connect', description: 'Accept credit cards, Apple Pay, Google Pay, and more' },
                  { label: 'Square', connectUrl: '/api/integrations/square/connect', description: 'In-person and online payments with Square' },
                ] as const).map((provider, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border"
                    style={{ borderColor }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${buttonBg}10`, color: buttonBg }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: textColor }}>{provider.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: mutedColor }}>{provider.description}</p>
                      </div>
                    </div>
                    {paymentConnected ? (
                      <span className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 flex-shrink-0">
                        Connected
                      </span>
                    ) : (
                      <a
                        href={provider.connectUrl}
                        className="px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90 flex-shrink-0"
                        style={{ backgroundColor: buttonBg, color: buttonText }}
                      >
                        Connect
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Add First Record */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                {tourContent.firstRecordPrompt}
              </p>
              <div
                className="border p-5 flex flex-col items-center text-center"
                style={{ borderColor, backgroundColor: pageBg }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${buttonBg}15` }}
                >
                  <svg className="w-6 h-6" style={{ color: buttonBg }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: textColor }}>
                  + Add {tourContent.primaryEntity.charAt(0).toUpperCase() + tourContent.primaryEntity.slice(1)}
                </p>
                <p className="text-xs" style={{ color: mutedColor }}>
                  Look for this button on your tabs to start adding records.
                </p>
              </div>
            </div>
          )}

          {/* STEP 7: Calendar & Booking */}
          {step === 7 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                {tourContent.bookingDescription}
              </p>
              <div
                className="border p-4"
                style={{ borderColor, backgroundColor: pageBg }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: mutedColor }}>
                  Your booking link:
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 px-3 py-2.5 border text-sm font-medium truncate"
                    style={{ borderColor, backgroundColor: cardBg, color: textColor }}
                  >
                    https://{subdomain}.redpine.systems
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-2.5 text-xs font-medium transition-opacity hover:opacity-90 flex-shrink-0"
                    style={{ backgroundColor: buttonBg, color: buttonText }}
                  >
                    {copiedUrl ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <p className="text-xs" style={{ color: mutedColor }}>
                Share this link on your website, social media, or Google Business profile so clients can book directly.
              </p>
            </div>
          )}

          {/* STEP 8: All Set */}
          {step === 8 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                Here is your quick checklist to get started:
              </p>
              <div className="space-y-2">
                {tourContent.checklist.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 border"
                    style={{ borderColor }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2"
                      style={{ borderColor: buttonBg }}
                    >
                      <span className="text-xs font-bold" style={{ color: buttonBg }}>
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: textColor }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-4" style={{ color: mutedColor }}>
                You can restart this tour anytime from the Settings page.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3.5 border-t shrink-0"
          style={{ borderColor }}
        >
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium border transition-opacity hover:opacity-70"
                style={{ borderColor, color: textColor }}
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleClose}
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: mutedColor }}
            >
              Skip Tour
            </button>
          </div>

          <div className="flex items-center gap-3">
            {skippableSteps.includes(step) && (
              <button
                onClick={handleNext}
                className="text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: mutedColor }}
              >
                Skip this step
              </button>
            )}
            <button
              onClick={step === TOTAL_STEPS - 1 ? handleClose : handleNext}
              className="px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {step === TOTAL_STEPS - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </CenterModal>
  );
}
