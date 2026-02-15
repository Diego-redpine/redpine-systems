'use client';

import { DashboardColors } from '@/types/config';
import { getTextColor, getCardBorder } from '@/lib/view-colors';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  configColors: DashboardColors;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  configColors,
}: SearchBarProps) {
  const textColor = getTextColor(configColors);
  const borderColor = getCardBorder(configColors);
  const cardBg = configColors.cards || '#FFFFFF';

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
      style={{
        backgroundColor: cardBg,
        borderColor: borderColor,
      }}
    >
      {/* Search icon */}
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: textColor, opacity: 0.5 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm min-w-[120px]"
        style={{ color: textColor }}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="p-0.5 rounded hover:bg-black/5 transition-colors"
          style={{ color: textColor, opacity: 0.5 }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
