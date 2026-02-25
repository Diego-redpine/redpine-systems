'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import CustomSelect from '@/components/ui/CustomSelect';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';

interface BookingSettingsData {
  name: string;
  calendar_type: 'one_on_one';
  duration_minutes: number;
  buffer_minutes: number;
  max_per_day: number | null;
  assignment_mode: 'manual' | 'round_robin' | 'direct_booking';
  availability: Record<string, { enabled: boolean; start: string; end: string }>;
  staff_ids: string[];
  metadata: { max_advance_days: number };
  deposit_percent: number;
  no_show_policy: 'none' | 'charge_deposit' | 'charge_full' | 'charge_custom';
  no_show_fee_cents: number;
}

interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

interface ExistingSettings extends BookingSettingsData {
  id: string;
  is_active?: boolean;
  [key: string]: unknown;
}

interface BookingSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  configColors: DashboardColors;
  existingSettings?: ExistingSettings | null;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const DEFAULT_AVAILABILITY: Record<string, { enabled: boolean; start: string; end: string }> = Object.fromEntries(
  DAYS.map(d => [d, { enabled: !['saturday', 'sunday'].includes(d), start: '09:00', end: '17:00' }])
);

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

const BUFFER_OPTIONS = [
  { value: '0', label: 'No buffer' },
  { value: '5', label: '5 minutes' },
  { value: '10', label: '10 minutes' },
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
];

const ADVANCE_OPTIONS = [
  { value: '7', label: '1 week ahead' },
  { value: '14', label: '2 weeks ahead' },
  { value: '30', label: '1 month ahead' },
  { value: '60', label: '2 months ahead' },
  { value: '90', label: '3 months ahead' },
];

const STEP_NAMES = ['Business Hours', 'Appointment Settings', 'Staff & Assignment', 'Review & Save'];

