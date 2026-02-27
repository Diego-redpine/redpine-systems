'use client';

import React from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface WebsitePreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  subdomain: string;
  businessName: string;
  colors: DashboardColors;
}

export default function WebsitePreviewPopup({
  isOpen,
  onClose,
  onStartTour,
  subdomain,
  businessName,
  colors,
}: WebsitePreviewPopupProps) {
  const buttonBg = colors.buttons || '#4F46E5';
  const buttonText = getContrastText(buttonBg);
  const textColor = colors.text || '#1A1A1A';
  const mutedColor = colors.text ? `${colors.text}99` : '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  const siteUrl = `https://${subdomain}.redpine.systems`;

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      configColors={colors}
      noPadding
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold" style={{ color: textColor }}>
            Your Website is Live!
          </h2>
          <p className="text-sm mt-1" style={{ color: mutedColor }}>
            {businessName} now has a public website. Here is a preview of what your customers will see.
          </p>
        </div>

        {/* iframe preview */}
        <div className="px-6">
          <div
            className="w-full border overflow-hidden"
            style={{ borderColor }}
          >
            <iframe
              src={siteUrl}
              className="w-full border-0"
              style={{ height: 400 }}
              title={`${businessName} website preview`}
            />
          </div>
        </div>

        {/* Link row */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" style={{ color: mutedColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.066a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
            </svg>
            <span className="text-sm font-medium" style={{ color: textColor }}>
              {subdomain}.redpine.systems
            </span>
          </div>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-opacity hover:opacity-80"
            style={{ borderColor, color: textColor }}
          >
            Visit Your Website
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 mt-2 border-t"
          style={{ borderColor }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: mutedColor }}
          >
            Skip
          </button>
          <button
            onClick={onStartTour}
            className="px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonBg, color: buttonText }}
          >
            Take a Tour
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
