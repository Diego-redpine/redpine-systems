'use client';

/**
 * Free-Form Canvas Component
 * Section-based canvas where content is organized in vertical sections
 */

import { useRef, useState, useCallback, type ReactNode } from 'react';
import PresetHeader from '@/components/editor/PresetHeader';
import PresetFooter from '@/components/editor/PresetFooter';
import SectionContainer from '@/components/editor/SectionContainer';
import { BlankSection, SectionRenderer } from '@/components/editor/sections';
import { SECTION_LABELS } from '@/hooks/useFreeFormEditor';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SectionElement {
  id: string;
  [key: string]: unknown;
}

interface Section {
  id: string;
  type: string;
  height: number;
  locked?: boolean;
  elements?: SectionElement[];
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

interface HeaderConfig {
  [key: string]: unknown;
}

interface FooterConfig {
  [key: string]: unknown;
}

interface CanvasConfig {
  backgroundColor?: string;
  [key: string]: unknown;
}

interface ColorsConfig {
  buttons?: string;
  text?: string;
  background?: string;
  sidebar_bg?: string;
}

interface SectionDragState {
  sectionId: string;
  index: number;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type Theme = 'dark' | 'light';
type PresetSelection = 'header' | 'footer' | null;

interface FreeFormCanvasProps {
  // Section-based props
  sections?: Section[];
  selectedSectionId?: string | null;
  selectedElementIds?: Set<string>;
  onSelectSection?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onMoveSection?: (fromIndex: number, toIndex: number) => void;
  onUpdateSectionHeight?: (sectionId: string, height: number) => void;
  onAddElementToSection?: (sectionId: string, elementType: string) => void;
  onUpdateSectionElement?: (sectionId: string, elementId: string, updates: Record<string, unknown>) => void;
  onDeleteSectionElement?: (sectionId: string, elementId: string) => void;
  onDuplicateSectionElement?: (sectionId: string, elementId: string) => void;
  onBringElementToFront?: (sectionId: string, elementId: string) => void;
  onToggleElementLock?: (sectionId: string, elementId: string) => void;
  // Common props
  businessName?: string;
  viewportWidth?: number;
  viewportMode?: ViewportMode;
  zoom?: number;
  theme?: Theme;
  hideHeader?: boolean;
  hideFooter?: boolean;
  headerConfig?: HeaderConfig;
  footerConfig?: FooterConfig;
  canvasConfig?: CanvasConfig;
  colors?: ColorsConfig;
  selectedSection?: PresetSelection;
  isPreviewMode?: boolean;
  animationKey?: number;
  showGrid?: boolean;
  onSelectPreset?: (preset: 'header' | 'footer') => void;
  onSelectElement?: (elementId: string, addToSelection?: boolean) => void;
  onClearSelection?: () => void;
  onCommitPosition?: (sectionId: string, elementId: string, x: number, y: number) => void;
  onCommitSize?: (sectionId: string, elementId: string, width: number, height: number) => void;
  accentColor?: string;
  sectionHeightOverrides?: Record<string, number>;
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * Free-Form Canvas
 */
export default function FreeFormCanvas({
  // Section-based props
  sections = [],
  selectedSectionId = null,
  selectedElementIds = new Set<string>(),
  onSelectSection: onSelectSectionById,
  onDeleteSection,
  onMoveSection,
  onUpdateSectionHeight,
  onAddElementToSection,
  onUpdateSectionElement,
  onDeleteSectionElement,
  onDuplicateSectionElement,
  onBringElementToFront,
  onToggleElementLock,
  // Common props
  businessName = 'My Business',
  viewportWidth = 1200,
  viewportMode = 'desktop',
  zoom = 100,
  theme = 'dark',
  hideHeader = false,
  hideFooter = false,
  headerConfig = {},
  footerConfig = {},
  canvasConfig = {},
  colors,
  selectedSection = null,
  isPreviewMode = false,
  animationKey = 0,
  showGrid = true,
  onSelectPreset,
  onSelectElement,
  onClearSelection,
  onCommitPosition,
  onCommitSize,
  accentColor = '#E11D48',
  sectionHeightOverrides = {},
  className = '',
}: FreeFormCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Section drag state for reordering
  const [sectionDragState, setSectionDragState] = useState<SectionDragState | null>(null);
  const [sectionDropTarget, setSectionDropTarget] = useState<number | null>(null);

  // Section drag handlers
  const handleSectionDragStart = useCallback((sectionId: string, index: number) => {
    setSectionDragState({ sectionId, index });
  }, []);

  const handleSectionDragOver = useCallback((targetIndex: number) => {
    if (sectionDragState && sectionDragState.index !== targetIndex) {
      setSectionDropTarget(targetIndex);
    }
  }, [sectionDragState]);

  const handleSectionDrop = useCallback((fromIndex: number, toIndex: number) => {
    onMoveSection?.(fromIndex, toIndex);
    setSectionDragState(null);
    setSectionDropTarget(null);
  }, [onMoveSection]);

  // Calculate scale factor from zoom percentage
  const scale = zoom / 100;

  // Calculate the scaled dimensions for the wrapper
  const scaledWidth = viewportWidth * scale;

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'} ${className}`}>
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="flex-shrink-0 px-4 py-2 flex items-center justify-center gap-3" style={{ backgroundColor: '#1A1A1A' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-['Fira_Code'] font-medium">
              Preview Mode - Animations Playing
            </span>
          </div>
          <span className="text-white/70 text-xs font-['Fira_Code']">
            Click the Eye icon to exit
          </span>
        </div>
      )}
      {/* Canvas wrapper with scroll - the workspace area */}
      <div className="flex-1 overflow-auto">
        {/* Centering container with padding for breathing room */}
        <div
          className="flex justify-center items-start p-4 md:p-6"
          style={{
            minHeight: '100%',
            minWidth: `${scaledWidth + 48}px`, // Ensure scrollable width
          }}
        >
          {/* Zoom transform wrapper */}
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Page preview container - fixed width */}
            <div
              className={`shadow-2xl overflow-visible flex flex-col ${
                isDark ? 'bg-zinc-950' : 'bg-white'
              }`}
              style={{
                width: `${viewportWidth}px`,
                boxShadow: isDark
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              }}
            >
            {/* Fixed Header */}
            {!hideHeader && (
              <div className="flex-shrink-0">
                <PresetHeader
                  businessName={businessName}
                  colors={colors}
                  theme={theme}
                  viewportMode={viewportMode}
                  config={headerConfig}
                  isSelected={selectedSection === 'header'}
                  onClick={() => onSelectPreset?.('header')}
                />
              </div>
            )}

