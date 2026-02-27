'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardColors, DashboardTab } from '@/types/config';
import { ColorItem } from './editors/ColorsEditor';
import BrandBoardEditor from './BrandBoardEditor';
import { getContrastText } from '@/lib/view-colors';
import { FONT_OPTIONS, CORE_FONTS, loadExtraFonts } from '@/lib/fonts';

// ─── Sections Editor (tab reordering) ────────────────────────────────────────

interface TabComponent {
  id: string;
  label: string;
}

function SectionsEditor({
  tabs,
  components,
  onTabsReorder,
  colors,
}: {
  tabs?: DashboardTab[];
  components: TabComponent[];
  onTabsReorder?: (tabs: DashboardTab[]) => void;
  colors?: DashboardColors;
}) {
  const items = tabs || [{ id: '_current', label: 'Current Tab', icon: '', components }];
  const cardBg = colors?.cards || '#FFFFFF';
  const borderColor = colors?.borders || '#E5E7EB';
  const textColor = colors?.text || '#1A1A1A';
  const mutedColor = colors?.icons || '#6B7280';

  const moveTabUp = (idx: number) => {
    if (idx <= 0 || !tabs) return;
    const newTabs = [...tabs];
    [newTabs[idx - 1], newTabs[idx]] = [newTabs[idx], newTabs[idx - 1]];
    onTabsReorder?.(newTabs);
  };

  const moveTabDown = (idx: number) => {
    if (!tabs || idx >= tabs.length - 1) return;
    const newTabs = [...tabs];
    [newTabs[idx], newTabs[idx + 1]] = [newTabs[idx + 1], newTabs[idx]];
    onTabsReorder?.(newTabs);
  };

  return (
    <div>
      <p className="text-sm mb-4" style={{ color: mutedColor }}>Reorder your dashboard tabs with the arrows.</p>
      <div className="space-y-3">
        {items.map((tab, tabIdx) => (
          <div
            key={tab.id}
            className="overflow-hidden"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}` }}>
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveTabUp(tabIdx)}
                  disabled={tabIdx === 0 || !tabs}
                  className="w-6 h-5 flex items-center justify-center rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  style={{ color: mutedColor }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => moveTabDown(tabIdx)}
                  disabled={!tabs || tabIdx >= items.length - 1}
                  className="w-6 h-5 flex items-center justify-center rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  style={{ color: mutedColor }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
              <span className="text-sm font-semibold uppercase tracking-wide flex-1" style={{ color: textColor }}>{tab.label}</span>
              <span className="text-xs" style={{ color: mutedColor }}>{tab.components.length} items</span>
            </div>
            <div style={{ backgroundColor: cardBg }}>
              {tab.components.map((comp, compIdx) => (
                <div
                  key={comp.id}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                  style={{ borderBottom: `1px solid ${borderColor}20` }}
                >
                  <span className="w-6 h-6 flex items-center justify-center text-xs font-mono rounded" style={{ backgroundColor: `${borderColor}40`, color: mutedColor }}>{compIdx + 1}</span>
                  <span className="text-sm flex-1" style={{ color: textColor, opacity: 0.8 }}>{comp.label}</span>
                </div>
              ))}
              {tab.components.length === 0 && (
                <div className="px-4 py-5 text-center text-sm" style={{ color: mutedColor }}>No sections</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Brand Board View (Full Page) ────────────────────────────────────────────

interface BrandBoardViewProps {
  colors: DashboardColors;
  editorColors: ColorItem[];
  onColorsChange: (colors: ColorItem[]) => void;
  tabs?: DashboardTab[];
  components?: TabComponent[];
  onTabsReorder?: (tabs: DashboardTab[]) => void;
  businessType?: string;
  businessName?: string;
  configHeadingFont?: string;
  configBodyFont?: string;
}

type SubTab = 'brand_kit' | 'sections';

export default function BrandBoardView({
  colors,
  editorColors,
  onColorsChange,
  tabs,
  components = [],
  onTabsReorder,
  businessType,
  businessName,
  configHeadingFont,
  configBodyFont,
}: BrandBoardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('brand_kit');

  // Font state — prefer config (DB) over localStorage
  const [selectedHeadingFont, setSelectedHeadingFont] = useState(() => {
    if (configHeadingFont) return configHeadingFont;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('redpine-heading-font') || localStorage.getItem('redpine-font') || 'Inter';
    }
    return 'Inter';
  });
  const [selectedBodyFont, setSelectedBodyFont] = useState(() => {
    if (configBodyFont) return configBodyFont;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('redpine-body-font') || localStorage.getItem('redpine-font') || 'Inter';
    }
    return 'Inter';
  });

  // Apply saved fonts on mount
  useEffect(() => {
    const bodyName = localStorage.getItem('redpine-body-font') || localStorage.getItem('redpine-font');
    if (bodyName) {
      const fontOption = FONT_OPTIONS.find(f => f.name === bodyName);
      if (fontOption) {
        if (!CORE_FONTS.has(bodyName)) loadExtraFonts();
        document.documentElement.style.setProperty('--font-family', fontOption.family);
        document.body.style.fontFamily = fontOption.family;
      }
    }
  }, []);

  // Lazy-load extra fonts when Brand Kit tab is active
  const fontsLoadedRef = useRef(false);
  useEffect(() => {
    if (activeSubTab === 'brand_kit' && !fontsLoadedRef.current) {
      fontsLoadedRef.current = true;
      loadExtraFonts();
    }
  }, [activeSubTab]);

  const applyFonts = (headingFamily: string, headingName: string, bodyFamily: string, bodyName: string) => {
    setSelectedHeadingFont(headingName);
    setSelectedBodyFont(bodyName);
    document.documentElement.style.setProperty('--font-family', bodyFamily);
    document.body.style.fontFamily = bodyFamily;
    localStorage.setItem('redpine-heading-font', headingName);
    localStorage.setItem('redpine-body-font', bodyName);
    localStorage.setItem('redpine-font', bodyName);
    // Persist to config API so fonts survive page refresh
    fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headingFont: headingName, bodyFont: bodyName }),
    }).catch(() => { /* non-critical */ });
  };

  const headingFontFamily = FONT_OPTIONS.find(f => f.name === selectedHeadingFont)?.family || selectedHeadingFont;
  const bodyFontFamily = FONT_OPTIONS.find(f => f.name === selectedBodyFont)?.family || selectedBodyFont;

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'brand_kit', label: 'Brand Kit' },
    { id: 'sections', label: 'Sections' },
  ];

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
            style={{
              backgroundColor: activeSubTab === tab.id ? buttonColor : 'transparent',
              color: activeSubTab === tab.id ? buttonText : textMuted,
              border: activeSubTab === tab.id ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSubTab === 'brand_kit' && (
        <BrandBoardEditor
          configId={null}
          colors={editorColors}
          onColorsChange={onColorsChange}
          headingFont={headingFontFamily}
          bodyFont={bodyFontFamily}
          onFontChange={(h, b) => {
            const hObj = FONT_OPTIONS.find(f => f.family === h) || FONT_OPTIONS[0];
            const bObj = FONT_OPTIONS.find(f => f.family === b) || FONT_OPTIONS[0];
            applyFonts(hObj.family, hObj.name, bObj.family, bObj.name);
          }}
          businessType={businessType}
          businessName={businessName}
          buttonColor={buttonColor}
          mode="editor"
          themeColors={colors}
        />
      )}

      {activeSubTab === 'sections' && (
        <div className="max-w-4xl mx-auto">
          <SectionsEditor
            tabs={tabs}
            components={components}
            onTabsReorder={onTabsReorder}
            colors={colors}
          />
        </div>
      )}
    </div>
  );
}
