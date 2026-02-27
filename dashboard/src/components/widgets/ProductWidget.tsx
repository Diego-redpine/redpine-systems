'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSubdomain, formatCents, isColorLight } from '@/lib/widget-utils';

// ─── Types ──────────────────────────────────────────────────────

interface ProductWidgetProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  columns?: number;
  showPrice?: boolean;
  showDescription?: boolean;
  accentColor?: string;
  viewportWidth?: number;
  sectionHeight?: number;
  [key: string]: unknown;
}

interface ProductInfo {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  category?: string;
  image_url?: string;
  quantity?: number;
  sku?: string;
}

interface CartItem {
  product: ProductInfo;
  quantity: number;
}

// ─── Constants ──────────────────────────────────────────────────

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const PRODUCT_ICON = 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z';

const CART_ICON = 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z';

const IMAGE_ICON = 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z';

const DEMO_PRODUCTS: ProductInfo[] = [
  { id: 'demo_1', name: 'Classic Candle — Vanilla Bean', description: 'Hand-poured soy wax candle with warm vanilla fragrance. 8 oz jar.', price_cents: 2400, category: 'Retail' },
  { id: 'demo_2', name: 'Signature Tote Bag', description: 'Heavyweight organic cotton tote with embroidered logo.', price_cents: 3200, category: 'Retail' },
  { id: 'demo_3', name: 'Hydrating Cuticle Oil', description: 'Nourishing blend of jojoba, vitamin E, and lavender essential oil.', price_cents: 1400, category: 'Nail Care' },
  { id: 'demo_4', name: 'Gel Polish Remover Kit', description: 'At-home gel removal kit with foil wraps and acetone pads.', price_cents: 1800, category: 'Nail Care' },
  { id: 'demo_5', name: 'Gift Card — $50', description: 'Digital gift card redeemable for any service or product.', price_cents: 5000, category: 'Gift Cards' },
  { id: 'demo_6', name: 'Luxury Hand Cream', description: 'Rich shea butter formula with light floral scent. 3.4 oz tube.', price_cents: 1600, category: 'Nail Care' },
];

// ─── Helpers ────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Component ──────────────────────────────────────────────────

