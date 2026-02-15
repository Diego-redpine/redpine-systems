'use client';

import React, { useState, useEffect } from 'react';
import { usePortalSession } from './PortalContext';

interface PortalShopProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  accentColor?: string;
  [key: string]: unknown;
}

interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'upgrade' | 'test_fee' | 'membership' | 'merch' | 'gear' | 'general';
  image_url?: string;
}

const DEMO_PRODUCTS: ShopProduct[] = [
  // Upgrades/Tests first
  { id: 'p1', name: 'Blue Belt Test Fee', description: 'Belt testing examination fee', price: 75, category: 'test_fee' },
  { id: 'p2', name: 'Premium Membership Upgrade', description: 'Unlimited classes + private lessons', price: 199, category: 'upgrade' },
  { id: 'p3', name: 'Tournament Registration', description: 'Spring Tournament 2026 entry fee', price: 45, category: 'test_fee' },
  // Merch/Gear below
  { id: 'p4', name: 'Studio T-Shirt', description: 'Official studio t-shirt — all sizes', price: 25, category: 'merch' },
  { id: 'p5', name: 'Training Gloves', description: 'Padded sparring gloves', price: 35, category: 'gear' },
  { id: 'p6', name: 'Water Bottle', description: 'Stainless steel 32oz', price: 15, category: 'merch' },
];

const PRIORITY_CATEGORIES = new Set(['upgrade', 'test_fee', 'membership']);

const CATEGORY_LABELS: Record<string, string> = {
  upgrade: 'Upgrade',
  test_fee: 'Test Fee',
  membership: 'Membership',
  merch: 'Merch',
  gear: 'Gear',
  general: 'Item',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  upgrade: { bg: '#8B5CF615', text: '#8B5CF6' },
  test_fee: { bg: '#F59E0B15', text: '#F59E0B' },
  membership: { bg: '#3B82F615', text: '#3B82F6' },
  merch: { bg: '#6B728015', text: '#6B7280' },
  gear: { bg: '#10B98115', text: '#10B981' },
  general: { bg: '#6B728015', text: '#6B7280' },
};

export const PortalShop: React.FC<PortalShopProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Shop',
  accentColor = '#1A1A1A',
}) => {
  const session = usePortalSession();
  const [products, setProducts] = useState<ShopProduct[]>(DEMO_PRODUCTS);
  const [buying, setBuying] = useState<string | null>(null);
  const [buyMessage, setBuyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (inBuilder || !session) return;
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/portal/data?type=products&student_id=${session.activeStudentId}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.products) setProducts(data.products);
        }
      } catch { /* use demo data */ }
    };
    fetchProducts();
  }, [inBuilder, session, session?.activeStudentId]);

  const handleBuy = async (productId: string) => {
    if (inBuilder || !session) return;
    setBuying(productId);
    setBuyMessage(null);
    try {
      const res = await fetch('/api/portal/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          student_id: session.activeStudentId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
          return;
        }
        setBuyMessage(data.message || 'Purchase request sent. The business will follow up.');
      } else {
        const err = await res.json().catch(() => ({}));
        setBuyMessage(err.error || 'Unable to process purchase. Please try again.');
      }
    } catch {
      setBuyMessage('Connection error. Please try again.');
    }
    setBuying(null);
  };

  // Separate priority items (upgrades/tests/membership) from general shop
  const priorityProducts = products.filter(p => PRIORITY_CATEGORIES.has(p.category));
  const shopProducts = products.filter(p => !PRIORITY_CATEGORIES.has(p.category));

  const renderProductCard = (product: ShopProduct) => {
    const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.general;
    const isPriority = PRIORITY_CATEGORIES.has(product.category);

    return (
      <div
        key={product.id}
        style={{
          padding: 16, borderRadius: 12,
          backgroundColor: isPriority ? `${accentColor}05` : '#FAFAFA',
          border: `1px solid ${isPriority ? `${accentColor}15` : '#F3F4F6'}`,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Image placeholder */}
        {product.image_url ? (
          <div style={{
            height: 120, borderRadius: 8, marginBottom: 12,
            backgroundImage: `url(${product.image_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        ) : (
          <div style={{
            height: 80, borderRadius: 8, marginBottom: 12,
            backgroundColor: `${accentColor}08`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={`${accentColor}40`} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <span style={{
          display: 'inline-block', alignSelf: 'flex-start',
          padding: '2px 8px', borderRadius: 6, marginBottom: 8,
          backgroundColor: catColor.bg, color: catColor.text,
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        }}>
          {CATEGORY_LABELS[product.category] || product.category}
        </span>

        {/* Name + description */}
        <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>{product.name}</p>
        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 12px', flex: 1 }}>{product.description}</p>

        {/* Price + buy */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: accentColor }}>${product.price}</span>
          <button
            onClick={() => handleBuy(product.id)}
            disabled={buying === product.id}
            style={{
              padding: '6px 16px', borderRadius: 8,
              backgroundColor: accentColor, color: '#fff',
              fontSize: 12, fontWeight: 600, border: 'none',
              cursor: 'pointer', opacity: buying === product.id ? 0.6 : 1,
            }}
          >
            {buying === product.id ? '...' : 'Buy'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{heading}</h3>

        {/* Purchase message */}
        {buyMessage && (
          <div style={{
            padding: 12, borderRadius: 10, marginBottom: 16,
            backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD',
            fontSize: 13, color: '#0369A1',
          }}>
            {buyMessage}
          </div>
        )}

        {/* Priority section: Upgrades & Tests */}
        {priorityProducts.length > 0 && (
          <>
            <p style={{
              fontSize: 13, fontWeight: 700, color: '#6B7280',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              marginBottom: 12,
            }}>
              Upgrades & Testing
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12, marginBottom: priorityProducts.length > 0 && shopProducts.length > 0 ? 24 : 0,
            }}>
              {priorityProducts.map(renderProductCard)}
            </div>
          </>
        )}

        {/* Separator */}
        {priorityProducts.length > 0 && shopProducts.length > 0 && (
          <div style={{ height: 1, backgroundColor: '#E5E7EB', marginBottom: 20 }} />
        )}

        {/* Shop section: Merch & Gear */}
        {shopProducts.length > 0 && (
          <>
            <p style={{
              fontSize: 13, fontWeight: 700, color: '#6B7280',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              marginBottom: 12,
            }}>
              Shop
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}>
              {shopProducts.map(renderProductCard)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
