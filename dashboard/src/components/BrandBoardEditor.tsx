'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FONT_OPTIONS, loadExtraFonts } from '@/lib/fonts';
import { ColorItem } from './editors/ColorsEditor';
import { getContrastText } from '@/lib/view-colors';
import { getColorDefaults, ColorConfig } from '@/lib/onboarding/color-defaults';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LogoSlot {
  slot: string;
  dataUrl: string;
}

interface BrandBoardEditorProps {
  configId: string | null;
  colors: ColorItem[];
  onColorsChange: (colors: ColorItem[]) => void;
  headingFont: string;
  bodyFont: string;
  onFontChange: (heading: string, body: string) => void;
  businessType?: string;
  businessName?: string;
  buttonColor?: string;
  mode: 'onboarding' | 'editor';
  onLaunch?: () => void;
}

// ─── Color Helpers ──────────────────────────────────────────────────────────

function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.min(255, Math.round(r + (255 - r) * amount));
  const ng = Math.min(255, Math.round(g + (255 - g) * amount));
  const nb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

function darkenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.max(0, Math.round(r * (1 - amount)));
  const ng = Math.max(0, Math.round(g * (1 - amount)));
  const nb = Math.max(0, Math.round(b * (1 - amount)));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

function colorConfigToItems(config: ColorConfig): ColorItem[] {
  return Object.entries(config).map(([key, value]) => ({
    color: value,
    target: key as ColorItem['target'],
  }));
}

/** Generate 3 preset variants: original, light, dark */
function generatePresets(businessType?: string): { label: string; config: ColorConfig }[] {
  const base = getColorDefaults(businessType || '');

  const light: ColorConfig = {
    ...base,
    sidebar_bg: lightenColor(base.sidebar_bg, 0.85),
    sidebar_text: '#1A1A1A',
    sidebar_icons: darkenColor(base.sidebar_icons, 0.3),
    background: '#F8FAFC',
    cards: '#FFFFFF',
    text: '#1A1A1A',
    headings: '#111827',
    borders: '#E5E7EB',
  };

  const dark: ColorConfig = {
    ...base,
    sidebar_bg: darkenColor(base.sidebar_bg, 0.4),
    sidebar_text: '#F1F5F9',
    background: '#0F172A',
    cards: '#1E293B',
    text: '#E2E8F0',
    headings: '#F1F5F9',
    borders: '#334155',
  };

  return [
    { label: 'Original', config: base },
    { label: 'Light', config: light },
    { label: 'Dark', config: dark },
  ];
}

// Labels for the 5 preview dots shown on preset cards
const PREVIEW_KEYS: { key: keyof ColorConfig; label: string }[] = [
  { key: 'sidebar_bg', label: 'Sidebar' },
  { key: 'buttons', label: 'Buttons' },
  { key: 'background', label: 'Background' },
  { key: 'cards', label: 'Cards' },
  { key: 'text', label: 'Text' },
];

// All 10 color keys with human-readable labels for the swatch row
const ALL_COLOR_KEYS: { key: keyof ColorConfig; label: string }[] = [
  { key: 'sidebar_bg', label: 'Sidebar BG' },
  { key: 'sidebar_icons', label: 'Sidebar Icons' },
  { key: 'sidebar_buttons', label: 'Sidebar Accent' },
  { key: 'sidebar_text', label: 'Sidebar Text' },
  { key: 'background', label: 'Background' },
  { key: 'buttons', label: 'Buttons' },
  { key: 'cards', label: 'Cards' },
  { key: 'text', label: 'Text' },
  { key: 'headings', label: 'Headings' },
  { key: 'borders', label: 'Borders' },
];

// ─── Logo upload slots ──────────────────────────────────────────────────────

