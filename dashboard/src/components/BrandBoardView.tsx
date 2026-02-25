'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardColors, DashboardTab } from '@/types/config';
import { ColorItem } from './editors/ColorsEditor';
import ColorsEditor from './editors/ColorsEditor';
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
}: {
  tabs?: DashboardTab[];
  components: TabComponent[];
  onTabsReorder?: (tabs: DashboardTab[]) => void;
}) {
  const items = tabs || [{ id: '_current', label: 'Current Tab', icon: '', components }];

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
      <p className="text-sm text-gray-500 mb-4">Reorder your dashboard tabs with the arrows.</p>
      <div className="space-y-3">
        {items.map((tab, tabIdx) => (
          <div
            key={tab.id}
            className="rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveTabUp(tabIdx)}
                  disabled={tabIdx === 0 || !tabs}
                  className="w-6 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => moveTabDown(tabIdx)}
                  disabled={!tabs || tabIdx >= items.length - 1}
                  className="w-6 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex-1">{tab.label}</span>
              <span className="text-xs text-gray-400">{tab.components.length} items</span>
            </div>
            <div className="divide-y divide-gray-50">
              {tab.components.map((comp, compIdx) => (
                <div
                  key={comp.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-6 h-6 flex items-center justify-center text-xs text-gray-400 font-mono bg-gray-100 rounded">{compIdx + 1}</span>
                  <span className="text-sm text-gray-600 flex-1">{comp.label}</span>
                </div>
              ))}
              {tab.components.length === 0 && (
                <div className="px-4 py-5 text-center text-sm text-gray-400">No sections</div>
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
}

type SubTab = 'brand_kit' | 'colors' | 'sections';

export default function BrandBoardView({
  colors,
  editorColors,
  onColorsChange,
  tabs,
  components = [],
  onTabsReorder,
  businessType,
  businessName,
}: BrandBoardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('brand_kit');

  // Font state
  const [selectedHeadingFont, setSelectedHeadingFont] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('redpine-heading-font') || localStorage.getItem('redpine-font') || 'Inter';
    }
    return 'Inter';
  });
  const [selectedBodyFont, setSelectedBodyFont] = useState(() => {
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
  };

  const headingFontFamily = FONT_OPTIONS.find(f => f.name === selectedHeadingFont)?.family || selectedHeadingFont;
  const bodyFontFamily = FONT_OPTIONS.find(f => f.name === selectedBodyFont)?.family || selectedBodyFont;

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMuted = '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'brand_kit', label: 'Brand Kit' },
    { id: 'colors', label: 'Colors' },
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
            className="px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap"
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
        />
      )}

      {activeSubTab === 'colors' && (
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
            <ColorsEditor
              colors={editorColors}
              onColorsChange={onColorsChange}
            />
          </div>
        </div>
      )}

      {activeSubTab === 'sections' && (
        <div className="max-w-4xl mx-auto">
          <SectionsEditor
            tabs={tabs}
            components={components}
            onTabsReorder={onTabsReorder}
          />
        </div>
      )}
    </div>
  );
}
