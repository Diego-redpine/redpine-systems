'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import ReviewWidgetPreview from './ReviewWidgetPreview';

interface ReviewWidgetBuilderProps {
  colors: DashboardColors;
}

interface WidgetConfig {
  id?: string;
  name: string;
  layout_type: 'list' | 'grid' | 'carousel' | 'badge';
  min_rating: number;
  max_reviews: number;
  platforms: string[];
  show_ai_summary: boolean;
  style_overrides?: Record<string, unknown>;
}

const DEFAULT_WIDGET: WidgetConfig = {
  name: 'My Review Widget',
  layout_type: 'carousel',
  min_rating: 4,
  max_reviews: 10,
  platforms: ['direct', 'google', 'facebook'],
  show_ai_summary: true,
};

const LAYOUT_OPTIONS: {
  type: WidgetConfig['layout_type'];
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    type: 'list',
    label: 'List',
    description: 'Vertical stack',
    icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z',
  },
  {
    type: 'grid',
    label: 'Grid',
    description: '2-column grid',
    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  },
  {
    type: 'carousel',
    label: 'Carousel',
    description: 'One at a time',
    icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z',
  },
  {
    type: 'badge',
    label: 'Badge',
    description: 'Compact floating',
    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  },
];

const PLATFORM_OPTIONS = [
  { value: 'direct', label: 'Direct' },
  { value: 'google', label: 'Google' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'yelp', label: 'Yelp' },
];

