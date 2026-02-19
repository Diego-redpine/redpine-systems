'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface BusinessConfig {
  businessName: string;
  colors: Record<string, string>;
}

export default function SiteHomePage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/subdomain', { headers: { 'x-subdomain': subdomain } });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setConfig({
              businessName: json.data.businessName,
              colors: json.data.colors || {},
            });
          }
        }
      } catch {
        // ignore
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

  const name = config?.businessName || subdomain;
  const accent = config?.colors?.buttons || '#3B82F6';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{name}</h1>
          <p className="text-gray-500 text-sm mb-6">
            This website is being built with the new editor. Check back soon!
          </p>
          <div
            className="inline-block px-5 py-2.5 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: accent }}
          >
            Coming Soon
          </div>
        </div>
      </div>
      <footer className="text-center py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {name} — Powered by <span className="font-semibold text-gray-500">Red Pine</span>
        </p>
      </footer>
    </div>
  );
}
