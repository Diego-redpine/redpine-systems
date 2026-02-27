'use client';

import React, { useState, useCallback } from 'react';
import { DataSelector, DataItem } from './DataSelector';

interface ProductGridProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  columns?: number;
  showPrice?: boolean;
  accentColor?: string;
  linkedProductId?: string;
  linkedProductName?: string;
  sectionHeight?: number;
  [key: string]: unknown;
}

const DEMO_PRODUCTS = [
  { id: '1', name: 'Classic Manicure', price: '$35', image: '', category: 'Nails' },
  { id: '2', name: 'Gel Pedicure', price: '$55', image: '', category: 'Nails' },
  { id: '3', name: 'Hair Color & Style', price: '$120', image: '', category: 'Hair' },
  { id: '4', name: 'Deep Tissue Massage', price: '$90', image: '', category: 'Spa' },
  { id: '5', name: 'Facial Treatment', price: '$75', image: '', category: 'Skin' },
  { id: '6', name: 'Lash Extensions', price: '$65', image: '', category: 'Beauty' },
];

// Map DataSelector product IDs to category filters
const PRODUCT_CATEGORY_MAP: Record<string, string | null> = {
  prod_1: 'Nails',
  prod_2: 'Nails',
  prod_3: 'Nails',
  prod_4: 'Hair',
  prod_5: 'Spa',
  prod_6: 'Skin',
};

const PRODUCT_ICON = 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z';

export const ProductGrid: React.FC<ProductGridProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Our Services',
  columns = 3,
  showPrice = true,
  accentColor = '#1A1A1A',
  linkedProductId = '',
  linkedProductName = '',
  sectionHeight,
}) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [localLinkedId, setLocalLinkedId] = useState(linkedProductId);
  const [localLinkedName, setLocalLinkedName] = useState(linkedProductName);

  const handleSelect = useCallback((item: DataItem) => {
    setLocalLinkedId(item.id);
    setLocalLinkedName(item.name);
    setSelectorOpen(false);
  }, []);

  // Filter products by linked category
  const getProducts = () => {
    const category = PRODUCT_CATEGORY_MAP[localLinkedId];
    if (category) return DEMO_PRODUCTS.filter(p => p.category === category);
    return DEMO_PRODUCTS;
  };

  // --- In Builder: No products linked → blank placeholder ---
  if (inBuilder && !localLinkedId) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          width: '100%', height: '100%', padding: 48,
          backgroundColor: '#F9FAFB', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flex: 1,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            backgroundColor: '#F0F0F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={PRODUCT_ICON} />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No products connected</p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
            Connect products from your dashboard to display here
          </p>
          <button
            onClick={() => setSelectorOpen(true)}
            style={{
              padding: '10px 24px', borderRadius: 10,
              backgroundColor: accentColor, color: '#fff',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            Connect Products
          </button>
        </div>
        <DataSelector
          entityType="products"
          isOpen={selectorOpen}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // --- In Builder: Products linked → preview with header badge ---
  if (inBuilder && localLinkedId) {
    const products = getProducts();
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{ padding: '32px 20px', flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20, padding: '12px 16px', borderRadius: 10,
            backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: `${accentColor}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={PRODUCT_ICON} />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{localLinkedName}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{products.length} products</p>
              </div>
            </div>
            <button
              onClick={() => setSelectorOpen(true)}
              style={{
                padding: '5px 12px', borderRadius: 6,
                backgroundColor: 'transparent', border: `1px solid ${accentColor}30`,
                color: accentColor, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Change
            </button>
          </div>

          {heading && (
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>{heading}</h3>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: (sectionHeight != null && sectionHeight > 600) ? '1fr' : `repeat(${Math.min(columns, 4)}, 1fr)`, gap: 16, opacity: 0.7, pointerEvents: 'none' }}>
            {products.slice(0, columns * 2).map(product => (
              <div key={product.id} style={{ borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', backgroundColor: '#fff' }}>
                <div style={{ height: 120, backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div style={{ padding: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: accentColor, textTransform: 'uppercase' }}>{product.category}</span>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 2, marginBottom: 6 }}>{product.name}</h4>
                  {showPrice && <span style={{ fontSize: 15, fontWeight: 700, color: accentColor }}>{product.price}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DataSelector
          entityType="products"
          isOpen={selectorOpen}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // --- Public site (with or without link) → render product grid ---
  const products = localLinkedId ? getProducts() : DEMO_PRODUCTS;

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
        {heading && (
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>{heading}</h3>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)`, gap: 16 }}>
          {products.map(product => (
            <div
              key={product.id}
              style={{
                borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden',
                backgroundColor: '#fff', transition: 'box-shadow 0.2s',
              }}
            >
              <div style={{
                height: 160, backgroundColor: '#F3F4F6', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <div style={{ padding: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {product.category}
                </span>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginTop: 4, marginBottom: 8 }}>{product.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {showPrice && (
                    <span style={{ fontSize: 16, fontWeight: 700, color: accentColor }}>{product.price}</span>
                  )}
                  <button style={{
                    padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    backgroundColor: accentColor, color: '#fff', border: 'none', cursor: 'pointer',
                  }}>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
