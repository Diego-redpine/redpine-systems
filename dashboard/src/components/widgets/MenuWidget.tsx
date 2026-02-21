'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSubdomain, formatCents, isColorLight } from '@/lib/widget-utils';

// ─── Types ──────────────────────────────────────────────────────

interface MenuWidgetProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  showAllergens?: boolean;
  showImages?: boolean;
  accentColor?: string;
  viewportWidth?: number;
  [key: string]: unknown;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price_cents: number;
  description?: string;
  allergens?: string[];
  image_url?: string;
  modifiers?: Modifier[];
}

interface Modifier {
  group_name: string;
  is_required: boolean;
  max_selections: number;
  options: { name: string; price_cents: number }[];
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: { name: string; price_cents: number }[];
  specialInstructions: string;
}

// ─── Constants ──────────────────────────────────────────────────

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const MENU_ICON = 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25';

const CART_ICON = 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z';

const IMAGE_ICON = 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z';

const ALLERGEN_COLORS: Record<string, string> = {
  nuts: '#B45309', peanuts: '#B45309', dairy: '#2563EB', eggs: '#D97706',
  gluten: '#9333EA', soy: '#059669', shellfish: '#DC2626', fish: '#0891B2', sesame: '#65A30D',
};

const DEMO_MENU: Record<string, MenuItem[]> = {
  'Appetizers': [
    { id: 'd1', name: 'Bruschetta', category: 'Appetizers', price_cents: 1200, description: 'Toasted bread with fresh tomatoes, basil, and balsamic glaze', allergens: ['gluten'] },
    { id: 'd2', name: 'Mozzarella Sticks', category: 'Appetizers', price_cents: 1000, description: 'Hand-breaded mozzarella with marinara sauce', allergens: ['dairy', 'gluten'] },
  ],
  'Entrees': [
    { id: 'd3', name: 'Grilled Salmon', category: 'Entrees', price_cents: 2800, description: 'Atlantic salmon with lemon herb butter, seasonal vegetables', allergens: ['fish'] },
    { id: 'd4', name: 'Chicken Parmesan', category: 'Entrees', price_cents: 2200, description: 'Breaded chicken breast with marinara and melted mozzarella', allergens: ['dairy', 'gluten', 'eggs'] },
    { id: 'd5', name: 'Veggie Bowl', category: 'Entrees', price_cents: 1800, description: 'Quinoa, roasted vegetables, avocado, tahini dressing' },
  ],
  'Desserts': [
    { id: 'd6', name: 'Tiramisu', category: 'Desserts', price_cents: 1100, description: 'Classic Italian dessert with espresso-soaked ladyfingers', allergens: ['dairy', 'eggs', 'gluten'] },
    { id: 'd7', name: 'Chocolate Lava Cake', category: 'Desserts', price_cents: 1300, description: 'Warm molten chocolate cake with vanilla ice cream', allergens: ['dairy', 'eggs', 'gluten'] },
  ],
  'Drinks': [
    { id: 'd8', name: 'Fresh Lemonade', category: 'Drinks', price_cents: 500, description: 'House-made with fresh lemons and a hint of mint' },
    { id: 'd9', name: 'Espresso', category: 'Drinks', price_cents: 400, description: 'Double shot of premium Italian espresso' },
  ],
};

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

