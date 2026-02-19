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

// Enterprise Nail Salon template — matches beauty_body.py nail_salon
const DEFAULT_TABS: DashboardTab[] = [
  {
    id: 'tab_1',
    label: 'Dashboard',
    icon: 'home',
    components: [],
  },
  {
    id: 'tab_2',
    label: 'Clients',
    icon: 'people',
    components: [
      {
        id: 'clients',
        label: 'Bookings',
        dataSource: 'clients',
        view: 'pipeline',
        availableViews: ['pipeline', 'table', 'list'],
        pipeline: {
          stages: [
            { id: 'stage_1', name: 'Requested', color: '#6366F1', order: 0 },
            { id: 'stage_2', name: 'Confirmed', color: '#F59E0B', order: 1 },
            { id: 'stage_3', name: 'Checked In', color: '#3B82F6', order: 2 },
            { id: 'stage_4', name: 'In Service', color: '#10B981', order: 3 },
            { id: 'stage_5', name: 'Completed', color: '#8B5CF6', order: 4 },
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
    id: 'tab_3',
    label: 'Appointments',
    icon: 'calendar',
    components: [
      { id: 'calendar', label: 'Schedule', view: 'calendar' },
    ],
  },
  {
    id: 'tab_4',
    label: 'Services',
    icon: 'package',
    components: [
      { id: 'packages', label: 'Service Menu', view: 'cards' },
      { id: 'nail_sets', label: 'Nail Sets & Add-Ons', view: 'cards' },
      { id: 'products', label: 'Retail Products', view: 'table' },
    ],
  },
  {
    id: 'tab_5',
    label: 'Nail Art Gallery',
    icon: 'image',
    components: [
      { id: 'galleries', label: 'Nail Art Gallery', view: 'cards' },
    ],
  },
  {
    id: 'tab_6',
    label: 'Nail Technicians',
    icon: 'people',
    components: [
      { id: 'staff', label: 'Nail Techs', view: 'cards', availableViews: ['cards', 'table'] },
    ],
  },
  {
    id: 'tab_7',
    label: 'Payments',
    icon: 'dollar',
    components: [
      { id: 'invoices', label: 'Invoices', view: 'table' },
      { id: 'expenses', label: 'Expenses', view: 'table' },
    ],
  },
];

// Nail salon color scheme — red/pink enterprise palette
const NAIL_SALON_COLORS: DashboardColors = {
  ...defaultColors,
  sidebar_bg: '#4C0519',
  sidebar_text: '#F1F5F9',
  sidebar_icons: '#A0AEC0',
  sidebar_buttons: '#E11D48',
  background: '#FFF1F2',
  buttons: '#E11D48',
  cards: '#FFFFFF',
  text: '#1A1A1A',
  headings: '#111827',
  borders: '#E5E7EB',
};

export default function PreviewPage() {
  const [tabs, setTabs] = useState<DashboardTab[]>(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState('tab_1');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [dashboardColors, setDashboardColors] = useState<DashboardColors>(NAIL_SALON_COLORS);
  const [editorColors, setEditorColors] = useState<ColorItem[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toolbarSide, setToolbarSide] = useState<'left' | 'right'>('left');

  const businessName = 'Bella Nails';

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
