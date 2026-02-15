'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import TopBar from '@/components/TopBar';
import DashboardContent from '@/components/DashboardContent';
import ToolsStrip from '@/components/ToolsStrip';
import { ColorItem } from '@/components/editors/ColorsEditor';

// Lazy-load overlays — only mount when user opens them
const EditorOverlay = lazy(() => import('@/components/EditorOverlay'));
const ChatOverlay = lazy(() => import('@/components/ChatOverlay'));
const SaveLaunchPopup = lazy(() => import('@/components/SaveLaunchPopup'));
const PineTreeWidget = lazy(() => import('@/components/PineTreeWidget'));
import { DashboardTab, DashboardColors } from '@/types/config';
import { defaultColors, mergeWithDefaults, applyColorsToDocument } from '@/lib/default-colors';

function colorsArrayToObject(colors: ColorItem[]): DashboardColors {
  const result: DashboardColors = {};
  colors.forEach(({ color, target }) => {
    result[target] = color;
  });
  return result;
}

// Default demo tabs for the main page
const DEFAULT_TABS: DashboardTab[] = [
  {
    id: 'tab_1',
    label: 'Clients',
    icon: 'people',
    components: [
      {
        id: 'pipeline',
        label: 'Pipeline',
        dataSource: 'clients',
        view: 'pipeline',
        availableViews: ['pipeline', 'list'],
        pipeline: {
          stages: [
            { id: 'stage_1', name: 'New Inquiry', color: '#6366F1', order: 0 },
            { id: 'stage_2', name: 'Consultation', color: '#F59E0B', order: 1 },
            { id: 'stage_3', name: 'Booked', color: '#10B981', order: 2 },
            { id: 'stage_4', name: 'In Service', color: '#8B5CF6', order: 3 },
            { id: 'stage_5', name: 'Follow Up', color: '#F97316', order: 4 },
            { id: 'stage_6', name: 'Loyal Client', color: '#14B8A6', order: 5 },
          ],
          default_stage_id: 'stage_1',
        },
      },
      {
        id: 'contacts',
        label: 'Contacts',
        view: 'list',
        availableViews: ['list', 'table', 'cards'],
      },
    ],
  },
  {
    id: 'tab_2',
    label: 'Schedule',
    icon: 'calendar',
    components: [
      { id: 'appointments', label: 'Appointments' },
      { id: 'calendar', label: 'Calendar' },
    ],
  },
  {
    id: 'tab_3',
    label: 'Payments',
    icon: 'dollar',
    components: [
      { id: 'payments', label: 'Payments' },
      { id: 'invoices', label: 'Invoices' },
    ],
  },
  {
    id: 'tab_4',
    label: 'Products',
    icon: 'box',
    components: [
      { id: 'products', label: 'Products' },
      { id: 'forms', label: 'Forms' },
      { id: 'reviews', label: 'Reviews' },
    ],
  },
  {
    id: 'tab_5',
    label: 'Restaurant',
    icon: 'utensils',
    components: [
      { id: 'waitlist', label: 'Waitlist' },
      { id: 'tip_pools', label: 'Tip Pool' },
      { id: 'waste_log', label: 'Waste Log' },
      { id: 'suppliers', label: 'Suppliers' },
      { id: 'purchase_orders', label: 'Purchase Orders' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    components: [],
  },
];

export default function PreviewPage() {
  const [tabs, setTabs] = useState<DashboardTab[]>(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState('tab_1');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [dashboardColors, setDashboardColors] = useState<DashboardColors>(defaultColors);
  const [editorColors, setEditorColors] = useState<ColorItem[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toolbarSide, setToolbarSide] = useState<'left' | 'right'>('left');

  const businessName = 'Bella Nails Salon';

  const handleColorsChange = useCallback((newColors: ColorItem[]) => {
    setEditorColors(newColors);
    const colorsObj = colorsArrayToObject(newColors);
    const mergedColors = mergeWithDefaults(colorsObj);
    setDashboardColors(mergedColors);
    applyColorsToDocument(mergedColors);
  }, []);

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const currentComponents = currentTab?.components || [];
  const currentTabLabel = currentTab?.label || '';

  return (
    <div className="flex flex-col h-screen" style={{ overflow: 'hidden' }}>
      <TopBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        colors={dashboardColors}
        businessName={businessName}
      />

      <DashboardContent
        activeTab={activeTab}
        tabLabel={currentTabLabel}
        components={currentComponents}
        businessType="salon"
        businessName={businessName}
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
          colors={editorColors}
          onColorsChange={handleColorsChange}
          components={currentComponents}
          tabs={tabs}
          onTabsReorder={setTabs}
          buttonColor={dashboardColors.buttons}
          side={toolbarSide}
        />
      </Suspense>)}

      {isChatOpen && (<Suspense fallback={null}>
        <ChatOverlay
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          businessName={businessName}
          tabs={tabs}
          colors={dashboardColors}
          onTabsChange={setTabs}
          onColorsChange={handleColorsChange}
          side={toolbarSide}
        />
      </Suspense>)}

      {showLimitPopup && (<Suspense fallback={null}>
        <SaveLaunchPopup
          isOpen={showLimitPopup}
          onClose={() => setShowLimitPopup(false)}
          configId="preview-config"
          businessName={businessName}
        />
      </Suspense>)}

      <Suspense fallback={null}>
        <PineTreeWidget colors={dashboardColors} />
      </Suspense>
    </div>
  );
}
