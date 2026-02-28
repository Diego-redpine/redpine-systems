'use client';

/**
 * Embeddable Service Catalog Widget
 * Renders the service catalog for a subdomain in iframe-friendly minimal layout.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface BusinessConfig {
  businessName: string;
  colors: Record<string, string>;
  logoUrl?: string;
}

interface ServiceInfo {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  duration_minutes?: number;
  category?: string;
}

function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

export default function EmbedServicesPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [configRes, servicesRes] = await Promise.all([
          fetch(`/api/subdomain`, { headers: { 'x-subdomain': subdomain } }),
          fetch(`/api/public/services?subdomain=${subdomain}`),
        ]);

        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.success && configData.data) {
            setConfig({
              businessName: configData.data.businessName || 'Business',
              colors: configData.data.colors || {},
              logoUrl: configData.data.logoUrl,
            });
          }
        }

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          if (servicesData.success && servicesData.services) {
            setServices(servicesData.services);
          }
        }
      } catch {
        setError('Unable to load services');
      }
      setIsLoading(false);
    }
    load();
  }, [subdomain]);

  const accentColor = config?.colors?.buttons || config?.colors?.sidebar_bg || '#1A1A1A';
  const accentTextColor = isColorLight(accentColor) ? '#000000' : '#FFFFFF';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="p-6 bg-white text-center">
        <p className="text-sm text-gray-500">Service catalog unavailable</p>
      </div>
    );
  }

  // Group services by category
  const categories = new Map<string, ServiceInfo[]>();
  services.forEach(svc => {
    const cat = svc.category || 'Services';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(svc);
  });

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {config.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: accentColor, color: accentTextColor }}>
              {config.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-base font-bold text-gray-900">{config.businessName}</h1>
            <p className="text-xs text-gray-500">Our Services</p>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">No services available at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(categories.entries()).map(([category, items]) => (
              <div key={category}>
                {categories.size > 1 && (
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">{category}</h2>
                )}
                <div className="space-y-2">
                  {items.map(svc => (
                    <div key={svc.id} className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">{svc.name}</p>
                          {svc.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{svc.description}</p>}
                          {svc.duration_minutes && (
                            <p className="text-xs text-gray-400 mt-1">
                              {svc.duration_minutes < 60
                                ? `${svc.duration_minutes} min`
                                : `${Math.floor(svc.duration_minutes / 60)}h${svc.duration_minutes % 60 ? ` ${svc.duration_minutes % 60}m` : ''}`}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-bold ml-4 flex-shrink-0" style={{ color: accentColor }}>
                          ${(svc.price_cents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Powered by Red Pine */}
        <div className="text-center mt-6 pb-2">
          <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-fira-code), monospace' }}>
            Powered by <span className="font-semibold text-red-600">Red Pine</span>
          </p>
        </div>
      </div>
    </div>
  );
}
