'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import AgentMarketplace from './AgentMarketplace';
import ComingSoonCard from './ComingSoonCard';

interface MarketplaceViewProps {
  colors: DashboardColors;
}

type SubTab = 'agents' | 'templates' | 'freelancers';

export default function MarketplaceView({ colors }: MarketplaceViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('agents');

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMuted = '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'agents', label: 'AI Agents' },
    { id: 'templates', label: 'Templates' },
    { id: 'freelancers', label: 'Freelancers' },
  ];

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className="px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap"
            style={{
              backgroundColor: activeSubTab === tab.id ? buttonColor : 'transparent',
              color: activeSubTab === tab.id ? buttonText : textMuted,
              border: activeSubTab === tab.id ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSubTab === 'agents' && <AgentMarketplace colors={colors} />}
      {activeSubTab === 'templates' && (
        <ComingSoonCard
          title="Template Marketplace"
          description="Browse and install pre-built business templates. Clone entire configurations — tabs, colors, components — with one click."
          colors={colors}
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={buttonColor} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          }
        />
      )}
      {activeSubTab === 'freelancers' && (
        <ComingSoonCard
          title="Freelancer Marketplace"
          description="Hire vetted freelancers for design, development, marketing, and more — directly from your dashboard."
          colors={colors}
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={buttonColor} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
      )}
    </div>
  );
}
