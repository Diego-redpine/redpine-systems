'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import UnifiedInbox from './UnifiedInbox';

interface CommunicationsTabProps {
  colors: DashboardColors;
  activeSubTab?: string;
}

type SubTab = 'COO' | 'Messages';

interface CommsStats {
  unread: number;
  activeChats: number;
  totalConversations: number;
}

export default function CommunicationsTab({ colors, activeSubTab }: CommunicationsTabProps) {
  const [currentTab, setCurrentTab] = useState<SubTab>(
    (activeSubTab as SubTab) || 'Messages'
  );
  const [stats, setStats] = useState<CommsStats>({
    unread: 0,
    activeChats: 0,
    totalConversations: 0,
  });

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/data/chat_widget');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const conversations = json.data as Array<{ status: string; unread_count: number }>;
          setStats({
            unread: conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
            activeChats: conversations.filter(c => c.status === 'active').length,
            totalConversations: conversations.length,
          });
        }
      }
    } catch {
      // Keep demo stats
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    if (activeSubTab && ['COO', 'Messages'].includes(activeSubTab)) {
      setCurrentTab(activeSubTab as SubTab);
    }
  }, [activeSubTab]);

  const SUB_TABS: SubTab[] = ['COO', 'Messages'];

  const statCards = [
    { label: 'Unread', value: stats.unread.toString(), highlight: stats.unread > 0 },
    { label: 'Active Chats', value: stats.activeChats.toString() },
    { label: 'Total Conversations', value: stats.totalConversations.toString() },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Sub-tab bar */}
      <div className="flex items-center gap-2">
        {SUB_TABS.map(tab => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? buttonColor : 'transparent',
                color: isActive ? buttonText : textMuted,
                border: isActive ? 'none' : `1px solid ${borderColor}`,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(card => (
          <div
            key={card.label}
            className="rounded-2xl p-5 shadow-sm"
            style={{
              backgroundColor: card.highlight ? buttonColor : cardBg,
              border: card.highlight ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            <p className="text-sm font-medium mb-1"
              style={{ color: card.highlight ? getContrastText(buttonColor) : textMuted }}>
              {card.label}
            </p>
            <span className="text-2xl font-bold"
              style={{ color: card.highlight ? getContrastText(buttonColor) : textMain }}>
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      {currentTab === 'COO' && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${buttonColor}10` }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={buttonColor} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-2" style={{ color: textMain }}>AI COO</p>
          <p className="text-sm" style={{ color: textMuted }}>Your AI Chief Operating Officer is coming soon</p>
        </div>
      )}

      {currentTab === 'Messages' && (
        <div className="flex-1 min-h-0">
          <UnifiedInbox colors={colors} onStatsChange={fetchStats} />
        </div>
      )}
    </div>
  );
}
