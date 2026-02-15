'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface CalendarSettingsData {
  name: string;
  calendar_type: 'one_on_one' | 'group' | 'shift';
  duration_minutes: number;
  buffer_minutes: number;
  max_per_day: number | null;
  max_group_size: number | null;
  assignment_mode: 'round_robin' | 'manual' | 'direct_booking';
  availability: Record<string, { enabled: boolean; start: string; end: string }>;
  staff_ids: string[];
}

interface StaffMember {
  id: string;
  name: string;
  role?: string;
  availability?: Record<string, { enabled: boolean; start: string; end: string }>;
}

interface CalendarWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CalendarSettingsData) => void;
  configColors: DashboardColors;
  isSaving?: boolean;
  editData?: CalendarSettingsData | null;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const DEFAULT_AVAILABILITY: Record<string, { enabled: boolean; start: string; end: string }> = Object.fromEntries(
  DAYS.map(d => [d, { enabled: !['saturday', 'sunday'].includes(d), start: '09:00', end: '17:00' }])
);

const TYPE_OPTIONS: { value: CalendarSettingsData['calendar_type']; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'one_on_one',
    title: '1-on-1',
    desc: 'Private appointments. One client, one time slot.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    value: 'group',
    title: 'Group',
    desc: 'Classes or workshops. Multiple clients per slot.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    value: 'shift',
    title: 'Shift',
    desc: 'Staff shift scheduling. Track hours and coverage.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const ASSIGNMENT_OPTIONS: { value: CalendarSettingsData['assignment_mode']; title: string; desc: string }[] = [
  { value: 'round_robin', title: 'Round Robin', desc: 'Automatically rotate between available staff' },
  { value: 'manual', title: 'Manual', desc: 'Owner assigns staff to each booking' },
  { value: 'direct_booking', title: 'Direct Booking', desc: 'Clients pick their preferred staff member' },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];

