'use client';

/**
 * FreeFormEditor — Main editor orchestrator
 * Replaces ChaiBuilder with a Canva-style drag-and-drop editor.
 * Renders: Sidebar (left) | Canvas (center) | PropertiesPanel (right)
 * Plus: Toolbar (top), PageThumbnailBar (bottom)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  useFreeFormEditor,
  createSection,
  getElementPosition,
  BREAKPOINTS,
  type EditorElement,
  type Section as HookSection,
  type ViewportMode,
} from '@/hooks/useFreeFormEditor';
import DragDropProvider from './DragDropProvider';
import FreeFormCanvas from './FreeFormCanvas';
import FreeFormSidebar from './FreeFormSidebar';
import FreeFormPropertiesPanel from './FreeFormPropertiesPanel';
import PageThumbnailBar from './PageThumbnailBar';
import ImagePickerModal from './ImagePickerModal';
import type { ColorItem } from '@/components/editors/ColorsEditor';
import {
  Undo2, Redo2, Monitor, Tablet, Smartphone,
  ZoomIn, ZoomOut, Save, Eye, X, Home,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageData {
  id: string;
  title: string;
  slug: string;
  sections: HookSection[];
  headerConfig: Record<string, unknown>;
  footerConfig: Record<string, unknown>;
  canvasConfig: Record<string, unknown>;
}

export interface FreeFormEditorProps {
  initialData?: FreeFormSaveData | null;
  businessName?: string;
  businessType?: string;
  accentColor?: string;
  dashboardColors?: Record<string, string | undefined>;
  onSave?: (data: FreeFormSaveData) => Promise<void>;
  onPreviewChange?: (isPreview: boolean) => void;
  onClose?: () => void;
  className?: string;
}

export interface FreeFormSaveData {
  format: 'freeform';
  version: 1;
  pages: PageData[];
  elements: EditorElement[];
  currentPageIndex: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createDefaultPage(title: string, slug: string): PageData {
  return {
    id: slug,
    title,
    slug,
    sections: [createSection('blank', { height: 600 })],
    headerConfig: {},
    footerConfig: {},
    canvasConfig: {},
  };
}

function deserialize(data: FreeFormSaveData | null | undefined): {
  pages: PageData[];
  elements: EditorElement[];
  pageIndex: number;
} {
  if (data && data.format === 'freeform') {
    // Ensure every page has at least one section
    const pages = data.pages.length > 0
      ? data.pages.map(p => ({
          ...p,
          sections: p.sections.length > 0 ? p.sections : [createSection('blank', { height: 600 })],
        }))
      : [createDefaultPage('Home', 'home')];
    return {
      pages,
      elements: data.elements || [],
      pageIndex: Math.min(data.currentPageIndex || 0, pages.length - 1),
    };
  }
  return {
    pages: [createDefaultPage('Home', 'home')],
    elements: [],
    pageIndex: 0,
  };
}

function serialize(pages: PageData[], elements: EditorElement[], pageIndex: number): FreeFormSaveData {
  return { format: 'freeform', version: 1, pages, elements, currentPageIndex: pageIndex };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FreeFormEditor({
  initialData,
  businessName = 'My Business',
  businessType,
  accentColor = '#1A1A1A',
  dashboardColors,
  onSave,
  onPreviewChange,
  onClose,
  className = '',
}: FreeFormEditorProps) {
  // Map dashboard colors → ColorItem[] for the Brand Board panel
  const initialBrandBoardColors = useMemo<ColorItem[]>(() => {
    if (!dashboardColors) return [];
    const items: ColorItem[] = [];
    const colorKeys: ColorItem['target'][] = [
      'background', 'buttons', 'text', 'sidebar_bg', 'sidebar_buttons',
      'sidebar_icons', 'sidebar_text', 'cards', 'headings', 'borders',
    ];
    for (const key of colorKeys) {
      const val = dashboardColors[key];
      if (val) items.push({ color: val, target: key });
    }
    return items;
  }, [dashboardColors]);

  const [brandBoardColors, setBrandBoardColors] = useState<ColorItem[]>(initialBrandBoardColors);
  const [brandHeadingFont, setBrandHeadingFont] = useState('Inter, system-ui, sans-serif');
  const [brandBodyFont, setBrandBodyFont] = useState('Inter, system-ui, sans-serif');

  // Build colors object from accentColor + brandBoardColors for PresetHeader/PresetFooter
  const editorColors = useMemo(() => {
    const colors: Record<string, string> = {};
    if (accentColor) colors.buttons = accentColor;
    // Overlay brand board color changes (these take priority)
    for (const item of brandBoardColors) {
      if (item.color) colors[item.target] = item.color;
    }
    return Object.keys(colors).length > 0 ? colors : undefined;
  }, [accentColor, brandBoardColors]);

  const initial = useRef(deserialize(initialData));

  // Page state
  const [pages, setPages] = useState<PageData[]>(initial.current.pages);
  const [currentPageIndex, setCurrentPageIndex] = useState(initial.current.pageIndex);
  const currentPage = pages[currentPageIndex] || pages[0];

  // Viewport & zoom
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const VIEWPORT_ZOOM: Record<ViewportMode, number> = { desktop: 0.55, tablet: 0.75, mobile: 0.95 };
  const [zoom, setZoom] = useState(VIEWPORT_ZOOM.desktop);
  const theme = 'light' as const;
  const isDark = false;

  // Tools overlay state
  const [toolsOverlayOpen, setToolsOverlayOpen] = useState(false);

  // Selection state
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSectionData, setSelectedSectionData] = useState<HookSection | null>(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(-1);

  // Properties panel — hidden by default, auto-opens on selection
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false);

  // Image picker for blank frames
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerTargetId, setImagePickerTargetId] = useState<string | null>(null);

  // Save / preview
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isPreview, setIsPreview] = useState(false);

  // Element management via hook
  const editor = useFreeFormEditor(initial.current.elements, {
    viewportWidth: BREAKPOINTS[viewportMode],
    viewportMode,
  });

  const viewportWidth = BREAKPOINTS[viewportMode];

  // Compute section height overrides when elements exceed section height (all viewports)
  const sectionHeightOverrides = useMemo(() => {
    const overrides: Record<string, number> = {};
    for (const section of currentPage.sections) {
      if (section.type !== 'blank') continue;
      const sectionElements = editor.elements.filter(el => el.sectionId === section.id);
      if (!sectionElements.length) continue;
      let maxBottom = 0;
      for (const el of sectionElements) {
        const pos = getElementPosition(el, viewportMode);
        const bottom = pos.y + pos.height;
        if (bottom > maxBottom) maxBottom = bottom;
      }
      const neededHeight = maxBottom + 30; // 30px bottom padding
      if (neededHeight > section.height) {
        overrides[section.id] = neededHeight;
      }
    }
    return overrides;
  }, [currentPage.sections, editor.elements, viewportMode]);

  const canvasHeight = useMemo(
    () => currentPage.sections.reduce((sum, s) => sum + (sectionHeightOverrides[s.id] ?? s.height), 0) + 200,
    [currentPage.sections, sectionHeightOverrides],
  );

  // Auto-open properties panel when a NEW section/element/preset is selected
  const selectionKey = selectedSection || editor.selectedElement?.id || null;
  const prevSelectionKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectionKey && selectionKey !== prevSelectionKeyRef.current) {
      setPropertiesPanelOpen(true);
    }
    prevSelectionKeyRef.current = selectionKey;
  }, [selectionKey]);

  const markUnsaved = useCallback(() => setSaveStatus('unsaved'), []);

  // ---------------------------------------------------------------------------
  // Section management
  // ---------------------------------------------------------------------------

  const addSection = useCallback((type: string = 'blank') => {
    const section = createSection(type);
    setPages(prev => prev.map((p, i) =>
      i === currentPageIndex ? { ...p, sections: [...p.sections, section] } : p
    ));
    markUnsaved();
    return section.id;
  }, [currentPageIndex, markUnsaved]);

  const deleteSection = useCallback((sectionId: string) => {
    setPages(prev => prev.map((p, i) =>
      i === currentPageIndex ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) } : p
    ));
    const toDelete = editor.rawElements.filter(el => el.sectionId === sectionId);
    if (toDelete.length > 0) editor.deleteElements(new Set(toDelete.map(el => el.id)));
    setSelectedSection(null);
    setSelectedSectionData(null);
    markUnsaved();
  }, [currentPageIndex, editor, markUnsaved]);

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= currentPage.sections.length) return;
    setPages(prev => prev.map((p, i) => {
      if (i !== currentPageIndex) return p;
      const sections = [...p.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return { ...p, sections };
    }));
    markUnsaved();
  }, [currentPageIndex, currentPage.sections.length, markUnsaved]);

  const updateSectionProperties = useCallback((sectionId: string, updates: Record<string, unknown>) => {
    setPages(prev => prev.map((p, i) =>
      i === currentPageIndex ? {
        ...p,
        sections: p.sections.map(s =>
          s.id === sectionId ? { ...s, properties: { ...s.properties, ...updates } } : s
        ),
      } : p
    ));
    markUnsaved();
  }, [currentPageIndex, markUnsaved]);

  const updateSectionHeight = useCallback((sectionId: string, height: number) => {
    setPages(prev => prev.map((p, i) =>
      i === currentPageIndex ? {
        ...p,
        sections: p.sections.map(s => s.id === sectionId ? { ...s, height } : s),
      } : p
    ));
    markUnsaved();
  }, [currentPageIndex, markUnsaved]);

  // ---------------------------------------------------------------------------
  // Config updates
  // ---------------------------------------------------------------------------

  const updateHeaderConfig = useCallback((updates: Record<string, unknown>) => {
    setPages(prev => prev.map((p, i) =>
      i === currentPageIndex ? { ...p, headerConfig: { ...p.headerConfig, ...updates } } : p
    ));
    markUnsaved();
  }, [currentPageIndex, markUnsaved]);

  const updateFooterConfig = useCallback((updates: Record<string, unknown>) => {
    setPages(prev => prev.map((p, i) =>
      i === currentPageIndex ? { ...p, footerConfig: { ...p.footerConfig, ...updates } } : p
    ));
    markUnsaved();
  }, [currentPageIndex, markUnsaved]);

  const updateCanvasConfig = useCallback((updates: Record<string, unknown>) => {
    setPages(prev => prev.map((p, i) =>
      i === currentPageIndex ? { ...p, canvasConfig: { ...p.canvasConfig, ...updates } } : p
    ));
    markUnsaved();
  }, [currentPageIndex, markUnsaved]);

  // ---------------------------------------------------------------------------
  // Page management (PageThumbnailBar uses pageId: string)
  // ---------------------------------------------------------------------------

  const addPage = useCallback(() => {
    const num = pages.length + 1;
    const page = createDefaultPage(`Page ${num}`, `page-${num}`);
    setPages(prev => [...prev, page]);
    setCurrentPageIndex(pages.length);
    markUnsaved();
  }, [pages.length, markUnsaved]);

  const deletePageById = useCallback((pageId: string) => {
    if (pages.length <= 1) return;
    const idx = pages.findIndex(p => p.id === pageId);
    if (idx < 0) return;
    setPages(prev => prev.filter(p => p.id !== pageId));
    setCurrentPageIndex(prev => Math.min(prev, pages.length - 2));
    markUnsaved();
  }, [pages, markUnsaved]);

  const duplicatePageById = useCallback((pageId: string) => {
    const source = pages.find(p => p.id === pageId);
    if (!source) return;
    const newPage: PageData = {
      ...source,
      id: `page_${Date.now()}`,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy`,
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    markUnsaved();
  }, [pages, markUnsaved]);

  const renamePageById = useCallback((pageId: string, newName: string) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, title: newName } : p));
    markUnsaved();
  }, [markUnsaved]);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPages(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    markUnsaved();
  }, [markUnsaved]);

  const switchPage = useCallback((pageId: string) => {
    const idx = pages.findIndex(p => p.id === pageId);
    if (idx >= 0) {
      setCurrentPageIndex(idx);
      editor.clearSelection();
      setSelectedSection(null);
      setSelectedSectionData(null);
    }
  }, [pages, editor]);

  // ---------------------------------------------------------------------------
  // Element operations — Canvas uses (sectionId, elementId, ...) signature
  // ---------------------------------------------------------------------------

  // Widget section types that cannot contain elements
  const WIDGET_SECTION_TYPES = new Set(['bookingWidget', 'serviceWidget', 'galleryWidget', 'productGrid', 'productWidget', 'menuWidget', 'eventsWidget', 'classesWidget', 'reviewCarousel']);

  const handleAddElementToSection = useCallback((sectionId: string, elementType: string) => {
    const section = currentPage.sections.find(s => s.id === sectionId);
    if (!section || WIDGET_SECTION_TYPES.has(section.type)) return; // Block widget sections
    let yOffset = 0;
    for (const s of currentPage.sections) {
      if (s.id === sectionId) break;
      yOffset += sectionHeightOverrides[s.id] ?? s.height;
    }
    // Find bottom of existing elements in this section to stack below them
    let maxBottom = 0;
    for (const el of editor.elements) {
      if (el.sectionId === sectionId) {
        const relativeY = el.y - yOffset;
        const bottom = relativeY + (el.height || 100);
        maxBottom = Math.max(maxBottom, bottom);
      }
    }
    const sectionHeight = sectionHeightOverrides[sectionId] ?? section.height ?? 400;
    const x = viewportWidth / 2 - 100;
    // Stack below existing elements, or center if section is empty
    const y = maxBottom > 0
      ? yOffset + maxBottom + 20
      : yOffset + sectionHeight / 2 - 50;
    editor.addElement(elementType, x, y, viewportMode, viewportWidth, sectionHeight, { sectionId });
    markUnsaved();
  }, [currentPage.sections, sectionHeightOverrides, viewportWidth, viewportMode, editor, markUnsaved]);

  // Sidebar onAddElement: (type, x, y, vpMode, vpWidth, canvasH, options?) => void
  const handleSidebarAddElement = useCallback((
    type: string, x: number, y: number,
    vpMode: string, vpWidth: number, _canvasH: number,
    options?: Record<string, unknown>,
  ) => {
    // Find the first blank section to add elements to (skip widget sections)
    const sectionId = (options?.sectionId as string) || currentPage.sections.find(s => s.type === 'blank')?.id;
    if (!sectionId) return;
    const section = currentPage.sections.find(s => s.id === sectionId);
    if (!section || WIDGET_SECTION_TYPES.has(section.type)) return; // Block widget sections
    editor.addElement(type, x, y, vpMode as ViewportMode, vpWidth, canvasHeight, { ...options, sectionId });
    markUnsaved();
  }, [currentPage.sections, editor, canvasHeight, markUnsaved]);

  const handleUpdateSectionElement = useCallback((sectionId: string, elementId: string, updates: Record<string, unknown>) => {
    if (updates.properties) {
      editor.updateProperties(elementId, updates.properties as Record<string, unknown>);
    }
    if (updates.x !== undefined || updates.y !== undefined) {
      const el = editor.rawElements.find(e => e.id === elementId);
      if (el) {
        editor.updatePosition(
          elementId,
          (updates.x as number) ?? el.x,
          (updates.y as number) ?? el.y,
        );
      }
    }
    if (updates.width !== undefined || updates.height !== undefined) {
      const el = editor.rawElements.find(e => e.id === elementId);
      if (el) {
        editor.updateSize(
          elementId,
          (updates.width as number) ?? el.width,
          (updates.height as number) ?? el.height,
        );
      }
    }
    markUnsaved();
  }, [editor, markUnsaved]);

  const handleDeleteSectionElement = useCallback((_sectionId: string, elementId: string) => {
    editor.deleteElements(elementId);
    markUnsaved();
  }, [editor, markUnsaved]);

  const handleDuplicateSectionElement = useCallback((_sectionId: string, elementId: string) => {
    editor.duplicateElements(elementId);
    markUnsaved();
  }, [editor, markUnsaved]);

  const handleBringElementToFront = useCallback((_sectionId: string, elementId: string) => {
    editor.bringToFront(elementId);
    markUnsaved();
  }, [editor, markUnsaved]);

  const handleToggleElementLock = useCallback((_sectionId: string, elementId: string) => {
    editor.toggleLock(elementId);
    markUnsaved();
  }, [editor, markUnsaved]);

  const handleCommitPosition = useCallback((_sectionId: string, _elementId: string, _x: number, _y: number) => {
    editor.commitPositionChange();
    markUnsaved();
  }, [editor, markUnsaved]);

  const handleCommitSize = useCallback((_sectionId: string, _elementId: string, _w: number, _h: number) => {
    editor.commitSizeChange();
    markUnsaved();
  }, [editor, markUnsaved]);

  // PropertiesPanel uses (id, propUpdates, posUpdates?) signature
  const handleUpdateProperties = useCallback((id: string, propUpdates: Record<string, unknown>, posUpdates?: Record<string, unknown>) => {
    if (posUpdates && Object.keys(posUpdates).length > 0) {
      const el = editor.rawElements.find(e => e.id === id);
      if (el) {
        if (posUpdates.x !== undefined || posUpdates.y !== undefined) {
          editor.updatePosition(id, (posUpdates.x as number) ?? el.x, (posUpdates.y as number) ?? el.y);
          editor.commitPositionChange();
        }
        if (posUpdates.width !== undefined || posUpdates.height !== undefined) {
          editor.updateSize(id, (posUpdates.width as number) ?? el.width, (posUpdates.height as number) ?? el.height);
          editor.commitSizeChange();
        }
        if (posUpdates.rotation !== undefined) editor.updateProperties(id, { rotation: posUpdates.rotation });
      }
    }
    if (Object.keys(propUpdates).length > 0) editor.updateProperties(id, propUpdates);
    markUnsaved();
  }, [editor, markUnsaved]);

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  const handleSelectSection = useCallback((sectionId: string) => {
    editor.clearSelection();
    const idx = currentPage.sections.findIndex(s => s.id === sectionId);
    const data = currentPage.sections[idx] || null;
    setSelectedSection(sectionId);
    setSelectedSectionData(data);
    setSelectedSectionIndex(idx);
  }, [editor, currentPage.sections]);

  const handleSelectPreset = useCallback((preset: 'header' | 'footer') => {
    editor.clearSelection();
    setSelectedSection(preset);
    setSelectedSectionData(null);
    setSelectedSectionIndex(-1);
  }, [editor]);

  const handleSelectElement = useCallback((elementId: string, addToSelection?: boolean) => {
    setSelectedSection(null);
    setSelectedSectionData(null);
    editor.selectElement(elementId, addToSelection);

    // If this is a blank frame (no image), open the image picker
    const el = editor.elements.find(e => e.id === elementId);
    if (el && el.type === 'frame' && !el.properties?.imageSrc) {
      setImagePickerTargetId(elementId);
      setImagePickerOpen(true);
    }
  }, [editor]);

  const handleClearSelection = useCallback(() => {
    editor.clearSelection();
    setSelectedSection(null);
    setSelectedSectionData(null);
  }, [editor]);

  // ---------------------------------------------------------------------------
  // Build sections with embedded elements for Canvas
  // ---------------------------------------------------------------------------

  const sectionsWithElements = useMemo(() => {
    return currentPage.sections.map(s => ({
      ...s,
      elements: editor.elements
        .filter(el => el.sectionId === s.id)
        .map(el => ({ ...el })),
    }));
  }, [currentPage.sections, editor.elements]);

  // Build pageElements map for PageThumbnailBar
  const pageElements = useMemo(() => {
    const map: Record<string, Array<{ x: number; y: number; width: number; height: number }>> = {};
    for (const p of pages) {
      map[p.id] = editor.rawElements
        .filter(el => p.sections.some(s => s.id === el.sectionId))
        .map(el => ({ x: el.x, y: el.y, width: el.width, height: el.height }));
    }
    return map;
  }, [pages, editor.rawElements]);

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isPreview) return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && !e.shiftKey && e.key === 'z') { e.preventDefault(); editor.undo(); return; }
      if (mod && e.shiftKey && e.key === 'z') { e.preventDefault(); editor.redo(); return; }
      if ((e.key === 'Backspace' || e.key === 'Delete') && editor.selectedIds.size > 0) {
        e.preventDefault(); editor.deleteElements(editor.selectedIds); markUnsaved(); return;
      }
      if (mod && e.key === 'd' && editor.selectedIds.size > 0) {
        e.preventDefault(); editor.duplicateElements(editor.selectedIds); markUnsaved(); return;
      }
      if (mod && e.key === 's') { e.preventDefault(); handleSave(); return; }
      if (e.key === 'Escape') handleClearSelection();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editor, isPreview, markUnsaved, handleClearSelection]);

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setSaveStatus('saving');
    try {
      await onSave(serialize(pages, editor.rawElements, currentPageIndex));
      setSaveStatus('saved');
    } catch { setSaveStatus('unsaved'); }
  }, [onSave, pages, editor.rawElements, currentPageIndex]);

  // ---------------------------------------------------------------------------
  // Auto-save to localStorage (debounced) — protects against refresh data loss
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const data = serialize(pages, editor.rawElements, currentPageIndex);
        localStorage.setItem('redpine-editor-autosave', JSON.stringify(data));
      } catch {
        // localStorage might be full — silently fail
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [pages, editor.rawElements, currentPageIndex]);

  // Flush autosave immediately on page unload (debounce may not fire in time)
  useEffect(() => {
    const flush = () => {
      try {
        const data = serialize(pages, editor.rawElements, currentPageIndex);
        localStorage.setItem('redpine-editor-autosave', JSON.stringify(data));
      } catch {}
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [pages, editor.rawElements, currentPageIndex]);

  const zoomIn = () => setZoom(z => Math.min(z + 0.1, 2.0));
  const zoomOut = () => setZoom(z => Math.max(z - 0.1, 0.25));

  const VIEWPORT_BUTTONS: { mode: ViewportMode; icon: typeof Monitor; label: string }[] = [
    { mode: 'desktop', icon: Monitor, label: 'Desktop' },
    { mode: 'tablet', icon: Tablet, label: 'Tablet' },
    { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isPreview) {
    return (
      <div className={`flex flex-col h-full bg-gray-100 ${className}`}>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white border-gray-200">
          <span className="text-sm font-medium font-['Fira_Code'] text-gray-800">Preview</span>
          <button onClick={() => { setIsPreview(false); onPreviewChange?.(false); }} className="px-3 py-1.5 text-xs font-medium font-['Fira_Code'] bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300">
            Back to Editor
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <FreeFormCanvas
            sections={sectionsWithElements}
            viewportWidth={viewportWidth}
            viewportMode={viewportMode}
            zoom={100}
            headerConfig={{ ...currentPage.headerConfig, storeName: businessName }}
            footerConfig={{ ...currentPage.footerConfig, storeName: businessName }}
            canvasConfig={currentPage.canvasConfig}
            businessName={businessName}
            colors={editorColors}
            isPreviewMode={true}
            theme={theme}
            accentColor={accentColor}
            sectionHeightOverrides={sectionHeightOverrides}
          />
        </div>
      </div>
    );
  }

  return (
    <DragDropProvider
      onAddComponent={(type: string, parentId: string | null, _index: number) => {
        const sectionId = parentId || currentPage.sections[0]?.id;
        if (sectionId) handleAddElementToSection(sectionId, type);
      }}
      onMoveComponent={(_componentId: string | number, _newParentId: string | null, _newIndex: number) => {
        // Element reordering handled by drag in BlankSection
      }}
    >
      <div className={`flex flex-col h-full bg-white ${className}`}>
        {/* MAIN LAYOUT */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Vertical TOOLS tab */}
          <button
            onClick={() => setToolsOverlayOpen(prev => !prev)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center bg-white border border-l-0 border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            style={{ width: 24, height: 80, writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            title="Toggle tools panel"
          >
            <span className="text-[10px] font-semibold font-['Fira_Code'] tracking-widest uppercase">TOOLS</span>
          </button>

          {/* Floating Toolbar — actions (top-right) */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
            {onClose && (
              <>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 text-gray-500" title="Back to dashboard">
                  <Home className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-gray-200" />
              </>
            )}
            <button onClick={editor.undo} disabled={!editor.canUndo} className="p-1.5 hover:bg-gray-100 text-gray-500 disabled:opacity-30" title="Undo (Cmd+Z)">
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={editor.redo} disabled={!editor.canRedo} className="p-1.5 hover:bg-gray-100 text-gray-500 disabled:opacity-30" title="Redo (Cmd+Shift+Z)">
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <button onClick={() => { setIsPreview(true); onPreviewChange?.(true); }} className="p-1.5 hover:bg-gray-100 text-gray-500" title="Preview">
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saved'}
              className={`p-1.5 transition-colors ${saveStatus === 'unsaved' ? 'hover:opacity-80' : saveStatus === 'saving' ? 'text-amber-500' : 'text-gray-400'}`}
              style={saveStatus === 'unsaved' ? { color: '#1A1A1A' } : undefined}
              title={saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save (Cmd+S)'}
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Viewport switcher — top left */}
          <div className="absolute top-3 left-8 z-20 flex items-center gap-1 px-2 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
            {VIEWPORT_BUTTONS.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => { setViewportMode(mode); setZoom(VIEWPORT_ZOOM[mode]); editor.generateBreakpointPositions(mode, BREAKPOINTS[mode]); }}
                className={`p-1.5 transition-colors ${viewportMode === mode ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                title={label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200" />
            <button onClick={zoomOut} className="p-1.5 hover:bg-gray-100 text-gray-500" title="Zoom out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-['Fira_Code'] min-w-[32px] text-center text-gray-500">{Math.round(zoom * 100)}%</span>
            <button onClick={zoomIn} className="p-1.5 hover:bg-gray-100 text-gray-500" title="Zoom in">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* LEFT SIDEBAR (overlay) */}
          <FreeFormSidebar
            isOverlayOpen={toolsOverlayOpen}
            onClose={() => setToolsOverlayOpen(false)}
            onElementAdded={() => setToolsOverlayOpen(false)}
            pages={pages.map(p => ({ id: p.id, name: p.title }))}
            currentPageId={currentPage.id}
            businessType={businessType}
            onAddElement={handleSidebarAddElement}
            onAddSection={addSection}
            onSelectPage={switchPage}
            onAddPage={addPage}
            onDeletePage={deletePageById}
            onDuplicatePage={duplicatePageById}
            onRenamePage={renamePageById}
            viewportWidth={viewportWidth}
            viewportMode={viewportMode}
            canvasHeight={canvasHeight}
            theme={theme}
            brandBoardColors={brandBoardColors}
            onBrandBoardColorsChange={setBrandBoardColors}
            brandHeadingFont={brandHeadingFont}
            brandBodyFont={brandBodyFont}
            onBrandFontChange={(h, b) => { setBrandHeadingFont(h); setBrandBodyFont(b); }}
            accentColor={accentColor}
            className="flex-shrink-0"
            sections={currentPage.sections.map(s => ({ id: s.id, type: s.type, properties: s.properties }))}
            elements={editor.elements.map(el => ({ id: el.id, type: el.type, sectionId: el.sectionId, x: el.x, y: el.y, width: el.width, height: el.height, properties: el.properties }))}
            onUpdateElement={(id, props) => { editor.updateProperties(id, props); markUnsaved(); }}
            onDeleteElement={(id) => { editor.deleteElements(id); markUnsaved(); }}
            onMoveSection={(sectionId, dir) => {
              const idx = currentPage.sections.findIndex(s => s.id === sectionId);
              if (idx >= 0) {
                const toIdx = dir === 'up' ? idx - 1 : idx + 1;
                if (toIdx >= 0 && toIdx < currentPage.sections.length) moveSection(idx, toIdx);
              }
            }}
            onUpdateSectionProperties={updateSectionProperties}
          />

          {/* CENTER CANVAS */}
          <FreeFormCanvas
            sections={sectionsWithElements}
            selectedSectionId={selectedSection}
            selectedElementIds={editor.selectedIds}
            onSelectSection={handleSelectSection}
            onDeleteSection={deleteSection}
            onMoveSection={moveSection}
            onUpdateSectionHeight={updateSectionHeight}
            onAddElementToSection={handleAddElementToSection}
            onUpdateSectionElement={handleUpdateSectionElement}
            onDeleteSectionElement={handleDeleteSectionElement}
            onDuplicateSectionElement={handleDuplicateSectionElement}
            onBringElementToFront={handleBringElementToFront}
            onToggleElementLock={handleToggleElementLock}
            onSelectElement={handleSelectElement}
            onClearSelection={handleClearSelection}
            onCommitPosition={handleCommitPosition}
            onCommitSize={handleCommitSize}
            onSelectPreset={handleSelectPreset}
            businessName={businessName}
            viewportWidth={viewportWidth}
            viewportMode={viewportMode}
            zoom={Math.round(zoom * 100)}
            headerConfig={{ ...currentPage.headerConfig, storeName: businessName }}
            footerConfig={{ ...currentPage.footerConfig, storeName: businessName }}
            canvasConfig={currentPage.canvasConfig}
            colors={editorColors}
            theme={theme}
            accentColor={accentColor}
            sectionHeightOverrides={sectionHeightOverrides}
            className="flex-1 min-w-0"
          />

          {/* Vertical PROPS tab — right edge */}
          <button
            onClick={() => setPropertiesPanelOpen(prev => !prev)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center bg-white border border-r-0 border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            style={{ width: 24, height: 80, writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            title="Toggle properties panel"
          >
            <span className="text-[10px] font-semibold font-['Fira_Code'] tracking-widest uppercase">PROPS</span>
          </button>

          {/* RIGHT PROPERTIES PANEL — overlay from right */}
          {propertiesPanelOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setPropertiesPanelOpen(false)}
              />
              <aside className="absolute right-0 top-0 bottom-0 z-50 w-[280px] flex flex-col border-l shadow-xl bg-white border-gray-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
                  <h2 className="text-sm font-semibold font-['Fira_Code'] uppercase tracking-wider text-zinc-900">
                    Properties
                  </h2>
                  <button onClick={() => setPropertiesPanelOpen(false)} className="p-1.5 hover:bg-gray-100 text-gray-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <FreeFormPropertiesPanel
                    selectedElement={editor.selectedElement}
                    selectedSection={selectedSection}
                    selectedSectionData={selectedSectionData}
                    sectionIndex={selectedSectionIndex}
                    totalSections={currentPage.sections.length}
                    headerConfig={{ ...currentPage.headerConfig, storeName: businessName }}
                    footerConfig={{ ...currentPage.footerConfig, storeName: businessName }}
                    canvasConfig={currentPage.canvasConfig}
                    onUpdateProperties={handleUpdateProperties}
                    onUpdateHeaderConfig={updateHeaderConfig}
                    onUpdateFooterConfig={updateFooterConfig}
                    onUpdateCanvasConfig={updateCanvasConfig}
                    onUpdateSectionProperties={updateSectionProperties}
                    onUpdateSectionHeight={updateSectionHeight}
                    onMoveSection={moveSection}
                    onDeleteSection={deleteSection}
                    onDelete={(id: string) => { editor.deleteElements(id); markUnsaved(); }}
                    onDuplicate={(id: string) => { editor.duplicateElements(id); markUnsaved(); }}
                    onBringToFront={(id: string) => { editor.bringToFront(id); markUnsaved(); }}
                    onSendToBack={(id: string) => { editor.sendToBack(id); markUnsaved(); }}
                    theme={theme}
                    accentColor={accentColor}
                    className="w-[280px] flex-shrink-0"
                  />
                </div>
              </aside>
            </>
          )}
        </div>

        {/* BOTTOM: Page Thumbnail Bar */}
        <PageThumbnailBar
          pages={pages.map(p => ({ id: p.id, name: p.title }))}
          currentPageId={currentPage.id}
          pageElements={pageElements}
          viewportWidth={viewportWidth}
          canvasHeight={canvasHeight}
          isVisible={!toolsOverlayOpen && !propertiesPanelOpen}
          onSelectPage={switchPage}
          onAddPage={addPage}
          onDuplicatePage={duplicatePageById}
          onDeletePage={deletePageById}
          onRenamePage={renamePageById}
          onReorderPages={reorderPages}
          theme={theme}
          accentColor={accentColor}
        />
      </div>

      {/* Image Picker Modal — opens when clicking a blank frame */}
      <ImagePickerModal
        isOpen={imagePickerOpen}
        onClose={() => { setImagePickerOpen(false); setImagePickerTargetId(null); }}
        onImageSelected={(url) => {
          if (imagePickerTargetId) {
            editor.updateProperties(imagePickerTargetId, { imageSrc: url });
            markUnsaved();
          }
          setImagePickerOpen(false);
          setImagePickerTargetId(null);
        }}
        accentColor={accentColor}
      />
    </DragDropProvider>
  );
}
