'use client';

import { useState, useRef, useEffect } from 'react';
import { FONT_OPTIONS, loadExtraFonts } from '@/lib/fonts';
import { ColorItem } from './editors/ColorsEditor';
import { getContrastText } from '@/lib/view-colors';
import { getColorDefaults, ColorConfig } from '@/lib/onboarding/color-defaults';
import { DashboardColors } from '@/types/config';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LogoSlot {
  slot: string;
  imageUrl: string;
  imageId?: string;
}

const BRAND_LOGOS_ALBUM_NAME = 'Brand Kit';

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
  mode: 'onboarding' | 'editor' | 'sidebar';
  onLaunch?: () => void;
  launching?: boolean;
  /** Dashboard theme colors — only passed in editor (dashboard) mode to adapt to dark/colored themes */
  themeColors?: DashboardColors;
}

// ─── Color Helpers ──────────────────────────────────────────────────────────

function colorConfigToItems(config: ColorConfig): ColorItem[] {
  return Object.entries(config).map(([key, value]) => ({
    color: value,
    target: key as ColorItem['target'],
  }));
}

// 3 semantic colors — everything else is derived
const EDITABLE_COLORS: { key: keyof ColorConfig; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'buttons', label: 'Accent' },
  { key: 'text', label: 'Text' },
];

/** Derive all 10 color keys from the 3 user-chosen colors */
function deriveFullPalette(partial: Record<string, string>): Record<string, string> {
  const bg = partial.background || '#f8fafc';
  const accent = partial.buttons || '#3b82f6';
  const text = partial.text || '#1a1a1a';

  return {
    background: bg,
    buttons: accent,
    text: text,
    sidebar_bg: bg,
    sidebar_buttons: accent,
    sidebar_icons: mixColor(bg, text, 0.5),
    sidebar_text: getContrastText(bg) === '#FFFFFF' ? '#f1f5f9' : '#1a1a1a',
    cards: bg,
    headings: text,
    borders: mixColor(bg, text, 0.15),
  };
}

function mixColor(c1: string, c2: string, ratio: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * ratio);
  return `#${mix(r1, r2).toString(16).padStart(2, '0')}${mix(g1, g2).toString(16).padStart(2, '0')}${mix(b1, b2).toString(16).padStart(2, '0')}`;
}

// ─── Logo slot IDs ──────────────────────────────────────────────────────────

const LOGO_SLOT_IDS = ['primary', 'icon', 'alt'];

// ─── Sub-Components ─────────────────────────────────────────────────────────

