'use client';

import { useState, useEffect, Suspense, useCallback, useRef, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import DashboardContent from '@/components/DashboardContent';
import ToolsStrip from '@/components/ToolsStrip';
import { ColorItem } from '@/components/editors/ColorsEditor';

const EditorOverlay = lazy(() => import('@/components/EditorOverlay'));
const ChatOverlay = lazy(() => import('@/components/ChatOverlay'));
import { DashboardConfig, DashboardColors, DashboardTab } from '@/types/config';
import { mergeWithDefaults, applyColorsToDocument } from '@/lib/default-colors';
import { DataModeProvider } from '@/providers/DataModeProvider';
import { useDataMode } from '@/hooks/useDataMode';
import { getContrastText } from '@/lib/view-colors';
import { useUserRole } from '@/hooks/useUserRole';

// Convert color object to ColorItem array
function colorsObjectToArray(colors: DashboardColors): ColorItem[] {
  const result: ColorItem[] = [];
  const allTargets = [
    'sidebar_bg', 'sidebar_icons', 'sidebar_buttons', 'sidebar_text',
    'background', 'buttons', 'cards', 'text', 'headings', 'borders'
  ] as const;

  allTargets.forEach(target => {
    const value = colors[target];
    if (value) {
      result.push({ color: value, target });
    }
  });

  return result;
}

// Convert ColorItem array to DashboardColors object
function colorsArrayToObject(colors: ColorItem[]): DashboardColors {
  const result: DashboardColors = {};
  colors.forEach(({ color, target }) => {
    result[target] = color;
  });
  return result;
}

// Preview mode banner for dummy data users
function PreviewModeBanner({ colors }: { colors: DashboardColors }) {
  const { mode, isLoading } = useDataMode();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isLoading || isDismissed || mode === 'real') {
    return null;
  }

  const buttonBg = colors.buttons || '#DC2626';
  const buttonText = getContrastText(buttonBg);

  return (
    <div
      className="shrink-0 flex items-center justify-center gap-3 px-4 py-2 text-sm"
      style={{
        backgroundColor: buttonBg,
        color: buttonText,
      }}
    >
      <span>Preview Mode — Sign up to add your own data</span>
      <button
        onClick={() => setIsDismissed(true)}
        className="p-1 rounded hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const configIdParam = searchParams.get('config_id');
  const { role, isOwner, isStaff, businessOwnerId, configId: roleConfigId, isLoading: roleLoading } = useUserRole();

  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [colors, setColors] = useState<DashboardColors>({});
  const [editorColors, setEditorColors] = useState<ColorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toolbarSide, setToolbarSide] = useState<'left' | 'right'>('left');

  const colorSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTabsChange = useCallback((newTabs: DashboardTab[]) => {
    setConfig(prev => prev ? { ...prev, tabs: newTabs } : prev);
  }, []);

  // Determine config ID: URL param takes priority, then role-resolved config
  const configId = configIdParam || roleConfigId;

  // Save colors to config with debounce
  const saveColors = useCallback(async (colorsToSave: DashboardColors) => {
    if (!configId) return;
    try {
      await fetch(`/api/config?id=${configId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: configId, colors: colorsToSave }),
      });
    } catch (error) {
      console.error('Failed to save colors:', error);
    }
  }, [configId]);

  // Handle color changes from editor
  const handleColorsChange = useCallback((newColors: ColorItem[]) => {
    setEditorColors(newColors);
    const colorsObj = colorsArrayToObject(newColors);
    const mergedColors = mergeWithDefaults(colorsObj);
    setColors(mergedColors);
    applyColorsToDocument(mergedColors);

    if (colorSaveTimeout.current) {
      clearTimeout(colorSaveTimeout.current);
    }
    colorSaveTimeout.current = setTimeout(() => {
      saveColors(colorsObj);
    }, 500);
  }, [saveColors]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (colorSaveTimeout.current) {
        clearTimeout(colorSaveTimeout.current);
      }
    };
  }, []);

  // Fetch config
  useEffect(() => {
    if (roleLoading) return;

    async function fetchData() {
      try {
        if (configId) {
          const configRes = await fetch(`/api/config?id=${configId}`);
          const configData = await configRes.json();
          if (configData.success && configData.data) {
            setConfig(configData.data);
            if (configData.data.tabs && configData.data.tabs.length > 0) {
              setActiveTab(configData.data.tabs[0].id);
            }
            const mergedColors = mergeWithDefaults(configData.data.colors);
            setColors(mergedColors);
            setEditorColors(colorsObjectToArray(mergedColors));
            applyColorsToDocument(mergedColors);
          }
        } else if (businessOwnerId) {
          const configRes = await fetch('/api/config');
          const configData = await configRes.json();
          if (configData.success && configData.data) {
            setConfig(configData.data);
            if (configData.data.tabs && configData.data.tabs.length > 0) {
              setActiveTab(configData.data.tabs[0].id);
            }
            const mergedColors = mergeWithDefaults(configData.data.colors);
            setColors(mergedColors);
            setEditorColors(colorsObjectToArray(mergedColors));
            applyColorsToDocument(mergedColors);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [configId, roleLoading, businessOwnerId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Red Pine OS"
            className="mx-auto mb-8"
            style={{ height: '10rem', animation: 'heartbeat 1.2s ease-in-out infinite' }}
          />
          <p className="text-xl font-semibold text-gray-900">Loading<span className="loading-dots" /></p>
          <style>{`
            @keyframes heartbeat {
              0% { transform: scale(1); }
              14% { transform: scale(1.1); }
              28% { transform: scale(1); }
              42% { transform: scale(1.1); }
              70% { transform: scale(1); }
            }
            .loading-dots::after {
              content: '';
              animation: dots 1.5s steps(4, end) infinite;
            }
            @keyframes dots {
              0% { content: ''; }
              25% { content: '.'; }
              50% { content: '..'; }
              75% { content: '...'; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Settings is accessed via profile dropdown, not as a nav tab
  const allTabs = config?.tabs || [];

  const currentTab = config?.tabs.find(tab => tab.id === activeTab);
  const currentComponents = currentTab?.components || [];
  const currentTabLabel = currentTab?.label || '';

  return (
    <DataModeProvider>
      <div className="flex flex-col h-screen" style={{ overflow: 'hidden' }}>
        <PreviewModeBanner colors={colors} />
        <TopBar
          tabs={allTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          colors={colors}
          businessName={config?.businessName}
        />

        <DashboardContent
          activeTab={activeTab}
          tabLabel={currentTabLabel}
          components={currentComponents}
          businessType={config?.businessType}
          businessName={config?.businessName}
          colors={colors}
          toolbarSide={toolbarSide}
        />

        <ToolsStrip
          onOpenEditor={() => { setIsEditorOpen(!isEditorOpen); setIsChatOpen(false); }}
          isEditorOpen={isEditorOpen}
          onOpenChat={() => { setIsChatOpen(!isChatOpen); setIsEditorOpen(false); }}
          isChatOpen={isChatOpen}
          side={toolbarSide}
          onSideChange={setToolbarSide}
          buttonColor={colors.buttons}
          onNavigateToSite={() => setActiveTab('__site__')}
          isSiteActive={activeTab === '__site__'}
          onNavigateToMarketplace={() => setActiveTab('__marketplace__')}
          isMarketplaceActive={activeTab === '__marketplace__'}
          onNavigateToMarketing={() => setActiveTab('__marketing__')}
          isMarketingActive={activeTab === '__marketing__'}
        />

        {isEditorOpen && (<Suspense fallback={null}>
          <EditorOverlay
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            colors={editorColors}
            onColorsChange={handleColorsChange}
            components={currentComponents}
            tabs={config?.tabs}
            onTabsReorder={handleTabsChange}
            buttonColor={colors.buttons}
            side={toolbarSide}
          />
        </Suspense>)}

        {isChatOpen && (<Suspense fallback={null}>
          <ChatOverlay
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            configId={configId}
            businessType={config?.businessType}
            businessName={config?.businessName}
            tabs={config?.tabs}
            colors={colors}
            onTabsChange={handleTabsChange}
            onColorsChange={handleColorsChange}
            side={toolbarSide}
          />
        </Suspense>)}
      </div>
    </DataModeProvider>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-muted">Loading...</div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}
