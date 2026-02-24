'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface NotificationPreferences {
  booking_reminders: boolean;
  payment_receipts: boolean;
  loyalty_updates: boolean;
  promotions: boolean;
  messages: boolean;
  channel_email: boolean;
  channel_sms: boolean;
  channel_push: boolean;
  digest_promotions: boolean;
  pause_all: boolean;
}

interface PortalNotificationsSectionProps {
  clientId: string;
  accentColor: string;
  accentTextColor: string;
  portalToken: string;
}

const DEFAULT_PREFS: NotificationPreferences = {
  booking_reminders: true,
  payment_receipts: true,
  loyalty_updates: true,
  promotions: false,
  messages: true,
  channel_email: true,
  channel_sms: false,
  channel_push: false,
  digest_promotions: true,
  pause_all: false,
};

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  accentColor,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  accentColor: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{ backgroundColor: checked ? accentColor : '#d1d5db' }}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

const CATEGORIES = [
  { key: 'booking_reminders', label: 'Booking reminders', description: 'Reminders about upcoming appointments' },
  { key: 'payment_receipts', label: 'Payment receipts', description: 'Receipts and payment confirmations' },
  { key: 'loyalty_updates', label: 'Loyalty updates', description: 'Points earned, tier changes, rewards' },
  { key: 'promotions', label: 'Promotions', description: 'Special offers and deals' },
  { key: 'messages', label: 'Messages', description: 'Chat messages from the business' },
] as const;

const CHANNELS = [
  { key: 'channel_email', label: 'Email', available: true },
  { key: 'channel_sms', label: 'SMS', available: true },
  { key: 'channel_push', label: 'Push', available: false },
] as const;

export function PortalNotificationsSection({
  clientId,
  accentColor,
  accentTextColor,
  portalToken,
}: PortalNotificationsSectionProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/portal/notifications', {
          headers: { 'x-portal-token': portalToken },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.preferences) {
            setPrefs({ ...DEFAULT_PREFS, ...data.preferences });
          }
        }
      } catch {
        // Silently fail
      }
      setLoading(false);
    }
    load();
  }, [portalToken]);

  const handleToggle = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Silently fail
    }
    setSaving(false);
  }, [prefs, portalToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pause All Card */}
      <div
        className={`rounded-2xl p-6 shadow-sm border transition-colors ${
          prefs.pause_all
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pause All Notifications</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {prefs.pause_all
                ? 'All notifications are paused'
                : 'Turn on for vacation mode'}
            </p>
          </div>
          <ToggleSwitch
            checked={prefs.pause_all}
            onChange={(val) => handleToggle('pause_all', val)}
            accentColor="#f59e0b"
          />
        </div>
      </div>

      {/* Channel Toggles */}
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 transition-opacity ${prefs.pause_all ? 'opacity-50' : ''}`}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Channels</h3>
        <div className="space-y-4">
          {CHANNELS.map(channel => (
            <div key={channel.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{channel.label}</span>
                {!channel.available && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400">
                    Coming soon
                  </span>
                )}
              </div>
              <ToggleSwitch
                checked={prefs[channel.key as keyof NotificationPreferences] as boolean}
                onChange={(val) => handleToggle(channel.key as keyof NotificationPreferences, val)}
                disabled={prefs.pause_all || !channel.available}
                accentColor={accentColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Category Matrix */}
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 transition-opacity ${prefs.pause_all ? 'opacity-50' : ''}`}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-4">
          {CATEGORIES.map(category => (
            <div
              key={category.key}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700">{category.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{category.description}</p>
              </div>
              <ToggleSwitch
                checked={prefs[category.key as keyof NotificationPreferences] as boolean}
                onChange={(val) => handleToggle(category.key as keyof NotificationPreferences, val)}
                disabled={prefs.pause_all}
                accentColor={accentColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Promotion Frequency */}
      {prefs.promotions && !prefs.pause_all && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Promotion Frequency</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleToggle('digest_promotions', false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: !prefs.digest_promotions ? accentColor : '#f3f4f6',
                color: !prefs.digest_promotions ? accentTextColor : '#6b7280',
              }}
            >
              Immediate
            </button>
            <button
              onClick={() => handleToggle('digest_promotions', true)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: prefs.digest_promotions ? accentColor : '#f3f4f6',
                color: prefs.digest_promotions ? accentTextColor : '#6b7280',
              }}
            >
              Daily Digest
            </button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{ backgroundColor: accentColor, color: accentTextColor }}
      >
        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
