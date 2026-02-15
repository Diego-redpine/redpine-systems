'use client';

import React, { useState, useCallback, useEffect } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

type EventType = 'appointment' | 'class' | 'shift';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  configColors: DashboardColors;
  isSaving?: boolean;
  prefillDate?: string;
  prefillStartTime?: string;
  prefillEndTime?: string;
}

interface EventFormData {
  event_type: EventType | null;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  recurrence: string;
  notes: string;
  client: string;
  staff_member: string;
  instructor: string;
  max_capacity: string;
  employee: string;
  role: string;
}

const EVENT_TYPE_OPTIONS: { value: EventType; title: string; desc: string; icon: React.ReactNode; defaultColor: string }[] = [
  {
    value: 'appointment',
    title: 'Appointment',
    desc: '1-on-1 with a client',
    defaultColor: '#3B82F6',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
  },
  {
    value: 'class',
    title: 'Class',
    desc: 'Group session with capacity',
    defaultColor: '#8B5CF6',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    value: 'shift',
    title: 'Shift',
    desc: 'Staff work schedule',
    defaultColor: '#10B981',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

const INITIAL_DATA: EventFormData = {
  event_type: null,
  title: '',
  date: '',
  start_time: '',
  end_time: '',
  recurrence: 'none',
  notes: '',
  client: '',
  staff_member: '',
  instructor: '',
  max_capacity: '',
  employee: '',
  role: '',
};

export default function AddEventModal({
  isOpen,
  onClose,
  onSave,
  configColors,
  isSaving,
  prefillDate,
  prefillStartTime,
  prefillEndTime,
}: AddEventModalProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EventFormData>({ ...INITIAL_DATA });

  const buttonBg = configColors.buttons || '#4F46E5';
  const buttonText = getContrastText(buttonBg);
  const textColor = configColors.text || '#1A1A1A';
  const mutedColor = configColors.text ? `${configColors.text}99` : '#6B7280';
  const borderColor = configColors.borders || '#E5E7EB';
  const cardBg = configColors.cards || '#FFFFFF';
  const pageBg = configColors.background || '#F5F5F5';

  // Prefill date/time from calendar selection
  useEffect(() => {
    if (!isOpen) return;
    const updates: Partial<EventFormData> = {};
    if (prefillDate) {
      updates.date = prefillDate;
    }
    if (prefillStartTime) {
      const d = new Date(prefillStartTime);
      updates.date = d.toISOString().split('T')[0];
      updates.start_time = d.toTimeString().slice(0, 5);
    }
    if (prefillEndTime) {
      const d = new Date(prefillEndTime);
      updates.end_time = d.toTimeString().slice(0, 5);
    }
    if (Object.keys(updates).length > 0) {
      setData(prev => ({ ...prev, ...updates }));
    }
  }, [isOpen, prefillDate, prefillStartTime, prefillEndTime]);

  const handleClose = useCallback(() => {
    setStep(1);
    setData({ ...INITIAL_DATA });
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    const startDateTime = `${data.date}T${data.start_time}:00`;
    const endDateTime = `${data.date}T${data.end_time}:00`;
    const defaultColor = EVENT_TYPE_OPTIONS.find(o => o.value === data.event_type)?.defaultColor || '#3B82F6';

    const record: Record<string, unknown> = {
      title: data.event_type === 'shift' ? `${data.employee}${data.role ? ' — ' + data.role : ''}` : data.title,
      start_time: startDateTime,
      end_time: endDateTime,
      event_type: data.event_type,
      color_primary: defaultColor,
      status: 'confirmed',
    };

    if (data.recurrence !== 'none') {
      record.recurrence = data.recurrence;
    }
    if (data.notes.trim()) {
      record.notes = data.notes;
    }

    if (data.event_type === 'appointment') {
      if (data.client) record.client = data.client;
      if (data.staff_member) record.staff_member = data.staff_member;
    } else if (data.event_type === 'class') {
      if (data.instructor) record.instructor = data.instructor;
      if (data.max_capacity) record.max_capacity = parseInt(data.max_capacity);
    } else if (data.event_type === 'shift') {
      record.employee = data.employee;
      if (data.role) record.role = data.role;
    }

    onSave(record);
  }, [data, onSave]);

  const isStepValid = (): boolean => {
    if (step === 1) return data.event_type !== null;
    if (step === 2) {
      const hasTime = !!data.date && !!data.start_time && !!data.end_time;
      if (!hasTime) return false;
      if (data.event_type === 'appointment') return !!data.title.trim();
      if (data.event_type === 'class') return !!data.title.trim();
      if (data.event_type === 'shift') return !!data.employee.trim();
      return false;
    }
    return false;
  };

  const stepLabel = step === 1 ? 'Event Type' : (
    data.event_type === 'appointment' ? 'Appointment Details' :
    data.event_type === 'class' ? 'Class Details' :
    'Shift Details'
  );

  const inputStyle: React.CSSProperties = {
    backgroundColor: pageBg,
    borderColor,
    color: textColor,
  };

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Event"
      subtitle={`Step ${step} of 2 — ${stepLabel}`}
      maxWidth="max-w-2xl"
      configColors={configColors}
      noPadding
    >
      <div className="flex flex-col" style={{ minHeight: 380 }}>
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-5 pt-4 pb-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: s === step ? 32 : 16,
                backgroundColor: s <= step ? buttonBg : borderColor,
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 px-5 py-4">

          {/* STEP 1: Event Type */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: mutedColor }}>
                What type of event are you adding?
              </p>
              <div className="grid grid-cols-3 gap-3">
                {EVENT_TYPE_OPTIONS.map(opt => {
                  const selected = data.event_type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setData(d => ({ ...d, event_type: opt.value }))}
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

          {/* STEP 2: Type-Specific Form */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Type-specific fields */}
              {data.event_type === 'appointment' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Service / Title</label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={e => setData(d => ({ ...d, title: e.target.value }))}
                      placeholder="e.g. Haircut, Consultation, Checkup"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-opacity-30"
                      style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Client</label>
                      <input
                        type="text"
                        value={data.client}
                        onChange={e => setData(d => ({ ...d, client: e.target.value }))}
                        placeholder="Client name"
                        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Staff Member</label>
                      <input
                        type="text"
                        value={data.staff_member}
                        onChange={e => setData(d => ({ ...d, staff_member: e.target.value }))}
                        placeholder="Assigned staff"
                        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </>
              )}

              {data.event_type === 'class' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Class Name</label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={e => setData(d => ({ ...d, title: e.target.value }))}
                      placeholder="e.g. Beginner Yoga, HIIT Training, Sparring"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-opacity-30"
                      style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Instructor</label>
                      <input
                        type="text"
                        value={data.instructor}
                        onChange={e => setData(d => ({ ...d, instructor: e.target.value }))}
                        placeholder="Instructor name"
                        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Max Capacity</label>
                      <input
                        type="number"
                        value={data.max_capacity}
                        onChange={e => setData(d => ({ ...d, max_capacity: e.target.value }))}
                        placeholder="e.g. 20"
                        min="1"
                        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </>
              )}

              {data.event_type === 'shift' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Employee</label>
                      <input
                        type="text"
                        value={data.employee}
                        onChange={e => setData(d => ({ ...d, employee: e.target.value }))}
                        placeholder="Employee name"
                        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-opacity-30"
                        style={{ ...inputStyle, '--tw-ring-color': buttonBg } as React.CSSProperties}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Role</label>
                      <input
                        type="text"
                        value={data.role}
                        onChange={e => setData(d => ({ ...d, role: e.target.value }))}
                        placeholder="e.g. Front Desk, Manager"
                        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Common fields: Date + Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Date</label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={e => setData(d => ({ ...d, date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Start Time</label>
                  <input
                    type="time"
                    value={data.start_time}
                    onChange={e => setData(d => ({ ...d, start_time: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>End Time</label>
                  <input
                    type="time"
                    value={data.end_time}
                    onChange={e => setData(d => ({ ...d, end_time: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Recurrence */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Repeat</label>
                <select
                  value={data.recurrence}
                  onChange={e => setData(d => ({ ...d, recurrence: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none cursor-pointer"
                  style={inputStyle}
                >
                  {RECURRENCE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Notes</label>
                <textarea
                  value={data.notes}
                  onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
                  placeholder="Optional notes..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                  style={inputStyle}
                />
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
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
            style={{ borderColor, color: textColor }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step === 2 ? (
            <button
              onClick={handleSave}
              disabled={!isStepValid() || isSaving}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {isSaving ? 'Adding...' : 'Add Event'}
            </button>
          ) : (
            <button
              onClick={() => setStep(2)}
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
