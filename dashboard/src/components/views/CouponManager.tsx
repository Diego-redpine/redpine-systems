'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import {
  getButtonColor,
  getTextColor,
  getCardBorder,
  getHeadingColor,
  getContrastText,
  getBackgroundColor,
} from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';

// ── Types ──────────────────────────────────────────────────────────────

type CouponType = 'percent' | 'fixed' | 'free_item';

interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // cents for fixed, whole number for percent, 0 for free_item
  min_order_amount: number | null; // cents
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

type CouponStatus = 'active' | 'expired' | 'depleted' | 'inactive';

interface CouponManagerProps {
  configColors: DashboardColors;
}

// ── Helpers ────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(dollars: string): number {
  return Math.round(parseFloat(dollars || '0') * 100);
}

function deriveCouponStatus(coupon: Coupon): CouponStatus {
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return 'expired';
  }
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return 'depleted';
  }
  return coupon.is_active ? 'active' : 'inactive';
}

function formatCouponValue(coupon: Coupon): string {
  switch (coupon.type) {
    case 'percent':
      return `${coupon.value}% off`;
    case 'fixed':
      return `$${centsToDollars(coupon.value)} off`;
    case 'free_item':
      return 'Free item';
  }
}

// ── Status badge colors (not from configColors — these are semantic) ──

const STATUS_STYLES: Record<CouponStatus, { bg: string; text: string; label: string }> = {
  active: { bg: '#DEF7EC', text: '#03543F', label: 'Active' },
  expired: { bg: '#FDE8E8', text: '#9B1C1C', label: 'Expired' },
  depleted: { bg: '#F3F4F6', text: '#6B7280', label: 'Depleted' },
  inactive: { bg: '#FEF3C7', text: '#92400E', label: 'Inactive' },
};

const TYPE_LABELS: Record<CouponType, string> = {
  percent: '% off',
  fixed: '$ off',
  free_item: 'Free item',
};

// ── Component ──────────────────────────────────────────────────────────

