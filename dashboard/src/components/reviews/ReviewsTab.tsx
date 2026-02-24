'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import ReviewInbox from './ReviewInbox';
import ReviewRequests from './ReviewRequests';
import ReviewGate from './ReviewGate';
import ReviewWidgetBuilder from './ReviewWidgetBuilder';

interface ReviewsTabProps {
  colors: DashboardColors;
  activeSubTab?: string;
}

type SubTab = 'Inbox' | 'Requests' | 'Gate' | 'Widgets';

interface ReviewStats {
  total: number;
  avgRating: number;
  thisMonth: number;
  pendingResponse: number;
}

export default function ReviewsTab({ colors, activeSubTab }: ReviewsTabProps) {
  const [currentTab, setCurrentTab] = useState<SubTab>(
    (activeSubTab as SubTab) || 'Inbox'
  );
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    avgRating: 0,
    thisMonth: 0,
    pendingResponse: 0,
  });

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/data/reviews?pageSize=500');
      const json = await res.json();
      if (json.success && json.data) {
        const reviews = json.data as Array<{
          rating: number;
          status: string;
          created_at: string;
        }>;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = reviews.filter(
          (r) => new Date(r.created_at) >= monthStart
        ).length;
        const pendingResponse = reviews.filter(
          (r) => r.status === 'new'
        ).length;
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        setStats({
          total: json.count || reviews.length,
          avgRating: Math.round(avgRating * 10) / 10,
          thisMonth,
          pendingResponse,
        });
      }
    } catch (err) {
      console.error('Failed to fetch review stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Update tab when external activeSubTab changes
  useEffect(() => {
    if (activeSubTab && ['Inbox', 'Requests', 'Gate', 'Widgets'].includes(activeSubTab)) {
      setCurrentTab(activeSubTab as SubTab);
    }
  }, [activeSubTab]);

  const SUB_TABS: SubTab[] = ['Inbox', 'Requests', 'Gate', 'Widgets'];

  const statCards = [
    { label: 'Total Reviews', value: stats.total.toString(), icon: 'star' },
    {
      label: 'Avg Rating',
      value: stats.avgRating > 0 ? `${stats.avgRating}` : '--',
      icon: 'chart',
      suffix: stats.avgRating > 0 ? '/5' : '',
    },
    { label: 'This Month', value: stats.thisMonth.toString(), icon: 'calendar' },
    {
      label: 'Pending Response',
      value: stats.pendingResponse.toString(),
      icon: 'chat',
      highlight: stats.pendingResponse > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab bar */}
      <div className="flex items-center gap-2">
        {SUB_TABS.map((tab) => {
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

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 shadow-sm"
            style={{
              backgroundColor: card.highlight ? buttonColor : cardBg,
              border: card.highlight ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            <p
              className="text-sm font-medium mb-1"
              style={{
                color: card.highlight ? getContrastText(buttonColor) : textMuted,
              }}
            >
              {card.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span
                className="text-2xl font-bold"
                style={{
                  color: card.highlight ? getContrastText(buttonColor) : textMain,
                }}
              >
                {card.value}
              </span>
              {card.suffix && (
                <span
                  className="text-sm"
                  style={{
                    color: card.highlight
                      ? getContrastText(buttonColor)
                      : textMuted,
                  }}
                >
                  {card.suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Content area */}
      <div>
        {currentTab === 'Inbox' && (
          <ReviewInbox colors={colors} onStatsChange={fetchStats} />
        )}
        {currentTab === 'Requests' && <ReviewRequests colors={colors} />}
        {currentTab === 'Gate' && <ReviewGate colors={colors} />}
        {currentTab === 'Widgets' && <ReviewWidgetBuilder colors={colors} />}
      </div>
    </div>
  );
}