export default function BookingSetupWizard({
  isOpen,
  onClose,
  onSave,
  configColors,
  existingSettings,
}: BookingSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [data, setData] = useState<BookingSettingsData>(() => {
    if (existingSettings) {
      return {
        name: existingSettings.name,
        calendar_type: 'one_on_one',
        duration_minutes: existingSettings.duration_minutes,
        buffer_minutes: existingSettings.buffer_minutes,
        max_per_day: existingSettings.max_per_day,
        assignment_mode: existingSettings.assignment_mode,
        availability: existingSettings.availability || DEFAULT_AVAILABILITY,
        staff_ids: existingSettings.staff_ids || [],
        metadata: existingSettings.metadata || { max_advance_days: 14 },
        deposit_percent: existingSettings.deposit_percent || 0,
        no_show_policy: existingSettings.no_show_policy || 'none',
        no_show_fee_cents: existingSettings.no_show_fee_cents || 0,
      };
    }
    return {
      name: 'Online Booking',
      calendar_type: 'one_on_one',
      duration_minutes: 60,
      buffer_minutes: 0,
      max_per_day: null,
      assignment_mode: 'manual',
      availability: { ...DEFAULT_AVAILABILITY },
      staff_ids: [],
      metadata: { max_advance_days: 14 },
      deposit_percent: 0,
      no_show_policy: 'none',
      no_show_fee_cents: 0,
    };
  });

  // Colors
  const buttonBg = configColors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const headingColor = configColors.headings || '#1A1A1A';
  const textColor = configColors.text || '#6B7280';
  const mutedColor = '#9CA3AF';
  const borderColor = configColors.borders || '#E5E7EB';
  const cardBg = configColors.cards || '#FFFFFF';
  const pageBg = configColors.background || '#F9FAFB';

  // Fetch staff list
  useEffect(() => {
    if (!isOpen) return;
    setStaffLoading(true);
    fetch('/api/data/staff?pageSize=100')
      .then(res => res.json())
      .then(result => {
        if (result.data && Array.isArray(result.data)) {
          setStaffList(result.data.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            name: (s.name || s.title || 'Staff') as string,
            role: (s.role || s.position || '') as string,
          })));
        }
      })
      .catch(() => setStaffList([]))
      .finally(() => setStaffLoading(false));
  }, [isOpen]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (existingSettings) {
        setData({
          name: existingSettings.name,
          calendar_type: 'one_on_one',
          duration_minutes: existingSettings.duration_minutes,
          buffer_minutes: existingSettings.buffer_minutes,
          max_per_day: existingSettings.max_per_day,
          assignment_mode: existingSettings.assignment_mode,
          availability: existingSettings.availability || DEFAULT_AVAILABILITY,
          staff_ids: existingSettings.staff_ids || [],
          metadata: existingSettings.metadata || { max_advance_days: 14 },
          deposit_percent: existingSettings.deposit_percent || 0,
          no_show_policy: existingSettings.no_show_policy || 'none',
          no_show_fee_cents: existingSettings.no_show_fee_cents || 0,
        });
      }
    }
  }, [isOpen, existingSettings]);

  const canProceed = useCallback(() => {
    if (step === 1) {
      return Object.values(data.availability).some(d => d.enabled);
    }
    if (step === 2) return true;
    if (step === 3) return true;
    return false;
  }, [step, data]);

  const toggleStaff = (id: string) => {
    setData(prev => ({
      ...prev,
      staff_ids: prev.staff_ids.includes(id)
        ? prev.staff_ids.filter(s => s !== id)
        : [...prev.staff_ids, id],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...(existingSettings?.id ? { id: existingSettings.id } : {}),
        name: data.name,
        calendar_type: data.calendar_type,
        duration_minutes: data.duration_minutes,
        buffer_minutes: data.buffer_minutes,
        max_per_day: data.max_per_day,
        assignment_mode: data.assignment_mode,
        availability: data.availability,
        staff_ids: data.assignment_mode === 'manual' ? [] : data.staff_ids,
        metadata: data.metadata,
        deposit_percent: data.deposit_percent,
        no_show_policy: data.no_show_policy,
        no_show_fee_cents: data.no_show_fee_cents,
      };

      const res = await fetch('/api/calendar-settings', {
        method: existingSettings?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      toast.success(existingSettings?.id ? 'Booking settings updated' : 'Online booking activated');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Count open days for summary
  const openDays = DAYS.filter(d => data.availability[d]?.enabled);
  const openDayLabels = openDays.map(d => DAY_LABELS[d]).join(', ');

  const stepLabel = STEP_NAMES[step - 1];
  const subtitle = `Step ${step} of 4 — ${stepLabel}`;

  const inputStyle = {
    border: `1px solid ${borderColor}`,
    backgroundColor: pageBg,
    color: headingColor,
  };

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={isSaving ? () => {} : onClose}
      title="Booking Setup"
      subtitle={subtitle}
      maxWidth="max-w-2xl"
      configColors={configColors}
      noPadding
    >
      <div className="flex flex-col" style={{ minHeight: 400 }}>
        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2 px-6 pt-4 pb-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className="h-2 rounded-full transition-colors"
              style={{
                width: s <= step ? 32 : 8,
                backgroundColor: s <= step ? buttonBg : borderColor,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Step 1: Business Hours */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${buttonBg}15` }}>
                  <svg className="w-6 h-6" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: headingColor }}>Set your business hours</p>
                  <p className="text-xs" style={{ color: mutedColor }}>Customers can only book during these times</p>
                </div>
              </div>

              <div className="space-y-2">
                {DAYS.map(day => {
                  const dayData = data.availability[day] || { enabled: false, start: '09:00', end: '17:00' };
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <button
                        onClick={() => setData(prev => ({
                          ...prev,
                          availability: { ...prev.availability, [day]: { ...dayData, enabled: !dayData.enabled } },
                        }))}
                        className="w-14 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                        style={{
                          backgroundColor: dayData.enabled ? buttonBg : 'transparent',
                          color: dayData.enabled ? buttonText : textColor,
                          border: `1px solid ${dayData.enabled ? buttonBg : borderColor}`,
                        }}
                      >
                        {DAY_LABELS[day]}
                      </button>
                      {dayData.enabled ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={dayData.start}
                            onChange={e => setData(prev => ({
                              ...prev,
                              availability: { ...prev.availability, [day]: { ...dayData, start: e.target.value } },
                            }))}
                            className="px-2.5 py-1.5 rounded-lg text-sm"
                            style={inputStyle}
                          />
                          <span className="text-xs" style={{ color: mutedColor }}>to</span>
                          <input
                            type="time"
                            value={dayData.end}
                            onChange={e => setData(prev => ({
                              ...prev,
                              availability: { ...prev.availability, [day]: { ...dayData, end: e.target.value } },
                            }))}
                            className="px-2.5 py-1.5 rounded-lg text-sm"
                            style={inputStyle}
                          />
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: mutedColor }}>Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Appointment Settings */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${buttonBg}15` }}>
                  <svg className="w-6 h-6" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: headingColor }}>Appointment settings</p>
                  <p className="text-xs" style={{ color: mutedColor }}>Configure duration, buffer time, and limits</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: mutedColor }}>Default Slot Duration</label>
                  <CustomSelect
                    value={String(data.duration_minutes)}
                    onChange={val => setData(prev => ({ ...prev, duration_minutes: parseInt(val, 10) }))}
                    options={DURATION_OPTIONS}
                    style={{ borderColor, backgroundColor: pageBg, color: headingColor }}
                    buttonColor={buttonBg}
                  />
                  <p className="text-xs mt-1.5" style={{ color: mutedColor }}>
                    Fallback when no service is selected. Service durations override this.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: mutedColor }}>Buffer Between</label>
                  <CustomSelect
                    value={String(data.buffer_minutes)}
                    onChange={val => setData(prev => ({ ...prev, buffer_minutes: parseInt(val, 10) }))}
                    options={BUFFER_OPTIONS}
                    style={{ borderColor, backgroundColor: pageBg, color: headingColor }}
                    buttonColor={buttonBg}
                  />
                </div>
              </div>

              {/* Deposit slider */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: headingColor }}>Require deposit</p>
                    <p className="text-xs" style={{ color: mutedColor }}>Clients pay upfront when booking</p>
                  </div>
                  <button
                    onClick={() => setData(prev => ({ ...prev, deposit_percent: prev.deposit_percent > 0 ? 0 : 50 }))}
                    className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                    style={{ backgroundColor: data.deposit_percent > 0 ? buttonBg : borderColor }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                      style={{ transform: data.deposit_percent > 0 ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>

                {data.deposit_percent > 0 && (
                  <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: `${buttonBg}06`, border: `1px solid ${borderColor}` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: mutedColor }}>Deposit percentage</span>
                      <span className="text-sm font-bold" style={{ color: headingColor }}>{data.deposit_percent}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={data.deposit_percent}
                      onChange={e => setData(prev => ({ ...prev, deposit_percent: parseInt(e.target.value, 10) }))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: buttonBg }}
                    />
                    <div className="flex justify-between text-xs" style={{ color: mutedColor }}>
                      <span>10%</span>
                      <span>100%</span>
                    </div>
                    <p className="text-xs" style={{ color: mutedColor }}>
                      For a $100 service, client pays <strong style={{ color: headingColor }}>${data.deposit_percent.toFixed(0)}</strong> upfront ({data.deposit_percent}%)
                    </p>
                  </div>
                )}
              </div>

              {/* No-show protection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: headingColor }}>No-show protection</p>
                    <p className="text-xs" style={{ color: mutedColor }}>Charge clients who miss appointments</p>
                  </div>
                  <button
                    onClick={() => setData(prev => ({
                      ...prev,
                      no_show_policy: prev.no_show_policy === 'none' ? (prev.deposit_percent > 0 ? 'charge_deposit' : 'charge_full') : 'none',
                      no_show_fee_cents: 0,
                    }))}
                    className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                    style={{ backgroundColor: data.no_show_policy !== 'none' ? buttonBg : borderColor }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                      style={{ transform: data.no_show_policy !== 'none' ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>

                {data.no_show_policy !== 'none' && (
                  <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: `${buttonBg}06`, border: `1px solid ${borderColor}` }}>
                    {([
                      { value: 'charge_deposit' as const, label: 'Charge deposit amount', disabled: data.deposit_percent === 0 },
                      { value: 'charge_full' as const, label: 'Charge full service price', disabled: false },
                      { value: 'charge_custom' as const, label: 'Custom fee', disabled: false },
                    ]).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => !opt.disabled && setData(prev => ({ ...prev, no_show_policy: opt.value }))}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                        style={{
                          backgroundColor: data.no_show_policy === opt.value ? `${buttonBg}15` : 'transparent',
                          border: `1px solid ${data.no_show_policy === opt.value ? buttonBg : 'transparent'}`,
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: data.no_show_policy === opt.value ? buttonBg : borderColor }}
                        >
                          {data.no_show_policy === opt.value && (
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: buttonBg }} />
                          )}
                        </div>
                        <span style={{ color: headingColor }}>{opt.label}</span>
                      </button>
                    ))}
                    {data.no_show_policy === 'charge_custom' && (
                      <div className="flex items-center gap-2 pl-7 pt-1">
                        <span className="text-sm" style={{ color: mutedColor }}>$</span>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={data.no_show_fee_cents ? (data.no_show_fee_cents / 100).toFixed(2) : ''}
                          onChange={e => setData(prev => ({ ...prev, no_show_fee_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                          placeholder="25"
                          className="w-24 px-3 py-1.5 rounded-lg text-sm"
                          style={inputStyle}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: mutedColor }}>Booking Window</label>
                  <CustomSelect
                    value={String(data.metadata.max_advance_days)}
                    onChange={val => setData(prev => ({ ...prev, metadata: { ...prev.metadata, max_advance_days: parseInt(val, 10) } }))}
                    options={ADVANCE_OPTIONS}
                    style={{ borderColor, backgroundColor: pageBg, color: headingColor }}
                    buttonColor={buttonBg}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: mutedColor }}>Max Per Day</label>
                  <input
                    type="number"
                    value={data.max_per_day ?? ''}
                    onChange={e => setData(prev => ({ ...prev, max_per_day: e.target.value ? parseInt(e.target.value, 10) : null }))}
                    placeholder="No limit"
                    min={1}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Staff & Assignment */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${buttonBg}15` }}>
                  <svg className="w-6 h-6" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: headingColor }}>Staff & assignment</p>
                  <p className="text-xs" style={{ color: mutedColor }}>
                    {staffList.length > 0 ? 'Choose how bookings are assigned to your team' : 'No staff members found'}
                  </p>
                </div>
              </div>

              {staffLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor, borderTopColor: buttonBg }} />
                </div>
              ) : staffList.length === 0 ? (
                /* No staff — solo mode */
                <div className="p-4 rounded-xl border-2 text-center" style={{ borderColor: buttonBg, backgroundColor: `${buttonBg}08` }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${buttonBg}15` }}>
                    <svg className="w-5 h-5" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: headingColor }}>Solo Mode</p>
                  <p className="text-xs" style={{ color: mutedColor }}>
                    All bookings go directly to you. Add staff members in the Staff tab to enable team scheduling.
                  </p>
                </div>
              ) : (
                /* Has staff — pick assignment mode */
                <>
                  <div className="space-y-2">
                    {([
                      {
                        value: 'manual' as const,
                        title: 'Solo',
                        desc: 'I handle all appointments myself',
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        ),
                      },
                      {
                        value: 'round_robin' as const,
                        title: 'Round Robin',
                        desc: 'Auto-assign to available staff',
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                        ),
                      },
                      {
                        value: 'direct_booking' as const,
                        title: 'Customer Picks',
                        desc: 'Customers choose their provider',
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                      },
                    ]).map(opt => {
                      const selected = data.assignment_mode === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setData(prev => ({ ...prev, assignment_mode: opt.value }))}
                          className="w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors"
                          style={{
                            border: `2px solid ${selected ? buttonBg : borderColor}`,
                            backgroundColor: selected ? `${buttonBg}08` : 'transparent',
                          }}
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${buttonBg}15` }}>
                            <div style={{ color: buttonBg }}>{opt.icon}</div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: headingColor }}>{opt.title}</p>
                            <p className="text-xs" style={{ color: mutedColor }}>{opt.desc}</p>
                          </div>
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: selected ? buttonBg : borderColor }}
                          >
                            {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: buttonBg }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Staff selection — only for round_robin and direct_booking */}
                  {data.assignment_mode !== 'manual' && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: mutedColor }}>
                        Select bookable staff ({data.staff_ids.length} selected)
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {staffList.map(s => {
                          const isSelected = data.staff_ids.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              onClick={() => toggleStaff(s.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                              style={{
                                backgroundColor: isSelected ? `${buttonBg}15` : 'transparent',
                                border: `1px solid ${isSelected ? buttonBg : borderColor}`,
                              }}
                            >
                              <div
                                className="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: isSelected ? buttonBg : 'transparent',
                                  borderColor: isSelected ? buttonBg : borderColor,
                                }}
                              >
                                {isSelected && (
                                  <svg className="w-3 h-3" fill="none" stroke={buttonText} viewBox="0 0 24 24" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium" style={{ color: headingColor }}>{s.name}</span>
                              {s.role && <span className="text-xs" style={{ color: mutedColor }}>{s.role}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${buttonBg}15` }}>
                  <svg className="w-6 h-6" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: headingColor }}>Review your settings</p>
                  <p className="text-xs" style={{ color: mutedColor }}>Make sure everything looks good before saving</p>
                </div>
              </div>

              <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: `${buttonBg}06`, border: `1px solid ${borderColor}` }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: textColor }}>Open Days</span>
                  <span className="text-sm font-semibold" style={{ color: headingColor }}>
                    {openDays.length > 0 ? openDayLabels : 'None'}
                  </span>
                </div>

                {/* Show hours for each open day */}
                {openDays.length > 0 && (
                  <div className="text-xs space-y-1 pl-2 border-l-2 ml-1" style={{ borderColor: `${buttonBg}30` }}>
                    {openDays.map(day => {
                      const d = data.availability[day];
                      return (
                        <div key={day} className="flex justify-between" style={{ color: mutedColor }}>
                          <span>{DAY_LABELS[day]}</span>
                          <span>{d.start} – {d.end}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor }}>
                  <span className="text-sm" style={{ color: textColor }}>Default Duration</span>
                  <span className="text-sm font-semibold" style={{ color: headingColor }}>
                    {data.duration_minutes < 60 ? `${data.duration_minutes} min` : `${data.duration_minutes / 60}h${data.duration_minutes % 60 ? ` ${data.duration_minutes % 60}m` : ''}`}
                  </span>
                </div>

                {data.buffer_minutes > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: textColor }}>Buffer</span>
                    <span className="text-sm font-semibold" style={{ color: headingColor }}>{data.buffer_minutes} min</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: textColor }}>Booking Window</span>
                  <span className="text-sm font-semibold" style={{ color: headingColor }}>
                    {ADVANCE_OPTIONS.find(o => o.value === String(data.metadata.max_advance_days))?.label || `${data.metadata.max_advance_days} days`}
                  </span>
                </div>

                {data.max_per_day && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: textColor }}>Max Per Day</span>
                    <span className="text-sm font-semibold" style={{ color: headingColor }}>{data.max_per_day}</span>
                  </div>
                )}

                {data.deposit_percent > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: textColor }}>Deposit</span>
                    <span className="text-sm font-semibold" style={{ color: headingColor }}>{data.deposit_percent}%</span>
                  </div>
                )}

                {data.no_show_policy !== 'none' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: textColor }}>No-Show Fee</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${buttonBg}15`, color: buttonBg }}>
                      {data.no_show_policy === 'charge_deposit' ? 'Deposit amount'
                        : data.no_show_policy === 'charge_full' ? 'Full price'
                        : `$${(data.no_show_fee_cents / 100).toFixed(2)}`}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor }}>
                  <span className="text-sm" style={{ color: textColor }}>Assignment</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${buttonBg}15`, color: buttonBg }}>
                    {data.assignment_mode === 'manual' ? 'Solo' : data.assignment_mode === 'round_robin' ? 'Round Robin' : 'Customer Picks'}
                  </span>
                </div>

                {data.assignment_mode !== 'manual' && data.staff_ids.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm" style={{ color: textColor }}>Staff</span>
                    <div className="text-right">
                      {data.staff_ids.map(id => {
                        const s = staffList.find(st => st.id === id);
                        return s ? (
                          <span key={id} className="block text-sm font-medium" style={{ color: headingColor }}>{s.name}</span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor }}>
          <button
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-70 disabled:opacity-50"
            style={{ color: textColor }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-5 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {isSaving && (
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `${buttonText}40`, borderTopColor: buttonText }} />
              )}
              {existingSettings?.id ? 'Save Changes' : 'Activate Booking'}
            </button>
          )}
        </div>
      </div>
    </CenterModal>
  );
}
