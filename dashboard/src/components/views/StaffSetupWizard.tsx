'use client';

import React, { useState, useCallback } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import type { StaffModel, PayType, StaffAvailability } from '@/types/data';

interface StaffWizardData {
  staff_model: StaffModel | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  availability: StaffAvailability;
  pay_type: PayType | null;
  pay_rate_cents: number;
  commission_percent: number;
}

interface StaffSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  configColors: DashboardColors;
  isSaving?: boolean;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const DEFAULT_AVAILABILITY: StaffAvailability = Object.fromEntries(
  DAYS.map(d => [d, {
    enabled: !['saturday', 'sunday'].includes(d),
    start: '09:00',
    end: '17:00',
  }])
);

const MODEL_OPTIONS: { value: StaffModel; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'independent',
    title: 'Independent',
    desc: 'Manages own schedule & clients. Commission or booth rental.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    value: 'employee',
    title: 'Employee',
    desc: 'Owner assigns shifts. Hourly or salary.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    value: 'instructor',
    title: 'Instructor',
    desc: 'Teaches classes, may do 1-on-1. Per-class rate.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
];

function getRoleLabel(model: StaffModel | null): string {
  if (model === 'independent') return 'Title';
  if (model === 'instructor') return 'Specialty';
  return 'Position';
}

function getRolePlaceholder(model: StaffModel | null): string {
  if (model === 'independent') return 'e.g. Senior Stylist, Lead Tattoo Artist';
  if (model === 'instructor') return 'e.g. Yoga Instructor, Personal Trainer';
  return 'e.g. Front Desk, Manager, Technician';
}

function getPayOptions(model: StaffModel): { value: PayType; label: string }[] {
  if (model === 'independent') return [
    { value: 'commission', label: 'Commission %' },
    { value: 'booth_rental', label: 'Booth Rental ($/month)' },
  ];
  if (model === 'employee') return [
    { value: 'hourly', label: 'Hourly Rate ($)' },
    { value: 'salary', label: 'Salary ($/year)' },
  ];
  return [
    { value: 'per_class', label: 'Per-Class Rate ($)' },
  ];
}

function formatPaySummary(data: StaffWizardData): string {
  if (!data.pay_type) return 'Not set';
  const rate = data.pay_rate_cents / 100;
  switch (data.pay_type) {
    case 'commission': return `${data.commission_percent}% commission`;
    case 'booth_rental': return `$${rate}/month booth rental`;
    case 'hourly': return `$${rate}/hour`;
    case 'salary': return `$${rate.toLocaleString()}/year`;
    case 'per_class': {
      const base = `$${rate}/class`;
      return data.commission_percent > 0 ? `${base} + ${data.commission_percent}% for 1-on-1` : base;
    }
    default: return 'Not set';
  }
}