export const ProductWidget: React.FC<ProductWidgetProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Our Products',
  columns = 3,
  showPrice = true,
  showDescription = true,
  accentColor = '#1A1A1A',
  viewportWidth = 1200,
  sectionHeight,
}) => {
  const [products, setProducts] = useState<ProductInfo[]>(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const buttonTextColor = isColorLight(accentColor) ? '#1A1A1A' : '#FFFFFF';

  // ─── Fetch products ──────────────────────────────────────────
  useEffect(() => {
    if (inBuilder) return;
    const subdomain = getSubdomain();
    if (!subdomain) return;

    setLoading(true);
    fetch(`/api/public/products?subdomain=${subdomain}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products?.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [inBuilder]);

  // ─── Categories ──────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  // ─── Cart logic ──────────────────────────────────────────────
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0), [cart]);

  const addToCart = useCallback((product: ProductInfo) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id !== productId) return item;
          const newQty = item.quantity + delta;
          return newQty <= 0 ? null : { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  // ─── Builder preview ────────────────────────────────────────
  if (inBuilder) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          fontFamily: FONT_STACK, width: '100%', height: '100%', boxSizing: 'border-box',
          opacity: 0.85, pointerEvents: 'none', flex: 1,
        }}>
          {heading && (
            <h3 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 16, color: '#1A1A1A' }}>
              {heading}
            </h3>
          )}

          {/* Category pills */}
          {categories.length > 2 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap', padding: '0 16px' }}>
              {categories.map(cat => (
                <span key={cat} style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  backgroundColor: cat === 'All' ? accentColor : '#F3F4F6',
                  color: cat === 'All' ? buttonTextColor : '#6B7280',
                }}>
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Product grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: (sectionHeight != null && sectionHeight > 600) ? '1fr' : `repeat(${viewportWidth < 480 ? 1 : viewportWidth < 768 ? 2 : Math.min(columns, 4)}, 1fr)`,
            gap: 14, padding: '0 16px',
          }}>
            {filteredProducts.slice(0, columns * 2).map(product => (
              <div key={product.id} style={{
                borderRadius: 14, border: '1px solid #E5E7EB',
                overflow: 'hidden', backgroundColor: '#fff',
              }}>
                <div style={{
                  height: 100, backgroundColor: '#F9FAFB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={IMAGE_ICON} />
                    </svg>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  {product.category && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {product.category}
                    </span>
                  )}
                  <p style={{ fontSize: 13, fontWeight: 600, margin: '2px 0 4px', color: '#1A1A1A' }}>{product.name}</p>
                  {showPrice && (
                    <span style={{ fontSize: 14, fontWeight: 700, color: accentColor }}>{formatCents(product.price_cents)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{ fontFamily: FONT_STACK, textAlign: 'center', padding: 60 }}>
          <div style={{
            width: 36, height: 36, border: `3px solid #E5E7EB`, borderTopColor: accentColor,
            borderRadius: '50%', margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#6B7280', fontSize: 14 }}>Loading products...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ─── Public site: Full catalog ──────────────────────────────
  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ fontFamily: FONT_STACK, maxWidth: 960, margin: '0 auto', padding: '32px 20px', position: 'relative' }}>
        {/* Header with cart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          {heading && (
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{heading}</h3>
          )}
          <button
            onClick={() => setCartOpen(!cartOpen)}
            style={{
              position: 'relative', width: 40, height: 40, borderRadius: 10,
              border: '1px solid #E5E7EB', backgroundColor: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={CART_ICON} />
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                width: 20, height: 20, borderRadius: '50%',
                backgroundColor: accentColor, color: buttonTextColor,
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Category tabs */}
        {categories.length > 2 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const isActive = cat === activeCategory;
              const isHovered = cat === hoveredCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  style={{
                    padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                    border: 'none', cursor: 'pointer',
                    backgroundColor: isActive ? accentColor : isHovered ? hexToRgba(accentColor, 0.08) : '#F3F4F6',
                    color: isActive ? buttonTextColor : '#374151',
                    transition: 'background-color 0.15s, color 0.15s',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Product grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)`,
          gap: 16,
        }}>
          {filteredProducts.map(product => {
            const isHovered = hoveredProduct === product.id;
            return (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                style={{
                  borderRadius: 16, border: '1px solid #E5E7EB',
                  overflow: 'hidden', backgroundColor: '#fff',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  boxShadow: isHovered ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                }}
              >
                {/* Image */}
                <div style={{
                  height: 160, backgroundColor: '#F9FAFB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url} alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={IMAGE_ICON} />
                    </svg>
                  )}
                </div>
                {/* Details */}
                <div style={{ padding: 16 }}>
                  {product.category && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: accentColor,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>
                      {product.category}
                    </span>
                  )}
                  <h4 style={{ fontSize: 15, fontWeight: 600, margin: '4px 0 6px', color: '#1A1A1A' }}>
                    {product.name}
                  </h4>
                  {showDescription && product.description && (
                    <p style={{
                      fontSize: 12, color: '#6B7280', margin: '0 0 10px', lineHeight: 1.4,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {product.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {showPrice && (
                      <span style={{ fontSize: 16, fontWeight: 700, color: accentColor }}>
                        {formatCents(product.price_cents)}
                      </span>
                    )}
                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        backgroundColor: accentColor, color: buttonTextColor,
                        border: 'none', cursor: 'pointer',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Cart drawer ──────────────────────────────────────── */}
        {cartOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setCartOpen(false)}
              style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 998,
              }}
            />
            {/* Drawer */}
            <div style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 380, maxWidth: '90vw',
              backgroundColor: '#fff', zIndex: 999,
              boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column',
              fontFamily: FONT_STACK,
            }}>
              {/* Drawer header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 20px 16px', borderBottom: '1px solid #E5E7EB',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={CART_ICON} />
                  </svg>
                  <h4 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#1A1A1A' }}>
                    Cart ({cartCount})
                  </h4>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: 'none',
                    backgroundColor: '#F3F4F6', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart items */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={CART_ICON} />
                    </svg>
                    <p style={{ fontSize: 14, color: '#9CA3AF' }}>Your cart is empty</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {cart.map(item => (
                      <div key={item.product.id} style={{
                        display: 'flex', gap: 12, padding: 12,
                        borderRadius: 12, backgroundColor: '#F9FAFB',
                      }}>
                        {/* Thumbnail */}
                        <div style={{
                          width: 56, height: 56, borderRadius: 10,
                          backgroundColor: '#E5E7EB', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                        }}>
                          {item.product.image_url ? (
                            <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d={IMAGE_ICON} />
                            </svg>
                          )}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.product.name}
                          </p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: accentColor, margin: '2px 0 8px' }}>
                            {formatCents(item.product.price_cents)}
                          </p>
                          {/* Quantity controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              style={{
                                width: 28, height: 28, borderRadius: 6,
                                border: '1px solid #E5E7EB', backgroundColor: '#fff',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 600, color: '#374151',
                              }}
                            >−</button>
                            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              style={{
                                width: 28, height: 28, borderRadius: 6,
                                border: '1px solid #E5E7EB', backgroundColor: '#fff',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 600, color: '#374151',
                              }}
                            >+</button>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              style={{
                                marginLeft: 'auto', padding: '4px 8px', borderRadius: 6,
                                border: 'none', backgroundColor: 'transparent',
                                cursor: 'pointer', fontSize: 11, color: '#EF4444', fontWeight: 500,
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart footer */}
              {cart.length > 0 && (
                <div style={{ padding: 20, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#6B7280' }}>Subtotal</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>{formatCents(cartTotal)}</span>
                  </div>
                  <button
                    onClick={() => {
                      // For now just show a simple alert — Stripe checkout will be wired in later
                      alert('Checkout coming soon! Cart total: ' + formatCents(cartTotal));
                    }}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                      backgroundColor: accentColor, color: buttonTextColor,
                      fontSize: 15, fontWeight: 600, cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Checkout — {formatCents(cartTotal)}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
