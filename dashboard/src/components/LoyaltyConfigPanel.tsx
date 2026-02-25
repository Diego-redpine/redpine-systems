'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getContrastText } from '@/lib/view-colors';

interface LoyaltyConfig {
  id?: string;
  program_name: string;
  points_per_dollar: number;
  reward_threshold: number;
  reward_type: 'discount' | 'free_item' | 'percentage';
  reward_value_cents: number;
  reward_description: string;
  tiers: TierConfig[];
  is_active: boolean;
  welcome_bonus: number;
  birthday_bonus: number;
  referral_bonus: number;
}

interface TierConfig {
  name: string;
  threshold: number;
  multiplier: number;
  color: string;
  perks: string;
}

interface LoyaltyConfigPanelProps {
  colors: {
    buttons?: string;
    text?: string;
    headings?: string;
    borders?: string;
    cards?: string;
  };
}

const DEFAULT_TIERS: TierConfig[] = [
  { name: 'Bronze', threshold: 0, multiplier: 1, color: '#CD7F32', perks: 'Earn points on every purchase' },
  { name: 'Silver', threshold: 500, multiplier: 1.25, color: '#C0C0C0', perks: 'Birthday bonus, 1.25x points' },
  { name: 'Gold', threshold: 1500, multiplier: 1.5, color: '#FFD700', perks: 'Priority booking, 1.5x points' },
  { name: 'Platinum', threshold: 5000, multiplier: 2, color: '#E5E4E2', perks: 'VIP access, 2x points, free upgrades' },
];

const DEFAULT_CONFIG: LoyaltyConfig = {
  program_name: 'Rewards',
  points_per_dollar: 1,
  reward_threshold: 100,
  reward_type: 'discount',
  reward_value_cents: 500,
  reward_description: '$5 off your next visit',
  tiers: DEFAULT_TIERS,
  is_active: false,
  welcome_bonus: 25,
  birthday_bonus: 50,
  referral_bonus: 100,
};

const REWARD_TYPE_LABELS: Record<string, string> = {
  discount: 'Fixed Discount ($)',
  free_item: 'Free Item',
  percentage: 'Percentage Off (%)',
};

