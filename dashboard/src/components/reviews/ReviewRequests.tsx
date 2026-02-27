'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface ReviewRequestsProps {
  colors: DashboardColors;
}

interface AutomationSettings {
  appointment_completed: {
    enabled: boolean;
    timing: string;
    channel: string;
  };
  invoice_paid: {
    enabled: boolean;
    timing: string;
    channel: string;
  };
  drip_enabled: boolean;
}

interface RequestRecord {
  id: string;
  client_id: string;
  trigger_type: string;
  channel: string;
  sent_at: string;
  clicked_at?: string;
  completed_at?: string;
  drip_step?: number;
  tracking_token?: string;
  created_at: string;
}

interface ClientOption {
  id: string;
  name: string;
  email?: string;
}

const DEFAULT_AUTOMATION: AutomationSettings = {
  appointment_completed: {
    enabled: true,
    timing: '2_hours',
    channel: 'sms_email',
  },
  invoice_paid: {
    enabled: true,
    timing: '24_hours',
    channel: 'email',
  },
  drip_enabled: true,
};

const TIMING_OPTIONS = [
  { value: 'immediate', label: 'Immediately' },
  { value: '30_min', label: '30 minutes after' },
  { value: '1_hour', label: '1 hour after' },
  { value: '2_hours', label: '2 hours after' },
  { value: '4_hours', label: '4 hours after' },
  { value: '24_hours', label: '24 hours after' },
  { value: '48_hours', label: '48 hours after' },
];

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'sms_email', label: 'SMS + Email' },
];

const REQUEST_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  sent: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Sent' },
  clicked: { bg: '#FEF3C7', text: '#92400E', label: 'Clicked' },
  completed: { bg: '#D1FAE5', text: '#047857', label: 'Completed' },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getRequestStatus(req: RequestRecord): string {
  if (req.completed_at) return 'completed';
  if (req.clicked_at) return 'clicked';
  return 'sent';
}

