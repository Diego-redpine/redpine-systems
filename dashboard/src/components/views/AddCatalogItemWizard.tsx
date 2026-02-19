'use client';

import React, { useState, useCallback } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface CatalogItemData {
  item_type: 'service' | 'product' | null;
  name: string;
  description: string;
  price: string; // display string, converted to cents on save
  category: string;
  duration_minutes: number;
  buffer_minutes: number;
  sku: string;
  quantity: string; // display string, converted to int on save
}

interface AddCatalogItemWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  configColors: DashboardColors;
  isSaving?: boolean;
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const BUFFER_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
];

const INITIAL_DATA: CatalogItemData = {
  item_type: null,
  name: '',
  description: '',
  price: '',
  category: '',
  duration_minutes: 60,
  buffer_minutes: 0,
  sku: '',
  quantity: '',
};

export default function AddCatalogItemWizard({
  isOpen,
  onClose,
  onSave,
  configColors,
  isSaving,
}: AddCatalogItemWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CatalogItemData>({ ...INITIAL_DATA });

  const buttonBg = configColors.buttons || '#4F46E5';
  const buttonText = getContrastText(buttonBg);
  const textColor = configColors.text || '#1A1A1A';
  const mutedColor = configColors.text ? `${configColors.text}99` : '#6B7280';
  const borderColor = configColors.borders || '#E5E7EB';
  const cardBg = configColors.cards || '#FFFFFF';
  const pageBg = configColors.background || '#F5F5F5';

  const steps = [1, 2, 3];
  const currentIdx = steps.indexOf(step);

  const goNext = useCallback(() => {
    if (currentIdx < steps.length - 1) setStep(steps[currentIdx + 1]);
  }, [currentIdx, steps]);

  const goBack = useCallback(() => {
    if (currentIdx > 0) setStep(steps[currentIdx - 1]);
  }, [currentIdx, steps]);

  const handleSave = useCallback(() => {
    const priceCents = Math.round(parseFloat(data.price || '0') * 100);
    const record: Record<string, unknown> = {
      name: data.name,
      description: data.description || undefined,
      price_cents: priceCents,
      category: data.category || undefined,
      item_type: data.item_type,
      is_active: true,
    };
    if (data.item_type === 'service') {
      record.duration_minutes = data.duration_minutes;
      record.buffer_minutes = data.buffer_minutes;
    } else {
      if (data.sku) record.sku = data.sku;
      if (data.quantity) record.quantity = parseInt(data.quantity) || undefined;
    }
    onSave(record);
  }, [data, onSave]);

  const handleClose = useCallback(() => {
    setStep(1);
    setData({ ...INITIAL_DATA });
    onClose();
  }, [onClose]);

  const isStepValid = (): boolean => {
    switch (step) {
      case 1: return data.item_type !== null;
      case 2: return data.name.trim().length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const stepTitles: Record<number, string> = {
    1: 'Item Type',
    2: 'Details',
    3: 'Review',
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: pageBg,
    borderColor,
    color: textColor,
  };

  const priceCentsForDisplay = Math.round(parseFloat(data.price || '0') * 100);
  const typeLabel = data.item_type === 'service' ? 'Service' : 'Product';

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={handleClose}
      title={data.item_type ? `Add ${typeLabel}` : 'Add Item'}
      subtitle={`Step ${currentIdx + 1} of ${steps.length} — ${stepTitles[step]}`}
      maxWidth="max-w-2xl"
      configColors={configColors}
      noPadding
    >
      <div className="flex flex-col" style={{ minHeight: 380 }}>
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-5 pt-4 pb-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === currentIdx ? 32 : 16,
                backgroundColor: i <= currentIdx ? buttonBg : borderColor,
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 px-5 py-4">

          {/* STEP 1: Type Picker */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                What kind of item are you adding?
              </p>
              <div className="grid grid-cols-2 gap-4">
                {([
                  {
                    value: 'service' as const,
                    title: 'Service',
                    desc: 'Bookable appointment with a duration and price',
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  },
                  {
                    value: 'product' as const,
                    title: 'Product',
                    desc: 'Physical or digital item for sale with inventory',
                    icon: (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    ),
                  },
                ]).map(opt => {
                  const selected = data.item_type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setData(d => ({ ...d, item_type: opt.value }))}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 text-center transition-all hover:shadow-md"
                      style={{
                        borderColor: selected ? buttonBg : borderColor,
                        backgroundColor: selected ? `${buttonBg}08` : cardBg,
                        boxShadow: selected ? `0 0 0 1px ${buttonBg}` : undefined,
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${buttonBg}15` }}
                      >
                        <div style={{ color: buttonBg }}>{opt.icon}</div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: textColor }}>
                          {opt.title}
                        </p>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: mutedColor }}>
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                  placeholder={data.item_type === 'service' ? 'e.g. Gel Manicure, Deep Tissue Massage' : 'e.g. Hair Oil, Gift Card'}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                    Price *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: mutedColor }}>$</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={data.price}
                      onChange={e => setData(d => ({ ...d, price: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                      style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={data.category}
                    onChange={e => setData(d => ({ ...d, category: e.target.value }))}
                    placeholder={data.item_type === 'service' ? 'e.g. Nails, Massage' : 'e.g. Hair Care, Accessories'}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                    style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Duration + Buffer — service only */}
              {data.item_type === 'service' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                      Duration
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_OPTIONS.map(opt => {
                        const selected = data.duration_minutes === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setData(d => ({ ...d, duration_minutes: opt.value }))}
                            className="px-3.5 py-2 rounded-lg border-2 text-xs font-medium transition-all"
                            style={{
                              borderColor: selected ? buttonBg : borderColor,
                              backgroundColor: selected ? `${buttonBg}10` : 'transparent',
                              color: selected ? buttonBg : textColor,
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                      Buffer Time
                    </label>
                    <p className="text-xs mb-2" style={{ color: mutedColor }}>
                      Gap between this service and the next appointment
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {BUFFER_OPTIONS.map(opt => {
                        const selected = data.buffer_minutes === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setData(d => ({ ...d, buffer_minutes: opt.value }))}
                            className="px-3.5 py-2 rounded-lg border-2 text-xs font-medium transition-all"
                            style={{
                              borderColor: selected ? buttonBg : borderColor,
                              backgroundColor: selected ? `${buttonBg}10` : 'transparent',
                              color: selected ? buttonBg : textColor,
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* SKU + Stock — product only */}
              {data.item_type === 'product' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                      SKU
                    </label>
                    <input
                      type="text"
                      value={data.sku}
                      onChange={e => setData(d => ({ ...d, sku: e.target.value }))}
                      placeholder="e.g. OPI-001"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                      style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={data.quantity}
                      onChange={e => setData(d => ({ ...d, quantity: e.target.value }))}
                      placeholder="e.g. 50"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                      style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                  Description
                </label>
                <textarea
                  value={data.description}
                  onChange={e => setData(d => ({ ...d, description: e.target.value }))}
                  placeholder={data.item_type === 'service' ? 'What does this service include?' : 'Product details'}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
                  style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Review & Save */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                Review and confirm
              </p>
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor, backgroundColor: pageBg }}
              >
                <Row label="Type" value={typeLabel} textColor={textColor} mutedColor={mutedColor} badge badgeBg={buttonBg} badgeText={buttonText} />
                <Row label="Name" value={data.name} textColor={textColor} mutedColor={mutedColor} />
                <Row
                  label="Price"
                  value={priceCentsForDisplay > 0 ? `$${(priceCentsForDisplay / 100).toFixed(2)}` : 'Free'}
                  textColor={textColor}
                  mutedColor={mutedColor}
                />
                {data.category && <Row label="Category" value={data.category} textColor={textColor} mutedColor={mutedColor} />}

                <div className="border-t" style={{ borderColor }} />

                {data.item_type === 'service' && (
                  <>
                    <Row
                      label="Duration"
                      value={DURATION_OPTIONS.find(d => d.value === data.duration_minutes)?.label || `${data.duration_minutes} min`}
                      textColor={textColor}
                      mutedColor={mutedColor}
                    />
                    <Row
                      label="Buffer"
                      value={BUFFER_OPTIONS.find(b => b.value === data.buffer_minutes)?.label || `${data.buffer_minutes} min`}
                      textColor={textColor}
                      mutedColor={mutedColor}
                    />
                  </>
                )}
                {data.item_type === 'product' && data.sku && (
                  <Row label="SKU" value={data.sku} textColor={textColor} mutedColor={mutedColor} />
                )}
                {data.item_type === 'product' && data.quantity && (
                  <Row label="Stock" value={data.quantity} textColor={textColor} mutedColor={mutedColor} />
                )}
                {data.description && (
                  <Row
                    label="Description"
                    value={data.description.length > 80 ? data.description.slice(0, 80) + '...' : data.description}
                    textColor={textColor}
                    mutedColor={mutedColor}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-t shrink-0"
          style={{ borderColor }}
        >
          <button
            onClick={currentIdx > 0 ? goBack : handleClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
            style={{ borderColor, color: textColor }}
          >
            {currentIdx > 0 ? 'Back' : 'Cancel'}
          </button>

          {step === 3 ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {isSaving ? 'Adding...' : `Add ${typeLabel}`}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!isStepValid()}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </CenterModal>
  );
}

// Summary row for review step
function Row({ label, value, textColor, mutedColor, badge, badgeBg, badgeText }: {
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
  badge?: boolean;
  badgeBg?: string;
  badgeText?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium" style={{ color: mutedColor }}>{label}</span>
      {badge ? (
        <span
          className="text-xs font-medium px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: badgeBg, color: badgeText }}
        >
          {value}
        </span>
      ) : (
        <span className="text-sm font-medium" style={{ color: textColor }}>{value}</span>
      )}
    </div>
  );
}
