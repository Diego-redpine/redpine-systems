'use client';

/**
 * Blank Section Component
 * A free-form canvas section where elements can be positioned freely
 */

import { useRef, useState, useCallback, useEffect, useMemo, MouseEvent, DragEvent } from 'react';
import FreeFormElement from '@/components/editor/FreeFormElement';
import { getElementPosition, type EditorElement } from '@/hooks/useFreeFormEditor';

interface SectionProperties {
  backgroundColor?: string;
  backgroundImage?: string;
}

interface Section {
  id: string;
  height?: number;
  elements?: EditorElement[];
  properties?: SectionProperties;
}

interface DragState {
  elementId: string;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
  canvasRect: DOMRect;
}

interface ResizeState {
  elementId: string;
  elementType: string;
  handle: string;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
  elementStartWidth: number;
  elementStartHeight: number;
  lockAspectRatio: boolean;
  aspectRatio: number;
}

interface RotateState {
  elementId: string;
  startRotation: number;
  centerX: number;
  centerY: number;
}

interface BlankSectionProps {
  section: Section;
  viewportWidth: number;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  theme?: 'dark' | 'light';
  accentColor?: string;
  isSelected?: boolean;
  selectedElementIds?: Set<string>;
  isPreviewMode?: boolean;
  animationKey?: number;
  showGrid?: boolean;
  onSelectElement?: (id: string, isMultiSelect: boolean) => void;
  onClearSelection?: () => void;
  onAddElement?: (sectionId: string, elementType: string, x: number, y: number) => void;
  onUpdateElementPosition?: (sectionId: string, elementId: string, x: number, y: number) => void;
  onCommitElementPosition?: () => void;
  onUpdateElementSize?: (sectionId: string, elementId: string, width: number, height: number, isTextElement: boolean) => void;
  onCommitElementSize?: () => void;
  onDeleteElement?: (sectionId: string, elementId: string) => void;
  onDuplicateElement?: (sectionId: string, elementId: string) => void;
  onBringElementToFront?: (sectionId: string, elementId: string) => void;
  onToggleElementLock?: (sectionId: string, elementId: string) => void;
  onUpdateElementProperties?: (sectionId: string, elementId: string, props: Record<string, unknown>) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function BlankSection({
  section,
  viewportWidth,
  viewportMode = 'desktop',
  theme = 'light',
  accentColor = '#E11D48',
  isSelected = false,
  selectedElementIds = new Set(),
  isPreviewMode = false,
  animationKey = 0,
  showGrid = true,
  onSelectElement,
  onClearSelection,
  onAddElement,
  onUpdateElementPosition,
  onCommitElementPosition,
  onUpdateElementSize,
  onCommitElementSize,
  onDeleteElement,
  onDuplicateElement,
  onBringElementToFront,
  onToggleElementLock,
  onUpdateElementProperties,
}: BlankSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [rotateState, setRotateState] = useState<RotateState | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const rawElements = section.elements || [];
  const sectionHeight = section.height || 400;
  const backgroundColor = section.properties?.backgroundColor || (isDark ? '#1a1a1a' : '#fafafa');

  // Get elements with viewport-specific positions applied
  const elements = useMemo(() => {
    return rawElements.map(el => {
      const pos = getElementPosition(el, viewportMode);
      return {
        ...el,
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
        fontScale: pos.fontScale,
      };
    });
  }, [rawElements, viewportMode]);

  // Grid color based on theme
  const gridColor = isDark ? '#3f3f46' : '#d4d4d8';

  // Handle element drop
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const elementType = e.dataTransfer.getData('elementType');
    if (!elementType || !sectionRef.current) return;

    // Calculate drop position relative to section
    const rect = sectionRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(e.clientX - rect.left - 50, viewportWidth - 150));
    const y = Math.max(20, Math.min(e.clientY - rect.top - 25, sectionHeight - 100));

