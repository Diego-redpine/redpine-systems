'use client';

/**
 * Page Thumbnail Bar Component
 * Horizontal bar at the bottom of the editor showing page thumbnails (like Canva)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Copy, Trash2, Edit3, GripVertical, Home, Briefcase, Wrench, FileText, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface PageData {
  id: string;
  name: string;
  icon?: LucideIcon;
  isDefault?: boolean;
}

interface CanvasElement {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
}

interface MiniCanvasPreviewProps {
  elements: CanvasElement[];
  theme: string;
  viewportWidth?: number;
  canvasHeight?: number;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: () => void;
  onClose: () => void;
  isDefault?: boolean;
  theme: string;
}

interface RenameDialogProps {
  isOpen: boolean;
  pageName: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
  theme: string;
}

interface PageThumbnailProps {
  page: PageData;
  elements: CanvasElement[];
  isActive: boolean;
  index: number;
  theme: string;
  viewportWidth: number;
  canvasHeight: number;
  onSelect: (pageId: string) => void;
  onDuplicate: (pageId: string) => void;
  onDelete: (pageId: string) => void;
  onRename: (pageId: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

interface PageThumbnailBarProps {
  pages: PageData[];
  currentPageId: string;
  pageElements: Record<string, CanvasElement[]>;
  viewportWidth: number;
  canvasHeight: number;
  theme?: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Get icon for page based on its id or type
 */
function getPageIcon(page: PageData): LucideIcon {
  if (page.icon) return page.icon;
  switch (page.id) {
    case 'home': return Home;
    case 'about': return Briefcase;
    case 'services': return Wrench;
    case 'contact': return Phone;
    default: return FileText;
  }
}

// ── Mini Canvas Preview ────────────────────────────────────────────────────

/**
 * Mini Canvas Preview - renders a simplified preview of page content
 */
