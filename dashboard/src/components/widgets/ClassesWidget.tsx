'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSubdomain, formatCents, isColorLight } from '@/lib/widget-utils';

// ─── Types ──────────────────────────────────────────────────────

interface ClassSchedule {
  id?: string;
  day_of_week: string;
  start_time: string;
  duration_minutes: number;
  room: string;
}

interface ClassInfo {
  id: string;
  name: string;
  description: string;
  instructor_name: string;
  category: string;
  capacity: number;
  drop_in_price_cents: number;
  member_only: boolean;
  schedule: ClassSchedule[];
}

interface ClassesWidgetProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  accentColor?: string;
  viewportWidth?: number;
  [key: string]: unknown;
}

// ─── Constants ──────────────────────────────────────────────────

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CATEGORY_COLORS: Record<string, string> = {
  'Martial Arts': '#DC2626',
  'Yoga': '#7C3AED',
  'Dance': '#EC4899',
  'Fitness': '#F59E0B',
  'Music': '#3B82F6',
  'Art': '#10B981',
  'Cooking': '#F97316',
  'Academic': '#6366F1',
};
const DEFAULT_CATEGORY_COLOR = '#6B7280';

const DEMO_CLASSES: ClassInfo[] = [
  {
    id: 'demo-1', name: 'BJJ Fundamentals', description: 'Core positions, escapes, and submissions. Gi required.',
    instructor_name: 'Coach Marcus', category: 'Martial Arts', capacity: 30, drop_in_price_cents: 2500, member_only: false,
    schedule: [
      { day_of_week: 'Monday', start_time: '18:00', duration_minutes: 60, room: 'Mat Room A' },
      { day_of_week: 'Wednesday', start_time: '18:00', duration_minutes: 60, room: 'Mat Room A' },
      { day_of_week: 'Friday', start_time: '17:30', duration_minutes: 60, room: 'Mat Room A' },
    ],
  },
  {
    id: 'demo-2', name: 'Vinyasa Flow', description: 'Dynamic flow linking breath to movement. Bring your own mat.',
    instructor_name: 'Priya Sharma', category: 'Yoga', capacity: 20, drop_in_price_cents: 2000, member_only: false,
    schedule: [
      { day_of_week: 'Tuesday', start_time: '07:00', duration_minutes: 75, room: 'Studio 1' },
      { day_of_week: 'Thursday', start_time: '07:00', duration_minutes: 75, room: 'Studio 1' },
      { day_of_week: 'Saturday', start_time: '09:00', duration_minutes: 90, room: 'Studio 1' },
    ],
  },
  {
    id: 'demo-3', name: 'Salsa & Bachata', description: 'Partner dancing for beginners. No partner needed.',
    instructor_name: 'Carlos & Maria', category: 'Dance', capacity: 24, drop_in_price_cents: 1800, member_only: false,
    schedule: [
      { day_of_week: 'Tuesday', start_time: '19:30', duration_minutes: 60, room: 'Dance Hall' },
      { day_of_week: 'Thursday', start_time: '19:30', duration_minutes: 60, room: 'Dance Hall' },
    ],
  },
  {
    id: 'demo-4', name: 'HIIT Bootcamp', description: 'High-intensity cardio, strength, and agility drills.',
    instructor_name: 'Coach Jordan', category: 'Fitness', capacity: 25, drop_in_price_cents: 1500, member_only: false,
    schedule: [
      { day_of_week: 'Monday', start_time: '06:00', duration_minutes: 45, room: 'Main Floor' },
      { day_of_week: 'Wednesday', start_time: '06:00', duration_minutes: 45, room: 'Main Floor' },
      { day_of_week: 'Friday', start_time: '06:00', duration_minutes: 45, room: 'Main Floor' },
    ],
  },
  {
    id: 'demo-5', name: 'Muay Thai Striking', description: 'Traditional Thai boxing — kicks, elbows, knees, clinch.',
    instructor_name: 'Kru David', category: 'Martial Arts', capacity: 20, drop_in_price_cents: 2500, member_only: false,
    schedule: [
      { day_of_week: 'Tuesday', start_time: '18:30', duration_minutes: 60, room: 'Mat Room B' },
      { day_of_week: 'Thursday', start_time: '18:30', duration_minutes: 60, room: 'Mat Room B' },
      { day_of_week: 'Saturday', start_time: '11:00', duration_minutes: 90, room: 'Mat Room B' },
    ],
  },
  {
    id: 'demo-6', name: 'Restorative Yoga', description: 'Gentle prop-supported poses. Ends with guided meditation.',
    instructor_name: 'Priya Sharma', category: 'Yoga', capacity: 15, drop_in_price_cents: 0, member_only: true,
    schedule: [
      { day_of_week: 'Sunday', start_time: '10:00', duration_minutes: 75, room: 'Studio 1' },
      { day_of_week: 'Wednesday', start_time: '19:30', duration_minutes: 75, room: 'Studio 1' },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function formatTimeRange(start: string, durationMin: number): string {
  const [h, m] = start.split(':').map(Number);
  const startTotal = h * 60 + m;
  const endTotal = startTotal + durationMin;
  const endH = Math.floor(endTotal / 60) % 24;
  const endM = endTotal % 60;
  const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  return `${formatTime(start)} \u2013 ${formatTime(endStr)}`;
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;
}

// ─── Component ──────────────────────────────────────────────────

export function ClassesWidget({
  blockProps,
  inBuilder,
  styles,
  heading = 'Weekly Class Schedule',
  accentColor = '#1A1A1A',
  viewportWidth = 1200,
}: ClassesWidgetProps) {
  const [classes, setClasses] = useState<ClassInfo[]>(DEMO_CLASSES);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [enrollForm, setEnrollForm] = useState({ name: '', email: '' });
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const buttonTextColor = isColorLight(accentColor) ? '#1A1A1A' : '#FFFFFF';

  // ─── Fetch classes ──────────────────────────────────────────
  useEffect(() => {
    if (inBuilder) return;
    const subdomain = getSubdomain();
    if (!subdomain) return;

    setLoading(true);
    fetch(`/api/public/classes?subdomain=${subdomain}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.classes?.length > 0) {
          setClasses(data.classes);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [inBuilder]);

  // ─── Categories ────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set<string>();
    classes.forEach(c => { if (c.category) cats.add(c.category); });
    return ['All', ...Array.from(cats).sort()];
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (activeCategory === 'All') return classes;
    return classes.filter(c => c.category === activeCategory);
  }, [classes, activeCategory]);

  // ─── Build schedule grid ───────────────────────────────────
  const scheduleByDay = useMemo(() => {
    const grid: Record<string, { cls: ClassInfo; sched: ClassSchedule }[]> = {};
    DAYS.forEach(d => { grid[d] = []; });
    filteredClasses.forEach(cls => {
      cls.schedule.forEach(sched => {
        if (grid[sched.day_of_week]) {
          grid[sched.day_of_week].push({ cls, sched });
        }
      });
    });
    // Sort each day by start_time
    DAYS.forEach(d => {
      grid[d].sort((a, b) => a.sched.start_time.localeCompare(b.sched.start_time));
    });
    return grid;
  }, [filteredClasses]);

  // ─── Enrollment ────────────────────────────────────────────
  const handleEnroll = useCallback(async () => {
    if (!selectedClass || !enrollForm.name || !enrollForm.email) return;
    setEnrollSubmitting(true);
    try {
      const res = await fetch('/api/public/classes/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: selectedClass.id,
          attendee_name: enrollForm.name,
          attendee_email: enrollForm.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnrollSuccess(true);
      }
    } catch {
      // silent fail for demo
    } finally {
      setEnrollSubmitting(false);
    }
  }, [selectedClass, enrollForm]);

  // ─── Render a class block (shared between builder and live) ─
  const renderClassBlock = (cls: ClassInfo, sched: ClassSchedule, interactive: boolean) => {
    const catColor = getCategoryColor(cls.category);
    const blockKey = `${cls.id}-${sched.day_of_week}-${sched.start_time}`;
    const isHovered = hoveredBlock === blockKey;

    return (
      <div
        key={blockKey}
        onClick={interactive ? () => {
          setSelectedClass(cls);
          setEnrollForm({ name: '', email: '' });
          setEnrollSuccess(false);
        } : undefined}
        onMouseEnter={interactive ? () => setHoveredBlock(blockKey) : undefined}
        onMouseLeave={interactive ? () => setHoveredBlock(null) : undefined}
        style={{
          padding: '8px 10px',
          borderRadius: 10,
          backgroundColor: hexToRgba(catColor, 0.08),
          borderLeft: `3px solid ${catColor}`,
          cursor: interactive ? 'pointer' : 'default',
          marginBottom: 6,
          transition: 'box-shadow 0.15s, transform 0.15s',
          boxShadow: isHovered && interactive ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
          transform: isHovered && interactive ? 'translateY(-1px)' : 'none',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', margin: 0, lineHeight: 1.3 }}>
          {cls.name}
        </p>
        <p style={{ fontSize: 10, color: '#6B7280', margin: '2px 0 0', lineHeight: 1.3 }}>
          {cls.instructor_name}
        </p>
        <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0 0', lineHeight: 1.3 }}>
          {formatTime(sched.start_time)} &middot; {sched.duration_minutes}min
        </p>
        <p style={{ fontSize: 10, color: '#9CA3AF', margin: '1px 0 0', lineHeight: 1.3 }}>
          {sched.room}
        </p>
      </div>
    );
  };

  // ─── Builder preview ──────────────────────────────────────
  if (inBuilder) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          fontFamily: FONT_STACK, width: '100%', boxSizing: 'border-box',
          opacity: 0.5, pointerEvents: 'none', position: 'relative',
        }}>
          {heading && (
            <h3 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 12, color: '#1A1A1A' }}>
              {heading}
            </h3>
          )}

          {/* Category pills */}
          {categories.length > 2 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap', padding: '0 16px' }}>
              {categories.slice(0, 5).map(cat => (
                <span key={cat} style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  backgroundColor: cat === 'All' ? accentColor : '#F3F4F6',
                  color: cat === 'All' ? buttonTextColor : '#6B7280',
                }}>
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Weekly grid preview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewportWidth < 480 ? '1fr' : viewportWidth < 768 ? 'repeat(4, 1fr)' : 'repeat(7, 1fr)',
            gap: 4, padding: '0 8px',
          }}>
            {(viewportWidth < 480 ? DAYS.slice(0, 3) : viewportWidth < 768 ? DAYS.slice(0, 4) : DAYS).map(day => (
              <div key={day} style={{ minWidth: 0 }}>
                <div style={{
                  textAlign: 'center', padding: '6px 0', fontSize: 11, fontWeight: 600,
                  color: '#374151', borderBottom: '2px solid #E5E7EB', marginBottom: 6,
                }}>
                  {day.slice(0, 3)}
                </div>
                {scheduleByDay[day].map(({ cls, sched }) => renderClassBlock(cls, sched, false))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{ fontFamily: FONT_STACK, textAlign: 'center', padding: 60 }}>
          <div style={{
            width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: accentColor,
            borderRadius: '50%', margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#6B7280', fontSize: 14 }}>Loading classes...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ─── Public site: Full weekly schedule ────────────────────
  return (
    <div {...blockProps} className={styles || 'w-full'} style={{ height: '100%' }}>
      <div style={{ fontFamily: FONT_STACK, maxWidth: 960, margin: '0 auto', padding: '32px 20px', position: 'relative', height: '100%' }}>
        {heading && (
          <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>{heading}</h3>
        )}

        {/* Category tabs */}
        {categories.length > 2 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const isActive = cat === activeCategory;
              const isHovered = cat === hoveredCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  style={{
                    padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                    border: 'none', cursor: 'pointer',
                    backgroundColor: isActive ? accentColor : isHovered ? hexToRgba(accentColor, 0.08) : '#F3F4F6',
                    color: isActive ? buttonTextColor : '#374151',
                    transition: 'background-color 0.15s',
                    fontFamily: FONT_STACK,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Weekly schedule grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: viewportWidth < 480 ? '1fr' : viewportWidth < 768 ? 'repeat(4, 1fr)' : 'repeat(7, 1fr)', gap: 8,
          border: '1px solid #E5E7EB', borderRadius: 16,
          backgroundColor: '#fff', padding: 12, overflowX: 'auto',
        }}>
          {DAYS.map(day => {
            const entries = scheduleByDay[day];
            return (
              <div key={day} style={{ minWidth: 110 }}>
                {/* Day header */}
                <div style={{
                  textAlign: 'center', padding: '8px 0', fontSize: 12, fontWeight: 700,
                  color: '#374151', borderBottom: '2px solid #E5E7EB', marginBottom: 8,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {day.slice(0, 3)}
                </div>
                {/* Class blocks */}
                {entries.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '16px 4px', fontSize: 11, color: '#D1D5DB' }}>
                    No classes
                  </div>
                )}
                {entries.map(({ cls, sched }) => renderClassBlock(cls, sched, true))}
              </div>
            );
          })}
        </div>

        {/* Legend: category colors */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          {categories.filter(c => c !== 'All').map(cat => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10, height: 10, borderRadius: 3,
                backgroundColor: getCategoryColor(cat),
              }} />
              <span style={{ fontSize: 12, color: '#6B7280' }}>{cat}</span>
            </div>
          ))}
        </div>

        {/* ─── Detail / Enrollment modal (bottom sheet) ─────── */}
        {selectedClass && (
          <>
            <div
              onClick={() => { setSelectedClass(null); setEnrollSuccess(false); }}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 998 }}
            />
            <div style={{
              position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 440, maxWidth: '95vw', maxHeight: '80vh',
              backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
              zIndex: 999, boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column', fontFamily: FONT_STACK,
              overflow: 'hidden',
            }}>
              {/* Modal header */}
              <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1A1A1A' }}>
                        {selectedClass.name}
                      </h4>
                      {selectedClass.member_only && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                          backgroundColor: '#FEF3C7', color: '#92400E',
                        }}>
                          Members Only
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
                      {selectedClass.instructor_name} &middot; {selectedClass.category}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedClass(null); setEnrollSuccess(false); }}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none',
                      backgroundColor: '#F3F4F6', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {enrollSuccess ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      backgroundColor: '#D1FAE5', margin: '0 auto 16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h4 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>You&apos;re signed up!</h4>
                    <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
                      A confirmation has been sent to <strong>{enrollForm.email}</strong>
                    </p>
                    <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                      {selectedClass.name} with {selectedClass.instructor_name}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Description */}
                    {selectedClass.description && (
                      <p style={{ fontSize: 14, color: '#374151', marginBottom: 20, lineHeight: 1.6 }}>
                        {selectedClass.description}
                      </p>
                    )}

                    {/* Schedule days */}
                    <div style={{
                      padding: 14, borderRadius: 12, backgroundColor: '#F9FAFB', marginBottom: 16,
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>Schedule</p>
                      {selectedClass.schedule.map((sched, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '6px 0',
                          borderBottom: i < selectedClass.schedule.length - 1 ? '1px solid #E5E7EB' : 'none',
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{sched.day_of_week}</span>
                          <span style={{ fontSize: 13, color: '#6B7280' }}>
                            {formatTimeRange(sched.start_time, sched.duration_minutes)} &middot; {sched.room}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Capacity & Price */}
                    <div style={{
                      padding: 14, borderRadius: 12, backgroundColor: '#F9FAFB',
                      marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        {selectedClass.drop_in_price_cents > 0
                          ? `Drop-in: ${formatCents(selectedClass.drop_in_price_cents)}`
                          : 'Included with membership'}
                      </span>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>
                        Capacity: {selectedClass.capacity}
                      </span>
                    </div>

                    {/* Enrollment form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Name *</label>
                        <input
                          type="text" value={enrollForm.name}
                          onChange={e => setEnrollForm(f => ({ ...f, name: e.target.value }))}
                          style={{
                            width: '100%', padding: '10px 12px', borderRadius: 10,
                            border: '1px solid #E5E7EB', fontSize: 14, fontFamily: FONT_STACK,
                            boxSizing: 'border-box',
                          }}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Email *</label>
                        <input
                          type="email" value={enrollForm.email}
                          onChange={e => setEnrollForm(f => ({ ...f, email: e.target.value }))}
                          style={{
                            width: '100%', padding: '10px 12px', borderRadius: 10,
                            border: '1px solid #E5E7EB', fontSize: 14, fontFamily: FONT_STACK,
                            boxSizing: 'border-box',
                          }}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!enrollSuccess && (
                <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #E5E7EB' }}>
                  <button
                    onClick={handleEnroll}
                    disabled={enrollSubmitting || !enrollForm.name || !enrollForm.email}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                      backgroundColor: (!enrollForm.name || !enrollForm.email) ? '#D1D5DB' : accentColor,
                      color: (!enrollForm.name || !enrollForm.email) ? '#6B7280' : buttonTextColor,
                      fontSize: 15, fontWeight: 600,
                      cursor: (!enrollForm.name || !enrollForm.email) ? 'default' : 'pointer',
                      fontFamily: FONT_STACK,
                    }}
                  >
                    {enrollSubmitting ? 'Signing up...' : 'Sign Up'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