            {/* Section-based Canvas Area */}
            <div
              ref={canvasRef}
              className="flex-1 flex flex-col"
              style={{ width: `${viewportWidth}px`, minHeight: 200 }}
            >
              {sections.map((section, index) => {
                const effectiveSection = sectionHeightOverrides[section.id]
                  ? { ...section, height: sectionHeightOverrides[section.id] }
                  : section;
                return (
                <SectionContainer
                  key={section.id}
                  section={effectiveSection}
                  index={index}
                  totalSections={sections.length}
                  sectionLabels={SECTION_LABELS}
                  accentColor={accentColor}
                  isSelected={selectedSectionId === section.id}
                  isLocked={section.locked}
                  viewportWidth={viewportWidth}
                  theme={theme}
                  onSelect={(sectionId: string) => onSelectSectionById?.(sectionId)}
                  onDelete={(sectionId: string) => onDeleteSection?.(sectionId)}
                  onMoveUp={(sectionId: string) => {
                    const idx = sections.findIndex(s => s.id === sectionId);
                    if (idx > 0) onMoveSection?.(idx, idx - 1);
                  }}
                  onMoveDown={(sectionId: string) => {
                    const idx = sections.findIndex(s => s.id === sectionId);
                    if (idx < sections.length - 1) onMoveSection?.(idx, idx + 1);
                  }}
                  onHeightChange={(sectionId: string, height: number) => onUpdateSectionHeight?.(sectionId, height)}
                  onDragStart={handleSectionDragStart}
                  onDragOver={handleSectionDragOver}
                  onDrop={handleSectionDrop}
                >
                  {effectiveSection.type === 'blank' ? (
                    <BlankSection
                      section={effectiveSection as never}
                      viewportWidth={viewportWidth}
                      viewportMode={viewportMode}
                      theme={theme}
                      accentColor={accentColor}
                      isSelected={selectedSectionId === section.id}
                      selectedElementIds={selectedElementIds}
                      isPreviewMode={isPreviewMode}
                      animationKey={animationKey}
                      showGrid={showGrid}
                      onSelectElement={(elementId: string, addToSelection?: boolean) => onSelectElement?.(elementId, addToSelection)}
                      onClearSelection={onClearSelection}
                      onAddElement={onAddElementToSection}
                      onUpdateElementPosition={(sectionId: string, elementId: string, x: number, y: number) => onUpdateSectionElement?.(sectionId, elementId, { x, y })}
                      onCommitElementPosition={() => onCommitPosition?.(section.id, '', 0, 0)}
                      onUpdateElementSize={(sectionId: string, elementId: string, width: number, height: number) => onUpdateSectionElement?.(sectionId, elementId, { width, height })}
                      onCommitElementSize={() => onCommitSize?.(section.id, '', 0, 0)}
                      onDeleteElement={(sectionId: string, elementId: string) => onDeleteSectionElement?.(sectionId, elementId)}
                      onDuplicateElement={onDuplicateSectionElement}
                      onBringElementToFront={onBringElementToFront}
                      onToggleElementLock={onToggleElementLock}
                      onUpdateElementProperties={(sectionId: string, elementId: string, props: Record<string, unknown>) => onUpdateSectionElement?.(sectionId, elementId, { properties: props })}
                    />
                  ) : (
                    <SectionRenderer
                      section={section as never}
                      viewportWidth={viewportWidth}
                      theme={theme}
                      accentColor={accentColor}
                    />
                  )}
                </SectionContainer>
                );
              })}

              {/* Empty sections state */}
              {sections.length === 0 && !isPreviewMode && (
                <div
                  className="flex items-center justify-center"
                  style={{
                    minHeight: 400,
                    backgroundColor: canvasConfig.backgroundColor || (isDark ? '#18181b' : '#fafafa'),
                  }}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-zinc-800' : 'bg-gray-200'
                    }`}>
                      <svg className={`w-8 h-8 ${isDark ? 'text-zinc-500' : 'text-gray-900'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-medium mb-2 font-['Fira_Code'] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      Add a Section
                    </h3>
                    <p className={`text-sm font-['Fira_Code'] max-w-xs ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>
                      Select a section type from the Elements panel to get started
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            {!hideFooter && (
              <div className="flex-shrink-0">
                <PresetFooter
                  businessName={businessName}
                  colors={colors}
                  theme={theme}
                  viewportMode={viewportMode}
                  config={footerConfig}
                  isSelected={selectedSection === 'footer'}
                  onClick={() => onSelectPreset?.('footer')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
