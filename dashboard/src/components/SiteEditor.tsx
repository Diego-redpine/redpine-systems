'use client';

import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import FreeFormEditor from '@/components/editor/FreeFormEditor';
import type { FreeFormSaveData } from '@/components/editor/FreeFormEditor';

interface SiteEditorPage {
  id: string;
  slug: string;
  title: string;
  blocks?: unknown[];
}

interface SiteEditorProps {
  pageSlug: string;
  pageTitle: string;
  initialBlocks: unknown[];
  allPages?: SiteEditorPage[];
  businessName?: string;
  accentColor?: string;
  dashboardColors?: Record<string, string | undefined>;
  onSave: (blocks: unknown[]) => Promise<void>;
  onClose: () => void;
  lockedMode?: boolean;
}

/**
 * SiteEditor — wraps FreeFormEditor in a full-screen portal.
 * Passes all pages from SiteContent so the editor shows every page in the thumbnail bar.
 */
export default function SiteEditor({
  pageSlug,
  pageTitle,
  initialBlocks,
  allPages,
  businessName,
  accentColor,
  dashboardColors,
  onSave,
  onClose,
  lockedMode = false,
}: SiteEditorProps) {
  const initialData = buildInitialData(initialBlocks, allPages, pageSlug, pageTitle);

  const handleSave = useCallback(async (data: FreeFormSaveData) => {
    await onSave([data]);
  }, [onSave]);

  return createPortal(
    <div className="fixed inset-0 z-[999] flex flex-col">
      {/* Close button overlay */}
      <button
        onClick={onClose}
        className="absolute top-3 left-3 z-50 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors shadow-sm border border-gray-200"
        title="Close editor"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {lockedMode && (
        <div className="absolute top-3 right-3 z-50">
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-200">
            Template Mode
          </span>
        </div>
      )}

      <FreeFormEditor
        initialData={initialData}
        businessName={businessName || pageTitle}
        accentColor={accentColor}
        dashboardColors={dashboardColors}
        onSave={handleSave}
        className="flex-1"
      />
    </div>,
    document.body
  );
}

/**
 * Build FreeFormSaveData from the available pages.
 * If existing data is already freeform format, use it directly.
 * Otherwise create fresh pages for each SiteContent page.
 */
function buildInitialData(
  blocks: unknown[],
  allPages: SiteEditorPage[] | undefined,
  currentSlug: string,
  currentTitle: string,
): FreeFormSaveData | null {
  // Check if existing data is already FreeForm format
  if (blocks.length > 0) {
    const first = blocks[0] as Record<string, unknown>;
    if (first && first.format === 'freeform') {
      const data = first as unknown as FreeFormSaveData;
      // If we have allPages and the saved data has fewer pages, add missing ones
      if (allPages && allPages.length > data.pages.length) {
        const existingSlugs = new Set(data.pages.map(p => p.slug));
        for (const page of allPages) {
          if (!existingSlugs.has(page.slug)) {
            data.pages.push({
              id: page.slug,
              title: page.title,
              slug: page.slug,
              sections: [],
              headerConfig: {},
              footerConfig: {},
              canvasConfig: {},
            });
          }
        }
      }
      return data;
    }
  }

  // No existing FreeForm data — build pages from allPages or single page
  if (allPages && allPages.length > 0) {
    const pageIndex = Math.max(0, allPages.findIndex(p => p.slug === currentSlug));
    return {
      format: 'freeform',
      version: 1,
      pages: allPages.map(p => ({
        id: p.slug,
        title: p.title,
        slug: p.slug,
        sections: [], // Will be populated with defaults by FreeFormEditor's deserialize
        headerConfig: {},
        footerConfig: {},
        canvasConfig: {},
      })),
      elements: [],
      currentPageIndex: pageIndex,
    };
  }

  // Fallback: no allPages, just the current page
  return null;
}
