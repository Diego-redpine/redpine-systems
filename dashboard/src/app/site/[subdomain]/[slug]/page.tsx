'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RenderChaiBlocks } from '@chaibuilder/sdk/render';
import { loadWebBlocks } from '@chaibuilder/sdk/web-blocks';
import { registerCustomBlocks } from '@/lib/chai-blocks-register';

loadWebBlocks();
registerCustomBlocks();

interface PageData {
  title: string;
  blocks: never[];
  seo_title?: string;
  seo_description?: string;
}

export default function SiteSlugPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const slug = params.slug as string;

  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/public/pages?subdomain=${subdomain}&slug=${slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setPage(json.data);
          } else {
            setError('Page not found');
          }
        } else {
          setError('Page not found');
        }
      } catch {
        setError('Failed to load page');
      }
      setIsLoading(false);
    }
    load();
  }, [subdomain, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500 text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {page.seo_title && <title>{page.seo_title}</title>}
      <RenderChaiBlocks blocks={page.blocks} draft={false} />
    </div>
  );
}