function LogoSection({ compact = false, themeColors }: { compact?: boolean; themeColors?: DashboardColors }) {
  const [logos, setLogos] = useState<LogoSlot[]>([]);
  const [slotCount, setSlotCount] = useState(1);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const albumIdRef = useRef<string | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const initRef = useRef(false);

  // Load existing brand logos on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function loadBrandLogos() {
      try {
        const res = await fetch('/api/gallery/albums');
        if (!res.ok) return;
        const { albums } = await res.json();
        const brandAlbum = albums?.find((a: { name: string }) => a.name === BRAND_LOGOS_ALBUM_NAME);
        if (!brandAlbum) return;

        albumIdRef.current = brandAlbum.id;
        const imagesRes = await fetch(`/api/gallery?album_id=${brandAlbum.id}`);
        if (!imagesRes.ok) return;
        const { images } = await imagesRes.json();

        if (images && images.length > 0) {
          const loaded: LogoSlot[] = images.slice(0, 3).map((img: { id: string; image_url: string }, i: number) => ({
            slot: LOGO_SLOT_IDS[i],
            imageUrl: img.image_url,
            imageId: img.id,
          }));
          setLogos(loaded);
          setSlotCount(Math.max(1, loaded.length));
        }
      } catch {
        // Not authenticated or gallery not set up
      }
    }

    loadBrandLogos();
  }, []);

  const ensureAlbum = async (): Promise<string | null> => {
    if (albumIdRef.current) return albumIdRef.current;
    try {
      const res = await fetch('/api/gallery/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: BRAND_LOGOS_ALBUM_NAME, description: 'Logo variations from your brand board' }),
      });
      if (!res.ok) return null;
      const { album } = await res.json();
      albumIdRef.current = album.id;
      return album.id;
    } catch {
      return null;
    }
  };

  const handleFileSelect = async (slotId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogos((prev) => {
        const existing = prev.findIndex((l) => l.slot === slotId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { slot: slotId, imageUrl: dataUrl };
          return updated;
        }
        return [...prev, { slot: slotId, imageUrl: dataUrl }];
      });
    };
    reader.readAsDataURL(file);

    setUploading((prev) => ({ ...prev, [slotId]: true }));
    try {
      const aid = await ensureAlbum();
      if (!aid) return;

      const oldLogo = logos.find((l) => l.slot === slotId);
      if (oldLogo?.imageId) {
        await fetch(`/api/gallery/${oldLogo.imageId}`, { method: 'DELETE' }).catch(() => {});
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('album_id', aid);
      formData.append('caption', `Logo: ${slotId}`);

      const res = await fetch('/api/gallery', { method: 'POST', body: formData });
      if (res.ok) {
        const { image } = await res.json();
        setLogos((prev) =>
          prev.map((l) =>
            l.slot === slotId ? { ...l, imageUrl: image.image_url, imageId: image.id } : l
          )
        );
      }
    } catch (err) {
      console.error('Failed to upload logo:', err);
    } finally {
      setUploading((prev) => ({ ...prev, [slotId]: false }));
    }
  };

  const getLogo = (slotId: string) => logos.find((l) => l.slot === slotId);
  const activeSlots = LOGO_SLOT_IDS.slice(0, slotCount);

  const handleAddSlot = () => {
    if (slotCount < 3) {
      const newIndex = slotCount;
      setSlotCount((prev) => prev + 1);
      setTimeout(() => fileInputRefs.current[newIndex]?.click(), 50);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${slotCount === 1 ? 'justify-center' : ''}`}>
      {activeSlots.map((slotId, i) => {
        const logo = getLogo(slotId);
        const isUploading = uploading[slotId];
        const isLast = i === slotCount - 1;
        const slotSize = compact
          ? 'w-20 h-20'
          : slotCount === 1 ? 'w-32 h-32' : 'w-28 h-28';
        return (
          <div key={slotId} className="relative group">
            <button
              type="button"
              onClick={() => fileInputRefs.current[i]?.click()}
              className={`${slotSize} border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer overflow-hidden`}
              style={{
                borderColor: themeColors?.borders || '#D1D5DB',
                backgroundColor: themeColors?.cards || '#F9FAFB',
              }}
            >
              {logo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.imageUrl}
                    alt="Logo"
                    className={`w-full h-full object-contain p-2 ${isUploading ? 'opacity-50' : ''}`}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-black animate-spin" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: themeColors?.icons || '#9CA3AF' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[10px] font-medium" style={{ color: themeColors?.icons || '#9CA3AF' }}>Upload</span>
                </>
              )}
            </button>
            {/* "−" to remove this slot — shows on hover when more than 1 slot */}
            {isLast && slotCount > 1 && (
              <button
                type="button"
                onClick={() => {
                  setLogos((prev) => prev.filter((l) => l.slot !== slotId));
                  setSlotCount((prev) => prev - 1);
                }}
                className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                </svg>
              </button>
            )}
            {/* "+" to add more — shows on hover of the last uploaded slot, max 3 */}
            {logo && isLast && slotCount < 3 && (
              <button
                type="button"
                onClick={handleAddSlot}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
            <input
              ref={(el) => { fileInputRefs.current[i] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(slotId, file);
                e.target.value = '';
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Color Bars (coolors.co style) ──────────────────────────────────────────

interface ColorBarsSectionProps {
  colors: ColorItem[];
  onColorsChange: (colors: ColorItem[]) => void;
  businessType?: string;
  themeColors?: DashboardColors;
}

function ColorBarsSection({ colors, onColorsChange, businessType, themeColors }: ColorBarsSectionProps) {
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const didAutoApply = useRef(false);

  // Auto-apply defaults when colors are empty
  useEffect(() => {
    if (colors.length === 0 && !didAutoApply.current) {
      didAutoApply.current = true;
      const base = getColorDefaults(businessType || '');
      onColorsChange(colorConfigToItems(base));
    }
  }, [colors.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const colorMap: Record<string, string> = {};
  colors.forEach((c) => { colorMap[c.target] = c.color; });

  const handleBarChange = (key: string, newColor: string) => {
    const partial: Record<string, string> = {};
    EDITABLE_COLORS.forEach(({ key: k }) => {
      partial[k] = k === key ? newColor : (colorMap[k] || '#cccccc');
    });

    const full = deriveFullPalette(partial);
    const updated = Object.entries(full).map(([k, v]) => ({
      color: v,
      target: k as ColorItem['target'],
    }));
    onColorsChange(updated);
  };

  return (
    <div className="flex overflow-hidden border-2" style={{ borderColor: themeColors?.borders || '#9CA3AF' }}>
      {EDITABLE_COLORS.map(({ key, label }, idx) => {
        const hex = colorMap[key] || '#cccccc';
        const textColor = getContrastText(hex);
        return (
          <label
            key={key}
            className="flex-1 relative cursor-pointer flex flex-col"
          >
            <div
              className="w-full flex-1 min-h-[80px]"
              style={{ backgroundColor: hex }}
            />
            <div
              className="px-1.5 py-2 text-center"
              style={{ backgroundColor: hex }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wider block"
                style={{ color: textColor }}
              >
                {label}
              </span>
              <span
                className="block text-[9px] font-mono mt-0.5"
                style={{ color: textColor, opacity: 0.7 }}
              >
                {hex.toUpperCase()}
              </span>
            </div>
            <input
              ref={(el) => { colorInputRefs.current[idx] = el; }}
              type="color"
              value={hex}
              onChange={(e) => handleBarChange(key, e.target.value)}
              className="absolute w-0 h-0 opacity-0"
            />
          </label>
        );
      })}
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
  themeColors?: DashboardColors;
}

function FontSection({ headingFont, bodyFont, onFontChange, buttonColor, themeColors }: FontSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) loadExtraFonts();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const findFont = (family: string) =>
    FONT_OPTIONS.find((f) => f.family === family) || FONT_OPTIONS[0];

  const currentFont = findFont(headingFont);

  const handleSelect = (family: string) => {
    // Single font applies to both heading and body
    onFontChange(family, family);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={isOpen ? dropdownRef : undefined}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border-2 p-3 flex items-center justify-between gap-2 transition-colors"
        style={{
          borderColor: themeColors?.borders || '#E5E7EB',
          backgroundColor: themeColors?.cards || '#FFFFFF',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-xl font-semibold shrink-0"
            style={{ fontFamily: currentFont.family, color: themeColors?.text || '#374151' }}
          >
            Aa
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: themeColors?.headings || '#1F2937' }}>{currentFont.name}</p>
            <p className="text-xs" style={{ color: themeColors?.icons || '#9CA3AF' }}>{currentFont.style}</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          style={{ color: themeColors?.icons || '#9CA3AF' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 left-0 right-0 border-2 shadow-lg max-h-64 overflow-y-auto"
          style={{
            backgroundColor: themeColors?.cards || '#FFFFFF',
            borderColor: themeColors?.headings || '#000000',
          }}
        >
          {FONT_OPTIONS.map((font) => {
            const isSelected = headingFont === font.family;
            return (
              <button
                key={font.name}
                type="button"
                onClick={() => handleSelect(font.family)}
                className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors"
                style={{
                  backgroundColor: isSelected ? (themeColors ? `${themeColors.borders}60` : '#F3F4F6') : undefined,
                }}
              >
                <span
                  className="text-lg font-semibold w-8 shrink-0 text-center"
                  style={{ fontFamily: font.family, color: themeColors?.icons || '#4B5563' }}
                >
                  Aa
                </span>
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: isSelected ? (themeColors?.headings || '#111827') : (themeColors?.text || '#374151') }}
                  >
                    {font.name}
                  </p>
                  <p className="text-xs" style={{ color: themeColors?.icons || '#9CA3AF' }}>{font.style}</p>
                </div>
                {isSelected && (
                  <svg className="w-4 h-4 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: themeColors?.headings || '#111827' }}>
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
  launching,
  themeColors,
}: BrandBoardEditorProps) {
  // Onboarding mode — narrow centered, no titles
  if (mode === 'onboarding') {
    return (
      <div className="max-w-2xl mx-auto px-6 pb-12">
        <div className="border-2 border-gray-400 p-6 space-y-6">
          <LogoSection />
          <ColorBarsSection
            colors={colors}
            onColorsChange={onColorsChange}
            businessType={businessType}
          />
          <FontSection
            headingFont={headingFont}
            bodyFont={bodyFont}
            onFontChange={onFontChange}
            buttonColor={buttonColor}
            businessName={businessName}
          />
        </div>
        {onLaunch && (
          <button
            onClick={onLaunch}
            disabled={launching}
            className="w-full py-4 font-semibold text-lg transition-all disabled:opacity-70 mt-0"
            style={{ backgroundColor: buttonColor, color: getContrastText(buttonColor) }}
          >
            {launching ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Launching...
              </span>
            ) : (
              'Launch Your Dashboard'
            )}
          </button>
        )}
      </div>
    );
  }

  // Sidebar mode — compact vertical layout for editor sidebar
  if (mode === 'sidebar') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <p className="text-[10px] font-['Fira_Code'] font-semibold uppercase tracking-wider text-gray-500 mb-2">Logo</p>
            <LogoSection compact />
          </div>
          <div>
            <p className="text-[10px] font-['Fira_Code'] font-semibold uppercase tracking-wider text-gray-500 mb-2">Colors</p>
            <ColorBarsSection
              colors={colors}
              onColorsChange={onColorsChange}
              businessType={businessType}
            />
          </div>
          <div>
            <p className="text-[10px] font-['Fira_Code'] font-semibold uppercase tracking-wider text-gray-500 mb-2">Font</p>
            <FontSection
              headingFont={headingFont}
              bodyFont={bodyFont}
              onFontChange={onFontChange}
              buttonColor={buttonColor}
              businessName={businessName}
            />
          </div>
        </div>
      </div>
    );
  }

  // Editor mode — centered, same width as onboarding, theme-aware
  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-2 p-6 space-y-6" style={{ borderColor: themeColors?.borders || '#9CA3AF' }}>
        <LogoSection themeColors={themeColors} />
        <ColorBarsSection
          colors={colors}
          onColorsChange={onColorsChange}
          businessType={businessType}
          themeColors={themeColors}
        />
        <FontSection
          headingFont={headingFont}
          bodyFont={bodyFont}
          onFontChange={onFontChange}
          buttonColor={buttonColor}
          businessName={businessName}
          themeColors={themeColors}
        />
      </div>
    </div>
  );
}