export default function CalendarWizard({ isOpen, onClose, onSave, configColors, isSaving, editData }: CalendarWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [data, setData] = useState<CalendarSettingsData>({
    name: '',
    calendar_type: 'one_on_one',
    duration_minutes: 60,
    buffer_minutes: 0,
    max_per_day: null,
    max_group_size: null,
    assignment_mode: 'manual',
    availability: { ...DEFAULT_AVAILABILITY },
    staff_ids: [],
  });

  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setData(editData);
      } else {
        setData({
          name: '',
          calendar_type: 'one_on_one',
          duration_minutes: 60,
          buffer_minutes: 0,
          max_per_day: null,
          max_group_size: null,
          assignment_mode: 'manual',
          availability: { ...DEFAULT_AVAILABILITY },
          staff_ids: [],
        });
      }
      setStep(1);
    }
  }, [isOpen, editData]);

  // Fetch staff list
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/data/staff?pageSize=100', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStaffList(json.data);
        }
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchStaff();
  }, [isOpen, fetchStaff]);

  const buttonBg = configColors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = configColors.cards || '#FFFFFF';
  const textColor = configColors.text || '#6B7280';
  const headingColor = configColors.headings || '#1A1A1A';
  const borderColor = configColors.borders || '#E5E7EB';

  const canProceed = () => {
    switch (step) {
      case 1: return !!data.calendar_type;
      case 2: return !!data.name && data.duration_minutes > 0;
      case 3: return Object.values(data.availability).some(d => d.enabled);
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onSave(data);
  };

  const toggleStaff = (staffId: string) => {
    setData(prev => ({
      ...prev,
      staff_ids: prev.staff_ids.includes(staffId)
        ? prev.staff_ids.filter(id => id !== staffId)
        : [...prev.staff_ids, staffId],
    }));
  };

  return (
    <CenterModal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Calendar' : 'Set Up Calendar'}>
      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i < step ? buttonBg : borderColor }}
          />
        ))}
      </div>

      {/* Step 1: Calendar Type */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm mb-4" style={{ color: textColor }}>
            What type of calendar are you setting up?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TYPE_OPTIONS.map(opt => {
              const selected = data.calendar_type === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setData(prev => ({ ...prev, calendar_type: opt.value }))}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: selected ? buttonBg : cardBg,
                    color: selected ? buttonText : headingColor,
                    border: `2px solid ${selected ? buttonBg : borderColor}`,
                  }}
                >
                  <div className="mb-3" style={{ color: selected ? buttonText : textColor }}>{opt.icon}</div>
                  <p className="font-semibold text-sm">{opt.title}</p>
                  <p className="text-xs mt-1 opacity-75">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: headingColor }}>Calendar Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={data.calendar_type === 'shift' ? 'Staff Shifts' : data.calendar_type === 'group' ? 'Group Classes' : 'Appointments'}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: headingColor }}>Duration</label>
              <select
                value={data.duration_minutes}
                onChange={(e) => setData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
              >
                {DURATION_OPTIONS.map(d => (
                  <option key={d} value={d}>{d < 60 ? `${d} min` : `${d / 60}h${d % 60 ? ` ${d % 60}m` : ''}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: headingColor }}>Buffer Between</label>
              <select
                value={data.buffer_minutes}
                onChange={(e) => setData(prev => ({ ...prev, buffer_minutes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
              >
                {BUFFER_OPTIONS.map(b => (
                  <option key={b} value={b}>{b === 0 ? 'No buffer' : `${b} min`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: headingColor }}>Max Per Day</label>
              <input
                type="number"
                value={data.max_per_day ?? ''}
                onChange={(e) => setData(prev => ({ ...prev, max_per_day: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="No limit"
                min={1}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
              />
            </div>

            {data.calendar_type === 'group' && (
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: headingColor }}>Max Group Size</label>
                <input
                  type="number"
                  value={data.max_group_size ?? ''}
                  onChange={(e) => setData(prev => ({ ...prev, max_group_size: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="No limit"
                  min={2}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Availability + Staff */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: headingColor }}>Business Hours</p>
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
                      className="w-12 text-xs font-semibold py-1 rounded-md transition-colors"
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
                          onChange={(e) => setData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, [day]: { ...dayData, start: e.target.value } },
                          }))}
                          className="px-2 py-1 rounded text-sm"
                          style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
                        />
                        <span className="text-xs" style={{ color: textColor }}>to</span>
                        <input
                          type="time"
                          value={dayData.end}
                          onChange={(e) => setData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, [day]: { ...dayData, end: e.target.value } },
                          }))}
                          className="px-2 py-1 rounded text-sm"
                          style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
                        />
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: textColor }}>Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {data.calendar_type !== 'shift' && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: headingColor }}>Staff Assignment</p>
              <div className="space-y-2 mb-3">
                {ASSIGNMENT_OPTIONS.map(opt => {
                  const selected = data.assignment_mode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setData(prev => ({ ...prev, assignment_mode: opt.value }))}
                      className="w-full p-3 rounded-lg text-left flex items-center gap-3 transition-colors"
                      style={{
                        backgroundColor: selected ? buttonBg : cardBg,
                        color: selected ? buttonText : headingColor,
                        border: `1px solid ${selected ? buttonBg : borderColor}`,
                      }}
                    >
                      <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                        style={{ borderColor: selected ? buttonText : borderColor }}
                      >
                        {selected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: buttonText }} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{opt.title}</p>
                        <p className="text-xs opacity-75">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Staff selection */}
          {staffList.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: headingColor }}>
                {data.calendar_type === 'shift' ? 'Staff on this schedule' : 'Assigned staff'}
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {staffList.map(s => {
                  const selected = data.staff_ids.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleStaff(s.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        backgroundColor: selected ? `${buttonBg}15` : 'transparent',
                        border: `1px solid ${selected ? buttonBg : borderColor}`,
                        color: headingColor,
                      }}
                    >
                      <div className="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: selected ? buttonBg : 'transparent',
                          borderColor: selected ? buttonBg : borderColor,
                        }}
                      >
                        {selected && (
                          <svg className="w-3 h-3" fill="none" stroke={buttonText} viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">{s.name}</span>
                      {s.role && <span className="text-xs opacity-60">{s.role}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: `${buttonBg}08`, border: `1px solid ${borderColor}` }}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: textColor }}>Calendar Name</span>
              <span className="text-sm font-semibold" style={{ color: headingColor }}>{data.name || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: textColor }}>Type</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: buttonBg, color: buttonText }}>
                {TYPE_OPTIONS.find(t => t.value === data.calendar_type)?.title}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: textColor }}>Duration</span>
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
            {data.max_per_day && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: textColor }}>Max per day</span>
                <span className="text-sm font-semibold" style={{ color: headingColor }}>{data.max_per_day}</span>
              </div>
            )}
            {data.calendar_type === 'group' && data.max_group_size && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: textColor }}>Max group size</span>
                <span className="text-sm font-semibold" style={{ color: headingColor }}>{data.max_group_size}</span>
              </div>
            )}
            {data.calendar_type !== 'shift' && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: textColor }}>Assignment</span>
                <span className="text-sm font-semibold" style={{ color: headingColor }}>
                  {ASSIGNMENT_OPTIONS.find(a => a.value === data.assignment_mode)?.title}
                </span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <span className="text-sm" style={{ color: textColor }}>Hours</span>
              <div className="text-right">
                {DAYS.filter(d => data.availability[d]?.enabled).map(d => (
                  <p key={d} className="text-xs" style={{ color: headingColor }}>
                    <span className="font-medium">{DAY_LABELS[d]}</span> {data.availability[d].start}–{data.availability[d].end}
                  </p>
                ))}
                {DAYS.every(d => !data.availability[d]?.enabled) && (
                  <p className="text-xs" style={{ color: textColor }}>No hours set</p>
                )}
              </div>
            </div>
            {data.staff_ids.length > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-sm" style={{ color: textColor }}>Staff</span>
                <div className="text-right">
                  {data.staff_ids.map(sid => {
                    const s = staffList.find(st => st.id === sid);
                    return <p key={sid} className="text-xs font-medium" style={{ color: headingColor }}>{s?.name || sid}</p>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={step === 1 ? onClose : () => setStep(step - 1)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ color: textColor }}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || isSaving}
          className="px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: buttonBg, color: buttonText }}
        >
          {isSaving ? 'Saving...' : step === totalSteps ? (editData ? 'Save Changes' : 'Create Calendar') : 'Next'}
        </button>
      </div>
    </CenterModal>
  );
}
