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

interface BusinessConfig {
  businessName: string;
  colors: Record<string, string>;
}

export default function SiteHomePage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [page, setPage] = useState<PageData | null>(null);
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch business config and home page in parallel
        const [configRes, pageRes] = await Promise.all([
          fetch('/api/subdomain', { headers: { 'x-subdomain': subdomain } }),
          fetch(`/api/public/pages?subdomain=${subdomain}&slug=home`),
        ]);

        if (configRes.ok) {
          const configJson = await configRes.json();
          if (configJson.success) {
            setConfig({
              businessName: configJson.data.businessName,
              colors: configJson.data.colors || {},
            });
          }
        }

        if (pageRes.ok) {
          const pageJson = await pageRes.json();
          if (pageJson.data) {
            setPage(pageJson.data);
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
  }, [subdomain]);

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
          <p className="text-gray-500 text-sm">This website is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {page.seo_title && <title>{page.seo_title}</title>}
      <RenderChaiBlocks blocks={page.blocks} draft={false} />
      {/* Footer */}
      <footer className="text-center py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {config?.businessName || subdomain} — Powered by <span className="font-semibold text-gray-500">Red Pine</span>
        </p>
      </footer>
    </div>
  );
}
