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
  lifetime_points: number;
  rewards_redeemed: number;
  tier_multiplier: number;
  next_tier?: { name: string; threshold: number };
  recent_activity?: { description: string; points: number; date: string }[];
}

interface PortalLoyaltySectionProps {
  accentColor: string;
  accentTextColor: string;
  portalToken: string;
}

const TIER_STYLES: Record<string, { bg: string; text: string; label: string; gradient: string }> = {
  bronze: { bg: '#CD7F32', text: '#FFFFFF', label: 'Bronze', gradient: 'linear-gradient(135deg, #CD7F32 0%, #E8A85C 50%, #CD7F32 100%)' },
  silver: { bg: '#C0C0C0', text: '#1a1a1a', label: 'Silver', gradient: 'linear-gradient(135deg, #A8A8A8 0%, #D8D8D8 50%, #A8A8A8 100%)' },
  gold: { bg: '#FFD700', text: '#1a1a1a', label: 'Gold', gradient: 'linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #DAA520 100%)' },
  platinum: { bg: '#E5E4E2', text: '#1a1a1a', label: 'Platinum', gradient: 'linear-gradient(135deg, #8C8C8C 0%, #E5E4E2 50%, #8C8C8C 100%)' },
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
  const [redeeming, setRedeeming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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

  const handleRedeem = async () => {
    if (!loyalty?.reward_available) return;
    setRedeeming(true);
    try {
      await fetch('/api/portal/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({ action: 'redeem_reward' }),
      });
      // Refresh loyalty data
      const res = await fetch('/api/portal/data?type=loyalty', {
        headers: { 'x-portal-token': portalToken },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.loyalty) setLoyalty(data.loyalty);
      }
    } catch {
      // Silently fail
    }
    setRedeeming(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading loyalty...</div>
      </div>
    );
  }

  if (notActive || !loyalty) {
    return (
      <div className="bg-white border border-gray-200 p-8 text-center">
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

  // Tier progress (if next tier exists)
  const tierProgressPercent = loyalty.next_tier
    ? Math.min(100, (loyalty.lifetime_points / loyalty.next_tier.threshold) * 100)
    : 100;

  const activity = loyalty.recent_activity || [];

  return (
    <div className="space-y-6">
      {/* Starbucks-Style Tier Card */}
      <div
        className="p-6 text-center shadow-lg relative overflow-hidden"
        style={{ background: tierStyle.gradient, color: tierStyle.text }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: tierStyle.text }} />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full opacity-10" style={{ backgroundColor: tierStyle.text }} />

        <div className="relative z-10">
          {/* Star icon */}
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${tierStyle.text}20` }}>
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <div className="text-sm font-medium opacity-80 mb-0.5">Your Tier</div>
          <div className="text-3xl font-bold tracking-tight">{tierStyle.label}</div>
          <div className="text-4xl font-black mt-2">
            {loyalty.points.toLocaleString()}
          </div>
          <div className="text-sm opacity-80 mt-0.5">
            points · {loyalty.tier_multiplier || 1}x earning rate
          </div>
        </div>
      </div>

      {/* Progress to Next Reward — Starbucks-style segmented */}
      <div className="bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Next Reward</h3>
          <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600">
            {loyalty.points % loyalty.reward_threshold} / {loyalty.reward_threshold} pts
          </span>
        </div>

        {/* Segmented Progress Bar (Starbucks-style) */}
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => {
            const segmentFilled = progressPercent > i * 10;
            return (
              <div
                key={i}
                className="flex-1 h-3 transition-all duration-300"
                style={{
                  backgroundColor: segmentFilled ? accentColor : '#E5E7EB',
                }}
              />
            );
          })}
        </div>

        {loyalty.reward_available ? (
          <div className="mt-4">
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className="w-full py-3 text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              style={{ backgroundColor: accentColor, color: accentTextColor }}
            >
              {redeeming ? 'Redeeming...' : `Redeem ${formatCurrency(loyalty.reward_value_cents)} Reward`}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-3">
            {loyalty.points_to_next_reward} more points until your next {formatCurrency(loyalty.reward_value_cents)} reward
          </p>
        )}
      </div>

      {/* Tier Progress (if next tier exists) */}
      {loyalty.next_tier && (
        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Path to {loyalty.next_tier.name}
          </h3>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${tierProgressPercent}%`, backgroundColor: accentColor }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {loyalty.lifetime_points.toLocaleString()} / {loyalty.next_tier.threshold.toLocaleString()} lifetime points
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {(loyalty.lifetime_points || loyalty.points).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Lifetime Points</p>
        </div>
        <div className="bg-white p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{loyalty.total_orders}</p>
          <p className="text-xs text-gray-500 mt-1">Total Visits</p>
        </div>
        <div className="bg-white p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{loyalty.rewards_redeemed ?? rewardsEarned}</p>
          <p className="text-xs text-gray-500 mt-1">Rewards Used</p>
        </div>
      </div>

      {/* Points Activity */}
      <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-5 flex items-center justify-between text-left"
        >
          <h3 className="text-sm font-semibold text-gray-900">Points Activity</h3>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showHistory && (
          <div className="border-t border-gray-100 px-5 pb-5">
            {activity.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No activity yet</p>
            ) : (
              <div className="space-y-3 pt-3">
                {activity.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: item.points > 0 ? '#dcfce7' : '#fee2e2' }}
                      >
                        <span className="text-xs font-bold" style={{ color: item.points > 0 ? '#166534' : '#991b1b' }}>
                          {item.points > 0 ? '+' : '-'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.points > 0 ? '+' : ''}{item.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-white p-6 shadow-sm border border-gray-200">
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
