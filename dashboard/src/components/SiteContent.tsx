'use client';

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';

// localStorage keys for editor persistence
const LS_SITE_PAGES = 'redpine-site-pages';
const LS_EDITOR_SESSION = 'redpine-editor-session';
const LS_EDITOR_AUTOSAVE = 'redpine-editor-autosave';

const SiteEditor = lazy(() => import('@/components/SiteEditor'));

interface Page {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  updated_at: string;
  blocks?: unknown[];
}

// Demo pages pre-populated for unauthenticated users
const DEMO_PAGES: Page[] = [
  {
    id: 'demo-home',
    slug: 'home',
    title: 'Home',
    published: true,
    updated_at: new Date().toISOString(),
    blocks: [],
  },
  {
    id: 'demo-services',
    slug: 'services',
    title: 'Services',
    published: true,
    updated_at: new Date().toISOString(),
    blocks: [],
  },
  {
    id: 'demo-about',
    slug: 'about',
    title: 'About Us',
    published: false,
    updated_at: new Date().toISOString(),
    blocks: [],
  },
  {
    id: 'demo-contact',
    slug: 'contact',
    title: 'Contact',
    published: false,
    updated_at: new Date().toISOString(),
    blocks: [],
  },
];

export default function SiteContent({ colors, isDemoMode = false, businessName, websiteData }: { colors: DashboardColors; isDemoMode?: boolean; businessName?: string; websiteData?: any }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);

  const router = useRouter();

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchOk, setFetchOk] = useState(false);

  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // Demo mode: inline editor overlay
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const fetchPages = useCallback(async () => {
    if (isDemoMode) {
      // Priority 1: Use onboarding-generated website data if available
      if (websiteData && websiteData.pages && websiteData.pages.length > 0) {
        const generatedPages: Page[] = websiteData.pages.map((p: any) => ({
          id: `gen-${p.slug}`,
          slug: p.slug,
          title: p.title,
          published: false,
          updated_at: new Date().toISOString(),
          blocks: [websiteData],  // Full FreeFormSaveData so editor can load it
        }));
        setPages(generatedPages);
        // Persist to localStorage so refresh keeps the generated site
        try { localStorage.setItem(LS_SITE_PAGES, JSON.stringify(generatedPages)); } catch {}
        setIsLoading(false);
        setFetchOk(true);
        return;
      }

      // Priority 2: Restore persisted pages from localStorage (survives refresh)
      try {
        const saved = localStorage.getItem(LS_SITE_PAGES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPages(parsed);
            setIsLoading(false);
            setFetchOk(true);
            return;
          }
        }
      } catch {}

      // Priority 3: Fallback to DEMO_PAGES (legacy configs without website_data)
      setPages(DEMO_PAGES);
      setIsLoading(false);
      setFetchOk(true);
      return;
    }
    try {
      const res = await fetch('/api/pages');
      if (res.ok) {
        const json = await res.json();
        setPages(json.data || []);
        setFetchOk(true);
      }
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, websiteData]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Persist demo pages to localStorage whenever they change
  useEffect(() => {
    if (isDemoMode && fetchOk && pages.length > 0) {
      try { localStorage.setItem(LS_SITE_PAGES, JSON.stringify(pages)); } catch {}
    }
  }, [isDemoMode, fetchOk, pages]);

  // Restore editor session after refresh (runs once when pages are ready)
  const restoredRef = useRef(false);
  useEffect(() => {
    if (!fetchOk || !isDemoMode || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const sessionSlug = localStorage.getItem(LS_EDITOR_SESSION);
      if (!sessionSlug) return;
      const page = pages.find(p => p.slug === sessionSlug);
      if (!page) {
        localStorage.removeItem(LS_EDITOR_SESSION);
        localStorage.removeItem(LS_EDITOR_AUTOSAVE);
        return;
      }
      // Prefer autosaved editor data (may contain unsaved changes)
      const autosave = localStorage.getItem(LS_EDITOR_AUTOSAVE);
      if (autosave) {
        try {
          const data = JSON.parse(autosave);
          if (data && data.format === 'freeform') {
            setEditingPage({ ...page, blocks: [data] });
            return;
          }
        } catch {}
      }
      setEditingPage(page);
    } catch {}
  }, [fetchOk, isDemoMode, pages]);

  const handleEdit = (slug: string) => {
    if (isDemoMode) {
      const page = pages.find(p => p.slug === slug);
      if (page) {
        setEditingPage(page);
        try { localStorage.setItem(LS_EDITOR_SESSION, slug); } catch {}
      }
      return;
    }
    router.push(`/editor/${slug}`);
  };

  const handleCloseEditor = useCallback(() => {
    setEditingPage(null);
    try {
      localStorage.removeItem(LS_EDITOR_SESSION);
      localStorage.removeItem(LS_EDITOR_AUTOSAVE);
    } catch {}
  }, []);

  // Demo mode: save blocks locally
  const handleDemoSave = useCallback(async (blocks: unknown[]) => {
    if (!editingPage) return;
    setPages(prev => prev.map(p =>
      p.slug === editingPage.slug ? { ...p, blocks, updated_at: new Date().toISOString() } : p
    ));
    setEditingPage(prev => prev ? { ...prev, blocks } : null);
  }, [editingPage]);

  const handleTogglePublish = async (slug: string, currentlyPublished: boolean) => {
    if (isDemoMode) {
      setPages(prev => prev.map(p =>
        p.slug === slug ? { ...p, published: !currentlyPublished } : p
      ));
      return;
    }
    await fetch(`/api/pages/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !currentlyPublished }),
    });
    fetchPages();
  };

  const handleDelete = async (slug: string) => {
    if (isDemoMode) {
      setPages(prev => prev.filter(p => p.slug !== slug));
      setDeletingSlug(null);
      toast.success('Page deleted');
      return;
    }
    await fetch(`/api/pages/${slug}`, { method: 'DELETE' });
    setDeletingSlug(null);
    fetchPages();
    toast.success('Page deleted');
  };

  const handleNewPage = async () => {
    const title = newPageTitle.trim();
    if (!title) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) return;

    if (isDemoMode) {
      const newPage: Page = {
        id: crypto.randomUUID(),
        slug,
        title,
        published: false,
        updated_at: new Date().toISOString(),
        blocks: [],
      };
      setPages(prev => [...prev, newPage]);
      setShowNewPageModal(false);
      setNewPageTitle('');
      toast.success(`"${title}" created`);
      return;
    }

    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug }),
    });

    if (res.ok) {
      setShowNewPageModal(false);
      setNewPageTitle('');
      fetchPages();
      toast.success(`"${title}" created`);
      router.push(`/editor/${slug}`);
    } else {
      const json = await res.json();
      toast.error(json.error || 'Failed to create page');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: buttonColor, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  // Empty state
  if (pages.length === 0) {
    return (
      <div className="rounded-2xl p-12 shadow-sm text-center" style={{ backgroundColor: cardBg }}>
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: textMain }}>No pages yet</h3>
        <p className="text-sm mb-6" style={{ color: textMuted }}>
          Create your first page to start building your website.
        </p>
        <button
          onClick={() => setShowNewPageModal(true)}
          className="px-6 py-3 text-sm font-medium rounded-xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: buttonColor, color: buttonText }}
        >
          Create First Page
        </button>

        {showNewPageModal && (
          <NewPageModal
            textMain={textMain}
            textMuted={textMuted}
            cardBg={cardBg}
            borderColor={borderColor}
            buttonColor={buttonColor}
            buttonText={buttonText}
            newPageTitle={newPageTitle}
            setNewPageTitle={setNewPageTitle}
            onSubmit={handleNewPage}
            onClose={() => { setShowNewPageModal(false); setNewPageTitle(''); }}
          />
        )}
      </div>
    );
  }

  // Page icon colors based on slug
  const getPageGradient = (slug: string) => {
    const gradients: Record<string, string> = {
      home: 'from-blue-400 to-blue-600',
      about: 'from-purple-400 to-purple-600',
      services: 'from-emerald-400 to-emerald-600',
      contact: 'from-amber-400 to-amber-600',
      blog: 'from-pink-400 to-pink-600',
      pricing: 'from-cyan-400 to-cyan-600',
    };
    return gradients[slug] || 'from-gray-400 to-gray-600';
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: textMuted }}>
            {pages.length} page{pages.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => setShowNewPageModal(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            + New Page
          </button>
        </div>

        {/* Page cards — 50/50 split */}
        {pages.map((page) => (
          <div
            key={page.id}
            className="rounded-2xl shadow-sm overflow-hidden"
            style={{ backgroundColor: cardBg }}
          >
            {/* Page title header */}
            <div className="px-5 py-3 border-b flex items-center justify-center" style={{ borderColor }}>
              <h3 className="text-sm font-semibold" style={{ color: textMain }}>{page.title}</h3>
            </div>

            {/* 50/50 split body */}
            <div className="flex flex-col sm:flex-row">
              {/* Left: Preview */}
              <div className="sm:w-1/2 p-4">
                <div
                  className={`w-full aspect-[16/10] rounded-xl bg-gradient-to-br ${getPageGradient(page.slug)} flex items-center justify-center relative overflow-hidden`}
                >
                  {/* Fake browser chrome */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-white/20 flex items-center px-2 gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="flex-1 h-2.5 mx-2 rounded bg-white/20" />
                  </div>
                  {/* Page icon */}
                  <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
              </div>

              {/* Right: Details */}
              <div className="sm:w-1/2 p-4 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Slug */}
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: textMuted }}>URL</p>
                    <p className="text-sm font-mono" style={{ color: textMain }}>/{page.slug}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: textMuted }}>Status</p>
                    <button
                      onClick={() => handleTogglePublish(page.slug, page.published)}
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                        page.published ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {page.published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  {/* Last updated */}
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: textMuted }}>Last updated</p>
                    <p className="text-sm" style={{ color: textMain }}>
                      {new Date(page.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor }}>
                  <button
                    onClick={() => handleEdit(page.slug)}
                    className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-opacity hover:opacity-90 text-center"
                    style={{ backgroundColor: buttonColor, color: buttonText }}
                  >
                    Edit Page
                  </button>
                  {deletingSlug === page.slug ? (
                    <>
                      <button
                        onClick={() => handleDelete(page.slug)}
                        className="px-3 py-2 text-xs font-medium rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeletingSlug(null)}
                        className="px-3 py-2 text-xs font-medium rounded-lg transition-colors hover:bg-gray-100"
                        style={{ color: textMuted }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeletingSlug(page.slug)}
                      className="px-3 py-2 text-xs font-medium rounded-lg text-red-500 transition-colors hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Page Modal */}
      {showNewPageModal && (
        <NewPageModal
          textMain={textMain}
          textMuted={textMuted}
          cardBg={cardBg}
          borderColor={borderColor}
          buttonColor={buttonColor}
          buttonText={buttonText}
          newPageTitle={newPageTitle}
          setNewPageTitle={setNewPageTitle}
          onSubmit={handleNewPage}
          onClose={() => { setShowNewPageModal(false); setNewPageTitle(''); }}
        />
      )}

      {/* Demo mode: inline FreeForm editor overlay */}
      {editingPage && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        }>
          <SiteEditor
            pageSlug={editingPage.slug}
            pageTitle={editingPage.title}
            initialBlocks={editingPage.blocks || []}
            allPages={pages}
            businessName={businessName}
            accentColor={colors.buttons}
            onSave={handleDemoSave}
            onClose={handleCloseEditor}
          />
        </Suspense>
      )}
    </>
  );
}

/** Inline modal for creating a new page */
function NewPageModal({
  textMain, textMuted, cardBg, borderColor, buttonColor, buttonText,
  newPageTitle, setNewPageTitle, onSubmit, onClose,
}: {
  textMain: string; textMuted: string; cardBg: string; borderColor: string;
  buttonColor: string; buttonText: string;
  newPageTitle: string; setNewPageTitle: (v: string) => void;
  onSubmit: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl p-6 shadow-xl w-full max-w-sm mx-4" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-1" style={{ color: textMain }}>New Page</h3>
        <p className="text-xs mb-4" style={{ color: textMuted }}>Enter a title for your new page.</p>
        <input
          type="text"
          value={newPageTitle}
          onChange={(e) => setNewPageTitle(e.target.value)}
          placeholder="e.g. About Us"
          autoFocus
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
          style={{ borderColor, color: textMain }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newPageTitle.trim()) onSubmit();
            if (e.key === 'Escape') onClose();
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor, color: textMuted }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!newPageTitle.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
