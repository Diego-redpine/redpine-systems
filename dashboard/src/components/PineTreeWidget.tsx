'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { useDataMode } from '@/hooks/useDataMode';

interface PineTreeWidgetProps {
  colors: DashboardColors;
}

interface GrowthData {
  level: number;
  points: number;
  progress_to_next: number;
  next_threshold: number;
  records_created: number;
  appointments_booked: number;
  invoices_paid: number;
  reviews_collected: number;
  features_used: string[];
  milestones_reached: string[];
}

const STAGE_NAMES = ['Seed', 'Sprout', 'Sapling', 'Pine', 'Mighty Pine'];
const STAGE_THRESHOLDS = [0, 50, 150, 400, 1000];

const DEMO_GROWTH: GrowthData = {
  level: 2,
  points: 215,
  progress_to_next: 26,
  next_threshold: 400,
  records_created: 42,
  appointments_booked: 18,
  invoices_paid: 7,
  reviews_collected: 3,
  features_used: ['calendar', 'pipeline', 'invoices', 'reviews', 'forms'],
  milestones_reached: ['reached_sprout', 'reached_sapling'],
};

// Pixel-art style SVG trees for each growth stage
function TreeSVG({ level, accent }: { level: number; accent: string }) {
  const w = 64;
  const h = 64;

  // Stage 0: Seed
  if (level === 0) {
    return (
      <svg width={w} height={h} viewBox="0 0 64 64" fill="none">
        {/* Ground */}
        <rect x="8" y="52" width="48" height="4" rx="2" fill="#8B6914" opacity="0.3" />
        {/* Seed */}
        <ellipse cx="32" cy="48" rx="6" ry="4" fill="#8B6914" />
        <ellipse cx="32" cy="47" rx="4" ry="2.5" fill="#A67C1A" />
        {/* Tiny sprout coming out */}
        <path d="M32 44 Q32 40 34 38" stroke="#4CAF50" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // Stage 1: Sprout
  if (level === 1) {
    return (
      <svg width={w} height={h} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="52" width="48" height="4" rx="2" fill="#8B6914" opacity="0.3" />
        {/* Stem */}
        <rect x="31" y="32" width="2" height="20" fill="#6B8E23" />
        {/* Two small leaves */}
        <ellipse cx="26" cy="36" rx="6" ry="3" fill="#4CAF50" transform="rotate(-20 26 36)" />
        <ellipse cx="38" cy="34" rx="6" ry="3" fill="#66BB6A" transform="rotate(15 38 34)" />
        {/* Tiny bud */}
        <circle cx="32" cy="30" r="3" fill="#81C784" />
      </svg>
    );
  }

  // Stage 2: Sapling
  if (level === 2) {
    return (
      <svg width={w} height={h} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="52" width="48" height="4" rx="2" fill="#8B6914" opacity="0.3" />
        {/* Trunk */}
        <rect x="30" y="34" width="4" height="18" fill="#6B4226" rx="1" />
        {/* Tree layers */}
        <polygon points="32,12 18,30 46,30" fill="#2E7D32" />
        <polygon points="32,18 20,34 44,34" fill="#388E3C" />
        <polygon points="32,24 22,38 42,38" fill="#43A047" />
      </svg>
    );
  }

  // Stage 3: Pine
  if (level === 3) {
    return (
      <svg width={w} height={h} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="52" width="48" height="4" rx="2" fill="#8B6914" opacity="0.3" />
        {/* Thick trunk */}
        <rect x="28" y="38" width="8" height="14" fill="#5D4037" rx="2" />
        {/* Multiple conifer layers */}
        <polygon points="32,6 14,24 50,24" fill="#1B5E20" />
        <polygon points="32,14 16,30 48,30" fill="#2E7D32" />
        <polygon points="32,22 18,36 46,36" fill="#388E3C" />
        <polygon points="32,28 20,40 44,40" fill="#43A047" />
        {/* Star accent */}
        <circle cx="32" cy="7" r="2" fill={accent} />
      </svg>
    );
  }

  // Stage 4: Mighty Pine
  return (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none">
      <rect x="6" y="52" width="52" height="4" rx="2" fill="#8B6914" opacity="0.3" />
      {/* Thick trunk with roots */}
      <rect x="26" y="38" width="12" height="14" fill="#4E342E" rx="2" />
      <path d="M26 52 Q22 56 18 52" stroke="#5D4037" strokeWidth="2" fill="none" />
      <path d="M38 52 Q42 56 46 52" stroke="#5D4037" strokeWidth="2" fill="none" />
      {/* Dense conifer layers */}
      <polygon points="32,2 10,22 54,22" fill="#1B5E20" />
      <polygon points="32,10 12,28 52,28" fill="#2E7D32" />
      <polygon points="32,16 14,32 50,32" fill="#388E3C" />
      <polygon points="32,22 16,36 48,36" fill="#43A047" />
      <polygon points="32,28 18,40 46,40" fill="#4CAF50" />
      {/* Golden star */}
      <polygon points="32,2 33.5,6 38,6 34.5,8.5 36,12.5 32,10 28,12.5 29.5,8.5 26,6 30.5,6" fill={accent} />
      {/* Small ornaments */}
      <circle cx="24" cy="26" r="1.5" fill={accent} opacity="0.7" />
      <circle cx="40" cy="30" r="1.5" fill={accent} opacity="0.7" />
      <circle cx="28" cy="34" r="1.5" fill={accent} opacity="0.7" />
    </svg>
  );
}

export default function PineTreeWidget({ colors }: PineTreeWidgetProps) {
  const [growth, setGrowth] = useState<GrowthData>(DEMO_GROWTH);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { mode: dataMode } = useDataMode();

  const buttonBg = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = colors.cards || '#FFFFFF';
  const textColor = colors.text || '#6B7280';
  const headingColor = colors.headings || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';
  const accentColor = colors.buttons || '#F59E0B';

  const fetchGrowth = useCallback(async () => {
    // Skip API call in dummy mode — use demo data
    if (dataMode === 'dummy') {
      setGrowth(DEMO_GROWTH);
      setIsDemoMode(true);
      return;
    }
    try {
      const res = await fetch('/api/growth', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.level !== undefined) {
          // Check for level up
          if (!isDemoMode && data.level > growth.level) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
          }
          setGrowth(data);
          setIsDemoMode(false);
          return;
        }
      }
    } catch { /* ignore */ }
    setGrowth(DEMO_GROWTH);
    setIsDemoMode(true);
  }, [dataMode, isDemoMode, growth.level]);

  useEffect(() => { fetchGrowth(); }, [dataMode]);  // eslint-disable-line react-hooks/exhaustive-deps

  const stageName = STAGE_NAMES[growth.level] || 'Seed';
  const nextStageName = growth.level < 4 ? STAGE_NAMES[growth.level + 1] : null;

  return (
    <>
      {/* Floating tree button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-6 right-20 z-40 rounded-full shadow-lg transition-transform hover:scale-105"
        style={{
          backgroundColor: cardBg,
          border: `2px solid ${borderColor}`,
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={`${stageName} — ${growth.points} pts`}
      >
        <TreeSVG level={growth.level} accent={accentColor} />
        {showCelebration && (
          <span className="absolute -top-1 -right-1 text-lg animate-bounce">
            &#x2728;
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div
          className="fixed bottom-20 right-14 z-50 w-72 rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 text-center" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <div className="flex justify-center mb-2">
              <TreeSVG level={growth.level} accent={accentColor} />
            </div>
            <p className="text-base font-bold" style={{ color: headingColor }}>{stageName}</p>
            <p className="text-xs mt-0.5" style={{ color: textColor }}>{growth.points} growth points</p>

            {/* Progress bar */}
            {growth.level < 4 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1" style={{ color: textColor }}>
                  <span>{stageName}</span>
                  <span>{nextStageName}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${borderColor}80` }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${growth.progress_to_next}%`, backgroundColor: accentColor }}
                  />
                </div>
                <p className="text-xs mt-1 text-center" style={{ color: textColor }}>
                  {growth.next_threshold - growth.points} points to {nextStageName}
                </p>
              </div>
            )}
            {growth.level === 4 && (
              <p className="text-xs mt-2 font-medium" style={{ color: accentColor }}>Max level reached!</p>
            )}
          </div>

          {/* Growth stats */}
          <div className="p-4 space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: textColor }}>Growth Breakdown</p>
            {[
              { label: 'Records created', value: growth.records_created, pts: '+2 pts each' },
              { label: 'Appointments booked', value: growth.appointments_booked, pts: '+5 pts each' },
              { label: 'Invoices paid', value: growth.invoices_paid, pts: '+10 pts each' },
              { label: 'Reviews collected', value: growth.reviews_collected, pts: '+15 pts each' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: headingColor }}>{stat.label}</p>
                  <p className="text-xs" style={{ color: textColor }}>{stat.pts}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: headingColor }}>{stat.value}</span>
              </div>
            ))}

            {/* Features used */}
            {growth.features_used.length > 0 && (
              <div className="pt-2" style={{ borderTop: `1px solid ${borderColor}` }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: textColor }}>Features explored</p>
                <div className="flex flex-wrap gap-1">
                  {growth.features_used.map(f => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded-full text-xs capitalize"
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stage progression preview */}
            <div className="pt-2" style={{ borderTop: `1px solid ${borderColor}` }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: textColor }}>Growth Journey</p>
              <div className="flex items-center justify-between">
                {STAGE_NAMES.map((name, i) => {
                  const isReached = i <= growth.level;
                  const isCurrent = i === growth.level;
                  return (
                    <div key={name} className="flex flex-col items-center">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all"
                        style={{
                          backgroundColor: isReached ? accentColor : `${borderColor}80`,
                          color: isReached ? buttonText : textColor,
                          border: isCurrent ? `2px solid ${headingColor}` : 'none',
                          transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                        }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-xs mt-1 whitespace-nowrap" style={{
                        color: isReached ? headingColor : textColor,
                        fontWeight: isCurrent ? 600 : 400,
                        fontSize: 9,
                      }}>
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Demo badge */}
          {isDemoMode && (
            <div className="px-4 py-2 text-center" style={{ backgroundColor: `${accentColor}08`, borderTop: `1px solid ${borderColor}` }}>
              <p className="text-xs" style={{ color: textColor }}>Demo data — sign in to track your real growth</p>
            </div>
          )}
        </div>
      )}

      {/* Click-away overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-30" onClick={() => setIsExpanded(false)} />
      )}
    </>
  );
}
