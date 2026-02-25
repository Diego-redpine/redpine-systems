'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import AgentMarketplace from './AgentMarketplace';
import FreelancerMarketplace from './FreelancerMarketplace';

interface MarketplaceViewProps {
  colors: DashboardColors;
}

type SubTab = 'agents' | 'freelancers';

export default function MarketplaceView({ colors }: MarketplaceViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('agents');

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMuted = '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'agents', label: 'AI Agents' },
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
      {activeSubTab === 'freelancers' && <FreelancerMarketplace colors={colors} />}
    </div>
  );
}
