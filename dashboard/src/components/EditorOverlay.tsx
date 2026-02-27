'use client';

import { useState, useEffect, useRef } from 'react';
import ColorsEditor, { ColorItem } from './editors/ColorsEditor';
import BrandBoardEditor from './BrandBoardEditor';
import { DashboardTab } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { FONT_OPTIONS, CORE_FONTS, loadExtraFonts } from '@/lib/fonts';

interface TabComponent {
  id: string;
  label: string;
}

interface EditorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  colors: ColorItem[];
  onColorsChange: (colors: ColorItem[]) => void;
  components: TabComponent[];
  tabs?: DashboardTab[];
  onTabsReorder?: (tabs: DashboardTab[]) => void;
  onComponentsReorder?: (components: TabComponent[]) => void;
  buttonColor?: string;
  side?: 'left' | 'right';
}

// ─── Sections Tab ───
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
      <p className="text-xs text-gray-500 mb-3">Reorder tabs with the arrows</p>
      <div className="space-y-3">
        {items.map((tab, tabIdx) => (
          <div
            key={tab.id}
            className="border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveTabUp(tabIdx)}
                  disabled={tabIdx === 0 || !tabs}
                  className="w-5 h-4 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => moveTabDown(tabIdx)}
                  disabled={!tabs || tabIdx >= items.length - 1}
                  className="w-5 h-4 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex-1">{tab.label}</span>
              <span className="text-[10px] text-gray-400">{tab.components.length} items</span>
            </div>
            <div className="divide-y divide-gray-50">
              {tab.components.map((comp, compIdx) => (
                <div
                  key={comp.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-5 h-5 flex items-center justify-center text-[10px] text-gray-400 font-mono bg-gray-100 rounded">{compIdx + 1}</span>
                  <span className="text-sm text-gray-600 flex-1">{comp.label}</span>
                </div>
              ))}
              {tab.components.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-400">No sections</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EditorOverlay({
  isOpen,
  onClose,
  colors,
  onColorsChange,
  components,
  tabs,
  onTabsReorder,
  buttonColor = '#1A1A1A',
  side = 'left',
}: EditorOverlayProps) {
  const [activeTab, setActiveTab] = useState<'brand-board' | 'colors' | 'sections'>('brand-board');
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

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Apply saved fonts on mount — load extra fonts if needed
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

  // Lazy-load extra fonts when Brand Board tab is opened
  const fontsLoadedRef = useRef(false);
  useEffect(() => {
    if (activeTab === 'brand-board' && !fontsLoadedRef.current) {
      fontsLoadedRef.current = true;
      loadExtraFonts();
    }
  }, [activeTab]);

  const applyFonts = (headingFamily: string, headingName: string, bodyFamily: string, bodyName: string) => {
    setSelectedHeadingFont(headingName);
    setSelectedBodyFont(bodyName);
    // Body font drives the global dashboard font
    document.documentElement.style.setProperty('--font-family', bodyFamily);
    document.body.style.fontFamily = bodyFamily;
    localStorage.setItem('redpine-heading-font', headingName);
    localStorage.setItem('redpine-body-font', bodyName);
    localStorage.setItem('redpine-font', bodyName); // backwards compat
  };

  // Convert font names to font families for BrandBoardEditor
  const headingFontFamily = FONT_OPTIONS.find(f => f.name === selectedHeadingFont)?.family || selectedHeadingFont;
  const bodyFontFamily = FONT_OPTIONS.find(f => f.name === selectedBodyFont)?.family || selectedBodyFont;

  const editorTabs = [
    { id: 'brand-board' as const, label: 'Brand' },
    { id: 'colors' as const, label: 'Colors' },
    { id: 'sections' as const, label: 'Sections' },
  ];

  const activeBg = buttonColor;
  const activeText = getContrastText(buttonColor);

  if (!isOpen) return null;

  const positionStyle = side === 'left'
    ? { left: '56px' }
    : { right: '56px' };

  const borderSide = side === 'left'
    ? 'border-r border-gray-200'
    : 'border-l border-gray-200';

  const slideFrom = side === 'left' ? 'slideInLeft' : 'slideInRight';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl ${borderSide} animate-slideEditor`}
        style={{ ...positionStyle, width: '380px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.88 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-900">Brand & Design</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab pills */}
        <div className="flex gap-1 px-4 pt-3 pb-2">
          {editorTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: activeTab === tab.id ? activeBg : 'transparent',
                color: activeTab === tab.id ? activeText : '#6B7280',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeTab === 'brand-board' && (
            <BrandBoardEditor
              configId={null}
              colors={colors}
              onColorsChange={onColorsChange}
              headingFont={headingFontFamily}
              bodyFont={bodyFontFamily}
              onFontChange={(h, b) => {
                const hObj = FONT_OPTIONS.find(f => f.family === h) || FONT_OPTIONS[0];
                const bObj = FONT_OPTIONS.find(f => f.family === b) || FONT_OPTIONS[0];
                applyFonts(hObj.family, hObj.name, bObj.family, bObj.name);
              }}
              businessType=""
              buttonColor={buttonColor}
              mode="editor"
            />
          )}

          {activeTab === 'colors' && (
            <ColorsEditor
              colors={colors}
              onColorsChange={onColorsChange}
            />
          )}

          {activeTab === 'sections' && (
            <SectionsEditor tabs={tabs} components={components} onTabsReorder={onTabsReorder} />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideEditor {
          animation: ${slideFrom} 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
