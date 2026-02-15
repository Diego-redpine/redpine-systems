'use client';

import React, { useState, useEffect } from 'react';
import { usePortalSession } from './PortalContext';

interface PortalAnnouncementsProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  accentColor?: string;
  [key: string]: unknown;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'tournament' | 'news' | 'event' | 'closure';
  pinned?: boolean;
}

const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1', title: 'Spring Tournament 2026',
    description: 'Annual spring tournament at the Springfield Convention Center. Registration deadline: March 1st. All belt levels welcome.',
    date: 'Mar 15, 2026', type: 'tournament', pinned: true,
  },
  {
    id: 'a2', title: 'Belt Testing — February',
    description: 'Belt testing will be held on the last Saturday of the month. Students must have minimum 30 class hours. See your instructor for eligibility.',
    date: 'Feb 22, 2026', type: 'event',
  },
  {
    id: 'a3', title: 'Holiday Hours',
    description: "The studio will be closed February 17th for Presidents' Day. Regular schedule resumes Tuesday.",
    date: 'Feb 17, 2026', type: 'closure',
  },
  {
    id: 'a4', title: 'New Advanced Class Added',
    description: 'Due to popular demand, we\'re adding a Thursday 7pm Advanced Sparring class starting March 1st.',
    date: 'Feb 5, 2026', type: 'news',
  },
];

const TYPE_STYLES: Record<string, { bg: string; icon: string; color: string }> = {
  tournament: {
    bg: '#F59E0B15', color: '#F59E0B',
    icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0',
  },
  news: {
    bg: '#3B82F615', color: '#3B82F6',
    icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5',
  },
  event: {
    bg: '#8B5CF615', color: '#8B5CF6',
    icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  },
  closure: {
    bg: '#EF444415', color: '#EF4444',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
};

export const PortalAnnouncements: React.FC<PortalAnnouncementsProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'News & Events',
  accentColor = '#1A1A1A',
}) => {
  const session = usePortalSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEMO_ANNOUNCEMENTS);

  useEffect(() => {
    if (inBuilder || !session) return;
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`/api/portal/data?type=announcements&student_id=${session.activeStudentId}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.announcements) setAnnouncements(data.announcements);
        }
      } catch { /* use demo data */ }
    };
    fetchAnnouncements();
  }, [inBuilder, session, session?.activeStudentId]);

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{heading}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.map(item => {
            const typeStyle = TYPE_STYLES[item.type] || TYPE_STYLES.news;
            return (
              <div
                key={item.id}
                style={{
                  padding: 16, borderRadius: 12,
                  backgroundColor: '#FAFAFA', border: '1px solid #F3F4F6',
                  position: 'relative',
                }}
              >
                {/* Pinned badge */}
                {item.pinned && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    padding: '2px 8px', borderRadius: 6,
                    backgroundColor: `${accentColor}10`, color: accentColor,
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  }}>
                    Pinned
                  </div>
                )}

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: typeStyle.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={typeStyle.color} strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={typeStyle.icon} />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{item.title}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{item.date}</p>
                  </div>
                </div>

                {/* Body */}
                <p style={{
                  fontSize: 13, color: '#4B5563', lineHeight: 1.5,
                  margin: 0, paddingLeft: 42,
                }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