export default function CouponManager({ configColors }: CouponManagerProps) {
  // Colors from config
  const buttonColor = getButtonColor(configColors);
  const buttonText = getContrastText(buttonColor);
  const textColor = getTextColor(configColors);
  const headingColor = getHeadingColor(configColors);
  const borderColor = getCardBorder(configColors);
  const cardBg = configColors.cards || '#FFFFFF';
  const bgColor = getBackgroundColor(configColors);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState(generateCode());
  const [type, setType] = useState<CouponType>('percent');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // List state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch coupons ──────────────────────────────────────────────────

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/data/coupons?pageSize=100&sort=created_at&sortDir=desc');
      const json = await res.json();
      if (json.success) {
        setCoupons(json.data || []);
      }
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ── Create coupon ──────────────────────────────────────────────────

  const resetForm = () => {
    setCode(generateCode());
    setType('percent');
    setValue('');
    setMinOrderAmount('');
    setMaxUses('');
    setExpiresAt('');
  };

  const handleCreate = async () => {
    if (!code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (type !== 'free_item' && (!value || parseFloat(value) <= 0)) {
      toast.error('Please enter a valid value');
      return;
    }
    if (type === 'percent' && parseFloat(value) > 100) {
      toast.error('Percentage cannot exceed 100');
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        code: code.trim().toUpperCase(),
        type,
        value: type === 'free_item' ? 0 : type === 'fixed' ? dollarsToCents(value) : parseInt(value, 10),
        current_uses: 0,
        is_active: true,
      };
      if (minOrderAmount) body.min_order_amount = dollarsToCents(minOrderAmount);
      if (maxUses) body.max_uses = parseInt(maxUses, 10);
      if (expiresAt) body.expires_at = new Date(expiresAt).toISOString();

      const res = await fetch('/api/data/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Coupon ${body.code} created`);
        resetForm();
        setShowForm(false);
        fetchCoupons();
      } else {
        toast.error(json.error || 'Failed to create coupon');
      }
    } catch {
      toast.error('Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle active ──────────────────────────────────────────────────

  const toggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/data/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Coupon ${coupon.code} ${coupon.is_active ? 'deactivated' : 'activated'}`);
        fetchCoupons();
      } else {
        toast.error(json.error || 'Failed to update coupon');
      }
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  // ── Delete coupon ──────────────────────────────────────────────────

  const deleteCoupon = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/data/coupons/${coupon.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Coupon ${coupon.code} deleted`);
        fetchCoupons();
      } else {
        toast.error(json.error || 'Failed to delete coupon');
      }
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header + toggle button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: headingColor }}>
          Coupons
        </h3>
        <button
          onClick={() => {
            if (!showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: buttonColor, color: buttonText }}
        >
          {showForm ? 'Cancel' : '+ New Coupon'}
        </button>
      </div>

      {/* ── Create form ─────────────────────────────────────────────── */}
      {showForm && (
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          {/* Code input */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
              Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SAVE20"
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  backgroundColor: bgColor,
                }}
              />
              <button
                onClick={() => setCode(generateCode())}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ border: `1px solid ${borderColor}`, color: textColor }}
                title="Generate random code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Type pills */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
              Type
            </label>
            <div className="flex gap-2">
              {(['percent', 'fixed', 'free_item'] as CouponType[]).map((t) => {
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    style={
                      isSelected
                        ? { backgroundColor: buttonColor, color: buttonText }
                        : { border: `1px solid ${borderColor}`, color: textColor, backgroundColor: 'transparent' }
                    }
                  >
                    {TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Value input (hidden for free_item) */}
          {type !== 'free_item' && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
                {type === 'percent' ? 'Percentage' : 'Amount ($)'}
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: textColor, opacity: 0.5 }}
                >
                  {type === 'percent' ? '%' : '$'}
                </span>
                <input
                  type="number"
                  min="0"
                  max={type === 'percent' ? 100 : undefined}
                  step={type === 'percent' ? 1 : 0.01}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'percent' ? '20' : '5.00'}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    border: `1px solid ${borderColor}`,
                    color: textColor,
                    backgroundColor: bgColor,
                  }}
                />
              </div>
            </div>
          )}

          {/* Optional fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
                Min order ($)
                <span className="font-normal opacity-50 ml-1">optional</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  backgroundColor: bgColor,
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
                Max uses
                <span className="font-normal opacity-50 ml-1">optional</span>
              </label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  backgroundColor: bgColor,
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
                Expiry date
                <span className="font-normal opacity-50 ml-1">optional</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  backgroundColor: bgColor,
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-6 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: buttonColor, color: buttonText }}
            >
              {submitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </div>
      )}

      {/* ── Coupon list ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-sm py-8 text-center" style={{ color: textColor, opacity: 0.5 }}>
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <p className="text-sm" style={{ color: textColor, opacity: 0.5 }}>
            No coupons yet. Create your first one above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => {
            const status = deriveCouponStatus(coupon);
            const statusStyle = STATUS_STYLES[status];
            const isToggleable = status !== 'expired' && status !== 'depleted';

            return (
              <div
                key={coupon.id}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
              >
                {/* Code + type */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm tracking-wide" style={{ color: headingColor }}>
                      {coupon.code}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: buttonColor + '1A', color: buttonColor }}
                    >
                      {formatCouponValue(coupon)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: textColor, opacity: 0.6 }}>
                    <span>
                      {coupon.max_uses !== null
                        ? `${coupon.current_uses}/${coupon.max_uses} used`
                        : `${coupon.current_uses} used`}
                    </span>
                    {coupon.min_order_amount !== null && coupon.min_order_amount > 0 && (
                      <span>Min ${centsToDollars(coupon.min_order_amount)}</span>
                    )}
                    {coupon.expires_at && (
                      <span>
                        Expires {new Date(coupon.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => isToggleable && toggleActive(coupon)}
                  disabled={!isToggleable}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 disabled:opacity-40"
                  style={{
                    backgroundColor: coupon.is_active && isToggleable ? buttonColor : borderColor,
                  }}
                  title={isToggleable ? (coupon.is_active ? 'Deactivate' : 'Activate') : status}
                >
                  <span
                    className="inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm"
                    style={{
                      transform: coupon.is_active ? 'translateX(22px)' : 'translateX(4px)',
                    }}
                  />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => deleteCoupon(coupon)}
                  className="p-2 rounded-xl transition-colors hover:opacity-70 shrink-0"
                  style={{ color: textColor, opacity: 0.4 }}
                  title="Delete coupon"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
