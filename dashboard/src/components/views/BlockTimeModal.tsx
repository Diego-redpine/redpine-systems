'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import CenterModal from '@/components/ui/CenterModal';

interface BlockTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockData: Record<string, unknown>) => void;
  colors: DashboardColors;
  isLoading?: boolean;
}

export interface BlockTimeData {
  title: string;
  start_time: string;
  end_time: string;
  reason: string;
  record_type: 'blocked';
  color_primary: string;
  status: string;
}

export default function BlockTimeModal({ isOpen, onClose, onSave, colors, isLoading }: BlockTimeModalProps) {
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  // Default to today
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [allDay, setAllDay] = useState(false);

  const handleSave = () => {
    const startDateTime = allDay ? `${date}T00:00:00` : `${date}T${startTime}:00`;
    const endDateTime = allDay ? `${date}T23:59:59` : `${date}T${endTime}:00`;

    onSave({
      title: reason || 'Blocked Time',
      start_time: startDateTime,
      end_time: endDateTime,
      reason,
      record_type: 'blocked',
      color_primary: '#6B7280',
      status: 'blocked',
    });

    // Reset form
    setDate(today);
    setStartTime('09:00');
    setEndTime('10:00');
    setReason('');
    setAllDay(false);
  };

  const inputStyle = {
    borderColor,
    color: textMain,
    backgroundColor: cardBg,
  };

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Block Time"
      subtitle="Prevent bookings during this time"
      maxWidth="max-w-md"
      configColors={colors}
    >
      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
            style={inputStyle}
          />
        </div>

        {/* All Day toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className="relative w-10 h-5 rounded-full transition-colors"
            style={{ backgroundColor: allDay ? buttonColor : '#D1D5DB' }}
            onClick={() => setAllDay(!allDay)}
          >
            <div
              className="absolute top-0.5 w-4 h-4 bg-white shadow transition-transform"
              style={{ transform: allDay ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </div>
          <span className="text-sm font-medium" style={{ color: textMain }}>All day</span>
        </label>

        {/* Time range */}
        {!allDay && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>
            Reason <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Lunch break, Staff meeting, Personal"
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
            style={inputStyle}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border transition-colors hover:bg-black/[0.02]"
            style={{ borderColor, color: textMuted }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            {isLoading ? 'Blocking...' : 'Block Time'}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