function MiniCanvasPreview({ elements, theme, viewportWidth = 1200, canvasHeight = 800 }: MiniCanvasPreviewProps) {
  const isLight = theme !== 'dark';

  // Scale factor to fit the preview
  const scale = 80 / viewportWidth;
  const previewHeight = canvasHeight * scale;

  return (
    <div
      className="relative overflow-hidden rounded"
      style={{
        width: '80px',
        height: `${Math.min(previewHeight, 50)}px`,
        backgroundColor: isLight ? '#f5f5f5' : '#e5e7eb',
      }}
    >
      {/* Render simplified element previews */}
      {elements.slice(0, 10).map((element, index) => {
        const left = element.x * scale;
        const top = element.y * scale;
        const width = element.width * scale;
        const height = element.height * scale;

        // Get color based on element type
        let bgColor = 'rgba(0,0,0,0.1)';
        if (element.type === 'heading' || element.type === 'text') {
          bgColor = 'rgba(0,0,0,0.2)';
        } else if (element.type === 'button') {
          bgColor = 'rgba(59,130,246,0.5)';
        } else if (element.type === 'image') {
          bgColor = 'rgba(59,130,246,0.2)';
        }

        return (
          <div
            key={element.id || index}
            className="absolute rounded-sm"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${Math.max(width, 2)}px`,
              height: `${Math.max(height, 2)}px`,
              backgroundColor: bgColor,
            }}
          />
        );
      })}

      {/* Empty state */}
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E5E7EB' }} />
        </div>
      )}
    </div>
  );
}

// ── Context Menu ───────────────────────────────────────────────────────────

/**
 * Context Menu Component
 */
function ContextMenu({ x, y, onDuplicate, onDelete, onRename, onClose, isDefault, theme }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 py-1 rounded-lg shadow-xl border min-w-[140px]"
      style={{
        left: x,
        top: y,
        backgroundColor: '#ffffff',
        borderColor: '#E5E7EB',
      }}
    >
      <button
        onClick={onRename}
        className="w-full px-3 py-2 text-left text-xs font-['Inter'] flex items-center gap-2 hover:bg-gray-100"
        style={{ color: '#6B7280' }}
      >
        <Edit3 className="w-3.5 h-3.5" />
        Rename
      </button>
      <button
        onClick={onDuplicate}
        className="w-full px-3 py-2 text-left text-xs font-['Inter'] flex items-center gap-2 hover:bg-gray-100"
        style={{ color: '#6B7280' }}
      >
        <Copy className="w-3.5 h-3.5" />
        Duplicate
      </button>
      {!isDefault && (
        <button
          onClick={onDelete}
          className="w-full px-3 py-2 text-left text-xs font-['Inter'] flex items-center gap-2 text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      )}
    </div>
  );
}

// ── Rename Dialog ──────────────────────────────────────────────────────────

/**
 * Rename Dialog Component
 */
function RenameDialog({ isOpen, pageName, onClose, onConfirm, theme }: RenameDialogProps) {
  const [name, setName] = useState(pageName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(pageName);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, pageName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="p-4 rounded-lg shadow-xl w-72"
        style={{ backgroundColor: '#ffffff' }}
      >
        <h3
          className="text-sm font-semibold mb-3 font-['Inter']"
          style={{ color: '#1A1A1A' }}
        >
          Rename Page
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm font-['Inter'] border"
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#E5E7EB',
              color: '#1A1A1A',
            }}
          />
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-xs font-['Inter']"
              style={{
                backgroundColor: '#f5f5f5',
                color: '#6B7280',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-xs font-['Inter'] text-white hover:opacity-90"
              style={{ backgroundColor: '#3B82F6' }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page Thumbnail ─────────────────────────────────────────────────────────

/**
 * Page Thumbnail Component
 */
function PageThumbnail({
  page,
  elements,
  isActive,
  index,
  theme,
  viewportWidth,
  canvasHeight,
  onSelect,
  onDuplicate,
  onDelete,
  onRename,
  onDragStart,
  onDragOver,
  onDrop,
}: PageThumbnailProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const Icon = getPageIcon(page);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        className={`relative flex-shrink-0 cursor-pointer transition-all duration-150 ${
          isActive ? 'scale-105' : 'hover:scale-[1.02]'
        }`}
        draggable={!page.isDefault}
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDrop={(e) => onDrop(e, index)}
        onClick={() => onSelect(page.id)}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Thumbnail container */}
        <div
          className="relative p-1.5 rounded-lg transition-all border"
          style={{
            ...(isActive
              ? {
                  borderColor: '#3B82F6',
                  boxShadow: '0 0 0 2px #3B82F6',
                  backgroundColor: 'rgba(59,130,246,0.1)',
                }
              : {
                  backgroundColor: '#ffffff',
                  borderColor: '#E5E7EB',
                }),
          }}
        >
          {/* Drag handle (for non-default pages) */}
          {!page.isDefault && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100" style={{ color: '#6B7280' }}>
              <GripVertical className="w-3 h-3" />
            </div>
          )}

          {/* Preview area */}
          <MiniCanvasPreview
            elements={elements}
            theme={theme}
            viewportWidth={viewportWidth}
            canvasHeight={canvasHeight}
          />

          {/* Page number badge */}
          <div
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              ...(isActive
                ? { backgroundColor: '#3B82F6', color: '#ffffff' }
                : { backgroundColor: '#f5f5f5', color: '#6B7280' }),
            }}
          >
            {index + 1}
          </div>

          {/* Page icon for default pages */}
          {page.isDefault && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 p-1 rounded-full"
              style={{
                backgroundColor: isActive ? '#3B82F6' : '#E5E7EB',
              }}
            >
              <Icon className="w-3 h-3" style={{ color: isActive ? '#ffffff' : '#6B7280' }} />
            </div>
          )}
        </div>

        {/* Tooltip with page name */}
        {showTooltip && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs font-['Inter'] whitespace-nowrap z-50"
            style={{ backgroundColor: '#1A1A1A', color: '#ffffff' }}
          >
            {page.name}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
              style={{ borderTopColor: '#1A1A1A' }}
            />
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isDefault={page.isDefault}
          onDuplicate={() => { onDuplicate(page.id); setContextMenu(null); }}
          onDelete={() => { onDelete(page.id); setContextMenu(null); }}
          onRename={() => { onRename(page.id); setContextMenu(null); }}
          onClose={() => setContextMenu(null)}
          theme={theme}
        />
      )}
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

/**
 * Page Thumbnail Bar
 */
export default function PageThumbnailBar({
  pages,
  currentPageId,
  pageElements,
  viewportWidth,
  canvasHeight,
  theme = 'light',
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onRenamePage,
  onReorderPages,
  className = '',
}: PageThumbnailBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [renameDialog, setRenameDialog] = useState<{ isOpen: boolean; pageId: string | null; pageName: string }>({
    isOpen: false,
    pageId: null,
    pageName: '',
  });

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, _index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    onReorderPages(draggedIndex, dropIndex);
    setDraggedIndex(null);
  }, [draggedIndex, onReorderPages]);

  // Handle rename
  const handleRename = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setRenameDialog({ isOpen: true, pageId, pageName: page.name });
    }
  };

  const handleRenameConfirm = (newName: string) => {
    if (renameDialog.pageId) {
      onRenamePage(renameDialog.pageId, newName);
    }
    setRenameDialog({ isOpen: false, pageId: null, pageName: '' });
  };

  // Scroll to active page on mount/change
  useEffect(() => {
    if (scrollRef.current) {
      const activeIndex = pages.findIndex(p => p.id === currentPageId);
      if (activeIndex !== -1) {
        const thumbnailWidth = 100; // Approximate width including gap
        const scrollLeft = activeIndex * thumbnailWidth - scrollRef.current.clientWidth / 2 + thumbnailWidth / 2;
        scrollRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
      }
    }
  }, [currentPageId, pages]);

  return (
    <>
      <div
        className={`flex items-center border-t ${className}`}
        style={{
          height: '100px',
          backgroundColor: '#ffffff',
          borderColor: '#E5E7EB',
        }}
      >
        {/* Pages label */}
        <div
          className="flex-shrink-0 px-3 border-r h-full flex items-center"
          style={{ borderColor: '#E5E7EB' }}
        >
          <span
            className="text-[10px] font-['Inter'] font-medium uppercase tracking-wider"
            style={{ color: '#6B7280' }}
          >
            Pages
          </span>
        </div>

        {/* Thumbnails scroll area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-2 flex items-center gap-3"
          style={{ scrollbarWidth: 'thin' }}
        >
          {pages.map((page, index) => (
            <PageThumbnail
              key={page.id}
              page={page}
              elements={pageElements[page.id] || []}
              isActive={page.id === currentPageId}
              index={index}
              theme={theme}
              viewportWidth={viewportWidth}
              canvasHeight={canvasHeight}
              onSelect={onSelectPage}
              onDuplicate={onDuplicatePage}
              onDelete={onDeletePage}
              onRename={handleRename}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Add page button */}
        <div
          className="flex-shrink-0 px-3 border-l h-full flex items-center"
          style={{ borderColor: '#E5E7EB' }}
        >
          <button
            onClick={onAddPage}
            className="p-2.5 rounded-lg transition-colors flex items-center justify-center border hover:bg-gray-100"
            style={{
              backgroundColor: '#ffffff',
              color: '#6B7280',
              borderColor: '#E5E7EB',
            }}
            title="Add new page"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialog.isOpen}
        pageName={renameDialog.pageName}
        onClose={() => setRenameDialog({ isOpen: false, pageId: null, pageName: '' })}
        onConfirm={handleRenameConfirm}
        theme={theme}
      />
    </>
  );
}
