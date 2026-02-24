'use client';

import React, { useState, useEffect } from 'react';

interface LoyaltyData {
  points: number;
  tier: string;
  total_orders: number;
  total_spent_cents: number;
  reward_threshold: number;
  reward_value_cents: number;
  points_per_dollar: number;
  reward_available: boolean;
  points_to_next_reward: number;
}

interface PortalLoyaltySectionProps {
  accentColor: string;
  accentTextColor: string;
  portalToken: string;
}

const TIER_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  bronze: { bg: '#CD7F32', text: '#FFFFFF', label: 'Bronze' },
  silver: { bg: '#C0C0C0', text: '#1a1a1a', label: 'Silver' },
  gold: { bg: '#FFD700', text: '#1a1a1a', label: 'Gold' },
  platinum: { bg: '#E5E4E2', text: '#1a1a1a', label: 'Platinum' },
};

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PortalLoyaltySection({
  accentColor,
  accentTextColor,
  portalToken,
}: PortalLoyaltySectionProps) {
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notActive, setNotActive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/portal/data?type=loyalty', {
          headers: { 'x-portal-token': portalToken },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.loyalty) {
            setLoyalty(data.loyalty);
          } else {
            setNotActive(true);
          }
        }
      } catch {
        // Silently fail
      }
      setLoading(false);
    }
    load();
  }, [portalToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading loyalty...</div>
      </div>
    );
  }

  if (notActive || !loyalty) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
        <p className="text-gray-500 font-medium">No loyalty program yet</p>
        <p className="text-sm text-gray-400 mt-1">
          This business hasn&apos;t set up a loyalty program yet.
        </p>
      </div>
    );
  }

  const tierStyle = TIER_STYLES[loyalty.tier] || TIER_STYLES.bronze;
  const progressPercent = loyalty.reward_threshold > 0
    ? Math.min(100, ((loyalty.points % loyalty.reward_threshold) / loyalty.reward_threshold) * 100)
    : 0;
  const rewardsEarned = loyalty.reward_threshold > 0
    ? Math.floor(loyalty.points / loyalty.reward_threshold)
    : 0;

  return (
    <div className="space-y-6">
      {/* Tier Badge Card */}
      <div
        className="rounded-2xl p-6 text-center shadow-sm"
        style={{ backgroundColor: tierStyle.bg, color: tierStyle.text }}
      >
        <div className="text-sm font-medium opacity-80 mb-1">Your Tier</div>
        <div className="text-3xl font-bold">{tierStyle.label}</div>
        <div className="text-sm opacity-80 mt-2">
          {loyalty.points.toLocaleString()} points
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Progress to Next Reward</h3>
          <span className="text-sm text-gray-500">
            {loyalty.points % loyalty.reward_threshold} / {loyalty.reward_threshold}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>

        {loyalty.reward_available ? (
          <p className="text-sm font-medium mt-3" style={{ color: accentColor }}>
            You have a reward available!
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-3">
            {loyalty.points_to_next_reward} more points until your next reward
          </p>
        )}
      </div>

      {/* Reward Available Card */}
      {loyalty.reward_available && (
        <div
          className="rounded-2xl p-6 shadow-sm border-2"
          style={{ borderColor: accentColor, backgroundColor: `${accentColor}08` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <svg className="w-6 h-6" fill="none" stroke={accentTextColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {formatCurrency(loyalty.reward_value_cents)} off your next visit!
              </p>
              <p className="text-sm text-gray-500">
                You&apos;ve earned {rewardsEarned} reward{rewardsEarned !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {loyalty.points.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Points</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{loyalty.total_orders}</p>
          <p className="text-xs text-gray-500 mt-1">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(loyalty.total_spent_cents)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Spent</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">How It Works</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              1
            </span>
            <span>Earn {loyalty.points_per_dollar} point{loyalty.points_per_dollar !== 1 ? 's' : ''} for every $1 spent</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              2
            </span>
            <span>Reach {loyalty.reward_threshold} points to unlock a reward</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              3
            </span>
            <span>Redeem {formatCurrency(loyalty.reward_value_cents)} off your next visit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