export default function LoyaltyConfigPanel({ colors }: LoyaltyConfigPanelProps) {
  const [config, setConfig] = useState<LoyaltyConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTierEditor, setShowTierEditor] = useState(false);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';
  const textMain = colors.headings || '#1A1A1A';

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/data/loyalty_config');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setConfig({
              ...DEFAULT_CONFIG,
              ...json.data,
              tiers: json.data.tiers?.length ? json.data.tiers : DEFAULT_TIERS,
            });
          }
        }
      } catch {
        // Use defaults
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/data/loyalty_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Error handled silently
    }
    setSaving(false);
  }, [config]);

  const updateConfig = useCallback((updates: Partial<LoyaltyConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const updateTier = useCallback((index: number, updates: Partial<TierConfig>) => {
    setConfig(prev => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => (i === index ? { ...t, ...updates } : t)),
    }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading loyalty config...</div>
      </div>
    );
  }

  const rewardValueDisplay = config.reward_type === 'percentage'
    ? `${config.reward_value_cents / 100}%`
    : `$${(config.reward_value_cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: textMain }}>
            Loyalty Program
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Reward your customers for coming back
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: buttonColor, color: buttonText }}
        >
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Active Toggle */}
      <div
        className="rounded-2xl p-5 shadow-sm flex items-center justify-between"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <div>
          <h3 className="font-semibold text-gray-900">Program Status</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {config.is_active ? 'Customers are earning points' : 'Enable to start rewarding customers'}
          </p>
        </div>
        <button
          onClick={() => updateConfig({ is_active: !config.is_active })}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            config.is_active ? '' : 'bg-gray-200'
          }`}
          style={config.is_active ? { backgroundColor: buttonColor } : undefined}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              config.is_active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Program Name + Earning Rules */}
      <div
        className="rounded-2xl p-6 shadow-sm space-y-5"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h3 className="font-semibold text-gray-900">Earning Rules</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
          <input
            type="text"
            value={config.program_name}
            onChange={e => updateConfig({ program_name: e.target.value })}
            placeholder="Rewards"
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ borderColor, '--tw-ring-color': buttonColor } as React.CSSProperties}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points per $1 Spent
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={config.points_per_dollar}
              onChange={e => updateConfig({ points_per_dollar: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ borderColor, '--tw-ring-color': buttonColor } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points to Redeem Reward
            </label>
            <input
              type="number"
              min={10}
              value={config.reward_threshold}
              onChange={e => updateConfig({ reward_threshold: parseInt(e.target.value) || 100 })}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ borderColor, '--tw-ring-color': buttonColor } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Preview Math */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <p>
            Customer spends <strong>$100</strong> → earns <strong>{config.points_per_dollar * 100} points</strong>
          </p>
          <p className="mt-1">
            At <strong>{config.reward_threshold} points</strong> → gets <strong>{rewardValueDisplay} reward</strong>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            That&apos;s roughly 1 reward per ${(config.reward_threshold / config.points_per_dollar).toFixed(0)} spent
          </p>
        </div>
      </div>

      {/* Reward Setup */}
      <div
        className="rounded-2xl p-6 shadow-sm space-y-5"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h3 className="font-semibold text-gray-900">Reward</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(REWARD_TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => updateConfig({ reward_type: key as LoyaltyConfig['reward_type'] })}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                  config.reward_type === key ? 'border-2' : 'border-gray-200 bg-white text-gray-600'
                }`}
                style={
                  config.reward_type === key
                    ? { borderColor: buttonColor, backgroundColor: `${buttonColor}10`, color: buttonColor }
                    : undefined
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.reward_type === 'percentage' ? 'Percentage Off' : 'Reward Value (cents)'}
            </label>
            <input
              type="number"
              min={1}
              value={config.reward_value_cents}
              onChange={e => updateConfig({ reward_value_cents: parseInt(e.target.value) || 500 })}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ borderColor, '--tw-ring-color': buttonColor } as React.CSSProperties}
            />
            <p className="text-xs text-gray-400 mt-1">
              {config.reward_type === 'percentage'
                ? `${(config.reward_value_cents / 100).toFixed(0)}% off`
                : `$${(config.reward_value_cents / 100).toFixed(2)}`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={config.reward_description}
              onChange={e => updateConfig({ reward_description: e.target.value })}
              placeholder="$5 off your next visit"
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ borderColor, '--tw-ring-color': buttonColor } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Bonus Points */}
      <div
        className="rounded-2xl p-6 shadow-sm space-y-5"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h3 className="font-semibold text-gray-900">Bonus Points</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welcome Bonus
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={config.welcome_bonus}
                onChange={e => updateConfig({ welcome_bonus: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ borderColor, '--tw-ring-color': buttonColor } as React.CSSProperties}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">pts</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">When they join</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birthday Bonus
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={config.birthday_bonus}
                onChange={e => updateConfig({ birthday_bonus: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ borderColor, '--tw-ring-color': buttonColor } as React.CSSProperties}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">pts</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">On their birthday</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referral Bonus
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={config.referral_bonus}
                onChange={e => updateConfig({ referral_bonus: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ borderColor, '--tw-ring-color': buttonColor } as React.CSSProperties}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">pts</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Per referral</p>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div
        className="rounded-2xl p-6 shadow-sm space-y-5"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Tiers</h3>
          <button
            onClick={() => setShowTierEditor(!showTierEditor)}
            className="text-sm font-medium"
            style={{ color: buttonColor }}
          >
            {showTierEditor ? 'Done Editing' : 'Edit Tiers'}
          </button>
        </div>

        {/* Tier Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {config.tiers.map((tier, i) => (
            <div
              key={i}
              className="rounded-xl p-4 text-center"
              style={{
                backgroundColor: tier.color,
                color: getContrastText(tier.color),
              }}
            >
              <p className="font-bold text-sm">{tier.name}</p>
              <p className="text-xs mt-1 opacity-80">{tier.threshold}+ pts</p>
              <p className="text-xs mt-0.5 opacity-80">{tier.multiplier}x earn</p>
            </div>
          ))}
        </div>

        {/* Tier Editor */}
        {showTierEditor && (
          <div className="space-y-4 pt-2">
            {config.tiers.map((tier, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <input
                  type="color"
                  value={tier.color}
                  onChange={e => updateTier(i, { color: e.target.value })}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={tier.name}
                  onChange={e => updateTier(i, { name: e.target.value })}
                  placeholder="Tier name"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
                <input
                  type="number"
                  value={tier.threshold}
                  onChange={e => updateTier(i, { threshold: parseInt(e.target.value) || 0 })}
                  placeholder="Points"
                  className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
                <input
                  type="number"
                  value={tier.multiplier}
                  onChange={e => updateTier(i, { multiplier: parseFloat(e.target.value) || 1 })}
                  step={0.25}
                  min={1}
                  className="w-16 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
                <span className="text-xs text-gray-400 flex-shrink-0">x</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Starbucks-Style Preview */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h3 className="font-semibold text-gray-900 mb-4">Customer Preview</h3>
        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
          {/* Simulated Tier Card */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: config.tiers[1]?.color || '#C0C0C0', color: getContrastText(config.tiers[1]?.color || '#C0C0C0') }}
          >
            <p className="text-xs font-medium opacity-80">Your Tier</p>
            <p className="text-xl font-bold">{config.tiers[1]?.name || 'Silver'}</p>
            <p className="text-sm opacity-80">350 points</p>
          </div>

          {/* Simulated Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress to Next Reward</span>
              <span>50 / {config.reward_threshold}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (50 / config.reward_threshold) * 100)}%`,
                  backgroundColor: buttonColor,
                }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            This is how your customers will see the loyalty program in their portal
          </p>
        </div>
      </div>
    </div>
  );
}
