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
            className="rounded-xl border border-gray-200 overflow-hidden"
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
  const [selectedFont, setSelectedFont] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('redpine-font') || 'Inter';
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

  // Apply saved font on mount — load extra fonts if needed
  useEffect(() => {
    const savedFont = localStorage.getItem('redpine-font');
    if (savedFont) {
      const fontOption = FONT_OPTIONS.find(f => f.name === savedFont);
      if (fontOption) {
        if (!CORE_FONTS.has(savedFont)) loadExtraFonts();
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

  const applyFont = (fontFamily: string, fontName: string) => {
    setSelectedFont(fontName);
    document.documentElement.style.setProperty('--font-family', fontFamily);
    document.body.style.fontFamily = fontFamily;
    localStorage.setItem('redpine-font', fontName);
  };

  // Convert font name to font family for BrandBoardEditor
  const selectedFontFamily = FONT_OPTIONS.find(f => f.name === selectedFont)?.family || selectedFont;

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-900">Editor</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
              className="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors"
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
              headingFont={selectedFontFamily}
              bodyFont={selectedFontFamily}
              onFontChange={(h, _b) => {
                const fontObj = FONT_OPTIONS.find(f => f.family === h);
                if (fontObj) applyFont(fontObj.family, fontObj.name);
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
