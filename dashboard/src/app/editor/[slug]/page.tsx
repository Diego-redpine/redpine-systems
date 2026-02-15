'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const SiteEditor = dynamic(() => import('@/components/SiteEditor'), {
  loading: () => (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading editor...</p>
      </div>
    </div>
  ),
  ssr: false,
});

interface PageData {
  slug: string;
  title: string;
  blocks: unknown[];
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pages/${slug}`);
        if (res.ok) {
          const json = await res.json();
          setPage({
            slug,
            title: json.data.title || slug,
            blocks: json.data.blocks || [],
          });
        } else {
          setError('Page not found');
        }
      } catch {
        setError('Failed to load page');
      }
      setIsLoading(false);
    }
    load();
  }, [slug]);

  const handleSave = useCallback(async (blocks: unknown[]) => {
    await fetch(`/api/pages/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });
  }, [slug]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{error || 'Page not found'}</h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <SiteEditor
      pageSlug={page.slug}
      pageTitle={page.title}
      initialBlocks={page.blocks}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
}
