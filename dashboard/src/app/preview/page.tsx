'use client';

import { useState, useEffect, Suspense, useRef, useCallback, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import DashboardContent from '@/components/DashboardContent';
import ToolsStrip from '@/components/ToolsStrip';
import { ColorItem } from '@/components/editors/ColorsEditor';

const EditorOverlay = lazy(() => import('@/components/EditorOverlay'));
const ChatOverlay = lazy(() => import('@/components/ChatOverlay'));
const SaveLaunchPopup = lazy(() => import('@/components/SaveLaunchPopup'));
import { DashboardConfig, DashboardColors, DashboardTab } from '@/types/config';
import { defaultColors, mergeWithDefaults, applyColorsToDocument } from '@/lib/default-colors';
import { DataModeProvider } from '@/providers/DataModeProvider';
import { createBrowserClient } from '@supabase/ssr';

// Convert color object to array
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

// Convert color array to object for storage
function colorsArrayToObject(colors: ColorItem[]): DashboardColors {
  const result: DashboardColors = {};
  colors.forEach(({ color, target }) => {
    result[target] = color;
  });
  return result;
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const configId = searchParams.get('config_id');
  const businessType = searchParams.get('business_type');
  const businessName = searchParams.get('business_name');

  const primaryColor = searchParams.get('primary_color');
  const secondaryColor = searchParams.get('secondary_color');
  const bgColor = searchParams.get('bg_color');
  const logoParam = searchParams.get('logo');

  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logo, setLogo] = useState<string | null>(logoParam ? decodeURIComponent(logoParam) : null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toolbarSide, setToolbarSide] = useState<'left' | 'right'>('left');

  // Color state
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [dashboardColors, setDashboardColors] = useState<DashboardColors>(defaultColors);

  const colorSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  function isColorLight(hex: string): boolean {
    const color = hex.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  function darkenColor(hex: string, amount: number): string {
    const color = hex.replace('#', '');
    const r = Math.max(0, Math.floor(parseInt(color.substr(0, 2), 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(parseInt(color.substr(2, 2), 16) * (1 - amount)));
    const b = Math.max(0, Math.floor(parseInt(color.substr(4, 2), 16) * (1 - amount)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  const getInitialColors = useCallback((): ColorItem[] => {
    const initialColors: ColorItem[] = [];

    const primary = primaryColor || '#ce0707';
    initialColors.push({ color: primary, target: 'buttons' });
    initialColors.push({ color: primary, target: 'sidebar_buttons' });

    const sidebarColor = isColorLight(primary) ? darkenColor(primary, 0.7) : primary;
    initialColors.push({ color: sidebarColor, target: 'sidebar_bg' });

    const secondary = secondaryColor || '#000000';
    initialColors.push({ color: secondary, target: 'text' });

    const sidebarTextColor = isColorLight(sidebarColor) ? '#111827' : '#F3F4F6';
    initialColors.push({ color: sidebarTextColor, target: 'sidebar_text' });
    initialColors.push({ color: sidebarTextColor, target: 'sidebar_icons' });

    const bg = bgColor || '#ffffff';
    initialColors.push({ color: bg, target: 'background' });

    return initialColors;
  }, [primaryColor, secondaryColor, bgColor]);

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

  const handleColorsChange = useCallback((newColors: ColorItem[]) => {
    setColors(newColors);
    const colorsObj = colorsArrayToObject(newColors);
    const mergedColors = mergeWithDefaults(colorsObj);
    setDashboardColors(mergedColors);
    applyColorsToDocument(mergedColors);

    if (colorSaveTimeout.current) {
      clearTimeout(colorSaveTimeout.current);
    }
    colorSaveTimeout.current = setTimeout(() => {
      saveColors(colorsObj);
    }, 500);
  }, [saveColors]);

  const handleTabsChange = useCallback((newTabs: DashboardTab[]) => {
    setConfig(prev => prev ? { ...prev, tabs: newTabs } : prev);
  }, []);

  const initialLoadDone = useRef(false);

  const fetchConfig = useCallback(async (loadColors: boolean = false) => {
    if (configId) {
      try {
        const response = await fetch(`/api/config?id=${configId}`);
        const data = await response.json();
        if (data.success && data.data) {
          setConfig(data.data);

          if (loadColors) {
            const supabaseColors = data.data.colors || {};
            const supabaseColorCount = Object.keys(supabaseColors).length;
            const hasUrlColors = primaryColor || secondaryColor || bgColor;

            if (hasUrlColors) {
              // URL params take priority — user customized colors in onboarding
              const initialColorItems = getInitialColors();
              setColors(initialColorItems);
              const colorsObj = colorsArrayToObject(initialColorItems);
              const mergedColors = mergeWithDefaults(colorsObj);
              setDashboardColors(mergedColors);
              applyColorsToDocument(mergedColors);
            } else if (supabaseColorCount >= 5) {
              // Full palette from Supabase — use it (AI-generated 10-key palette)
              const mergedColors = mergeWithDefaults(supabaseColors);
              setDashboardColors(mergedColors);
              setColors(colorsObjectToArray(mergedColors));
              applyColorsToDocument(mergedColors);
            } else {
              const initialColorItems = getInitialColors();
              setColors(initialColorItems);
              const colorsObj = colorsArrayToObject(initialColorItems);
              const mergedColors = mergeWithDefaults(colorsObj);
              setDashboardColors(mergedColors);
              applyColorsToDocument(mergedColors);
            }
          }

          if (data.data.tabs && data.data.tabs.length > 0 && !initialLoadDone.current) {
            setActiveTab(data.data.tabs[0].id);
          }

          initialLoadDone.current = true;
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
    }
  }, [configId, getInitialColors]);

  // Pick up auth tokens from URL (set by onboarding signup flow)
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  useEffect(() => {
    async function initialFetch() {
      // If auth tokens are in the URL, set the Supabase session
      if (accessToken && refreshToken) {
        try {
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          // Clean up URL — remove auth tokens so they're not visible/bookmarkable
          const url = new URL(window.location.href);
          url.searchParams.delete('access_token');
          url.searchParams.delete('refresh_token');
          window.history.replaceState({}, '', url.toString());
        } catch (err) {
          console.error('Failed to set auth session from URL tokens:', err);
        }
      }

      await fetchConfig(true);
      setIsLoading(false);
    }
    initialFetch();
  }, [configId]);

  useEffect(() => {
    return () => {
      if (colorSaveTimeout.current) {
        clearTimeout(colorSaveTimeout.current);
      }
    };
  }, []);

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

  const displayName = config?.businessName || businessName || 'Bella Nails Salon';

  // Settings is accessed via profile dropdown, not as a nav tab
  const allTabs = config?.tabs || [];

  const currentTab = config?.tabs.find(tab => tab.id === activeTab);
  const currentComponents = currentTab?.components || [];
  const currentTabLabel = currentTab?.label || '';

  return (
    <DataModeProvider>
      <div className="flex flex-col h-screen" style={{ overflow: 'hidden' }}>
        <TopBar
          tabs={allTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          colors={dashboardColors}
          logo={logo}
          onLogoChange={setLogo}
          businessName={businessName || config?.businessName}
          configId={configId}
        />

        <DashboardContent
          activeTab={activeTab}
          tabLabel={currentTabLabel}
          components={currentComponents}
          businessType={businessType || config?.businessType}
          businessName={businessName || config?.businessName}
          colors={dashboardColors}
          toolbarSide={toolbarSide}
        />

        <ToolsStrip
          onOpenEditor={() => { setIsEditorOpen(!isEditorOpen); setIsChatOpen(false); }}
          isEditorOpen={isEditorOpen}
          onOpenChat={() => { setIsChatOpen(!isChatOpen); setIsEditorOpen(false); }}
          isChatOpen={isChatOpen}
          side={toolbarSide}
          onSideChange={setToolbarSide}
          buttonColor={dashboardColors.buttons}
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
            colors={colors}
            onColorsChange={handleColorsChange}
            components={currentComponents}
            tabs={config?.tabs}
            onTabsReorder={handleTabsChange}
            buttonColor={dashboardColors.buttons}
            side={toolbarSide}
          />
        </Suspense>)}

        {isChatOpen && (<Suspense fallback={null}>
          <ChatOverlay
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            configId={configId}
            businessType={businessType || config?.businessType}
            businessName={displayName}
            tabs={config?.tabs}
            colors={dashboardColors}
            onTabsChange={handleTabsChange}
            onColorsChange={handleColorsChange}
            side={toolbarSide}
          />
        </Suspense>)}

        {showLimitPopup && (<Suspense fallback={null}>
          <SaveLaunchPopup
            isOpen={showLimitPopup}
            onClose={() => setShowLimitPopup(false)}
            configId={configId || undefined}
            businessName={displayName}
          />
        </Suspense>)}
      </div>
    </DataModeProvider>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#ce0707] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">Loading system</p>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
