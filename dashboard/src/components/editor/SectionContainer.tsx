'use client';

/**
 * Section Container Component
 * Wrapper for all section types with selection, reordering, and height controls
 * Handles drag-and-drop reorder, resize for blank sections, and section controls
 */

import { useState, useRef, type ReactNode } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Lock } from 'lucide-react';
import { cn } from '@/lib/editor-utils';

interface SectionProperties {
  backgroundColor?: string;
  [key: string]: unknown;
}

interface Section {
  id: string;
  type: string;
  height: number;
  properties?: SectionProperties;
}

interface SectionContainerProps {
  section: Section;
  index: number;
  totalSections: number;
  isSelected?: boolean;
  isLocked?: boolean;
  viewportWidth?: number;
  theme?: 'dark' | 'light';
  accentColor?: string;
  sectionLabels?: Record<string, string>;
  onSelect?: (sectionId: string) => void;
  onDelete?: (sectionId: string) => void;
  onMoveUp?: (sectionId: string) => void;
  onMoveDown?: (sectionId: string) => void;
  onHeightChange?: (sectionId: string, newHeight: number) => void;
  onDragStart?: (sectionId: string, index: number) => void;
  onDragOver?: (index: number) => void;
  onDrop?: (fromIndex: number, toIndex: number) => void;
  children?: ReactNode;
}

export default function SectionContainer({
  section,
  index,
  totalSections,
  isSelected = false,
  isLocked = false,
  theme = 'light',
  accentColor = '#E11D48',
  sectionLabels = {},
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  onHeightChange,
  onDragStart,
  onDragOver,
  onDrop,
  children,
}: SectionContainerProps) {
  const isDark = theme === 'dark';
  const isBlank = section.type === 'blank';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOverState, setIsDragOverState] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Handle drag start for reordering
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isLocked) return;
    e.dataTransfer.setData('sectionId', section.id);
    e.dataTransfer.setData('sectionIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    onDragStart?.(section.id, index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverState(true);
    onDragOver?.(index);
  };

  const handleDragLeave = () => {
    setIsDragOverState(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverState(false);
    const draggedIndex = parseInt(e.dataTransfer.getData('sectionIndex'), 10);
    if (draggedIndex !== index) {
      onDrop?.(draggedIndex, index);
    }
  };

  // Per-type max heights to prevent dead space on prebuilt sections
  const SECTION_MAX_HEIGHTS: Record<string, number> = {
    blogWidget: 900,
    serviceWidget: 700,
    galleryWidget: 800,
    productGrid: 700,
    productWidget: 700,
    menuWidget: 700,
    eventsWidget: 600,
    classesWidget: 800,
    reviewCarousel: 500,
    bookingWidget: 600,
  };
  const maxHeight = SECTION_MAX_HEIGHTS[section.type] || 1200;
  const isAtMax = section.height >= maxHeight - 2; // 2px tolerance

  // Handle height resize
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = section.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(200, Math.min(maxHeight, startHeight + delta));
      onHeightChange?.(section.id, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Resolve label for section type
  const sectionLabel = sectionLabels[section.type] || section.type;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full transition-[opacity,box-shadow] duration-150',
        isDragging && 'opacity-50',
        isDragOverState && 'ring-2 ring-offset-2',
      )}
      style={{
        height: section.height || 400,
        ...(isDragOverState ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}),
      }}
      onMouseDown={() => onSelect?.(section.id)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Selection outline */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none transition-[box-shadow] duration-150',
          isSelected
            ? 'ring-2 ring-inset'
            : 'ring-0 hover:ring-1 hover:ring-gray-400 hover:ring-inset',
        )}
        style={isSelected ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}}
      />

      {/* Section label badge */}
      <div
        className={cn(
          `absolute top-2 left-2 z-10 px-2 py-1 text-[10px] font-['Fira_Code'] uppercase tracking-wider flex items-center gap-1.5`,
          isSelected
            ? 'text-white'
            : isDark
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-200 text-gray-600',
        )}
        style={isSelected ? { backgroundColor: accentColor } : {}}
      >
        {isLocked && <Lock className="w-3 h-3" />}
        {sectionLabel}
      </div>

      {/* Drag handle for reordering (not for locked sections) */}
      {!isLocked && isSelected && (
        <div
          className={cn(
            'absolute top-2 right-2 z-10 flex items-center gap-1 p-1',
            isDark ? 'bg-gray-700' : 'bg-gray-200',
          )}
        >
          {/* Move up button */}
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onMoveUp?.(section.id);
            }}
            disabled={index === 0}
            className={cn(
              'p-1 transition-colors',
              index === 0
                ? 'opacity-30 cursor-not-allowed'
                : isDark
                  ? 'hover:bg-gray-600 text-gray-300'
                  : 'hover:bg-gray-300 text-gray-600',
            )}
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Move down button */}
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onMoveDown?.(section.id);
            }}
            disabled={index === totalSections - 1}
            className={cn(
              'p-1 transition-colors',
              index === totalSections - 1
                ? 'opacity-30 cursor-not-allowed'
                : isDark
                  ? 'hover:bg-gray-600 text-gray-300'
                  : 'hover:bg-gray-300 text-gray-600',
            )}
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Drag handle */}
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={cn(
              'p-1 cursor-grab active:cursor-grabbing',
              isDark
                ? 'hover:bg-gray-600 text-gray-300'
                : 'hover:bg-gray-300 text-gray-600',
            )}
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Delete button */}
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete?.(section.id);
            }}
            className={cn(
              'p-1 transition-colors',
              isDark
                ? 'hover:bg-red-500/20 text-red-400'
                : 'hover:bg-red-50 text-red-500',
            )}
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section content */}
      <div
        className="w-full h-full"
        style={{
          minHeight: section.height || 400,
          height: '100%',
          backgroundColor: section.properties?.backgroundColor || 'transparent',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>

      {/* Red bottom border when section is at max height */}
      {isAtMax && section.type !== 'blank' && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ backgroundColor: '#CE0707' }}
        />
      )}

      {/* Resize handle */}
      {isSelected && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize group',
          )}
          style={isResizing
            ? { backgroundColor: isAtMax ? '#CE070730' : `${accentColor}30` }
            : undefined
          }
          onMouseDown={handleResizeStart}
          onMouseEnter={(e) => { if (!isResizing) e.currentTarget.style.backgroundColor = isAtMax ? '#CE070720' : `${accentColor}20`; }}
          onMouseLeave={(e) => { if (!isResizing) e.currentTarget.style.backgroundColor = ''; }}
        >
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 bottom-1 w-16 h-1 rounded-full transition-colors',
              isResizing ? '' : isDark ? 'bg-gray-500' : 'bg-gray-400',
            )}
            style={isResizing
              ? { backgroundColor: isAtMax ? '#CE0707' : accentColor }
              : isAtMax && section.type !== 'blank'
                ? { backgroundColor: '#CE0707' }
                : undefined
            }
            onMouseEnter={(e) => { if (!isResizing) e.currentTarget.style.backgroundColor = isAtMax ? '#CE0707' : accentColor; }}
            onMouseLeave={(e) => { if (!isResizing) e.currentTarget.style.backgroundColor = ''; }}
          />
        </div>
      )}

      {/* Drop indicator line */}
      {isDragOverState && (
        <div
          className="absolute top-0 left-0 right-0 h-1 -translate-y-1"
          style={{ backgroundColor: accentColor }}
        />
      )}
    </div>
  );
}

export type { SectionContainerProps, Section, SectionProperties };
