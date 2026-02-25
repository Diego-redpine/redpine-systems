'use client';

import React, { useState, useCallback } from 'react';
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
  phone?: string;
  relationship?: string;
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
  familyMembers: initialFamily = [],
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

  // Family member management
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamily);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('family');
  const [familySaving, setFamilySaving] = useState(false);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

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

  const handleAddFamilyMember = useCallback(async () => {
    if (!newMemberName.trim()) return;
    setFamilySaving(true);
    try {
      const res = await fetch('/api/portal/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({
          action: 'add_family_member',
          member: {
            name: newMemberName,
            email: newMemberEmail,
            phone: newMemberPhone,
            relationship: newMemberRelation,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newMember: FamilyMember = data.member || {
          id: `temp-${Date.now()}`,
          name: newMemberName,
          email: newMemberEmail,
          phone: newMemberPhone,
          relationship: newMemberRelation,
        };
        setFamilyMembers(prev => [...prev, newMember]);
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberPhone('');
        setNewMemberRelation('family');
        setShowAddFamily(false);
      }
    } catch {
      // Silently fail
    }
    setFamilySaving(false);
  }, [newMemberName, newMemberEmail, newMemberPhone, newMemberRelation, portalToken]);

  const handleRemoveFamilyMember = useCallback(async (memberId: string) => {
    try {
      await fetch('/api/portal/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({
          action: 'remove_family_member',
          member_id: memberId,
        }),
      });
      setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
    } catch {
      // Silently fail
    }
  }, [portalToken]);

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

      {/* Family Members Card — Full Management */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Family Members</h2>
          <button
            onClick={() => setShowAddFamily(!showAddFamily)}
            className="text-sm font-semibold"
            style={{ color: accentColor }}
          >
            {showAddFamily ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {/* Add Family Member Form */}
        {showAddFamily && (
          <div className="mb-4 p-4 rounded-xl bg-gray-50 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input
                type="text"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                placeholder="Family member name"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newMemberPhone}
                  onChange={e => setNewMemberPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
              <select
                value={newMemberRelation}
                onChange={e => setNewMemberRelation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              >
                <option value="family">Family</option>
                <option value="spouse">Spouse / Partner</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
              </select>
            </div>
            <button
              onClick={handleAddFamilyMember}
              disabled={familySaving || !newMemberName.trim()}
              className="w-full py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{ backgroundColor: accentColor, color: accentTextColor }}
            >
              {familySaving ? 'Adding...' : 'Add Family Member'}
            </button>
          </div>
        )}

        {familyMembers.length === 0 && !showAddFamily ? (
          <div className="text-center py-6">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <p className="text-sm text-gray-500">No family members added</p>
            <p className="text-xs text-gray-400 mt-1">Add family members to book appointments for them</p>
          </div>
        ) : (
          <div className="space-y-2">
            {familyMembers.map(member => (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                  activeMemberId === member.id ? 'ring-2' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                style={activeMemberId === member.id ? { outline: `2px solid ${accentColor}`, outlineOffset: '-2px', backgroundColor: `${accentColor}08` } : undefined}
                onClick={() => setActiveMemberId(activeMemberId === member.id ? null : member.id)}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                >
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {member.relationship || 'Family'}{member.email ? ` · ${member.email}` : ''}
                  </p>
                </div>

                {/* Switch / Remove actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {activeMemberId === member.id && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                      Active
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFamilyMember(member.id); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {familyMembers.length > 0 && (
          <p className="text-xs text-gray-400 mt-3">
            Tap a family member to set them as active when booking
          </p>
        )}
      </div>

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
