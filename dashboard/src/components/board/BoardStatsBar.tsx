'use client';

import React from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  featured?: boolean;
  icon: React.ReactNode;
}

interface BoardStatsBarProps {
  items: StatItem[];
  accentColor?: string;
  tvMode?: boolean;
}

export function BoardStatsBar({ items, accentColor = '#3B82F6', tvMode = false }: BoardStatsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-['Inter']">
      {items.map((card) => {
        const isFeatured = card.featured;
        const cardBg = isFeatured
          ? accentColor
          : tvMode
            ? '#1A1A1A'
            : '#FFFFFF';
        const textColor = isFeatured || tvMode ? '#FFFFFF' : '#111827';
        const labelColor = isFeatured
          ? 'rgba(255,255,255,0.8)'
          : tvMode
            ? 'rgba(255,255,255,0.6)'
            : '#6B7280';

        return (
          <div
            key={card.label}
            className="rounded-xl p-5 shadow-sm border"
            style={{
              backgroundColor: cardBg,
              borderColor: tvMode ? 'rgba(255,255,255,0.1)' : isFeatured ? 'transparent' : '#E5E7EB',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: isFeatured ? 'rgba(255,255,255,0.9)' : labelColor }}>
                {card.icon}
              </span>
            </div>
            <div
              className={`font-bold ${tvMode ? 'text-5xl' : 'text-3xl'} font-['Inter']`}
              style={{ color: textColor }}
            >
              {card.value}
            </div>
            <div
              className="text-sm mt-1 font-medium font-['Inter']"
              style={{ color: labelColor }}
            >
              {card.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
