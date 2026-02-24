'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { PortalConfig, PortalPreferenceField } from '@/lib/portal-templates';

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  custom_fields?: Record<string, string>;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
}

interface PortalAccountSectionProps {
  clientData: ClientData;
  portalConfig: PortalConfig;
  accentColor: string;
  accentTextColor: string;
  portalToken: string;
  familyMembers?: FamilyMember[];
  subdomain: string;
}

export function PortalAccountSection({
  clientData,
  portalConfig,
  accentColor,
  accentTextColor,
  portalToken,
  familyMembers = [],
  subdomain,
}: PortalAccountSectionProps) {
  // Profile state
  const [name, setName] = useState(clientData.name || '');
  const [email, setEmail] = useState(clientData.email || '');
  const [phone, setPhone] = useState(clientData.phone || '');
  const [address, setAddress] = useState(clientData.address || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Preference state
  const [preferences, setPreferences] = useState<Record<string, string>>(
    clientData.custom_fields || {}
  );
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Magic link state
  const [linkSent, setLinkSent] = useState(false);
  const [linkSending, setLinkSending] = useState(false);

  const handleSaveProfile = useCallback(async () => {
    setProfileSaving(true);
    try {
      await fetch('/api/portal/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({
          action: 'update_profile',
          student_id: clientData.id,
          profile: { name, email, phone, address },
        }),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {
      // Error handled silently
    }
    setProfileSaving(false);
  }, [name, email, phone, address, clientData.id, portalToken]);

  const handleSavePreferences = useCallback(async () => {
    setPrefsSaving(true);
    try {
      await fetch('/api/portal/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({
          action: 'update_preferences',
          student_id: clientData.id,
          preferences,
        }),
      });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch {
      // Error handled silently
    }
    setPrefsSaving(false);
  }, [preferences, clientData.id, portalToken]);

  const handleSendMagicLink = useCallback(async () => {
    setLinkSending(true);
    try {
      await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, email }),
      });
      setLinkSent(true);
    } catch {
      // Error handled silently
    }
    setLinkSending(false);
  }, [subdomain, email]);

  const handlePreferenceChange = useCallback((key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Profile</h2>

        <div className="space-y-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{name || 'Client'}</p>
              <p className="text-sm text-gray-500 truncate">{email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Main St"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={profileSaving}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: accentColor, color: accentTextColor }}
          >
            {profileSaved ? 'Saved!' : profileSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Preferences Card (only if industry has preference fields) */}
      {portalConfig.preferenceFields.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Preferences</h2>

          <div className="space-y-4">
            {portalConfig.preferenceFields.map((field: PortalPreferenceField) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={preferences[field.key] || ''}
                    onChange={e => handlePreferenceChange(field.key, e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 resize-none"
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  />
                ) : field.type === 'select' && field.options ? (
                  <select
                    value={preferences[field.key] || ''}
                    onChange={e => handlePreferenceChange(field.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white"
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  >
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={preferences[field.key] || ''}
                    onChange={e => handlePreferenceChange(field.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleSavePreferences}
              disabled={prefsSaving}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{ backgroundColor: accentColor, color: accentTextColor }}
            >
              {prefsSaved ? 'Saved!' : prefsSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* Family Members Card */}
      {familyMembers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Family Members</h2>

          <div className="space-y-3">
            {familyMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                >
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Login Link Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Sign In</h2>
        <p className="text-sm text-gray-500 mb-4">
          We use magic links instead of passwords. Click below to receive a new sign-in link.
        </p>

        {linkSent ? (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
            Login link sent to <strong>{email}</strong>. Check your inbox.
          </div>
        ) : (
          <button
            onClick={handleSendMagicLink}
            disabled={linkSending}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 transition-opacity disabled:opacity-50"
            style={{ borderColor: accentColor, color: accentColor, backgroundColor: 'transparent' }}
          >
            {linkSending ? 'Sending...' : 'Send Me a New Login Link'}
          </button>
        )}
      </div>
    </div>
  );
}