export const MenuWidget: React.FC<MenuWidgetProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Our Menu',
  showAllergens = true,
  showImages = true,
  accentColor = '#1A1A1A',
  viewportWidth = 1200,
}) => {
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>(DEMO_MENU);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemModifiers, setItemModifiers] = useState<Record<string, { name: string; price_cents: number }[]>>({});
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemInstructions, setItemInstructions] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const buttonTextColor = isColorLight(accentColor) ? '#1A1A1A' : '#FFFFFF';
  const categories = useMemo(() => Object.keys(menu), [menu]);

  // Set default active category
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // ─── Fetch menu ──────────────────────────────────────────────
  useEffect(() => {
    if (inBuilder) return;
    const subdomain = getSubdomain();
    if (!subdomain) return;

    setLoading(true);
    fetch(`/api/public/menu?subdomain=${subdomain}`)
      .then(res => res.json())
      .then(data => {
        if (data.menu && Object.keys(data.menu).length > 0) {
          setMenu(data.menu);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [inBuilder]);

  // ─── Cart logic ──────────────────────────────────────────────
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const subtotalCents = useMemo(() => {
    return cart.reduce((sum, item) => {
      let itemTotal = item.menuItem.price_cents * item.quantity;
      for (const mod of item.selectedModifiers) {
        itemTotal += mod.price_cents * item.quantity;
      }
      return sum + itemTotal;
    }, 0);
  }, [cart]);

  const addToCart = useCallback(() => {
    if (!selectedItem) return;
    // Validate required modifiers
    if (selectedItem.modifiers) {
      for (const mod of selectedItem.modifiers) {
        if (mod.is_required && !(itemModifiers[mod.group_name]?.length)) {
          return; // required modifier not selected
        }
      }
    }
    const allMods = Object.values(itemModifiers).flat();
    const newItem: CartItem = {
      menuItem: selectedItem,
      quantity: itemQuantity,
      selectedModifiers: allMods,
      specialInstructions: itemInstructions,
    };
    setCart(prev => [...prev, newItem]);
    setSelectedItem(null);
    setItemModifiers({});
    setItemQuantity(1);
    setItemInstructions('');
  }, [selectedItem, itemModifiers, itemQuantity, itemInstructions]);

  const removeFromCart = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, []);

  const toggleModifier = useCallback((groupName: string, option: { name: string; price_cents: number }, maxSelections: number) => {
    setItemModifiers(prev => {
      const current = prev[groupName] || [];
      const exists = current.find(m => m.name === option.name);
      if (exists) {
        return { ...prev, [groupName]: current.filter(m => m.name !== option.name) };
      }
      if (maxSelections === 1) {
        return { ...prev, [groupName]: [option] };
      }
      if (current.length < maxSelections) {
        return { ...prev, [groupName]: [...current, option] };
      }
      return prev;
    });
  }, []);

  // ─── Builder preview ────────────────────────────────────────
  if (inBuilder) {
    const previewItems = (menu[categories[0]] || []).slice(0, 3);
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          fontFamily: FONT_STACK, width: '100%', height: '100%', boxSizing: 'border-box',
          opacity: 0.85, pointerEvents: 'none',
        }}>
          {heading && (
            <h3 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 16, color: '#1A1A1A' }}>
              {heading}
            </h3>
          )}

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap', padding: '0 16px' }}>
            {categories.map((cat, i) => (
              <span key={cat} style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                backgroundColor: i === 0 ? accentColor : '#F3F4F6',
                color: i === 0 ? buttonTextColor : '#6B7280',
              }}>
                {cat}
              </span>
            ))}
          </div>

          {/* Menu items preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
            {previewItems.map(item => (
              <div key={item.id} style={{
                display: 'flex', gap: 12, padding: 12,
                borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#fff',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{item.name}</p>
                    <span style={{ fontSize: 14, fontWeight: 700, color: accentColor, marginLeft: 8, whiteSpace: 'nowrap' }}>
                      {formatCents(item.price_cents)}
                    </span>
                  </div>
                  {item.description && (
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0', lineHeight: 1.4 }}>{item.description}</p>
                  )}
                  {showAllergens && item.allergens && item.allergens.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      {item.allergens.map(a => (
                        <span key={a} style={{
                          padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600,
                          color: '#fff', backgroundColor: ALLERGEN_COLORS[a] || '#6B7280',
                          textTransform: 'capitalize',
                        }}>{a}</span>
                      ))}
                    </div>
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
            width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: accentColor,
            borderRadius: '50%', margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#6B7280', fontSize: 14 }}>Loading menu...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ─── Public site: Full menu ─────────────────────────────────
  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ fontFamily: FONT_STACK, maxWidth: 720, margin: '0 auto', padding: '32px 20px', position: 'relative' }}>
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
              cursor: 'pointer',
            }}
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
                  transition: 'background-color 0.15s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Menu items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(menu[activeCategory] || []).map(item => (
            <button
              key={item.id}
              onClick={() => { setSelectedItem(item); setItemModifiers({}); setItemQuantity(1); setItemInstructions(''); }}
              style={{
                display: 'flex', gap: 14, padding: 14,
                borderRadius: 14, border: '1px solid #E5E7EB', backgroundColor: '#fff',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'box-shadow 0.2s',
                fontFamily: FONT_STACK,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              {showImages && item.image_url && (
                <img src={item.image_url} alt={item.name} style={{
                  width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0,
                }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{item.name}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: accentColor, marginLeft: 12, whiteSpace: 'nowrap' }}>
                    {formatCents(item.price_cents)}
                  </span>
                </div>
                {item.description && (
                  <p style={{
                    fontSize: 13, color: '#6B7280', margin: '4px 0 0', lineHeight: 1.5,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {item.description}
                  </p>
                )}
                {showAllergens && item.allergens && item.allergens.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {item.allergens.map(a => (
                      <span key={a} style={{
                        padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        color: '#fff', backgroundColor: ALLERGEN_COLORS[a] || '#6B7280',
                        textTransform: 'capitalize',
                      }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* ─── Item detail / modifier modal ─────────────────────── */}
        {selectedItem && (
          <>
            <div
              onClick={() => setSelectedItem(null)}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 998 }}
            />
            <div style={{
              position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 440, maxWidth: '95vw', maxHeight: '80vh',
              backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
              zIndex: 999, boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column', fontFamily: FONT_STACK,
              overflow: 'hidden',
            }}>
              {/* Modal header */}
              <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1A1A1A' }}>{selectedItem.name}</h4>
                    <span style={{ fontSize: 16, fontWeight: 600, color: accentColor }}>{formatCents(selectedItem.price_cents)}</span>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
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
                {selectedItem.description && (
                  <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0', lineHeight: 1.5 }}>{selectedItem.description}</p>
                )}
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {/* Modifiers */}
                {selectedItem.modifiers?.map(mod => (
                  <div key={mod.group_name} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{mod.group_name}</span>
                      {mod.is_required && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                          Required
                        </span>
                      )}
                      {mod.max_selections > 1 && (
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Pick up to {mod.max_selections}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {mod.options.map(opt => {
                        const selected = (itemModifiers[mod.group_name] || []).some(m => m.name === opt.name);
                        return (
                          <button
                            key={opt.name}
                            onClick={() => toggleModifier(mod.group_name, opt, mod.max_selections)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 12px', borderRadius: 10,
                              border: `1.5px solid ${selected ? accentColor : '#E5E7EB'}`,
                              backgroundColor: selected ? hexToRgba(accentColor, 0.05) : '#fff',
                              cursor: 'pointer', fontFamily: FONT_STACK,
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{opt.name}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: opt.price_cents > 0 ? accentColor : '#9CA3AF' }}>
                              {opt.price_cents > 0 ? `+${formatCents(opt.price_cents)}` : 'Free'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Special instructions */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>
                    Special Instructions
                  </label>
                  <textarea
                    value={itemInstructions}
                    onChange={e => setItemInstructions(e.target.value)}
                    placeholder="Any allergies or special requests?"
                    style={{
                      width: '100%', padding: 10, borderRadius: 10, border: '1px solid #E5E7EB',
                      fontSize: 13, fontFamily: FONT_STACK, resize: 'none', height: 60,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
                  <button
                    onClick={() => setItemQuantity(q => Math.max(1, q - 1))}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: '1px solid #E5E7EB', backgroundColor: '#fff',
                      cursor: 'pointer', fontSize: 18, fontWeight: 600, color: '#374151',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <span style={{ fontSize: 18, fontWeight: 700, minWidth: 30, textAlign: 'center' }}>{itemQuantity}</span>
                  <button
                    onClick={() => setItemQuantity(q => q + 1)}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: '1px solid #E5E7EB', backgroundColor: '#fff',
                      cursor: 'pointer', fontSize: 18, fontWeight: 600, color: '#374151',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                </div>
              </div>

              {/* Add to order button */}
              <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #E5E7EB' }}>
                <button
                  onClick={addToCart}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                    backgroundColor: accentColor, color: buttonTextColor,
                    fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Add to Order — {formatCents(
                    (selectedItem.price_cents + Object.values(itemModifiers).flat().reduce((s, m) => s + m.price_cents, 0)) * itemQuantity
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ─── Cart drawer ──────────────────────────────────────── */}
        {cartOpen && (
          <>
            <div
              onClick={() => setCartOpen(false)}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 998 }}
            />
            <div style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 380, maxWidth: '90vw',
              backgroundColor: '#fff', zIndex: 999,
              boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column', fontFamily: FONT_STACK,
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 20px 16px', borderBottom: '1px solid #E5E7EB',
              }}>
                <h4 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#1A1A1A' }}>
                  Your Order ({cartCount})
                </h4>
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

              {/* Items */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={MENU_ICON} />
                    </svg>
                    <p style={{ fontSize: 14, color: '#9CA3AF' }}>Your order is empty</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {cart.map((item, index) => (
                      <div key={index} style={{
                        padding: 12, borderRadius: 12, backgroundColor: '#F9FAFB',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                              {item.quantity}× {item.menuItem.name}
                            </p>
                            {item.selectedModifiers.length > 0 && (
                              <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>
                                {item.selectedModifiers.map(m => m.name).join(', ')}
                              </p>
                            )}
                            {item.specialInstructions && (
                              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0', fontStyle: 'italic' }}>
                                &quot;{item.specialInstructions}&quot;
                              </p>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
                              {formatCents(
                                (item.menuItem.price_cents + item.selectedModifiers.reduce((s, m) => s + m.price_cents, 0)) * item.quantity
                              )}
                            </span>
                            <button
                              onClick={() => removeFromCart(index)}
                              style={{
                                display: 'block', border: 'none', backgroundColor: 'transparent',
                                fontSize: 11, color: '#EF4444', cursor: 'pointer', padding: '4px 0', fontWeight: 500,
                              }}
                            >Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div style={{ padding: 20, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#6B7280' }}>Subtotal</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>{formatCents(subtotalCents)}</span>
                  </div>
                  <button
                    onClick={() => {
                      alert('Checkout coming soon! Order total: ' + formatCents(subtotalCents));
                    }}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                      backgroundColor: accentColor, color: buttonTextColor,
                      fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Place Order — {formatCents(subtotalCents)}
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
