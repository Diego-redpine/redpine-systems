'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

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

interface BusinessInfo {
  businessName: string;
  taxRate: number;
  isDemo: boolean;
}

function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Allergen badges
const ALLERGEN_COLORS: Record<string, string> = {
  nuts: '#B45309', peanuts: '#B45309', dairy: '#2563EB', eggs: '#D97706',
  gluten: '#9333EA', soy: '#059669', shellfish: '#DC2626', fish: '#0891B2', sesame: '#65A30D',
};

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const tableParam = searchParams.get('table');

  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [colors, setColors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'menu' | 'cart' | 'checkout' | 'confirmation'>('menu');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemModifiers, setItemModifiers] = useState<Record<string, { name: string; price_cents: number }[]>>({});
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemInstructions, setItemInstructions] = useState('');

  // Checkout state
  const [orderType, setOrderType] = useState<'dine_in' | 'pickup' | 'delivery'>(
    tableParam ? 'dine_in' : 'pickup'
  );
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tipPercent, setTipPercent] = useState<number | null>(18);
  const [customTip, setCustomTip] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount_cents: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryCheck, setDeliveryCheck] = useState<{ inZone: boolean; message: string } | null>(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  // Loyalty state
  const [loyaltyData, setLoyaltyData] = useState<{
    points: number;
    tier: string;
    reward_available: boolean;
    reward_threshold: number;
    reward_value_cents?: number;
    points_to_next_reward: number;
  } | null>(null);
  const [loyaltyChecked, setLoyaltyChecked] = useState(false);
  const [applyReward, setApplyReward] = useState(false);

  // Catering mode
  const [isCatering, setIsCatering] = useState(false);
  const [cateringDate, setCateringDate] = useState('');
  const [cateringTime, setCateringTime] = useState('');
  const [cateringNotes, setCateringNotes] = useState('');
  const cateringMinOrderCents = 10000; // $100 minimum
  const cateringAdvanceHours = 48;

  // Reorder state
  const [reorderPhone, setReorderPhone] = useState('');
  const [pastOrders, setPastOrders] = useState<{
    id: string;
    order_number: string;
    created_at: string;
    total_cents: number;
    items: { name: string; quantity: number; price_cents: number; modifiers: { name: string; price_cents: number }[] }[];
  }[]>([]);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [reorderSearched, setReorderSearched] = useState(false);

  // Confirmation state
  const [orderResult, setOrderResult] = useState<{
    order_number: string;
    total_cents: number;
    estimated_ready_at: string;
    status: string;
  } | null>(null);

  // Fetch menu + config
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch config for colors
        const configRes = await fetch('/api/subdomain', {
          headers: { 'x-subdomain': subdomain },
        });
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.success && configData.data?.colors) {
            setColors(configData.data.colors);
          }
        }

        // Fetch menu
        const menuRes = await fetch(`/api/public/menu?subdomain=${subdomain}`);
        const menuData = await menuRes.json();
        if (menuData.success) {
          setMenu(menuData.data);
          setBusinessInfo({
            businessName: menuData.businessName,
            taxRate: menuData.taxRate || 0,
            isDemo: menuData.isDemo,
          });
          const categories = Object.keys(menuData.data);
          if (categories.length > 0) setActiveCategory(categories[0]);
        } else {
          setError('Menu not available');
        }
      } catch {
        setError('Failed to load menu');
      }
      setIsLoading(false);
    }
    fetchData();
  }, [subdomain]);

  // Computed
  const categories = useMemo(() => Object.keys(menu), [menu]);
  const buttonBg = colors.buttons || colors.sidebar_buttons || '#3B82F6';
  const buttonText = isColorLight(buttonBg) ? '#1A1A1A' : '#FFFFFF';
  const accentBg = colors.sidebar_bg || '#1A1A2E';
  const accentText = isColorLight(accentBg) ? '#1A1A1A' : '#FFFFFF';

  const subtotalCents = useMemo(() => {
    return cart.reduce((sum, item) => {
      let itemTotal = item.menuItem.price_cents * item.quantity;
      for (const mod of item.selectedModifiers) {
        itemTotal += mod.price_cents * item.quantity;
      }
      return sum + itemTotal;
    }, 0);
  }, [cart]);

  const tipCents = useMemo(() => {
    if (customTip) return Math.round(parseFloat(customTip) * 100) || 0;
    if (tipPercent !== null) return Math.round(subtotalCents * (tipPercent / 100));
    return 0;
  }, [subtotalCents, tipPercent, customTip]);

  const loyaltyDiscountCents = applyReward && loyaltyData?.reward_value_cents ? loyaltyData.reward_value_cents : 0;
  const discountCents = (promoApplied?.discount_cents || 0) + loyaltyDiscountCents;
  const taxCents = Math.round((subtotalCents - discountCents) * ((businessInfo?.taxRate || 0) / 100));
  const deliveryFeeCents = orderType === 'delivery' ? 500 : 0;
  const totalCents = subtotalCents - discountCents + taxCents + tipCents + deliveryFeeCents;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart
  function addToCart() {
    if (!selectedItem) return;
    // Check required modifiers
    if (selectedItem.modifiers) {
      for (const mod of selectedItem.modifiers) {
        if (mod.is_required) {
          const selected = (itemModifiers[mod.group_name] || []);
          if (selected.length === 0) return; // Required modifier not selected
        }
      }
    }

    const allModifiers = Object.values(itemModifiers).flat();
    setCart(prev => {
      // Check if identical item exists
      const existingIdx = prev.findIndex(
        c => c.menuItem.id === selectedItem.id &&
        JSON.stringify(c.selectedModifiers) === JSON.stringify(allModifiers) &&
        c.specialInstructions === itemInstructions
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + itemQuantity };
        return updated;
      }
      return [...prev, {
        menuItem: selectedItem,
        quantity: itemQuantity,
        selectedModifiers: allModifiers,
        specialInstructions: itemInstructions,
      }];
    });
    setSelectedItem(null);
    setItemModifiers({});
    setItemQuantity(1);
    setItemInstructions('');
  }

  function removeFromCart(idx: number) {
    setCart(prev => prev.filter((_, i) => i !== idx));
  }

  function updateCartQuantity(idx: number, delta: number) {
    setCart(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], quantity: Math.max(1, updated[idx].quantity + delta) };
      return updated;
    });
  }

  // Toggle modifier selection
  function toggleModifier(groupName: string, option: { name: string; price_cents: number }, maxSelections: number) {
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
  }

  // Phone lookup for reorder
  async function lookupPastOrders() {
    if (!reorderPhone || reorderPhone.replace(/\D/g, '').length < 10) return;
    setReorderLoading(true);
    try {
      const res = await fetch(`/api/public/orders?phone=${encodeURIComponent(reorderPhone)}&subdomain=${subdomain}`);
      const data = await res.json();
      if (data.success) {
        setPastOrders(data.data || []);
      }
    } catch {
      // silently fail
    }
    setReorderLoading(false);
    setReorderSearched(true);
  }

  // Reorder from past order
  function reorderFromPast(order: typeof pastOrders[0]) {
    const allItems = menu[activeCategory] ? Object.values(menu).flat() : [];
    const cartItems: CartItem[] = [];
    for (const item of order.items) {
      // Try to find matching menu item
      const menuItem = allItems.find(m => m.name === item.name);
      if (menuItem) {
        cartItems.push({
          menuItem,
          quantity: item.quantity,
          selectedModifiers: item.modifiers || [],
          specialInstructions: '',
        });
      } else {
        // Fallback: create a simple menu item from the order data
        cartItems.push({
          menuItem: { id: `reorder-${item.name}`, name: item.name, category: '', price_cents: item.price_cents },
          quantity: item.quantity,
          selectedModifiers: item.modifiers || [],
          specialInstructions: '',
        });
      }
    }
    if (cartItems.length > 0) {
      setCart(cartItems);
      setStep('cart');
    }
  }

  // Check loyalty when phone is filled on checkout
  async function checkLoyalty(phone: string) {
    if (!phone || phone.replace(/\D/g, '').length < 10) return;
    try {
      const res = await fetch(`/api/public/loyalty?phone=${encodeURIComponent(phone)}&subdomain=${subdomain}`);
      const data = await res.json();
      if (data.success && data.data) {
        setLoyaltyData(data.data);
      }
    } catch {
      // silently fail
    }
    setLoyaltyChecked(true);
  }

  // Check delivery zone
  async function checkDeliveryZone() {
    if (!deliveryAddress) return;
    setCheckingDelivery(true);
    try {
      const res = await fetch(`/api/public/delivery-check?subdomain=${subdomain}&address=${encodeURIComponent(deliveryAddress)}`);
      const data = await res.json();
      if (data.success) {
        setDeliveryCheck({ inZone: data.inZone, message: data.message });
      }
    } catch {
      setDeliveryCheck(null);
    }
    setCheckingDelivery(false);
  }

  // Catering validation
  const cateringError = useMemo(() => {
    if (!isCatering) return null;
    if (subtotalCents < cateringMinOrderCents) {
      return `Catering orders require a minimum of ${formatCents(cateringMinOrderCents)}. Current: ${formatCents(subtotalCents)}.`;
    }
    if (cateringDate && cateringTime) {
      const scheduledAt = new Date(`${cateringDate}T${cateringTime}`);
      const hoursUntil = (scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntil < cateringAdvanceHours) {
        return `Catering orders require at least ${cateringAdvanceHours} hours advance notice.`;
      }
    } else if (isCatering) {
      return 'Please select a date and time for your catering order.';
    }
    return null;
  }, [isCatering, subtotalCents, cateringDate, cateringTime, cateringMinOrderCents, cateringAdvanceHours]);

  // Place order
  async function handlePlaceOrder() {
    if (!customerName) return;
    if (orderType === 'delivery' && deliveryCheck && !deliveryCheck.inZone) return;
    if (cateringError) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          items: cart.map(c => ({
            id: c.menuItem.id,
            name: c.menuItem.name,
            price_cents: c.menuItem.price_cents,
            quantity: c.quantity,
            modifiers: c.selectedModifiers,
            special_instructions: c.specialInstructions,
          })),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          order_type: orderType,
          table_number: tableParam || undefined,
          delivery_address: orderType === 'delivery' ? { street: deliveryAddress } : undefined,
          special_instructions: isCatering ? cateringNotes : '',
          tip_cents: tipCents,
          promo_code: promoApplied?.code,
          is_catering: isCatering,
          scheduled_for: isCatering && cateringDate && cateringTime ? `${cateringDate}T${cateringTime}` : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setOrderResult(data.data);
        setStep('confirmation');
      }
    } catch {
      // Error handling
    }
    setIsSubmitting(false);
  }

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800 mb-2">Oops!</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // CONFIRMATION STEP
  if (step === 'confirmation' && orderResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: buttonBg + '20' }}>
            <svg className="w-10 h-10" style={{ color: buttonBg }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1">Order Confirmed!</h1>
          <p className="text-3xl font-bold mb-4" style={{ color: buttonBg }}>{orderResult.order_number}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-medium capitalize">{orderResult.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-medium">{formatCents(orderResult.total_cents)}</span>
            </div>
            {orderResult.estimated_ready_at && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estimated Ready</span>
                <span className="font-medium">
                  {new Date(orderResult.estimated_ready_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">You&apos;ll receive updates about your order.</p>
          <div className="text-xs text-gray-400 pt-4 border-t border-gray-100" style={{ fontFamily: 'var(--font-fira-code), monospace' }}>
            Powered by <span className="font-semibold text-red-600">Red Pine</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 shadow-sm" style={{ backgroundColor: accentBg, color: accentText }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{businessInfo?.businessName || 'Order Online'}</h1>
            {step !== 'menu' && (
              <button onClick={() => setStep(step === 'checkout' ? 'cart' : 'menu')} className="text-sm opacity-75 hover:opacity-100">
                &larr; Back
              </button>
            )}
          </div>
          {step === 'menu' && cartCount > 0 && (
            <button
              onClick={() => setStep('cart')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              Cart ({cartCount}) &middot; {formatCents(subtotalCents)}
            </button>
          )}
        </div>
      </header>

      {/* Item detail modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                  <p className="text-lg font-semibold" style={{ color: buttonBg }}>{formatCents(selectedItem.price_cents)}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedItem.description && (
                <p className="text-gray-600 text-sm mb-4">{selectedItem.description}</p>
              )}
              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedItem.allergens.map(a => (
                    <span key={a} className="px-2 py-0.5 text-xs font-medium rounded-full text-white" style={{ backgroundColor: ALLERGEN_COLORS[a] || '#6B7280' }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {/* Modifiers */}
              {selectedItem.modifiers && selectedItem.modifiers.map((mod) => (
                <div key={mod.group_name} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold">{mod.group_name}</h4>
                    {mod.is_required && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">Required</span>
                    )}
                    {mod.max_selections > 1 && (
                      <span className="text-xs text-gray-400">Up to {mod.max_selections}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {mod.options.map(opt => {
                      const isSelected = (itemModifiers[mod.group_name] || []).some(m => m.name === opt.name);
                      return (
                        <button
                          key={opt.name}
                          onClick={() => toggleModifier(mod.group_name, opt, mod.max_selections)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                            </div>
                            <span>{opt.name}</span>
                          </div>
                          {opt.price_cents > 0 && (
                            <span className="text-gray-500">+{formatCents(opt.price_cents)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special instructions */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Special Instructions</label>
                <textarea
                  value={itemInstructions}
                  onChange={e => setItemInstructions(e.target.value)}
                  placeholder="Allergies, preferences, etc."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                  rows={2}
                />
              </div>

              {/* Quantity + Add */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} className="px-3 py-2 text-lg hover:bg-gray-50">&minus;</button>
                  <span className="px-3 py-2 font-medium">{itemQuantity}</span>
                  <button onClick={() => setItemQuantity(itemQuantity + 1)} className="px-3 py-2 text-lg hover:bg-gray-50">+</button>
                </div>
                <button
                  onClick={addToCart}
                  className="flex-1 py-3 rounded-xl font-semibold text-center transition-colors"
                  style={{ backgroundColor: buttonBg, color: buttonText }}
                >
                  Add to Cart &middot; {formatCents(
                    (selectedItem.price_cents + Object.values(itemModifiers).flat().reduce((s, m) => s + m.price_cents, 0)) * itemQuantity
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* MENU STEP */}
        {step === 'menu' && (
          <>
            {/* Reorder section */}
            {!reorderSearched && (
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Ordered before? Find your past orders</p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={reorderPhone}
                    onChange={e => setReorderPhone(e.target.value)}
                    placeholder="Phone number"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    onKeyDown={e => e.key === 'Enter' && lookupPastOrders()}
                  />
                  <button
                    onClick={lookupPastOrders}
                    disabled={reorderLoading}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: buttonBg }}
                  >
                    {reorderLoading ? '...' : 'Look Up'}
                  </button>
                </div>
              </div>
            )}
            {reorderSearched && pastOrders.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Your Past Orders</p>
                  <button onClick={() => { setReorderSearched(false); setPastOrders([]); setReorderPhone(''); }} className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
                </div>
                <div className="space-y-2">
                  {pastOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{order.order_number}</span>
                          <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                      </div>
                      <button
                        onClick={() => reorderFromPast(order)}
                        className="ml-3 px-3 py-1.5 text-xs font-medium rounded-lg text-white flex-shrink-0"
                        style={{ backgroundColor: buttonBg }}
                      >
                        Reorder
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {reorderSearched && pastOrders.length === 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6 text-center">
                <p className="text-sm text-gray-500">No past orders found for this number</p>
                <button onClick={() => { setReorderSearched(false); setReorderPhone(''); }} className="text-xs mt-1" style={{ color: buttonBg }}>Try again</button>
              </div>
            )}

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
                  style={activeCategory === cat ? { backgroundColor: buttonBg, color: buttonText } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu items */}
            <div className="space-y-3">
              {(menu[activeCategory] || []).map(item => (
                <button
                  key={item.id}
                  onClick={() => { setSelectedItem(item); setItemModifiers({}); setItemQuantity(1); setItemInstructions(''); }}
                  className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left flex gap-4"
                >
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className="font-semibold ml-2" style={{ color: buttonBg }}>{formatCents(item.price_cents)}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {item.allergens.map(a => (
                          <span key={a} className="px-1.5 py-0.5 text-[10px] font-medium rounded text-white" style={{ backgroundColor: ALLERGEN_COLORS[a] || '#6B7280' }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* CART STEP */}
        {step === 'cart' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Order</h2>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button onClick={() => setStep('menu')} className="text-sm font-medium" style={{ color: buttonBg }}>
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.menuItem.name}</h3>
                          {item.selectedModifiers.length > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.selectedModifiers.map(m => m.name).join(', ')}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-xs text-gray-400 italic mt-0.5">{item.specialInstructions}</p>
                          )}
                        </div>
                        <span className="font-semibold ml-2">
                          {formatCents(
                            (item.menuItem.price_cents + item.selectedModifiers.reduce((s, m) => s + m.price_cents, 0)) * item.quantity
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => updateCartQuantity(idx, -1)} className="px-2.5 py-1 text-sm hover:bg-gray-50">&minus;</button>
                          <span className="px-2.5 py-1 text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(idx, 1)} className="px-2.5 py-1 text-sm hover:bg-gray-50">+</button>
                        </div>
                        <button onClick={() => removeFromCart(idx)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order type */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                  <h3 className="text-sm font-semibold mb-3">Order Type</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dine_in', 'pickup', 'delivery'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setOrderType(type)}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${orderType === type ? 'text-white' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}
                        style={orderType === type ? { backgroundColor: buttonBg, color: buttonText } : {}}
                      >
                        {type === 'dine_in' ? 'Dine In' : type === 'pickup' ? 'Pickup' : 'Delivery'}
                      </button>
                    ))}
                  </div>
                  {tableParam && orderType === 'dine_in' && (
                    <p className="text-xs text-gray-500 mt-2">Table {tableParam}</p>
                  )}
                </div>

                {/* Catering mode */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">Ordering for a group?</h3>
                      <p className="text-xs text-gray-400">Catering: {formatCents(cateringMinOrderCents)} min, {cateringAdvanceHours}h advance</p>
                    </div>
                    <button
                      onClick={() => setIsCatering(!isCatering)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${isCatering ? '' : 'bg-gray-200'}`}
                      style={isCatering ? { backgroundColor: buttonBg } : {}}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${isCatering ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  {isCatering && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Date</label>
                          <input
                            type="date"
                            value={cateringDate}
                            onChange={e => setCateringDate(e.target.value)}
                            min={new Date(Date.now() + cateringAdvanceHours * 60 * 60 * 1000).toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Time</label>
                          <input
                            type="time"
                            value={cateringTime}
                            onChange={e => setCateringTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Catering Notes</label>
                        <textarea
                          value={cateringNotes}
                          onChange={e => setCateringNotes(e.target.value)}
                          placeholder="Setup instructions, dietary needs, number of guests..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                          rows={3}
                        />
                      </div>
                      {cateringError && (
                        <p className="text-xs text-red-500 font-medium">{cateringError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tip selection */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                  <h3 className="text-sm font-semibold mb-3">Add a Tip</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[15, 18, 20].map(pct => (
                      <button
                        key={pct}
                        onClick={() => { setTipPercent(pct); setCustomTip(''); }}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${tipPercent === pct && !customTip ? 'text-white' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}
                        style={tipPercent === pct && !customTip ? { backgroundColor: buttonBg, color: buttonText } : {}}
                      >
                        {pct}%
                      </button>
                    ))}
                    <button
                      onClick={() => { setTipPercent(null); setCustomTip(''); }}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${tipPercent === null && !customTip ? 'text-white' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}
                      style={tipPercent === null && !customTip ? { backgroundColor: buttonBg, color: buttonText } : {}}
                    >
                      None
                    </button>
                    <input
                      type="number"
                      placeholder="$"
                      value={customTip}
                      onChange={e => { setCustomTip(e.target.value); setTipPercent(null); }}
                      className="py-2 px-2 rounded-lg text-sm border border-gray-200 text-center focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                  </div>
                </div>

                {/* Promo code */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                  <h3 className="text-sm font-semibold mb-3">Promo Code</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                    <button
                      onClick={() => {
                        if (promoCode) {
                          // Simulate promo application (real API call would go here)
                          setPromoApplied({ code: promoCode, discount_cents: Math.round(subtotalCents * 0.1) });
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">{promoApplied.code} applied!</span>
                      <span className="text-sm text-green-600">-{formatCents(promoApplied.discount_cents)}</span>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span>{formatCents(subtotalCents)}</span>
                    </div>
                    {discountCents > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatCents(discountCents)}</span>
                      </div>
                    )}
                    {taxCents > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax</span>
                        <span>{formatCents(taxCents)}</span>
                      </div>
                    )}
                    {tipCents > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tip</span>
                        <span>{formatCents(tipCents)}</span>
                      </div>
                    )}
                    {deliveryFeeCents > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery Fee</span>
                        <span>{formatCents(deliveryFeeCents)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span>{formatCents(totalCents)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3.5 rounded-xl font-semibold text-center transition-colors"
                  style={{ backgroundColor: buttonBg, color: buttonText }}
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        )}

        {/* CHECKOUT STEP */}
        {step === 'checkout' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Checkout</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold mb-3">Your Information</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Full Name *"
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    onBlur={() => checkLoyalty(customerPhone)}
                    placeholder="Phone Number"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="Email (for receipt)"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  {orderType === 'delivery' && (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={e => { setDeliveryAddress(e.target.value); setDeliveryCheck(null); }}
                          placeholder="Delivery Address *"
                          required
                          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                          onBlur={checkDeliveryZone}
                        />
                        {checkingDelivery && (
                          <div className="flex items-center px-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      {deliveryCheck && (
                        <p className={`text-xs mt-1.5 ${deliveryCheck.inZone ? 'text-green-600' : 'text-red-500'}`}>
                          {deliveryCheck.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Loyalty rewards */}
              {loyaltyChecked && loyaltyData && (
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4" style={{ borderLeftColor: buttonBg }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Loyalty Rewards</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium capitalize">{loyaltyData.tier}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{loyaltyData.points} points{loyaltyData.points_to_next_reward > 0 ? ` · ${loyaltyData.points_to_next_reward} to next reward` : ''}</p>
                  {loyaltyData.reward_available && loyaltyData.reward_value_cents && (
                    <button
                      onClick={() => setApplyReward(!applyReward)}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${applyReward ? 'text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      style={applyReward ? { backgroundColor: buttonBg } : {}}
                    >
                      {applyReward ? `Reward Applied: -${formatCents(loyaltyData.reward_value_cents)}` : `Apply Reward: ${formatCents(loyaltyData.reward_value_cents)} off`}
                    </button>
                  )}
                </div>
              )}

              {/* Order summary */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">{item.quantity}x {item.menuItem.name}</span>
                      <span>{formatCents((item.menuItem.price_cents + item.selectedModifiers.reduce((s, m) => s + m.price_cents, 0)) * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100 space-y-1">
                    <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCents(subtotalCents)}</span></div>
                    {discountCents > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCents(discountCents)}</span></div>}
                    {taxCents > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCents(taxCents)}</span></div>}
                    {tipCents > 0 && <div className="flex justify-between"><span className="text-gray-500">Tip</span><span>{formatCents(tipCents)}</span></div>}
                    {deliveryFeeCents > 0 && <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{formatCents(deliveryFeeCents)}</span></div>}
                    <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100"><span>Total</span><span>{formatCents(totalCents)}</span></div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !customerName}
                className="w-full py-3.5 rounded-xl font-semibold text-center transition-colors disabled:opacity-50"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                {isSubmitting ? 'Placing Order...' : `Place Order \u00B7 ${formatCents(totalCents)}`}
              </button>

              <div className="text-center text-xs text-gray-400 pt-2" style={{ fontFamily: 'var(--font-fira-code), monospace' }}>
                Powered by <span className="font-semibold text-red-600">Red Pine</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
