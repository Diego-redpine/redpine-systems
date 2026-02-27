'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface ReviewGateProps {
  colors: DashboardColors;
}

interface GateConfig {
  id?: string;
  enabled: boolean;
  star_threshold: number;
  positive_platforms: {
    google: { enabled: boolean; url: string };
    facebook: { enabled: boolean; url: string };
    yelp: { enabled: boolean; url: string };
  };
  negative_message: string;
  notify_team: boolean;
  notify_channels: {
    in_app: boolean;
    email: boolean;
    sms: boolean;
  };
}

const DEFAULT_CONFIG: GateConfig = {
  enabled: false,
  star_threshold: 4,
  positive_platforms: {
    google: { enabled: true, url: '' },
    facebook: { enabled: true, url: '' },
    yelp: { enabled: false, url: '' },
  },
  negative_message:
    "We're sorry to hear your experience wasn't perfect. Your feedback is incredibly valuable to us, and we'd love to make things right. Our team will reach out to you shortly.",
  notify_team: true,
  notify_channels: {
    in_app: true,
    email: false,
    sms: false,
  },
};

export default function ReviewGate({ colors }: ReviewGateProps) {
  const [config, setConfig] = useState<GateConfig>(DEFAULT_CONFIG);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/data/review-gate?pageSize=1');
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        const raw = json.data[0];
        setConfig({
          id: raw.id,
          enabled: raw.enabled ?? false,
          star_threshold: raw.star_threshold ?? 4,
          positive_platforms: raw.positive_platforms ?? DEFAULT_CONFIG.positive_platforms,
          negative_message: raw.negative_message ?? DEFAULT_CONFIG.negative_message,
          notify_team: raw.notify_team ?? true,
          notify_channels: raw.notify_channels ?? DEFAULT_CONFIG.notify_channels,
        });
      }
    } catch (err) {
      console.error('Failed to fetch gate config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (config.id) {
        await fetch(`/api/data/review-gate?id=${config.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enabled: config.enabled,
            star_threshold: config.star_threshold,
            positive_platforms: config.positive_platforms,
            negative_message: config.negative_message,
            notify_team: config.notify_team,
            notify_channels: config.notify_channels,
          }),
        });
      } else {
        const res = await fetch('/api/data/review-gate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enabled: config.enabled,
            star_threshold: config.star_threshold,
            positive_platforms: config.positive_platforms,
            negative_message: config.negative_message,
            notify_team: config.notify_team,
            notify_channels: config.notify_channels,
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setConfig((prev) => ({ ...prev, id: json.data.id }));
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save gate config:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<GateConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const togglePlatform = (platform: 'google' | 'facebook' | 'yelp') => {
    setConfig((prev) => ({
      ...prev,
      positive_platforms: {
        ...prev.positive_platforms,
        [platform]: {
          ...prev.positive_platforms[platform],
          enabled: !prev.positive_platforms[platform].enabled,
        },
      },
    }));
  };

  const updatePlatformUrl = (platform: 'google' | 'facebook' | 'yelp', url: string) => {
    setConfig((prev) => ({
      ...prev,
      positive_platforms: {
        ...prev.positive_platforms,
        [platform]: {
          ...prev.positive_platforms[platform],
          url,
        },
      },
    }));
  };

  const toggleChannel = (channel: 'in_app' | 'email' | 'sms') => {
    setConfig((prev) => ({
      ...prev,
      notify_channels: {
        ...prev.notify_channels,
        [channel]: !prev.notify_channels[channel],
      },
    }));
  };

  if (loading) {
    return (
      <div
        className="p-12 text-center"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <p style={{ color: textMuted }}>Loading gate settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main gate card */}
      <div
        className="p-6"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold" style={{ color: textMain }}>
              Review Gate
            </h3>
            <p className="text-sm mt-1" style={{ color: textMuted }}>
              Route reviews based on star rating
            </p>
          </div>

          {/* Toggle switch */}
          <button
            onClick={() => updateConfig({ enabled: !config.enabled })}
            className="relative w-14 h-7 transition-colors"
            style={{
              backgroundColor: config.enabled ? buttonColor : '#D1D5DB',
            }}
          >
            <span
              className="absolute top-0.5 w-6 h-6 bg-white shadow transition-transform"
              style={{
                left: config.enabled ? '30px' : '2px',
              }}
            />
          </button>
        </div>

        {/* Gate status description */}
        {!config.enabled ? (
          <div
            className="p-4"
            style={{
              backgroundColor: colors.background || '#F9FAFB',
              border: `1px solid ${borderColor}`,
            }}
          >
            <p className="text-sm" style={{ color: textMuted }}>
              All reviews go directly to your inbox. Turn the gate on to route positive reviews to public platforms and capture negative feedback privately.
            </p>
          </div>
        ) : (
          <>
            <div
              className="p-4 mb-4"
              style={{
                backgroundColor: `${buttonColor}05`,
                border: `1px solid ${buttonColor}15`,
              }}
            >
              <p className="text-sm" style={{ color: textMain }}>
                Positive reviews ({config.star_threshold}-5 stars) are directed to leave public reviews.
                Lower ratings go to private feedback.
              </p>
            </div>

            {/* Customize link */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm font-medium mb-4"
              style={{ color: buttonColor }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform"
                style={{
                  transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Customize settings
            </button>

            {/* Expanded settings */}
            {expanded && (
              <div className="space-y-6 pt-2">
                {/* Star threshold slider */}
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: textMain }}>
                    Route to public review if rating is{' '}
                    <span
                      className="inline-block px-2 py-0.5 text-sm font-bold"
                      style={{
                        backgroundColor: `${buttonColor}10`,
                        color: buttonColor,
                      }}
                    >
                      {config.star_threshold}+ stars
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: textMuted }}>1</span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={config.star_threshold}
                      onChange={(e) =>
                        updateConfig({ star_threshold: parseInt(e.target.value) })
                      }
                      className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${buttonColor} ${
                          ((config.star_threshold - 1) / 4) * 100
                        }%, #D1D5DB ${((config.star_threshold - 1) / 4) * 100}%)`,
                      }}
                    />
                    <span className="text-xs" style={{ color: textMuted }}>5</span>
                  </div>
                </div>

                {/* Positive path platforms */}
                <div>
                  <label
                    className="text-sm font-medium block mb-3"
                    style={{ color: textMain }}
                  >
                    Direct positive reviews to:
                  </label>
                  <div className="space-y-3">
                    {(
                      [
                        { key: 'google' as const, label: 'Google', icon: 'G' },
                        { key: 'facebook' as const, label: 'Facebook', icon: 'f' },
                        { key: 'yelp' as const, label: 'Yelp', icon: 'Y' },
                      ] as const
                    ).map(({ key, label, icon }) => (
                      <div key={key}>
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            onClick={() => togglePlatform(key)}
                            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: config.positive_platforms[key].enabled
                                ? buttonColor
                                : 'transparent',
                              border: `2px solid ${
                                config.positive_platforms[key].enabled
                                  ? buttonColor
                                  : '#D1D5DB'
                              }`,
                            }}
                          >
                            {config.positive_platforms[key].enabled && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={buttonText}
                                strokeWidth="3"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                          <span
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
                          >
                            {icon}
                          </span>
                          <span className="text-sm font-medium" style={{ color: textMain }}>
                            {label}
                          </span>
                        </div>
                        {config.positive_platforms[key].enabled && (
                          <input
                            type="url"
                            value={config.positive_platforms[key].url}
                            onChange={(e) => updatePlatformUrl(key, e.target.value)}
                            placeholder={`Your ${label} review page URL`}
                            className="w-full ml-8 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                            style={{
                              width: 'calc(100% - 2rem)',
                              border: `1px solid ${borderColor}`,
                              color: textMain,
                              backgroundColor: colors.background || '#F9FAFB',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Negative path message */}
                <div>
                  <label
                    className="text-sm font-medium block mb-2"
                    style={{ color: textMain }}
                  >
                    Private feedback message (shown for lower ratings)
                  </label>
                  <textarea
                    value={config.negative_message}
                    onChange={(e) =>
                      updateConfig({ negative_message: e.target.value })
                    }
                    rows={3}
                    className="w-full p-3 text-sm resize-none focus:outline-none focus:ring-2"
                    style={{
                      border: `1px solid ${borderColor}`,
                      color: textMain,
                      backgroundColor: colors.background || '#F9FAFB',
                    }}
                  />
                </div>

                {/* Team notifications */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label
                      className="text-sm font-medium"
                      style={{ color: textMain }}
                    >
                      Notify team on negative feedback
                    </label>
                    <button
                      onClick={() =>
                        updateConfig({ notify_team: !config.notify_team })
                      }
                      className="relative w-11 h-6 transition-colors"
                      style={{
                        backgroundColor: config.notify_team
                          ? buttonColor
                          : '#D1D5DB',
                      }}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 bg-white shadow transition-transform"
                        style={{
                          left: config.notify_team ? '22px' : '2px',
                        }}
                      />
                    </button>
                  </div>

                  {config.notify_team && (
                    <div className="flex gap-4 ml-1">
                      {(
                        [
                          { key: 'in_app' as const, label: 'In-app' },
                          { key: 'email' as const, label: 'Email' },
                          { key: 'sms' as const, label: 'SMS' },
                        ] as const
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => toggleChannel(key)}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: config.notify_channels[key]
                                ? buttonColor
                                : 'transparent',
                              border: `2px solid ${
                                config.notify_channels[key]
                                  ? buttonColor
                                  : '#D1D5DB'
                              }`,
                            }}
                          >
                            {config.notify_channels[key] && (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={buttonText}
                                strokeWidth="3"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </span>
                          <span className="text-sm" style={{ color: textMain }}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Save button */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: buttonColor,
              color: buttonText,
            }}
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
          {saved && (
            <span className="text-sm" style={{ color: '#047857' }}>
              Settings saved successfully
            </span>
          )}
        </div>
      </div>

      {/* Info card about gate activation */}
      <div
        className="p-5"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h4 className="text-sm font-semibold mb-2" style={{ color: textMain }}>
          When does the gate activate?
        </h4>
        <ul className="space-y-1.5">
          {[
            'Portal review section (when clients leave reviews through their portal)',
            'Post-appointment email/SMS review requests',
            'QR code at your physical location',
            'Review request links',
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm"
              style={{ color: textMuted }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={buttonColor}
                strokeWidth="2"
                className="flex-shrink-0 mt-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
