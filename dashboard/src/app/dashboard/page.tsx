'use client';

import { useState, useEffect, Suspense, useCallback, useRef, useMemo, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import DashboardContent from '@/components/DashboardContent';
import ToolsStrip from '@/components/ToolsStrip';
import { ColorItem } from '@/components/editors/ColorsEditor';

const ChatOverlay = lazy(() => import('@/components/ChatOverlay'));
const WebsitePreviewPopup = lazy(() => import('@/components/views/WebsitePreviewPopup'));
const SpotlightTour = lazy(() => import('@/components/views/SpotlightTour'));
import { DashboardConfig, DashboardColors, DashboardTab } from '@/types/config';
import { mergeWithDefaults, applyColorsToDocument } from '@/lib/default-colors';
import { DataModeProvider } from '@/providers/DataModeProvider';
import { useDataMode } from '@/hooks/useDataMode';
import { getContrastText } from '@/lib/view-colors';
import { useUserRole } from '@/hooks/useUserRole';
import { FONT_OPTIONS, loadExtraFonts } from '@/lib/fonts';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toolbarSide, setToolbarSide] = useState<'left' | 'right'>('left');
  const [logo, setLogo] = useState<string | null>(null);

  // Onboarding tour state
  const [showWebsitePreview, setShowWebsitePreview] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [subdomain, setSubdomain] = useState('');

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
        // Fetch primary logo from Brand Kit gallery album
        try {
          const albumsRes = await fetch('/api/gallery/albums');
          if (albumsRes.ok) {
            const { albums } = await albumsRes.json();
            const brandAlbum = albums?.find((a: { name: string }) => a.name === 'Brand Kit');
            if (brandAlbum) {
              const imagesRes = await fetch(`/api/gallery?album_id=${brandAlbum.id}`);
              if (imagesRes.ok) {
                const { images } = await imagesRes.json();
                if (images && images.length > 0) {
                  setLogo(images[0].image_url);
                }
              }
            }
          }
        } catch {
          // Logo fetch is non-critical
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [configId, roleLoading, businessOwnerId]);

  // Fetch subdomain from profile and trigger first-visit website preview
  useEffect(() => {
    if (isLoading || !config) return;
    let cancelled = false;

    async function checkFirstVisit() {
      try {
        const res = await fetch('/api/settings/profile');
        if (res.ok) {
          const json = await res.json();
          if (json.data?.subdomain && !cancelled) {
            setSubdomain(json.data.subdomain);
          }
        }
      } catch {
        // non-critical
      }

      if (cancelled) return;

      const alreadyShown = localStorage.getItem('redpine_first_visit_shown');
      if (!alreadyShown) {
        localStorage.setItem('redpine_first_visit_shown', 'true');
        setTimeout(() => {
          if (!cancelled) setShowWebsitePreview(true);
        }, 800);
      }
    }

    checkFirstVisit();
    return () => { cancelled = true; };
  }, [isLoading, config]);

  // Memoize tabs for tour
  const tourTabs = useMemo(() => {
    return (config?.tabs || []).map(t => ({ id: t.id, label: t.label }));
  }, [config?.tabs]);

  // Resolve heading font name → CSS font-family
  const headingFontFamily = useMemo(() => {
    if (!config?.headingFont) return undefined;
    const match = FONT_OPTIONS.find(f => f.name === config.headingFont);
    return match?.family;
  }, [config?.headingFont]);

  // Preload extra Google Fonts on mount so they're ready when config arrives
  useEffect(() => {
    loadExtraFonts();
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
          <p className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Fira Code', monospace" }}>Loading<span className="loading-dots" /></p>
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
          logo={logo}
          onLogoChange={setLogo}
          businessName={config?.businessName}
          configId={configId}
          headingFont={headingFontFamily}
        />

        <DashboardContent
          activeTab={activeTab}
          tabLabel={currentTabLabel}
          components={currentComponents}
          businessType={config?.businessType}
          businessName={config?.businessName}
          colors={colors}
          toolbarSide={toolbarSide}
          editorColors={editorColors}
          onColorsChange={handleColorsChange}
          tabs={config?.tabs}
          onTabsReorder={handleTabsChange}
          configHeadingFont={config?.headingFont}
          configBodyFont={config?.bodyFont}
        />

        <ToolsStrip
          onOpenChat={() => { setIsChatOpen(!isChatOpen); }}
          isChatOpen={isChatOpen}
          onNavigateToComms={() => setActiveTab('comms')}
          isCommsActive={activeTab === 'comms'}
          side={toolbarSide}
          onSideChange={setToolbarSide}
          buttonColor={colors.buttons}
          onNavigateToBrand={() => setActiveTab('__brand__')}
          isBrandActive={activeTab === '__brand__'}
          onNavigateToSite={() => setActiveTab('__site__')}
          isSiteActive={activeTab === '__site__'}
          onNavigateToMarketplace={() => setActiveTab('__marketplace__')}
          isMarketplaceActive={activeTab === '__marketplace__'}
          onNavigateToMarketing={() => setActiveTab('__marketing__')}
          isMarketingActive={activeTab === '__marketing__'}
          disableDrag={showTour}
        />

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

        {showWebsitePreview && (<Suspense fallback={null}>
          <WebsitePreviewPopup
            isOpen={showWebsitePreview}
            onClose={() => setShowWebsitePreview(false)}
            onStartTour={() => {
              setShowWebsitePreview(false);
              setShowTour(true);
            }}
            subdomain={subdomain || config?.businessName?.toLowerCase().replace(/\s+/g, '-') || 'my-business'}
            businessName={config?.businessName || 'Your Business'}
            colors={colors}
          />
        </Suspense>)}

        {showTour && (<Suspense fallback={null}>
          <SpotlightTour
            isOpen={showTour}
            onClose={() => setShowTour(false)}
            businessName={config?.businessName || 'Your Business'}
            businessType={config?.businessType || ''}
            subdomain={subdomain || config?.businessName?.toLowerCase().replace(/\s+/g, '-') || 'my-business'}
            tabs={tourTabs}
            colors={colors}
            onTabChange={setActiveTab}
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
