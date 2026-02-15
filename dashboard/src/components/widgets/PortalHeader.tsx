'use client';

import React from 'react';
import { usePortalSession } from './PortalContext';

interface PortalHeaderProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  accentColor?: string;
  showLogo?: boolean;
  [key: string]: unknown;
}

const DEMO_STUDENTS = [
  { id: 's1', name: 'Alex Johnson', email: 'alex@example.com' },
  { id: 's2', name: 'Jordan Johnson', email: 'jordan@example.com' },
];

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Welcome back',
  accentColor = '#1A1A1A',
  showLogo = true,
}) => {
  const session = usePortalSession();

  const students = inBuilder ? DEMO_STUDENTS : (session?.students || []);
  const activeId = inBuilder ? 's1' : session?.activeStudentId;
  const clientName = inBuilder ? 'Alex Johnson' : session?.clientName || 'Student';
  const showSwitcher = students.length > 1;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const activeName = students.find(s => s.id === activeId)?.name || clientName;

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{
        padding: 32,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
          opacity: 0.05,
          backgroundImage: `radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px),
                           radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo placeholder */}
          {showLogo && (
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, fontSize: 20, fontWeight: 700,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}

          {/* Greeting */}
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            {heading}, {activeName.split(' ')[0]}
          </h2>
          <p style={{ fontSize: 14, opacity: 0.8, marginBottom: showSwitcher ? 20 : 0 }}>
            Manage your schedule, payments, and progress
          </p>

          {/* Student switcher */}
          {showSwitcher && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {students.map((student) => {
                const isActive = student.id === activeId;
                return (
                  <button
                    key={student.id}
                    onClick={() => !inBuilder && session?.setActiveStudentId(student.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 14px 6px 6px',
                      borderRadius: 999,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                      border: isActive ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
                      color: '#fff', cursor: 'pointer',
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {getInitials(student.name)}
                    </div>
                    {student.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
