'use client';

/**
 * Embeddable Shop / Product Grid Widget
 * Renders product grid for a subdomain in iframe-friendly minimal layout.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface BusinessConfig {
  businessName: string;
  colors: Record<string, string>;
  logoUrl?: string;
}

interface ProductInfo {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  image_url?: string;
  category?: string;
  in_stock?: boolean;
}

function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

export default function EmbedShopPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [configRes, productsRes] = await Promise.all([
          fetch(`/api/subdomain`, { headers: { 'x-subdomain': subdomain } }),
          fetch(`/api/public/products?subdomain=${subdomain}`),
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

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          if (productsData.success && productsData.data) {
            setProducts(productsData.data);
          } else if (productsData.products) {
            setProducts(productsData.products);
          }
        }
      } catch {
        setError('Unable to load shop');
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
        <p className="text-sm text-gray-500">Shop unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto p-4">
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
            <p className="text-xs text-gray-500">Shop</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">No products available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(product => (
              <div key={product.id} className="rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt={product.name} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                  {product.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold" style={{ color: accentColor }}>
                      ${(product.price_cents / 100).toFixed(2)}
                    </span>
                    {product.in_stock === false && (
                      <span className="text-xs text-red-500 font-medium">Out of stock</span>
                    )}
                  </div>
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
