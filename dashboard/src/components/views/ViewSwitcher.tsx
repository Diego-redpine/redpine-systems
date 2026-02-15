'use client';

import { useState, useRef, useEffect } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface ViewSwitcherProps {
  componentId: string;
  currentView: string;
  availableViews: string[];
  configColors: DashboardColors;
  onChange: (viewType: string) => void;
}

const viewLabels: Record<string, string> = {
  table: 'Table',
  cards: 'Cards',
  pipeline: 'Pipeline',
  calendar: 'Calendar',
  list: 'List',
};

function ViewIcon({ viewType, color }: { viewType: string; color: string }) {
  const iconProps = {
    className: 'w-4 h-4',
    fill: 'none',
    stroke: color,
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
  };

  switch (viewType) {
    case 'table':
      return (<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" /></svg>);
    case 'cards':
      return (<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>);
    case 'pipeline':
      return (<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>);
    case 'calendar':
      return (<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
    case 'list':
      return (<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>);
    default:
      return (<svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>);
  }
}

export default function ViewSwitcher({
  currentView,
  availableViews,
  configColors,
  onChange,
}: ViewSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const buttonBg = configColors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const dropdownBg = configColors.cards || '#FFFFFF';
  const textColor = configColors.text || '#1A1A1A';
  const borderColor = configColors.borders || '#E5E7EB';

  const handleSelect = (viewType: string) => {
    onChange(viewType);
    setIsOpen(false);
  };

  if (availableViews.length <= 1) return null;

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
        style={{ backgroundColor: buttonBg, color: buttonText }}
      >
        <ViewIcon viewType={currentView} color={buttonText} />
        <span>{viewLabels[currentView] || currentView}</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 min-w-[160px] rounded-xl shadow-lg border z-50 py-1 overflow-hidden"
          style={{ backgroundColor: dropdownBg, borderColor }}
        >
          {availableViews.map((viewType) => (
            <button
              key={viewType}
              onClick={() => handleSelect(viewType)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
                viewType === currentView ? 'font-medium' : ''
              }`}
              style={{
                color: textColor,
                backgroundColor: viewType === currentView ? '#F5F5F5' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (viewType !== currentView) e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = viewType === currentView ? '#F5F5F5' : 'transparent';
              }}
            >
              <ViewIcon viewType={viewType} color={viewType === currentView ? buttonBg : '#6B7280'} />
              <span>{viewLabels[viewType] || viewType}</span>
              {viewType === currentView && (
                <svg className="w-4 h-4 ml-auto" fill="none" stroke={buttonBg} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
