'use client';

import React, { useState, useEffect } from 'react';
import { usePortalSession } from './PortalContext';

interface PortalAccountProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  accentColor?: string;
  [key: string]: unknown;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
}

const DEMO_PROFILE: ProfileData = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '(555) 123-4567',
  address: '123 Oak Street, Springfield, IL 62701',
  emergency_contact: 'Sarah Johnson',
  emergency_phone: '(555) 987-6543',
};

export const PortalAccount: React.FC<PortalAccountProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'My Account',
  accentColor = '#1A1A1A',
}) => {
  const session = usePortalSession();
  const [profile, setProfile] = useState<ProfileData>(DEMO_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(DEMO_PROFILE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (inBuilder || !session) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/portal/data?type=profile&student_id=${session.activeStudentId}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
            setDraft(data.profile);
          }
        }
      } catch { /* use demo data */ }
    };
    fetchProfile();
  }, [inBuilder, session, session?.activeStudentId]);

  const handleSave = async () => {
    if (inBuilder || !session) return;
    setSaving(true);
    try {
      const res = await fetch('/api/portal/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          action: 'update_profile',
          student_id: session.activeStudentId,
          profile: draft,
        }),
      });
      if (res.ok) {
        setProfile(draft);
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const fields: { key: keyof ProfileData; label: string; type?: string }[] = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'address', label: 'Address' },
    { key: 'emergency_contact', label: 'Emergency Contact' },
    { key: 'emergency_phone', label: 'Emergency Phone', type: 'tel' },
  ];

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{heading}</h3>
          {saved && (
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>Saved!</span>
          )}
        </div>

        {/* Avatar + name */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: 16, borderRadius: 12, marginBottom: 20,
          backgroundColor: '#FAFAFA', border: '1px solid #F3F4F6',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: `${accentColor}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: accentColor,
          }}>
            {getInitials(profile.name)}
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{profile.name}</p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0' }}>{profile.email}</p>
          </div>
          {!editing && (
            <button
              onClick={() => !inBuilder && setEditing(true)}
              style={{
                marginLeft: 'auto',
                padding: '6px 14px', borderRadius: 8,
                backgroundColor: `${accentColor}10`, color: accentColor,
                fontSize: 12, fontWeight: 600, border: 'none',
                cursor: inBuilder ? 'default' : 'pointer',
              }}
            >
              Edit
            </button>
          )}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fields.map(field => (
            <div key={field.key}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: '#6B7280', marginBottom: 4,
              }}>
                {field.label}
              </label>
              {editing ? (
                <input
                  type={field.type || 'text'}
                  value={draft[field.key]}
                  onChange={e => setDraft({ ...draft, [field.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #E5E7EB', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <p style={{
                  fontSize: 14, margin: 0, padding: '10px 12px',
                  backgroundColor: '#FAFAFA', borderRadius: 8,
                  color: profile[field.key] ? '#1A1A1A' : '#9CA3AF',
                }}>
                  {profile[field.key] || 'Not set'}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Save/Cancel buttons */}
        {editing && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              onClick={() => { setEditing(false); setDraft(profile); }}
              style={{
                padding: '8px 16px', borderRadius: 8,
                backgroundColor: '#F3F4F6', border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '8px 16px', borderRadius: 8,
                backgroundColor: accentColor, color: '#fff',
                fontSize: 13, fontWeight: 600, border: 'none',
                cursor: 'pointer', opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