export default function ReviewRequests({ colors }: ReviewRequestsProps) {
  const [automation, setAutomation] = useState<AutomationSettings>(DEFAULT_AUTOMATION);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/data/review-requests?pageSize=100&sort=created_at&sortDir=desc');
      const json = await res.json();
      if (json.success && json.data) {
        setRequests(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch review requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async (search: string) => {
    try {
      const params = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/data/clients?pageSize=20${params}`);
      const json = await res.json();
      if (json.success && json.data) {
        setClients(
          json.data.map((c: { id: string; name: string; email?: string }) => ({
            id: c.id,
            name: c.name,
            email: c.email,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchClients('');
  }, [fetchRequests, fetchClients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearch) {
        fetchClients(clientSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch, fetchClients]);

  const handleSendRequest = async () => {
    if (!selectedClientId) return;
    setSending(true);
    try {
      const res = await fetch('/api/reviews/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClientId,
          trigger_type: 'manual',
          channel: 'email',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedClientId('');
        setClientSearch('');
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to send request:', err);
    } finally {
      setSending(false);
    }
  };

  const updateTrigger = (
    trigger: 'appointment_completed' | 'invoice_paid',
    updates: Partial<AutomationSettings['appointment_completed']>
  ) => {
    setAutomation((prev) => ({
      ...prev,
      [trigger]: { ...prev[trigger], ...updates },
    }));
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Automation settings */}
      <div
        className="p-6"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h3 className="text-lg font-bold mb-1" style={{ color: textMain }}>
          Automation
        </h3>
        <p className="text-sm mb-5" style={{ color: textMuted }}>
          Automatically request reviews after key events.
        </p>

        <div className="space-y-4">
          {/* Appointment completed trigger */}
          <div
            className="p-4"
            style={{
              backgroundColor: colors.background || '#F9FAFB',
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    updateTrigger('appointment_completed', {
                      enabled: !automation.appointment_completed.enabled,
                    })
                  }
                  className="relative w-11 h-6 transition-colors"
                  style={{
                    backgroundColor: automation.appointment_completed.enabled
                      ? buttonColor
                      : '#D1D5DB',
                  }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white shadow transition-transform"
                    style={{
                      left: automation.appointment_completed.enabled
                        ? '22px'
                        : '2px',
                    }}
                  />
                </button>
                <span className="text-sm font-medium" style={{ color: textMain }}>
                  Appointment completed
                </span>
              </div>
            </div>
            {automation.appointment_completed.enabled && (
              <div className="flex flex-wrap gap-3 ml-14">
                <select
                  value={automation.appointment_completed.timing}
                  onChange={(e) =>
                    updateTrigger('appointment_completed', {
                      timing: e.target.value,
                    })
                  }
                  className="px-3 py-1.5 text-sm"
                  style={{
                    border: `1px solid ${borderColor}`,
                    color: textMain,
                    backgroundColor: cardBg,
                  }}
                >
                  {TIMING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={automation.appointment_completed.channel}
                  onChange={(e) =>
                    updateTrigger('appointment_completed', {
                      channel: e.target.value,
                    })
                  }
                  className="px-3 py-1.5 text-sm"
                  style={{
                    border: `1px solid ${borderColor}`,
                    color: textMain,
                    backgroundColor: cardBg,
                  }}
                >
                  {CHANNEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Invoice paid trigger */}
          <div
            className="p-4"
            style={{
              backgroundColor: colors.background || '#F9FAFB',
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    updateTrigger('invoice_paid', {
                      enabled: !automation.invoice_paid.enabled,
                    })
                  }
                  className="relative w-11 h-6 transition-colors"
                  style={{
                    backgroundColor: automation.invoice_paid.enabled
                      ? buttonColor
                      : '#D1D5DB',
                  }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white shadow transition-transform"
                    style={{
                      left: automation.invoice_paid.enabled ? '22px' : '2px',
                    }}
                  />
                </button>
                <span className="text-sm font-medium" style={{ color: textMain }}>
                  Invoice paid
                </span>
              </div>
            </div>
            {automation.invoice_paid.enabled && (
              <div className="flex flex-wrap gap-3 ml-14">
                <select
                  value={automation.invoice_paid.timing}
                  onChange={(e) =>
                    updateTrigger('invoice_paid', { timing: e.target.value })
                  }
                  className="px-3 py-1.5 text-sm"
                  style={{
                    border: `1px solid ${borderColor}`,
                    color: textMain,
                    backgroundColor: cardBg,
                  }}
                >
                  {TIMING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={automation.invoice_paid.channel}
                  onChange={(e) =>
                    updateTrigger('invoice_paid', { channel: e.target.value })
                  }
                  className="px-3 py-1.5 text-sm"
                  style={{
                    border: `1px solid ${borderColor}`,
                    color: textMain,
                    backgroundColor: cardBg,
                  }}
                >
                  {CHANNEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Follow-up drip */}
          <div
            className="p-4"
            style={{
              backgroundColor: colors.background || '#F9FAFB',
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{ color: textMain }}>
                  Follow-up reminders
                </span>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                  Stops automatically when review is submitted
                </p>
              </div>
              <button
                onClick={() =>
                  setAutomation((prev) => ({
                    ...prev,
                    drip_enabled: !prev.drip_enabled,
                  }))
                }
                className="relative w-11 h-6 transition-colors"
                style={{
                  backgroundColor: automation.drip_enabled
                    ? buttonColor
                    : '#D1D5DB',
                }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white shadow transition-transform"
                  style={{
                    left: automation.drip_enabled ? '22px' : '2px',
                  }}
                />
              </button>
            </div>
            {automation.drip_enabled && (
              <div className="flex gap-4 mt-3 ml-1">
                {[
                  { day: 'Day 1', channel: 'SMS' },
                  { day: 'Day 3', channel: 'Email' },
                  { day: 'Day 6', channel: 'Final Email' },
                ].map((step) => (
                  <div
                    key={step.day}
                    className="flex items-center gap-2 text-xs px-3 py-1.5"
                    style={{
                      backgroundColor: `${buttonColor}08`,
                      color: textMain,
                    }}
                  >
                    <span className="font-semibold">{step.day}</span>
                    <span style={{ color: textMuted }}>{step.channel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual send */}
      <div
        className="p-6"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: textMain }}>
          Send Manual Request
        </h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={selectedClient ? selectedClient.name : clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setSelectedClientId('');
                setShowClientDropdown(true);
              }}
              onFocus={() => setShowClientDropdown(true)}
              placeholder="Search for a client..."
              className="w-full px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${borderColor}`,
                color: textMain,
                backgroundColor: colors.background || '#F9FAFB',
              }}
            />
            {showClientDropdown && filteredClients.length > 0 && !selectedClientId && (
              <div
                className="absolute top-full left-0 right-0 mt-1 shadow-lg z-20 max-h-48 overflow-y-auto"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setClientSearch(client.name);
                      setShowClientDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                    style={{ color: textMain }}
                  >
                    <span className="font-medium">{client.name}</span>
                    {client.email && (
                      <span className="ml-2 text-xs" style={{ color: textMuted }}>
                        {client.email}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSendRequest}
            disabled={!selectedClientId || sending}
            className="px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50 whitespace-nowrap"
            style={{
              backgroundColor: buttonColor,
              color: buttonText,
            }}
          >
            {sending ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>

      {/* Request history */}
      <div
        className="p-6"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: textMain }}>
          Request History
        </h3>
        {loading ? (
          <p className="text-sm" style={{ color: textMuted }}>
            Loading...
          </p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: textMuted }}>
            No review requests sent yet. Send your first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Client', 'Trigger', 'Channel', 'Sent', 'Clicked', 'Completed', 'Status'].map(
                    (header) => (
                      <th
                        key={header}
                        className="text-left text-xs font-medium px-3 py-2"
                        style={{ color: textMuted, borderBottom: `1px solid ${borderColor}` }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const status = getRequestStatus(req);
                  const statusStyle = REQUEST_STATUS_STYLES[status] || REQUEST_STATUS_STYLES.sent;
                  return (
                    <tr key={req.id}>
                      <td
                        className="px-3 py-3 text-sm font-medium"
                        style={{ color: textMain, borderBottom: `1px solid ${borderColor}` }}
                      >
                        {req.client_id?.slice(0, 8) || '--'}
                      </td>
                      <td
                        className="px-3 py-3 text-sm capitalize"
                        style={{ color: textMuted, borderBottom: `1px solid ${borderColor}` }}
                      >
                        {req.trigger_type?.replace('_', ' ') || '--'}
                      </td>
                      <td
                        className="px-3 py-3 text-sm capitalize"
                        style={{ color: textMuted, borderBottom: `1px solid ${borderColor}` }}
                      >
                        {req.channel || '--'}
                      </td>
                      <td
                        className="px-3 py-3 text-xs"
                        style={{ color: textMuted, borderBottom: `1px solid ${borderColor}` }}
                      >
                        {formatDate(req.sent_at)}
                      </td>
                      <td
                        className="px-3 py-3 text-xs"
                        style={{ color: textMuted, borderBottom: `1px solid ${borderColor}` }}
                      >
                        {req.clicked_at ? formatDate(req.clicked_at) : '--'}
                      </td>
                      <td
                        className="px-3 py-3 text-xs"
                        style={{ color: textMuted, borderBottom: `1px solid ${borderColor}` }}
                      >
                        {req.completed_at ? formatDate(req.completed_at) : '--'}
                      </td>
                      <td
                        className="px-3 py-3"
                        style={{ borderBottom: `1px solid ${borderColor}` }}
                      >
                        <span
                          className="px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
