'use client';

import { useState, useEffect, useCallback } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface OutlookCalendarSyncProps {
  isOpen: boolean;
  onClose: () => void;
  colors: DashboardColors;
  onSyncComplete: (count: number) => void;
}

interface OutlookCalendar {
  id: string;
  name: string;
  color: string;
}

interface SyncResult {
  imported: number;
  updated: number;
  errors: number;
  total: number;
}

type Step = 'select-calendar' | 'date-range' | 'sync';
type SyncStatus = 'idle' | 'syncing' | 'done' | 'error';

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Microsoft Graph calendar colors mapped to hex for display
const OUTLOOK_COLOR_MAP: Record<string, string> = {
  auto: '#0078D4',
  lightBlue: '#71AFE5',
  lightGreen: '#7BD148',
  lightOrange: '#FFB878',
  lightGray: '#B3B3B3',
  lightYellow: '#FBD75B',
  lightTeal: '#46D6DB',
  lightPink: '#FF887C',
  lightBrown: '#E6C9A8',
  lightRed: '#DC2127',
  maxColor: '#0078D4',
};

function getCalendarColor(color: string): string {
  return OUTLOOK_COLOR_MAP[color] || '#0078D4';
}

export default function OutlookCalendarSync({
  isOpen,
  onClose,
  colors,
  onSyncComplete,
}: OutlookCalendarSyncProps) {
  const [step, setStep] = useState<Step>('select-calendar');
  const [calendars, setCalendars] = useState<OutlookCalendar[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCalendar, setSelectedCalendar] = useState<OutlookCalendar | null>(null);

  // Date range defaults: 30 days ago to 90 days from now
  const now = new Date();
  const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const defaultEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(formatDateForInput(defaultStart));
  const [endDate, setEndDate] = useState(formatDateForInput(defaultEnd));

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const buttonBg = colors.buttons || '#DC2626';
  const buttonText = getContrastText(buttonBg);
  const textColor = colors.text || '#1A1A1A';
  const headingColor = colors.headings || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';
  const bgColor = colors.background || '#F9FAFB';

  // Fetch calendars on mount
  const fetchCalendars = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integrations/outlook/calendars');
      if (!response.ok) {
        setConnected(false);
        setLoading(false);
        return;
      }
      const json = await response.json();
      const data = json.data;
      setConnected(data.connected);
      setCalendars(data.calendars || []);
    } catch {
      setConnected(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCalendars();
      // Reset state when opening
      setStep('select-calendar');
      setSelectedCalendar(null);
      setSyncStatus('idle');
      setSyncResult(null);
      setSyncError(null);
    }
  }, [isOpen, fetchCalendars]);

  // Handle sync
  const handleSync = async () => {
    if (!selectedCalendar) return;

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const response = await fetch('/api/integrations/outlook/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: selectedCalendar.id,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({ error: 'Sync failed' }));
        setSyncError(errorJson.error || 'Sync failed');
        setSyncStatus('error');
        return;
      }

      const json = await response.json();
      const result: SyncResult = json.data;
      setSyncResult(result);
      setSyncStatus('done');
      onSyncComplete(result.imported + result.updated);
    } catch {
      setSyncError('Network error. Please try again.');
      setSyncStatus('error');
    }
  };

  // Handle connect redirect
  const handleConnect = () => {
    window.location.href = '/api/integrations/outlook/connect';
  };

  // Step progress dots
  const steps: Step[] = ['select-calendar', 'date-range', 'sync'];
  const currentStepIndex = steps.indexOf(step);

  const renderStepDots = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div
          key={s}
          className="w-2 h-2 transition-all duration-200"
          style={{
            backgroundColor: i <= currentStepIndex ? buttonBg : borderColor,
            transform: i === currentStepIndex ? 'scale(1.3)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );

  // Step 1: Select Calendar
  const renderSelectCalendar = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mb-3"
            style={{ borderColor, borderTopColor: buttonBg }}
          />
          <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>
            Loading calendars...
          </p>
        </div>
      );
    }

    if (!connected) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-14 h-14 flex items-center justify-center mb-4" style={{ backgroundColor: bgColor }}>
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: headingColor }}>
            Connect your Outlook calendar
          </h3>
          <p className="text-sm text-center mb-6 max-w-xs" style={{ color: textColor, opacity: 0.6 }}>
            Sign in with your Microsoft account to import calendar events into your dashboard.
          </p>
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonBg, color: buttonText }}
          >
            <svg className="w-4 h-4" viewBox="0 0 21 21" fill="currentColor">
              <rect x="1" y="1" width="9" height="9" />
              <rect x="11" y="1" width="9" height="9" />
              <rect x="1" y="11" width="9" height="9" />
              <rect x="11" y="11" width="9" height="9" />
            </svg>
            Connect Outlook
          </button>
        </div>
      );
    }

    if (calendars.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>
            No calendars found in your Outlook account.
          </p>
        </div>
      );
    }

    return (
      <div>
        {renderStepDots()}
        <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
          Select a calendar to sync events from:
        </p>
        <div className="space-y-2">
          {calendars.map((cal) => {
            const isSelected = selectedCalendar?.id === cal.id;
            const calColor = getCalendarColor(cal.color);
            return (
              <button
                key={cal.id}
                onClick={() => {
                  setSelectedCalendar(cal);
                  setStep('date-range');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 border text-left transition-all hover:shadow-sm"
                style={{
                  borderColor: isSelected ? buttonBg : borderColor,
                  backgroundColor: isSelected ? `${buttonBg}08` : 'transparent',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: calColor }}
                />
                <span className="text-sm font-medium flex-1" style={{ color: headingColor }}>
                  {cal.name}
                </span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={textColor} viewBox="0 0 24 24" strokeWidth={2} style={{ opacity: 0.4 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Step 2: Date Range
  const renderDateRange = () => (
    <div>
      {renderStepDots()}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: getCalendarColor(selectedCalendar?.color || 'auto') }}
        />
        <p className="text-sm font-medium" style={{ color: headingColor }}>
          {selectedCalendar?.name}
        </p>
      </div>

      <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>
        Choose the date range for events to sync:
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: textColor, opacity: 0.6 }}>
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border text-sm outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              borderColor,
              color: textColor,
              backgroundColor: bgColor,
              // @ts-expect-error CSS custom property for focus ring
              '--tw-ring-color': buttonBg,
            }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: textColor, opacity: 0.6 }}>
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border text-sm outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              borderColor,
              color: textColor,
              backgroundColor: bgColor,
              // @ts-expect-error CSS custom property for focus ring
              '--tw-ring-color': buttonBg,
            }}
          />
        </div>
      </div>

      <div
        className="px-4 py-3 text-sm"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        Sync events from <strong>{new Date(startDate).toLocaleDateString()}</strong> to{' '}
        <strong>{new Date(endDate).toLocaleDateString()}</strong>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep('select-calendar')}
          className="px-4 py-2 text-sm border transition-opacity hover:opacity-70"
          style={{ borderColor, color: textColor }}
        >
          Back
        </button>
        <button
          onClick={() => {
            setStep('sync');
            handleSync();
          }}
          disabled={!startDate || !endDate}
          className="px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: buttonBg, color: buttonText }}
        >
          Start Sync
        </button>
      </div>
    </div>
  );

  // Step 3: Sync
  const renderSync = () => (
    <div>
      {renderStepDots()}

      {syncStatus === 'syncing' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div
            className="w-10 h-10 border-2 rounded-full animate-spin mb-4"
            style={{ borderColor, borderTopColor: buttonBg }}
          />
          <p className="text-sm font-medium" style={{ color: headingColor }}>
            Syncing events...
          </p>
          <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.5 }}>
            Importing from {selectedCalendar?.name}
          </p>
        </div>
      )}

      {syncStatus === 'done' && syncResult && (
        <div className="flex flex-col items-center justify-center py-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#10B98120' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="#10B981" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: headingColor }}>
            Sync Complete
          </h3>

          <div className="flex items-center gap-6 mt-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: headingColor }}>
                {syncResult.imported}
              </p>
              <p className="text-xs" style={{ color: textColor, opacity: 0.5 }}>
                New events
              </p>
            </div>
            <div className="w-px h-10" style={{ backgroundColor: borderColor }} />
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: headingColor }}>
                {syncResult.updated}
              </p>
              <p className="text-xs" style={{ color: textColor, opacity: 0.5 }}>
                Updated
              </p>
            </div>
            {syncResult.errors > 0 && (
              <>
                <div className="w-px h-10" style={{ backgroundColor: borderColor }} />
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">
                    {syncResult.errors}
                  </p>
                  <p className="text-xs" style={{ color: textColor, opacity: 0.5 }}>
                    Errors
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="text-sm" style={{ color: textColor, opacity: 0.6 }}>
            {syncResult.total} total events processed from{' '}
            <strong>{selectedCalendar?.name}</strong>
          </p>

          <button
            onClick={onClose}
            className="mt-6 px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonBg, color: buttonText }}
          >
            Done
          </button>
        </div>
      )}

      {syncStatus === 'error' && (
        <div className="flex flex-col items-center justify-center py-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#EF444420' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="#EF4444" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: headingColor }}>
            Sync Failed
          </h3>
          <p className="text-sm text-center max-w-xs mb-6" style={{ color: textColor, opacity: 0.6 }}>
            {syncError || 'An unexpected error occurred.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('date-range')}
              className="px-4 py-2 text-sm border transition-opacity hover:opacity-70"
              style={{ borderColor, color: textColor }}
            >
              Back
            </button>
            <button
              onClick={handleSync}
              className="px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Outlook Calendar Sync"
      subtitle={
        step === 'select-calendar'
          ? 'Import events from your Outlook calendar'
          : step === 'date-range'
            ? 'Choose date range'
            : 'Syncing events'
      }
      maxWidth="max-w-md"
      configColors={colors}
    >
      {step === 'select-calendar' && renderSelectCalendar()}
      {step === 'date-range' && renderDateRange()}
      {step === 'sync' && renderSync()}
    </CenterModal>
  );
}
