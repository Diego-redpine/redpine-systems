'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const SiteEditor = dynamic(() => import('@/components/SiteEditor'), {
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Red Pine OS"
          className="mx-auto mb-8"
          style={{ height: '10rem', animation: 'heartbeat 1.2s ease-in-out infinite' }}
        />
        <p className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Fira Code', monospace" }}>Loading editor<span className="loading-dots" /></p>
        <style>{`
          @keyframes heartbeat {
            0% { transform: scale(1); }
            14% { transform: scale(1.1); }
            28% { transform: scale(1); }
            42% { transform: scale(1.1); }
            70% { transform: scale(1); }
          }
          .loading-dots::after {
            content: '';
            animation: dots 1.5s steps(4, end) infinite;
          }
          @keyframes dots {
            0% { content: ''; }
            25% { content: '.'; }
            50% { content: '..'; }
            75% { content: '...'; }
          }
        `}</style>
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

interface ConfigData {
  businessName: string;
  businessType: string;
  accentColor: string;
  colors: Record<string, string | undefined>;
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [page, setPage] = useState<PageData | null>(null);
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [pageRes, configRes] = await Promise.all([
          fetch(`/api/pages/${slug}`),
          fetch('/api/config'),
        ]);
        if (pageRes.ok) {
          const json = await pageRes.json();
          setPage({
            slug,
            title: json.data.title || slug,
            blocks: json.data.blocks || [],
          });
        } else {
          setError('Page not found');
        }
        if (configRes.ok) {
          const configJson = await configRes.json();
          const cfg = configJson.data;
          if (cfg) {
            setConfigData({
              businessName: cfg.businessName || '',
              businessType: cfg.businessType || '',
              accentColor: cfg.colors?.buttons || '#1A1A1A',
              colors: cfg.colors || {},
            });
          }
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
    return null;
  }

  if (error || !page) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{error || 'Page not found'}</h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white"
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
      businessName={configData?.businessName || page.title}
      businessType={configData?.businessType}
      accentColor={configData?.accentColor}
      dashboardColors={configData?.colors}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
}