    onAddElement?.(section.id, elementType, x, y);
  }, [section.id, viewportWidth, sectionHeight, onAddElement]);

  // Handle element mouse down for dragging
  const handleElementMouseDown = useCallback((e: MouseEvent, element: EditorElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    onSelectElement?.(element.id, e.shiftKey);

    if (!element.locked) {
      const rect = sectionRef.current!.getBoundingClientRect();
      setDragState({
        elementId: element.id,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: element.x,
        elementStartY: element.y,
        canvasRect: rect,
      });
    }
  }, [onSelectElement]);

  // Handle resize handle mouse down
  const handleResizeMouseDown = useCallback((e: MouseEvent, element: EditorElement, handle: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    setResizeState({
      elementId: element.id,
      elementType: element.type,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      elementStartX: element.x,
      elementStartY: element.y,
      elementStartWidth: element.width,
      elementStartHeight: element.height,
      lockAspectRatio: !!(element.properties?.lockAspectRatio),
      aspectRatio: element.width / element.height,
    });
  }, []);

  // Handle rotation handle mouse down
  const handleRotateMouseDown = useCallback((e: MouseEvent, element: EditorElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const rect = sectionRef.current!.getBoundingClientRect();
    const elementCenterX = element.x + element.width / 2;
    const elementCenterY = element.y + element.height / 2;

    setRotateState({
      elementId: element.id,
      startRotation: element.rotation || 0,
      centerX: rect.left + elementCenterX,
      centerY: rect.top + elementCenterY,
    });
  }, []);

  // Handle mouse move for drag/resize/rotate
  useEffect(() => {
    if (!dragState && !resizeState && !rotateState) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (dragState) {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;

        const element = elements.find(el => el.id === dragState.elementId);
        if (!element) return;

        const maxX = viewportWidth - element.width;
        const maxY = sectionHeight - element.height;

        const newX = Math.max(0, Math.min(maxX, dragState.elementStartX + dx));
        const newY = Math.max(0, Math.min(maxY, dragState.elementStartY + dy));

        onUpdateElementPosition?.(section.id, dragState.elementId, newX, newY);
      }

      if (resizeState) {
        const dx = e.clientX - resizeState.startX;
        const dy = e.clientY - resizeState.startY;
        const { handle } = resizeState;

        let newWidth = resizeState.elementStartWidth;
        let newHeight = resizeState.elementStartHeight;
        let newX = resizeState.elementStartX;
        let newY = resizeState.elementStartY;

        if (handle.includes('e')) {
          const maxWidth = viewportWidth - newX - 10;
          newWidth = Math.max(50, Math.min(maxWidth, resizeState.elementStartWidth + dx));
        }
        if (handle.includes('w')) {
          const widthDelta = -dx;
          newWidth = Math.max(50, resizeState.elementStartWidth + widthDelta);
          newX = resizeState.elementStartX - widthDelta;
          if (newX < 10) {
            newWidth = newWidth + newX - 10;
            newX = 10;
          }
        }
        if (handle.includes('s')) {
          const maxHeight = sectionHeight - newY - 10;
          newHeight = Math.max(30, Math.min(maxHeight, resizeState.elementStartHeight + dy));
        }
        if (handle.includes('n')) {
          const heightDelta = -dy;
          newHeight = Math.max(30, resizeState.elementStartHeight + heightDelta);
          newY = resizeState.elementStartY - heightDelta;
          if (newY < 10) {
            newHeight = newHeight + newY - 10;
            newY = 10;
          }
        }

        if (resizeState.lockAspectRatio && resizeState.aspectRatio) {
          const widthChange = Math.abs(newWidth - resizeState.elementStartWidth);
          const heightChange = Math.abs(newHeight - resizeState.elementStartHeight);
          if (widthChange >= heightChange) {
            newHeight = newWidth / resizeState.aspectRatio;
          } else {
            newWidth = newHeight * resizeState.aspectRatio;
          }
        }

        // Final boundary clamp — ensure element stays within section bounds
        if (newX < 0) { newWidth += newX; newX = 0; }
        if (newY < 0) { newHeight += newY; newY = 0; }
        if (newX + newWidth > viewportWidth) { newWidth = viewportWidth - newX; }
        if (newY + newHeight > sectionHeight) { newHeight = sectionHeight - newY; }
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(30, newHeight);

        const isTextElement = ['heading', 'text', 'button'].includes(resizeState.elementType);
        onUpdateElementSize?.(section.id, resizeState.elementId, newWidth, newHeight, isTextElement);
        if (newX !== resizeState.elementStartX || newY !== resizeState.elementStartY) {
          onUpdateElementPosition?.(section.id, resizeState.elementId, Math.max(0, newX), Math.max(0, newY));
        }
      }

      if (rotateState) {
        const dx = e.clientX - rotateState.centerX;
        const dy = e.clientY - rotateState.centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        if (e.shiftKey) {
          angle = Math.round(angle / 15) * 15;
        }
        onUpdateElementProperties?.(section.id, rotateState.elementId, { rotation: Math.round(angle) });
      }
    };

    const handleMouseUp = () => {
      if (dragState) {
        onCommitElementPosition?.();
        setDragState(null);
      }
      if (resizeState) {
        onCommitElementSize?.();
        setResizeState(null);
      }
      if (rotateState) {
        setRotateState(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, resizeState, rotateState, elements, viewportWidth, sectionHeight, section.id,
      onUpdateElementPosition, onUpdateElementSize, onCommitElementPosition, onCommitElementSize, onUpdateElementProperties]);

  return (
    <div
      ref={sectionRef}
      className={`relative w-full overflow-hidden transition-all ${isDragOver ? 'ring-2 ring-inset' : ''}`}
      style={{
        height: sectionHeight,
        backgroundColor,
        backgroundImage: section.properties?.backgroundImage ? `url(${section.properties.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...(isDragOver ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}),
      }}
      onClick={(e) => {
        if (e.target === sectionRef.current) {
          onClearSelection?.();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Grid pattern background */}
      {showGrid && !isPreviewMode && (
        <div
          className={`absolute inset-0 pointer-events-none ${section.properties?.backgroundImage ? 'opacity-10' : 'opacity-20'}`}
          style={{
            backgroundImage: `
              linear-gradient(to right, ${gridColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      )}

      {/* Elements */}
      {elements.map((element, index) => (
        <FreeFormElement
          key={element.id}
          element={{ ...element, zIndex: index }}
          isSelected={selectedElementIds.has(element.id)}
          isDragging={dragState?.elementId === element.id}
          isRotating={rotateState?.elementId === element.id}
          theme={theme}
          accentColor={accentColor}
          isPreviewMode={isPreviewMode}
          animationKey={animationKey}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
          onResizeMouseDown={(e, handle) => handleResizeMouseDown(e, element, handle)}
          onRotateMouseDown={(e) => handleRotateMouseDown(e, element)}
          onDoubleClick={() => onBringElementToFront?.(section.id, element.id)}
          onDelete={(id) => onDeleteElement?.(section.id, id)}
          onToggleLock={(id) => onToggleElementLock?.(section.id, id)}
          onUpdateContent={(id, props) => onUpdateElementProperties?.(section.id, id, props)}
        />
      ))}

      {/* Empty state */}
      {elements.length === 0 && !isPreviewMode && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
              isDark ? 'bg-zinc-800' : 'bg-zinc-200'
            }`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className={`text-sm font-['Inter'] ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>
              Drag elements here
            </p>
          </div>
        </div>
      )}

      {/* Section size indicator */}
      {!isPreviewMode && (
        <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-[10px] font-['Inter'] ${
          isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-600'
        }`}>
          {viewportWidth}px x {sectionHeight}px
        </div>
      )}
    </div>
  );
}
