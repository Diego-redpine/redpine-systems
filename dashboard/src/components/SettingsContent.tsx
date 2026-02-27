'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import CustomSelect from '@/components/ui/CustomSelect';
import QRCodeGenerator from './QRCodeGenerator';
import ActivityFeedView from './ActivityFeedView';
import type { CustomFieldDefinition } from '@/hooks/useCustomFields';

interface Profile {
  id: string;
  email: string;
  business_name: string;
  phone: string;
  address: string;
  business_type: string;
  plan: string;
  notification_email: boolean;
  notification_sms: boolean;
  notification_push: boolean;
  subdomain: string;
}

export default function SettingsContent({ colors, defaultTab }: { colors: DashboardColors; defaultTab?: 'profile' | 'settings' | 'activity' }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonTextColor = getContrastText(buttonColor);

  // Sub-tab: Profile | Settings | Activity
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'settings' | 'activity'>(defaultTab || 'profile');

  // Sync sub-tab when dropdown navigates to profile vs settings
  useEffect(() => {
    if (defaultTab) setActiveSubTab(defaultTab);
  }, [defaultTab]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Integrations state
  const [connections, setConnections] = useState<{ provider: string; accountId: string; isActive: boolean; connectedAt: string }[]>([]);
  const [dataConnections, setDataConnections] = useState<{ provider: string; isActive: boolean; connectedAt: string; metadata: Record<string, unknown> }[]>([]);

  // QuickBooks state
  const [qbStatus, setQbStatus] = useState<{
    connected: boolean;
    connection?: { company_name: string; is_active: boolean; last_sync_at: string | null; sync_status: string; sync_error: string | null; created_at: string };
    sync_logs?: { id: string; entity_type: string; direction: string; records_synced: number; status: string; started_at: string; completed_at: string | null }[];
    entity_counts?: { customers: number; invoices: number };
  } | null>(null);
  const [qbSyncing, setQbSyncing] = useState(false);

  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [cfEntity, setCfEntity] = useState('clients');
  const [cfNewLabel, setCfNewLabel] = useState('');
  const [cfNewType, setCfNewType] = useState('text');
  const [cfNewOptions, setCfNewOptions] = useState('');
  const [cfAdding, setCfAdding] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, integrationsRes, qbRes] = await Promise.all([
        fetch('/api/settings/profile'),
        fetch('/api/integrations/status'),
        fetch('/api/integrations/quickbooks/status'),
      ]);
      if (profileRes.ok) {
        const json = await profileRes.json();
        setProfile(json.data);
      }
      if (integrationsRes.ok) {
        const json = await integrationsRes.json();
        const data = json.data || {};
        setConnections(data.paymentConnections || []);
        setDataConnections(data.dataConnections || []);
      }
      if (qbRes.ok) {
        const json = await qbRes.json();
        setQbStatus(json);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch custom fields when entity changes
  const fetchCustomFields = useCallback(async (entity: string) => {
    try {
      const res = await fetch(`/api/custom-fields?entity_type=${entity}`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setCustomFields(json.data || []);
      }
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    fetchCustomFields(cfEntity);
  }, [cfEntity, fetchCustomFields]);

  const addCustomField = async () => {
    if (!cfNewLabel.trim()) return;
    setCfAdding(true);
    try {
      const res = await fetch('/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          entity_type: cfEntity,
          field_label: cfNewLabel.trim(),
          field_type: cfNewType,
          options: cfNewType === 'dropdown' ? cfNewOptions.split(',').map(o => o.trim()).filter(Boolean) : [],
        }),
      });
      if (res.ok) {
        setCfNewLabel('');
        setCfNewOptions('');
        fetchCustomFields(cfEntity);
      }
    } catch { /* */ }
    setCfAdding(false);
  };

  const deleteCustomField = async (fieldId: string) => {
    try {
      await fetch(`/api/custom-fields?id=${fieldId}`, { method: 'DELETE', credentials: 'include' });
      fetchCustomFields(cfEntity);
    } catch { /* */ }
  };

  const saveField = async (field: string, value: unknown) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const json = await res.json();
        setProfile(json.data);
        setSaveMessage('Saved');
        setTimeout(() => setSaveMessage(''), 2000);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
      setEditField(null);
    }
  };

  const handleToggleNotification = async (key: string, current: boolean) => {
    await saveField(key, !current);
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/settings/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', newPassword }),
      });
      if (res.ok) {
        setShowPasswordForm(false);
        setNewPassword('');
        setConfirmPassword('');
        setSaveMessage('Password updated');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const json = await res.json();
        setPasswordError(json.error || 'Failed to update password');
      }
    } catch {
      setPasswordError('Something went wrong');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      const res = await fetch('/api/settings/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_account' }),
      });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
    }
  };

  const handleQbSync = async (action: string) => {
    setQbSyncing(true);
    try {
      const res = await fetch('/api/integrations/quickbooks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        // Refresh QB status
        const statusRes = await fetch('/api/integrations/quickbooks/status');
        if (statusRes.ok) setQbStatus(await statusRes.json());
      }
    } catch (err) {
      console.error('QB sync failed:', err);
    } finally {
      setQbSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: buttonColor, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const inputClass = 'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-primary/20';

  const businessFields = [
    { key: 'business_name', label: 'Business Name' },
    { key: 'email', label: 'Email', readOnly: true },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'business_type', label: 'Business Type' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Sub-tab pills */}
      <div className="flex gap-2 mb-2">
        {(['profile', 'settings', 'activity'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeSubTab === tab ? buttonColor : 'transparent',
              color: activeSubTab === tab ? buttonTextColor : textMuted,
              border: activeSubTab === tab ? 'none' : '1px solid #E5E7EB',
            }}
          >
            {tab === 'profile' ? 'Profile' : tab === 'settings' ? 'Settings' : 'Activity'}
          </button>
        ))}
      </div>

      {activeSubTab === 'activity' && <ActivityFeedView colors={colors} />}

      {activeSubTab === 'profile' && <>
      {/* Save confirmation */}
      {saveMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-emerald-500 text-white text-sm font-medium shadow-lg animate-fadeIn">
          {saveMessage}
        </div>
      )}

      {/* 1. Business Info */}
      <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Business Info</h3>
        <div className="space-y-1">
          {businessFields.map((field, i) => {
            const value = profile?.[field.key as keyof Profile] || '';
            const isEditing = editField === field.key;
            const isLast = i === businessFields.length - 1;

            return (
              <div
                key={field.key}
                className={`flex items-center justify-between py-3 ${!isLast ? 'border-b' : ''}`}
                style={{ borderColor }}
              >
                <span className="text-sm" style={{ color: textMuted }}>{field.label}</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={inputClass}
                      style={{ borderColor, maxWidth: 200 }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveField(field.key, editValue);
                        if (e.key === 'Escape') setEditField(null);
                      }}
                    />
                    <button
                      onClick={() => saveField(field.key, editValue)}
                      disabled={isSaving}
                      className="px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: buttonColor }}
                    >
                      {isSaving ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditField(null)}
                      className="px-3 py-1.5 text-xs font-medium border"
                      style={{ borderColor, color: textMuted }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: textMain }}>
                      {String(value) || '--'}
                    </span>
                    {!field.readOnly && (
                      <button
                        onClick={() => { setEditField(field.key); setEditValue(String(value)); }}
                        className="text-xs px-2 py-1 transition-colors hover:bg-gray-100"
                        style={{ color: textMuted }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Account */}
      <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-4" style={{ color: textMain }}>Account</h3>

        {showPasswordForm ? (
          <div className="space-y-3">
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {passwordError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: textMain }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                style={{ borderColor }}
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: textMain }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                style={{ borderColor }}
                placeholder="Confirm your password"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: buttonColor }}
              >
                Update Password
              </button>
              <button
                onClick={() => { setShowPasswordForm(false); setPasswordError(''); }}
                className="px-4 py-2 text-sm font-medium border"
                style={{ borderColor, color: textMuted }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-4 py-2 text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor, color: textMain }}
          >
            Change Password
          </button>
        )}
      </div>

      {/* 3. Billing */}
      <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: textMain }}>Billing</h3>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm" style={{ color: textMuted }}>Current plan:</span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            profile?.plan === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {profile?.plan === 'active' ? 'Pro ($29/mo)' : 'Free'}
          </span>
        </div>
        <button
          onClick={handleManageBilling}
          className="px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: buttonColor }}
        >
          Manage Billing
        </button>
      </div>

      {/* 4. Notifications */}
      <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'notification_email', label: 'Email Notifications', desc: 'Receive booking confirmations and updates' },
            { key: 'notification_sms', label: 'SMS Notifications', desc: 'Get text alerts for new bookings' },
            { key: 'notification_push', label: 'Push Notifications', desc: 'Browser notifications for activity' },
          ].map(item => {
            const enabled = profile?.[item.key as keyof Profile] as boolean ?? false;
            return (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: textMain }}>{item.label}</p>
                  <p className="text-xs" style={{ color: textMuted }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggleNotification(item.key, enabled)}
                  className="relative inline-flex h-6 w-11 transition-colors"
                  style={{ backgroundColor: enabled ? buttonColor : '#D1D5DB' }}
                >
                  <span
                    className={`inline-block h-5 w-5 transform bg-white shadow transition-transform mt-0.5 ${
                      enabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 9. Danger Zone */}
      <div className="p-6 shadow-sm border-2 border-red-200" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-2 text-red-600">Danger Zone</h3>
        <p className="text-sm mb-4" style={{ color: textMuted }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        {showDeleteConfirm ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-600">
              Type DELETE to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className={inputClass}
              style={{ borderColor: '#FCA5A5' }}
              placeholder="DELETE"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white disabled:opacity-50"
              >
                Delete My Account
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="px-4 py-2 text-sm font-medium border"
                style={{ borderColor, color: textMuted }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm font-medium border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete Account
          </button>
        )}
      </div>
      </>}

      {activeSubTab === 'settings' && <>
      {/* Save confirmation */}
      {saveMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-emerald-500 text-white text-sm font-medium shadow-lg animate-fadeIn">
          {saveMessage}
        </div>
      )}

      {/* 5. Payment Integrations */}
      <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: textMain }}>Payment Integrations</h3>
        <p className="text-sm mb-4" style={{ color: textMuted }}>
          Connect a payment processor to accept payments from your customers.
        </p>
        <div className="space-y-3">
          {([
            { key: 'stripe_connect', label: 'Stripe', connectUrl: '/api/integrations/stripe/connect' },
            { key: 'square', label: 'Square', connectUrl: '/api/integrations/square/connect' },
          ] as const).map(provider => {
            const conn = connections.find(c => c.provider === provider.key && c.isActive);
            return (
              <div
                key={provider.key}
                className="flex items-center justify-between p-4 border"
                style={{ borderColor }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: textMain }}>{provider.label}</p>
                  <p className="text-xs" style={{ color: textMuted }}>
                    {conn ? `Connected — ${conn.accountId}` : 'Accept payments via ' + provider.label}
                  </p>
                </div>
                {conn ? (
                  <span className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700">
                    Connected
                  </span>
                ) : (
                  <a
                    href={provider.connectUrl}
                    className="px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: buttonColor }}
                  >
                    Connect
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5b. Data Integrations */}
      <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: textMain }}>Data Integrations</h3>
        <p className="text-sm mb-4" style={{ color: textMuted }}>
          Import data from external services or sync your calendar.
        </p>
        <div className="space-y-3">
          {([
            { key: 'google', label: 'Google Sheets', connectUrl: '/api/integrations/google/connect', description: 'Import clients, products, and more from spreadsheets' },
            { key: 'notion', label: 'Notion', connectUrl: '/api/integrations/notion/connect', description: 'Import data from Notion databases' },
            { key: 'outlook', label: 'Outlook Calendar', connectUrl: '/api/integrations/outlook/connect', description: 'Sync events from your Outlook calendar' },
          ] as const).map(provider => {
            const conn = dataConnections.find(c => c.provider === provider.key && c.isActive);
            return (
              <div
                key={provider.key}
                className="flex items-center justify-between p-4 border"
                style={{ borderColor }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: textMain }}>{provider.label}</p>
                  <p className="text-xs" style={{ color: textMuted }}>
                    {conn
                      ? `Connected${conn.metadata?.email ? ` — ${conn.metadata.email}` : conn.metadata?.workspace_name ? ` — ${conn.metadata.workspace_name}` : ''}`
                      : provider.description}
                  </p>
                </div>
                {conn ? (
                  <span className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700">
                    Connected
                  </span>
                ) : (
                  <a
                    href={provider.connectUrl}
                    className="px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: buttonColor }}
                  >
                    Connect
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. QuickBooks Integration */}
      <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: textMain }}>QuickBooks Online</h3>
        <p className="text-sm mb-4" style={{ color: textMuted }}>
          Sync your customers and invoices with QuickBooks Online.
        </p>

        {qbStatus?.connected && qbStatus.connection?.is_active ? (
          <div className="space-y-4">
            {/* Connection info */}
            <div className="flex items-center justify-between p-4 border" style={{ borderColor }}>
              <div>
                <p className="text-sm font-medium" style={{ color: textMain }}>{qbStatus.connection.company_name}</p>
                <p className="text-xs" style={{ color: textMuted }}>
                  {qbStatus.connection.last_sync_at
                    ? `Last synced ${new Date(qbStatus.connection.last_sync_at).toLocaleString()}`
                    : 'Never synced'}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                qbStatus.connection.sync_status === 'success' ? 'bg-emerald-50 text-emerald-700'
                  : qbStatus.connection.sync_status === 'syncing' ? 'bg-blue-50 text-blue-700'
                  : qbStatus.connection.sync_status === 'error' ? 'bg-red-50 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {qbStatus.connection.sync_status === 'success' ? 'Connected'
                  : qbStatus.connection.sync_status === 'syncing' ? 'Syncing...'
                  : qbStatus.connection.sync_status === 'error' ? 'Error'
                  : 'Idle'}
              </span>
            </div>

            {/* Sync error */}
            {qbStatus.connection.sync_error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {qbStatus.connection.sync_error}
              </div>
            )}

            {/* Entity counts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border text-center" style={{ borderColor }}>
                <p className="text-lg font-bold" style={{ color: textMain }}>{qbStatus.entity_counts?.customers || 0}</p>
                <p className="text-xs" style={{ color: textMuted }}>Synced Customers</p>
              </div>
              <div className="p-3 border text-center" style={{ borderColor }}>
                <p className="text-lg font-bold" style={{ color: textMain }}>{qbStatus.entity_counts?.invoices || 0}</p>
                <p className="text-xs" style={{ color: textMuted }}>Synced Invoices</p>
              </div>
            </div>

            {/* Sync actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQbSync('sync_all')}
                disabled={qbSyncing}
                className="px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: buttonColor }}
              >
                {qbSyncing ? 'Syncing...' : 'Sync All'}
              </button>
              <button
                onClick={() => handleQbSync('sync_customers')}
                disabled={qbSyncing}
                className="px-4 py-2 text-xs font-medium border disabled:opacity-50"
                style={{ borderColor, color: textMain }}
              >
                Sync Customers
              </button>
              <button
                onClick={() => handleQbSync('sync_invoices')}
                disabled={qbSyncing}
                className="px-4 py-2 text-xs font-medium border disabled:opacity-50"
                style={{ borderColor, color: textMain }}
              >
                Sync Invoices
              </button>
              <button
                onClick={() => handleQbSync('disconnect')}
                disabled={qbSyncing}
                className="px-4 py-2 text-xs font-medium border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>

            {/* Recent sync logs */}
            {qbStatus.sync_logs && qbStatus.sync_logs.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: textMuted }}>Recent Sync Activity</p>
                <div className="space-y-1">
                  {qbStatus.sync_logs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between py-2 px-3 text-xs" style={{ backgroundColor: `${borderColor}40` }}>
                      <span style={{ color: textMain }}>
                        {log.entity_type} ({log.direction})
                      </span>
                      <div className="flex items-center gap-2">
                        <span style={{ color: textMuted }}>{log.records_synced} records</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          log.status === 'success' ? 'bg-emerald-50 text-emerald-700'
                            : log.status === 'error' ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/api/integrations/quickbooks/connect"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#2CA01C' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
            Connect QuickBooks
          </a>
        )}
      </div>

      {/* 7. QR Codes */}
      <QRCodeGenerator subdomain={profile?.subdomain || 'my-business'} colors={colors} />

      {/* 8. Custom Fields */}
      <div className="p-6 shadow-sm border" style={{ backgroundColor: cardBg, borderColor }}>
        <h3 className="text-base font-semibold mb-1" style={{ color: textMain }}>Custom Fields</h3>
        <p className="text-sm mb-4" style={{ color: textMuted }}>
          Add custom fields to any entity. These fields appear in record detail panels.
        </p>

        {/* Entity selector */}
        <div className="mb-4">
          <CustomSelect
            value={cfEntity}
            onChange={val => setCfEntity(val)}
            options={['clients', 'appointments', 'invoices', 'leads', 'tasks', 'products', 'staff', 'reviews', 'waivers', 'workflows'].map(e => ({
              value: e,
              label: e.charAt(0).toUpperCase() + e.slice(1),
            }))}
            style={{ borderColor, color: textMain, backgroundColor: colors.background || '#F9FAFB' }}
            buttonColor={buttonColor}
          />
        </div>

        {/* Existing fields */}
        {customFields.length > 0 && (
          <div className="space-y-2 mb-4">
            {customFields.map(cf => (
              <div key={cf.id} className="flex items-center justify-between p-3 border" style={{ borderColor }}>
                <div>
                  <span className="text-sm font-medium" style={{ color: textMain }}>{cf.field_label}</span>
                  <span className="text-xs ml-2 px-2 py-0.5 " style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}>
                    {cf.field_type}
                  </span>
                  {cf.field_type === 'dropdown' && cf.options?.length > 0 && (
                    <span className="text-xs ml-1 opacity-50" style={{ color: textMuted }}>
                      ({(cf.options as string[]).join(', ')})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteCustomField(cf.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {customFields.length === 0 && (
          <p className="text-sm mb-4 opacity-50" style={{ color: textMuted }}>
            No custom fields for {cfEntity} yet.
          </p>
        )}

        {/* Add new field */}
        <div className="space-y-2 pt-3 border-t" style={{ borderColor }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={cfNewLabel}
              onChange={e => setCfNewLabel(e.target.value)}
              placeholder="Field name (e.g., Hair Type)"
              className="flex-1 px-3 py-2 border text-sm"
              style={{ borderColor, color: textMain, backgroundColor: colors.background || '#F9FAFB' }}
            />
            <CustomSelect
              value={cfNewType}
              onChange={val => setCfNewType(val)}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'number', label: 'Number' },
                { value: 'date', label: 'Date' },
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone' },
                { value: 'url', label: 'URL' },
                { value: 'dropdown', label: 'Dropdown' },
                { value: 'checkbox', label: 'Checkbox' },
                { value: 'textarea', label: 'Text Area' },
                { value: 'currency', label: 'Currency' },
              ]}
              className="w-40"
              style={{ borderColor, color: textMain, backgroundColor: colors.background || '#F9FAFB' }}
              buttonColor={buttonColor}
            />
          </div>
          {cfNewType === 'dropdown' && (
            <input
              type="text"
              value={cfNewOptions}
              onChange={e => setCfNewOptions(e.target.value)}
              placeholder="Options (comma-separated, e.g., Curly, Straight, Wavy)"
              className="w-full px-3 py-2 border text-sm"
              style={{ borderColor, color: textMain, backgroundColor: colors.background || '#F9FAFB' }}
            />
          )}
          <button
            onClick={addCustomField}
            disabled={cfAdding || !cfNewLabel.trim()}
            className="px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
            style={{ backgroundColor: buttonColor, color: getContrastText(buttonColor) }}
          >
            {cfAdding ? 'Adding...' : 'Add Field'}
          </button>
        </div>
      </div>

      {/* 9. Restart Onboarding Tour */}
      <div className="p-6 shadow-sm border" style={{ backgroundColor: cardBg, borderColor }}>
        <h3 className="text-base font-semibold mb-1" style={{ color: textMain }}>Onboarding Tour</h3>
        <p className="text-sm mb-4" style={{ color: textMuted }}>
          Replay the onboarding tour to review your dashboard setup and integration options.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('redpine_tour_completed');
            localStorage.removeItem('redpine_first_visit_shown');
            window.location.reload();
          }}
          className="px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80"
          style={{ borderColor, color: textMain }}
        >
          Restart Onboarding Tour
        </button>
      </div>

      </>}
    </div>
  );
}
