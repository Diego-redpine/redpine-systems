'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

type EstimateStatus = 'draft' | 'sent' | 'approved' | 'invoiced' | 'expired';

interface LineItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
}

interface QuoteBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  onConvertToInvoice?: (estimateId: string) => void;
  configColors: DashboardColors;
  existingEstimate?: Record<string, unknown> | null;
  isSaving?: boolean;
}

const STATUS_CONFIG: Record<EstimateStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#6B7280' },
  sent: { label: 'Sent', color: '#3B82F6' },
  approved: { label: 'Approved', color: '#10B981' },
  invoiced: { label: 'Invoiced', color: '#8B5CF6' },
  expired: { label: 'Expired', color: '#EF4444' },
};

function createEmptyLineItem(): LineItem {
  return { description: '', quantity: 1, unit_price_cents: 0 };
}

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(dollars: string): number {
  const parsed = parseFloat(dollars);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export default function QuoteBuilder({
  isOpen,
  onClose,
  onSave,
  onConvertToInvoice,
  configColors,
  existingEstimate,
  isSaving = false,
}: QuoteBuilderProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([createEmptyLineItem()]);
  const [taxPercent, setTaxPercent] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<EstimateStatus>('draft');

  // Hydrate from existing estimate when opened
  useEffect(() => {
    if (!isOpen) return;

    if (existingEstimate) {
      const items = existingEstimate.line_items as LineItem[] | undefined;
      setLineItems(items && items.length > 0 ? items : [createEmptyLineItem()]);
      setNotes((existingEstimate.notes as string) || '');
      setValidUntil((existingEstimate.valid_until as string) || '');
      setStatus((existingEstimate.status as EstimateStatus) || 'draft');

      // Reverse-calculate tax percent from stored values
      const subtotal = existingEstimate.subtotal_cents as number | undefined;
      const taxCents = existingEstimate.tax_cents as number | undefined;
      if (subtotal && taxCents && subtotal > 0) {
        setTaxPercent(((taxCents / subtotal) * 100).toFixed(2));
      } else {
        setTaxPercent('');
      }
    } else {
      setLineItems([createEmptyLineItem()]);
      setTaxPercent('');
      setNotes('');
      setValidUntil('');
      setStatus('draft');
    }
  }, [isOpen, existingEstimate]);

  // Color helpers
  const buttonBg = configColors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const textColor = configColors.text || '#111827';
  const headingColor = configColors.headings || '#111827';
  const borderColor = configColors.borders || '#E5E7EB';
  const bgColor = configColors.background || '#F9FAFB';
  const inputStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    borderColor: borderColor,
    color: textColor,
  };

  // Line item handlers
  const updateLineItem = useCallback((index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => {
      const updated = [...prev];
      if (field === 'description') {
        updated[index] = { ...updated[index], description: value as string };
      } else if (field === 'quantity') {
        const qty = typeof value === 'string' ? parseInt(value, 10) : value;
        updated[index] = { ...updated[index], quantity: isNaN(qty) || qty < 1 ? 1 : qty };
      } else if (field === 'unit_price_cents') {
        const cents = typeof value === 'string' ? dollarsToCents(value) : value;
        updated[index] = { ...updated[index], unit_price_cents: cents };
      }
      return updated;
    });
  }, []);

  const addLineItem = useCallback(() => {
    setLineItems(prev => [...prev, createEmptyLineItem()]);
  }, []);

  const removeLineItem = useCallback((index: number) => {
    setLineItems(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Calculations
  const subtotalCents = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price_cents, 0);
  }, [lineItems]);

  const taxCents = useMemo(() => {
    const pct = parseFloat(taxPercent);
    if (isNaN(pct) || pct <= 0) return 0;
    return Math.round(subtotalCents * (pct / 100));
  }, [subtotalCents, taxPercent]);

  const totalCents = subtotalCents + taxCents;

  // Save handler
  const handleSave = useCallback(() => {
    const data = {
      line_items: lineItems.filter(item => item.description.trim() !== ''),
      subtotal_cents: subtotalCents,
      tax_cents: taxCents,
      total_cents: totalCents,
      notes,
      valid_until: validUntil,
      status,
    };
    onSave(data);
  }, [lineItems, subtotalCents, taxCents, totalCents, notes, validUntil, status, onSave]);

  // Convert to invoice handler
  const handleConvertToInvoice = useCallback(() => {
    if (!onConvertToInvoice || !existingEstimate) return;
    const estimateId = existingEstimate.id as string;
    if (estimateId) {
      onConvertToInvoice(estimateId);
    }
  }, [onConvertToInvoice, existingEstimate]);

  const hasValidItems = lineItems.some(item => item.description.trim() !== '');
  const statusConfig = STATUS_CONFIG[status];

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Estimate / Quote"
      subtitle="Build and send quotes to clients"
      maxWidth="max-w-2xl"
      configColors={configColors}
      headerRight={
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: statusConfig.color,
            color: getContrastText(statusConfig.color),
          }}
        >
          {statusConfig.label}
        </span>
      }
    >
      <div className="space-y-5">
        {/* Line Items */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: headingColor }}
          >
            Line Items
          </h3>

          {/* Column Headers */}
          <div className="grid grid-cols-[1fr_72px_100px_80px_32px] gap-2 mb-2 px-1">
            <span className="text-xs font-medium" style={{ color: textColor, opacity: 0.6 }}>
              Description
            </span>
            <span className="text-xs font-medium" style={{ color: textColor, opacity: 0.6 }}>
              Qty
            </span>
            <span className="text-xs font-medium" style={{ color: textColor, opacity: 0.6 }}>
              Unit Price
            </span>
            <span className="text-xs font-medium text-right" style={{ color: textColor, opacity: 0.6 }}>
              Total
            </span>
            <span />
          </div>

          {/* Line Item Rows */}
          <div className="space-y-2">
            {lineItems.map((item, index) => {
              const lineTotalCents = item.quantity * item.unit_price_cents;
              return (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_72px_100px_80px_32px] gap-2 items-center"
                >
                  {/* Description */}
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1"
                    style={{
                      ...inputStyle,
                      // @ts-expect-error ring color via style
                      '--tw-ring-color': buttonBg,
                    }}
                  />

                  {/* Quantity */}
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border text-sm text-center focus:outline-none focus:ring-1"
                    style={inputStyle}
                  />

                  {/* Unit Price (displayed as dollars) */}
                  <div className="relative">
                    <span
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
                      style={{ color: textColor, opacity: 0.5 }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      value={item.unit_price_cents > 0 ? centsToDollars(item.unit_price_cents) : ''}
                      onChange={(e) => updateLineItem(index, 'unit_price_cents', e.target.value)}
                      className="w-full pl-6 pr-2 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1"
                      style={inputStyle}
                    />
                  </div>

                  {/* Line Total */}
                  <span
                    className="text-sm font-medium text-right tabular-nums"
                    style={{ color: textColor }}
                  >
                    ${centsToDollars(lineTotalCents)}
                  </span>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length <= 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70 disabled:opacity-20"
                    style={{ color: textColor }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Line Item Button */}
          <button
            type="button"
            onClick={addLineItem}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: borderColor,
              color: buttonBg,
              backgroundColor: 'transparent',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Item
          </button>
        </div>

        {/* Totals Section */}
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: textColor, opacity: 0.7 }}>
              Subtotal
            </span>
            <span className="text-sm font-medium tabular-nums" style={{ color: textColor }}>
              ${centsToDollars(subtotalCents)}
            </span>
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: textColor, opacity: 0.7 }}>
                Tax
              </span>
              <div className="relative w-20">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full pl-2 pr-6 py-1 rounded-md border text-xs text-right focus:outline-none focus:ring-1"
                  style={inputStyle}
                />
                <span
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                  style={{ color: textColor, opacity: 0.5 }}
                >
                  %
                </span>
              </div>
            </div>
            <span className="text-sm font-medium tabular-nums" style={{ color: textColor }}>
              ${centsToDollars(taxCents)}
            </span>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${borderColor}` }} />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: headingColor }}>
              Total
            </span>
            <span className="text-base font-bold tabular-nums" style={{ color: headingColor }}>
              ${centsToDollars(totalCents)}
            </span>
          </div>
        </div>

        {/* Valid Until */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: headingColor }}
          >
            Valid Until
          </label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1"
            style={inputStyle}
          />
        </div>

        {/* Notes */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: headingColor }}
          >
            Notes
          </label>
          <textarea
            rows={3}
            placeholder="Additional notes, terms, or conditions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-1"
            style={inputStyle}
          />
        </div>

        {/* Action Buttons */}
        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor }}
        >
          {/* Left: Convert to Invoice (conditional) */}
          <div>
            {existingEstimate && onConvertToInvoice && status !== 'invoiced' && (
              <button
                type="button"
                onClick={handleConvertToInvoice}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  borderColor: borderColor,
                  color: textColor,
                  backgroundColor: 'transparent',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Convert to Invoice
              </button>
            )}
          </div>

          {/* Right: Send + Save */}
          <div className="flex items-center gap-2">
            {/* Send to Client (placeholder, disabled) */}
            <button
              type="button"
              disabled
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
              style={{
                borderColor: borderColor,
                color: textColor,
                backgroundColor: 'transparent',
              }}
              title="Coming soon"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Send to Client
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasValidItems}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: buttonBg,
                color: buttonText,
              }}
            >
              {isSaving ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              {isSaving ? 'Saving...' : 'Save Estimate'}
            </button>
          </div>
        </div>
      </div>
    </CenterModal>
  );
}