export default function StaffSetupWizard({
  isOpen,
  onClose,
  onSave,
  configColors,
  isSaving,
}: StaffSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<StaffWizardData>({
    staff_model: null,
    name: '',
    email: '',
    phone: '',
    role: '',
    availability: { ...DEFAULT_AVAILABILITY },
    pay_type: null,
    pay_rate_cents: 0,
    commission_percent: 0,
  });

  const buttonBg = configColors.buttons || '#4F46E5';
  const buttonText = getContrastText(buttonBg);
  const textColor = configColors.text || '#1A1A1A';
  const mutedColor = configColors.text ? `${configColors.text}99` : '#6B7280';
  const borderColor = configColors.borders || '#E5E7EB';
  const cardBg = configColors.cards || '#FFFFFF';
  const pageBg = configColors.background || '#F5F5F5';

  // Steps: Employee skips step 3 (availability)
  const allSteps = data.staff_model === 'employee'
    ? [1, 2, 4, 5]
    : [1, 2, 3, 4, 5];
  const currentIdx = allSteps.indexOf(step);
  const totalSteps = allSteps.length;
  const canGoNext = currentIdx < totalSteps - 1;
  const canGoBack = currentIdx > 0;

  const goNext = useCallback(() => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < allSteps.length) setStep(allSteps[nextIdx]);
  }, [currentIdx, allSteps]);

  const goBack = useCallback(() => {
    const prevIdx = currentIdx - 1;
    if (prevIdx >= 0) setStep(allSteps[prevIdx]);
  }, [currentIdx, allSteps]);

  const handleSave = useCallback(() => {
    const record: Record<string, unknown> = {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      role: data.role || undefined,
      staff_model: data.staff_model,
      pay_type: data.pay_type,
      pay_rate_cents: data.pay_type === 'commission' ? 0 : data.pay_rate_cents,
      commission_percent: data.commission_percent || undefined,
      availability: data.staff_model !== 'employee' ? data.availability : undefined,
      is_active: true,
    };
    // For hourly, also set legacy hourly_rate_cents
    if (data.pay_type === 'hourly') {
      record.hourly_rate_cents = data.pay_rate_cents;
    }
    onSave(record);
  }, [data, onSave]);

  const handleClose = useCallback(() => {
    setStep(1);
    setData({
      staff_model: null, name: '', email: '', phone: '', role: '',
      availability: { ...DEFAULT_AVAILABILITY },
      pay_type: null, pay_rate_cents: 0, commission_percent: 0,
    });
    onClose();
  }, [onClose]);

  // Validation per step
  const isStepValid = (): boolean => {
    switch (step) {
      case 1: return data.staff_model !== null;
      case 2: return data.name.trim().length > 0;
      case 3: return true; // availability always valid
      case 4: return data.pay_type !== null;
      case 5: return true;
      default: return false;
    }
  };

  const stepTitles: Record<number, string> = {
    1: 'Work Model',
    2: 'Basic Info',
    3: 'Availability',
    4: 'Pay Structure',
    5: 'Confirm',
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: pageBg,
    borderColor,
    color: textColor,
  };

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Team Member"
      subtitle={`Step ${currentIdx + 1} of ${totalSteps} — ${stepTitles[step]}`}
      maxWidth="max-w-2xl"
      configColors={configColors}
      noPadding
    >
      <div className="flex flex-col" style={{ minHeight: 400 }}>
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-5 pt-4 pb-2">
          {allSteps.map((s, i) => (
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

          {/* STEP 1: Work Model */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                How does this team member work?
              </p>
              <div className="grid grid-cols-3 gap-3">
                {MODEL_OPTIONS.map(opt => {
                  const selected = data.staff_model === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setData(d => ({
                          ...d,
                          staff_model: opt.value,
                          pay_type: null,
                          pay_rate_cents: 0,
                          commission_percent: 0,
                        }));
                      }}
                      className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 text-center transition-all hover:shadow-md"
                      style={{
                        borderColor: selected ? buttonBg : borderColor,
                        backgroundColor: selected ? `${buttonBg}08` : cardBg,
                        boxShadow: selected ? `0 0 0 1px ${buttonBg}` : undefined,
                      }}
                    >
                      <div style={{ color: selected ? buttonBg : mutedColor }}>
                        {opt.icon}
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

          {/* STEP 2: Basic Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={e => setData(d => ({ ...d, email: e.target.value }))}
                    placeholder="john@email.com"
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                    style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                    style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                  {getRoleLabel(data.staff_model)}
                </label>
                <input
                  type="text"
                  value={data.role}
                  onChange={e => setData(d => ({ ...d, role: e.target.value }))}
                  placeholder={getRolePlaceholder(data.staff_model)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Availability */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: mutedColor }}>
                Set default weekly availability
              </p>
              {DAYS.map(day => {
                const dayData = data.availability[day] || { enabled: false, start: '09:00', end: '17:00' };
                return (
                  <div
                    key={day}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                    style={{ backgroundColor: dayData.enabled ? `${buttonBg}06` : 'transparent' }}
                  >
                    {/* Toggle */}
                    <button
                      onClick={() => setData(d => ({
                        ...d,
                        availability: {
                          ...d.availability,
                          [day]: { ...dayData, enabled: !dayData.enabled },
                        },
                      }))}
                      className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                      style={{
                        backgroundColor: dayData.enabled ? buttonBg : borderColor,
                      }}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                        style={{
                          transform: dayData.enabled ? 'translateX(22px)' : 'translateX(2px)',
                        }}
                      />
                    </button>

                    {/* Day label */}
                    <span
                      className="text-sm font-medium w-10"
                      style={{ color: dayData.enabled ? textColor : mutedColor }}
                    >
                      {DAY_LABELS[day]}
                    </span>

                    {/* Time pickers */}
                    {dayData.enabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={dayData.start}
                          onChange={e => setData(d => ({
                            ...d,
                            availability: {
                              ...d.availability,
                              [day]: { ...dayData, start: e.target.value },
                            },
                          }))}
                          className="px-2 py-1.5 rounded-lg border text-xs outline-none"
                          style={inputStyle}
                        />
                        <span className="text-xs" style={{ color: mutedColor }}>to</span>
                        <input
                          type="time"
                          value={dayData.end}
                          onChange={e => setData(d => ({
                            ...d,
                            availability: {
                              ...d.availability,
                              [day]: { ...dayData, end: e.target.value },
                            },
                          }))}
                          className="px-2 py-1.5 rounded-lg border text-xs outline-none"
                          style={inputStyle}
                        />
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: mutedColor }}>Off</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 4: Pay Structure */}
          {step === 4 && data.staff_model && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                How is this team member compensated?
              </p>

              {/* Pay type selection */}
              <div className="flex gap-2">
                {getPayOptions(data.staff_model).map(opt => {
                  const selected = data.pay_type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setData(d => ({ ...d, pay_type: opt.value, pay_rate_cents: 0, commission_percent: 0 }))}
                      className="flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all"
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

              {/* Rate input */}
              {data.pay_type && (
                <div className="space-y-3 mt-4">
                  {data.pay_type === 'commission' ? (
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                        Commission Percentage
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={data.commission_percent || ''}
                          onChange={e => setData(d => ({ ...d, commission_percent: parseFloat(e.target.value) || 0 }))}
                          placeholder="e.g. 60"
                          className="w-32 px-3 py-2.5 rounded-lg border text-sm outline-none"
                          style={inputStyle}
                        />
                        <span className="text-sm font-medium" style={{ color: mutedColor }}>%</span>
                      </div>
                    </div>
                  ) : data.pay_type === 'per_class' ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                          Rate Per Class
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: mutedColor }}>$</span>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={data.pay_rate_cents ? (data.pay_rate_cents / 100).toFixed(2) : ''}
                            onChange={e => setData(d => ({ ...d, pay_rate_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                            placeholder="e.g. 75.00"
                            className="w-40 px-3 py-2.5 rounded-lg border text-sm outline-none"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                          Commission for 1-on-1 Sessions (optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={data.commission_percent || ''}
                            onChange={e => setData(d => ({ ...d, commission_percent: parseFloat(e.target.value) || 0 }))}
                            placeholder="e.g. 70"
                            className="w-32 px-3 py-2.5 rounded-lg border text-sm outline-none"
                            style={inputStyle}
                          />
                          <span className="text-sm font-medium" style={{ color: mutedColor }}>%</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>
                        {data.pay_type === 'booth_rental' ? 'Monthly Rental Amount'
                          : data.pay_type === 'hourly' ? 'Hourly Rate'
                          : 'Annual Salary'}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: mutedColor }}>$</span>
                        <input
                          type="number"
                          min={0}
                          step={data.pay_type === 'salary' ? 1000 : 0.01}
                          value={data.pay_rate_cents ? (data.pay_rate_cents / 100).toFixed(data.pay_type === 'salary' ? 0 : 2) : ''}
                          onChange={e => setData(d => ({ ...d, pay_rate_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                          placeholder={data.pay_type === 'salary' ? 'e.g. 45000' : data.pay_type === 'booth_rental' ? 'e.g. 1200' : 'e.g. 18.50'}
                          className="w-40 px-3 py-2.5 rounded-lg border text-sm outline-none"
                          style={inputStyle}
                        />
                        <span className="text-xs" style={{ color: mutedColor }}>
                          {data.pay_type === 'booth_rental' ? '/month'
                            : data.pay_type === 'hourly' ? '/hour'
                            : '/year'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Confirmation */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                Review and confirm
              </p>
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor, backgroundColor: pageBg }}
              >
                <Row label="Name" value={data.name} textColor={textColor} mutedColor={mutedColor} />
                {data.email && <Row label="Email" value={data.email} textColor={textColor} mutedColor={mutedColor} />}
                {data.phone && <Row label="Phone" value={data.phone} textColor={textColor} mutedColor={mutedColor} />}
                {data.role && <Row label={getRoleLabel(data.staff_model)} value={data.role} textColor={textColor} mutedColor={mutedColor} />}
                <div className="border-t" style={{ borderColor }} />
                <Row
                  label="Work Model"
                  value={data.staff_model === 'independent' ? 'Independent' : data.staff_model === 'employee' ? 'Employee' : 'Instructor'}
                  textColor={textColor}
                  mutedColor={mutedColor}
                  badge
                  badgeBg={buttonBg}
                  badgeText={buttonText}
                />
                <Row label="Compensation" value={formatPaySummary(data)} textColor={textColor} mutedColor={mutedColor} />
                {data.staff_model !== 'employee' && (
                  <Row
                    label="Availability"
                    value={DAYS.filter(d => data.availability[d]?.enabled).map(d => DAY_LABELS[d]).join(', ') || 'None set'}
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
            onClick={canGoBack ? goBack : handleClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
            style={{ borderColor, color: textColor }}
          >
            {canGoBack ? 'Back' : 'Cancel'}
          </button>

          {step === 5 ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {isSaving ? 'Adding...' : 'Add Team Member'}
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

// Summary row for confirmation step
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