const LOGO_SLOTS = [
  { id: 'primary', label: 'Primary Logo' },
  { id: 'icon', label: 'Icon' },
  { id: 'alt', label: 'Alt Logo' },
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

function LogoSection() {
  const [logos, setLogos] = useState<LogoSlot[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileSelect = (slotId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogos((prev) => {
        const existing = prev.findIndex((l) => l.slot === slotId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { slot: slotId, dataUrl };
          return updated;
        }
        return [...prev, { slot: slotId, dataUrl }];
      });
    };
    reader.readAsDataURL(file);
  };

  const getLogo = (slotId: string) => logos.find((l) => l.slot === slotId);

  return (
    <div className="grid grid-cols-3 gap-3">
      {LOGO_SLOTS.map((slot, i) => {
        const logo = getLogo(slot.id);
        return (
          <div key={slot.id}>
            <button
              type="button"
              onClick={() => fileInputRefs.current[i]?.click()}
              className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer overflow-hidden"
            >
              {logo ? (
                <img
                  src={logo.dataUrl}
                  alt={slot.label}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-xs text-gray-400 font-medium">{slot.label}</span>
                </>
              )}
            </button>
            <input
              ref={(el) => { fileInputRefs.current[i] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(slot.id, file);
                e.target.value = '';
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Color Presets Section ──────────────────────────────────────────────────

interface ColorPresetsSectionProps {
  colors: ColorItem[];
  onColorsChange: (colors: ColorItem[]) => void;
  businessType?: string;
  buttonColor: string;
}

function ColorPresetsSection({ colors, onColorsChange, businessType, buttonColor }: ColorPresetsSectionProps) {
  const presets = generatePresets(businessType);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Build a lookup from current colors for the active swatch row
  const colorMap: Record<string, string> = {};
  colors.forEach((c) => { colorMap[c.target] = c.color; });

  const handlePresetClick = (index: number) => {
    setSelectedPreset(index);
    const items = colorConfigToItems(presets[index].config);
    onColorsChange(items);
  };

  const handleSwatchChange = (key: string, newColor: string) => {
    const updated = colors.map((c) =>
      c.target === key ? { ...c, color: newColor } : c
    );
    onColorsChange(updated);
  };

  return (
    <div>
      {/* Preset cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {presets.map((preset, idx) => {
          const isSelected = selectedPreset === idx;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(idx)}
              className="rounded-xl border-2 p-3 transition-all hover:shadow-sm"
              style={{
                borderColor: isSelected ? buttonColor : '#E5E7EB',
                boxShadow: isSelected ? `0 0 0 1px ${buttonColor}` : 'none',
              }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                {PREVIEW_KEYS.map(({ key }) => (
                  <div
                    key={key}
                    className="w-5 h-5 rounded-full border border-gray-200"
                    style={{ backgroundColor: preset.config[key] }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-gray-600 text-center">{preset.label}</p>
            </button>
          );
        })}
      </div>

      {/* Active palette swatch row */}
      <div className="flex flex-wrap gap-2">
        {ALL_COLOR_KEYS.map(({ key, label }, idx) => {
          const hex = colorMap[key] || '#cccccc';
          return (
            <label key={key} className="flex flex-col items-center gap-1 cursor-pointer group">
              <div
                className="w-9 h-9 rounded-xl border border-gray-200 group-hover:ring-2 group-hover:ring-offset-1 transition-shadow cursor-pointer"
                style={{
                  backgroundColor: hex,
                  ['--tw-ring-color' as string]: buttonColor,
                }}
              />
              <input
                ref={(el) => { colorInputRefs.current[idx] = el; }}
                type="color"
                value={hex}
                onChange={(e) => handleSwatchChange(key, e.target.value)}
                className="absolute w-0 h-0 opacity-0"
              />
              <span className="text-[10px] text-gray-400 leading-tight text-center max-w-[40px]">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Font Section ───────────────────────────────────────────────────────────

interface FontSectionProps {
  headingFont: string;
  bodyFont: string;
  onFontChange: (heading: string, body: string) => void;
  buttonColor: string;
  businessName?: string;
}

function FontSection({ headingFont, bodyFont, onFontChange, buttonColor, businessName }: FontSectionProps) {
  const [openDropdown, setOpenDropdown] = useState<'heading' | 'body' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load extra fonts when dropdown opens
  useEffect(() => {
    if (openDropdown) {
      loadExtraFonts();
    }
  }, [openDropdown]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdown]);

  const findFont = (family: string) =>
    FONT_OPTIONS.find((f) => f.family === family) || FONT_OPTIONS[0];

  const headingFontObj = findFont(headingFont);
  const bodyFontObj = findFont(bodyFont);

  const handleSelect = (type: 'heading' | 'body', family: string) => {
    if (type === 'heading') {
      onFontChange(family, bodyFont);
    } else {
      onFontChange(headingFont, family);
    }
    // Apply to document
    document.documentElement.style.setProperty('--font-family', family);
    document.body.style.fontFamily = family;
    setOpenDropdown(null);
  };

  const renderPicker = (type: 'heading' | 'body', currentFont: typeof headingFontObj) => {
    const isOpen = openDropdown === type;
    const label = type === 'heading' ? 'Heading Font' : 'Body Font';

    return (
      <div className="relative" ref={isOpen ? dropdownRef : undefined}>
        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : type)}
          className="w-full rounded-xl border border-gray-200 hover:border-gray-300 bg-white p-3 flex items-center justify-between gap-2 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="text-xl font-semibold text-gray-700 shrink-0"
              style={{ fontFamily: currentFont.family }}
            >
              Aa
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{currentFont.name}</p>
              <p className="text-xs text-gray-400">{currentFont.style}</p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {FONT_OPTIONS.map((font) => {
              const isSelected =
                (type === 'heading' && headingFont === font.family) ||
                (type === 'body' && bodyFont === font.family);
              return (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => handleSelect(type, font.family)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  style={{
                    backgroundColor: isSelected ? `${buttonColor}10` : undefined,
                  }}
                >
                  <span
                    className="text-lg font-semibold text-gray-600 w-8 shrink-0 text-center"
                    style={{ fontFamily: font.family }}
                  >
                    Aa
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: isSelected ? buttonColor : '#374151' }}
                    >
                      {font.name}
                    </p>
                    <p className="text-xs text-gray-400">{font.style}</p>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 ml-auto shrink-0" style={{ color: buttonColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="space-y-3 mb-5">
        {renderPicker('heading', headingFontObj)}
        {renderPicker('body', bodyFontObj)}
      </div>

      {/* Live specimen preview */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
        <h4
          className="text-xl font-bold text-gray-800 mb-2"
          style={{ fontFamily: headingFontObj.family }}
        >
          {businessName || 'Your Business Name'}
        </h4>
        <p
          className="text-sm text-gray-500 leading-relaxed"
          style={{ fontFamily: bodyFontObj.family }}
        >
          Welcome to your brand new platform. This is how your body text will look across your
          dashboard, website, and client-facing pages. Clean, readable, and on-brand.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function BrandBoardEditor({
  configId,
  colors,
  onColorsChange,
  headingFont,
  bodyFont,
  onFontChange,
  businessType,
  businessName,
  buttonColor = '#1A1A1A',
  mode,
  onLaunch,
}: BrandBoardEditorProps) {
  const containerClass = mode === 'onboarding'
    ? 'max-w-2xl mx-auto px-6 pb-12'
    : '';

  return (
    <div className={containerClass}>
      {/* Section: Logos */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Logo</h3>
        <LogoSection />
      </div>

      <div className="border-t border-gray-100 my-6" />

      {/* Section: Colors */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Colors</h3>
        <ColorPresetsSection
          colors={colors}
          onColorsChange={onColorsChange}
          businessType={businessType}
          buttonColor={buttonColor}
        />
      </div>

      <div className="border-t border-gray-100 my-6" />

      {/* Section: Fonts */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Typography</h3>
        <FontSection
          headingFont={headingFont}
          bodyFont={bodyFont}
          onFontChange={onFontChange}
          buttonColor={buttonColor}
          businessName={businessName}
        />
      </div>

      {/* Launch button -- onboarding only */}
      {mode === 'onboarding' && onLaunch && (
        <button
          onClick={onLaunch}
          className="w-full py-4 rounded-xl font-semibold text-lg transition-colors"
          style={{ backgroundColor: buttonColor, color: getContrastText(buttonColor) }}
        >
          Launch Your Dashboard
        </button>
      )}
    </div>
  );
}
