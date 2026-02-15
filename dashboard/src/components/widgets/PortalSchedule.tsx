'use client';

import React, { useState, useEffect } from 'react';
import { usePortalSession } from './PortalContext';

interface PortalScheduleProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  accentColor?: string;
  allowRegistration?: boolean;
  [key: string]: unknown;
}

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string;
  instructor?: string;
  spots_available?: number;
  registered?: boolean;
  type: 'class' | 'appointment';
}

const DEMO_SCHEDULE: ScheduleItem[] = [
  { id: '1', title: 'Advanced Sparring', date: 'Mon, Feb 10', time: '6:00 PM', instructor: 'Master Kim', spots_available: 4, registered: true, type: 'class' },
  { id: '2', title: 'Belt Test Prep', date: 'Wed, Feb 12', time: '5:30 PM', instructor: 'Master Kim', spots_available: 8, registered: false, type: 'class' },
  { id: '3', title: 'Private Lesson', date: 'Thu, Feb 13', time: '4:00 PM', instructor: 'Coach Park', type: 'appointment' },
  { id: '4', title: 'Forms Practice', date: 'Fri, Feb 14', time: '6:00 PM', instructor: 'Master Kim', spots_available: 12, registered: false, type: 'class' },
  { id: '5', title: 'Beginners Class', date: 'Sat, Feb 15', time: '10:00 AM', instructor: 'Coach Lee', spots_available: 2, registered: true, type: 'class' },
];

const ICON_CALENDAR = 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5';
const ICON_CHECK = 'M9 12.75L11.25 15 15 9.75';

export const PortalSchedule: React.FC<PortalScheduleProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'My Schedule',
  accentColor = '#1A1A1A',
  allowRegistration = true,
}) => {
  const session = usePortalSession();
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEMO_SCHEDULE);
  const [registering, setRegistering] = useState<string | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'registered'>('upcoming');

  useEffect(() => {
    if (inBuilder || !session) return;
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/portal/data?type=schedule&student_id=${session.activeStudentId}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.schedule) setSchedule(data.schedule);
        }
      } catch { /* use demo data */ }
    };
    fetchSchedule();
  }, [inBuilder, session, session?.activeStudentId]);

  const handleRegister = async (itemId: string) => {
    if (inBuilder || !session) return;
    setRegistering(itemId);
    try {
      const res = await fetch('/api/portal/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          class_id: itemId,
          student_id: session.activeStudentId,
        }),
      });
      if (res.ok) {
        setSchedule(prev => prev.map(s =>
          s.id === itemId
            ? { ...s, registered: true, spots_available: (s.spots_available || 1) - 1 }
            : s
        ));
      }
    } catch { /* silent */ }
    setRegistering(null);
  };

  const filtered = tab === 'registered'
    ? schedule.filter(s => s.registered)
    : schedule;

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        {/* Header with tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{heading}</h3>
          <div style={{ display: 'flex', gap: 4, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 3 }}>
            {(['upcoming', 'registered'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  backgroundColor: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? '#1A1A1A' : '#6B7280',
                  border: 'none', cursor: 'pointer',
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 8px', opacity: 0.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={ICON_CALENDAR} />
              </svg>
              <p style={{ fontSize: 13 }}>No {tab} classes</p>
            </div>
          )}
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 14, borderRadius: 12,
                backgroundColor: item.registered ? `${accentColor}08` : '#FAFAFA',
                border: `1px solid ${item.registered ? `${accentColor}20` : '#F3F4F6'}`,
              }}
            >
              {/* Type icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: item.type === 'class' ? '#8B5CF620' : '#3B82F620',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={item.type === 'class' ? '#8B5CF6' : '#3B82F6'} strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={ICON_CALENDAR} />
                </svg>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                  {item.date} &middot; {item.time}
                  {item.instructor && <> &middot; {item.instructor}</>}
                </p>
              </div>

              {/* Action */}
              <div style={{ flexShrink: 0 }}>
                {item.registered ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '5px 12px', borderRadius: 8,
                    backgroundColor: '#10B98115', color: '#10B981',
                    fontSize: 12, fontWeight: 600,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_CHECK} />
                    </svg>
                    Registered
                  </span>
                ) : allowRegistration && item.spots_available !== undefined ? (
                  <button
                    onClick={() => handleRegister(item.id)}
                    disabled={registering === item.id || item.spots_available === 0}
                    style={{
                      padding: '5px 14px', borderRadius: 8,
                      backgroundColor: item.spots_available === 0 ? '#E5E7EB' : accentColor,
                      color: item.spots_available === 0 ? '#9CA3AF' : '#fff',
                      fontSize: 12, fontWeight: 600, border: 'none',
                      cursor: item.spots_available === 0 ? 'not-allowed' : 'pointer',
                      opacity: registering === item.id ? 0.6 : 1,
                    }}
                  >
                    {registering === item.id ? 'Joining...'
                      : item.spots_available === 0 ? 'Full'
                      : `Register (${item.spots_available})`}
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {item.type === 'appointment' ? 'Booked' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