const MIN_RATING_OPTIONS = [
  { value: 1, label: '1+ Stars' },
  { value: 2, label: '2+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 4, label: '4+ Stars' },
  { value: 5, label: '5 Stars Only' },
];

const MAX_REVIEWS_OPTIONS = [5, 10, 15, 20, 30, 50];

export default function ReviewWidgetBuilder({ colors }: ReviewWidgetBuilderProps) {
  const [widget, setWidget] = useState<WidgetConfig>(DEFAULT_WIDGET);
  const [savedWidgets, setSavedWidgets] = useState<WidgetConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';

  const fetchWidgets = useCallback(async () => {
    try {
      const res = await fetch('/api/data/review-widgets?pageSize=50');
      const json = await res.json();
      if (json.success && json.data) {
        setSavedWidgets(json.data);
        if (json.data.length > 0) {
          const first = json.data[0];
          setWidget({
            id: first.id,
            name: first.name || 'My Review Widget',
            layout_type: first.layout_type || 'carousel',
            min_rating: first.min_rating ?? 4,
            max_reviews: first.max_reviews ?? 10,
            platforms: first.platforms || ['direct', 'google', 'facebook'],
            show_ai_summary: first.show_ai_summary ?? true,
            style_overrides: first.style_overrides,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch widgets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        name: widget.name,
        layout_type: widget.layout_type,
        min_rating: widget.min_rating,
        max_reviews: widget.max_reviews,
        platforms: widget.platforms,
        show_ai_summary: widget.show_ai_summary,
        style_overrides: widget.style_overrides || {},
      };

      if (widget.id) {
        await fetch(`/api/data/review-widgets?id=${widget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        const res = await fetch('/api/data/review-widgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setWidget((prev) => ({ ...prev, id: json.data.id }));
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save widget:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateWidget = (updates: Partial<WidgetConfig>) => {
    setWidget((prev) => ({ ...prev, ...updates }));
  };

  const togglePlatform = (platform: string) => {
    setWidget((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  if (loading) {
    return (
      <div
        className="p-12 text-center"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <p style={{ color: textMuted }}>Loading widget builder...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left panel: Settings */}
      <div className="space-y-4">
        <div
          className="p-6"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <h3 className="text-lg font-bold mb-5" style={{ color: textMain }}>
            Widget Settings
          </h3>

          {/* Widget name */}
          <div className="mb-5">
            <label
              className="text-sm font-medium block mb-1.5"
              style={{ color: textMain }}
            >
              Widget Name
            </label>
            <input
              type="text"
              value={widget.name}
              onChange={(e) => updateWidget({ name: e.target.value })}
              className="w-full px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${borderColor}`,
                color: textMain,
                backgroundColor: colors.background || '#F9FAFB',
              }}
            />
          </div>

          {/* Layout type selector */}
          <div className="mb-5">
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: textMain }}
            >
              Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUT_OPTIONS.map((option) => {
                const isActive = widget.layout_type === option.type;
                return (
                  <button
                    key={option.type}
                    onClick={() => updateWidget({ layout_type: option.type })}
                    className="flex items-center gap-3 p-3 text-left transition-colors"
                    style={{
                      backgroundColor: isActive ? `${buttonColor}08` : 'transparent',
                      border: `1px solid ${isActive ? buttonColor : borderColor}`,
                    }}
                  >
                    <div
                      className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isActive ? `${buttonColor}12` : '#F3F4F6',
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isActive ? buttonColor : textMuted}
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={option.icon}
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: isActive ? buttonColor : textMain }}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs" style={{ color: textMuted }}>
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-5">
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: textMain }}
            >
              Filters
            </label>

            <div className="space-y-3">
              {/* Min rating */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: textMuted }}>
                  Minimum Rating
                </span>
                <select
                  value={widget.min_rating}
                  onChange={(e) =>
                    updateWidget({ min_rating: parseInt(e.target.value) })
                  }
                  className="px-3 py-1.5 text-sm"
                  style={{
                    border: `1px solid ${borderColor}`,
                    color: textMain,
                    backgroundColor: cardBg,
                  }}
                >
                  {MIN_RATING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max reviews */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: textMuted }}>
                  Max Reviews
                </span>
                <select
                  value={widget.max_reviews}
                  onChange={(e) =>
                    updateWidget({ max_reviews: parseInt(e.target.value) })
                  }
                  className="px-3 py-1.5 text-sm"
                  style={{
                    border: `1px solid ${borderColor}`,
                    color: textMain,
                    backgroundColor: cardBg,
                  }}
                >
                  {MAX_REVIEWS_OPTIONS.map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platforms */}
              <div>
                <span className="text-sm block mb-2" style={{ color: textMuted }}>
                  Platforms
                </span>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((platform) => {
                    const isActive = widget.platforms.includes(platform.value);
                    return (
                      <button
                        key={platform.value}
                        onClick={() => togglePlatform(platform.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: isActive ? `${buttonColor}10` : 'transparent',
                          border: `1px solid ${isActive ? buttonColor : borderColor}`,
                          color: isActive ? buttonColor : textMuted,
                        }}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: isActive ? buttonColor : 'transparent',
                            border: `1.5px solid ${isActive ? buttonColor : '#D1D5DB'}`,
                          }}
                        >
                          {isActive && (
                            <svg
                              width="8"
                              height="8"
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
                        {platform.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-sm font-medium" style={{ color: textMain }}>
                AI Summary
              </span>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                Show a one-line summary at the top
              </p>
            </div>
            <button
              onClick={() =>
                updateWidget({ show_ai_summary: !widget.show_ai_summary })
              }
              className="relative w-11 h-6 transition-colors"
              style={{
                backgroundColor: widget.show_ai_summary ? buttonColor : '#D1D5DB',
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white shadow transition-transform"
                style={{
                  left: widget.show_ai_summary ? '22px' : '2px',
                }}
              />
            </button>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: buttonColor, color: buttonText }}
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Widget'}
            </button>
            {saved && (
              <span className="text-sm" style={{ color: '#047857' }}>
                Widget saved
              </span>
            )}
          </div>
        </div>

        {/* Info note */}
        <div
          className="p-4 text-center"
          style={{
            backgroundColor: `${buttonColor}05`,
            border: `1px solid ${buttonColor}15`,
          }}
        >
          <p className="text-xs" style={{ color: textMuted }}>
            This widget is automatically available as a section in your website editor.
          </p>
        </div>
      </div>

      {/* Right panel: Live preview */}
      <div>
        <div
          className="p-6 sticky top-4"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: textMain }}>
              Live Preview
            </h3>
            <span
              className="px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${buttonColor}10`,
                color: buttonColor,
              }}
            >
              {widget.layout_type.charAt(0).toUpperCase() + widget.layout_type.slice(1)}
            </span>
          </div>

          <div
            className="p-4"
            style={{
              backgroundColor: colors.background || '#F9FAFB',
              border: `1px solid ${borderColor}`,
              minHeight: 200,
            }}
          >
            <ReviewWidgetPreview config={widget} colors={colors} />
          </div>
        </div>
      </div>
    </div>
  );
}
