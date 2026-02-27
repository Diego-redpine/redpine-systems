'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSubdomain, formatCents, isColorLight } from '@/lib/widget-utils';

// ─── Types ──────────────────────────────────────────────────────

interface EventsWidgetProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  showCapacity?: boolean;
  accentColor?: string;
  viewportWidth?: number;
  [key: string]: unknown;
}

interface EventInfo {
  id: string;
  name: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  venue?: string;
  image_url?: string;
  category?: string;
  capacity?: number;
  tickets_sold?: number;
  ticket_price_cents?: number;
  is_free?: boolean;
}

// ─── Constants ──────────────────────────────────────────────────

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const CALENDAR_ICON = 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5';

const TICKET_ICON = 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z';

const MAP_PIN_ICON = 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z';

const IMAGE_ICON = 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z';

const DEMO_EVENTS: EventInfo[] = [
  { id: 'de1', name: 'Watercolor Workshop', description: 'Learn basic watercolor techniques with our resident artist. All supplies provided.', event_date: '2026-03-15', start_time: '10:00', end_time: '12:00', venue: 'Main Studio', category: 'Workshops', capacity: 20, tickets_sold: 14, ticket_price_cents: 4500, is_free: false },
  { id: 'de2', name: 'Jazz Night', description: 'Live jazz trio featuring local musicians. Drinks and light bites available.', event_date: '2026-03-22', start_time: '19:00', end_time: '22:00', venue: 'The Lounge', category: 'Concerts', capacity: 80, tickets_sold: 62, ticket_price_cents: 2500, is_free: false },
  { id: 'de3', name: 'Community Yoga', description: 'Free outdoor yoga class for all levels. Bring your own mat.', event_date: '2026-03-29', start_time: '08:00', end_time: '09:00', venue: 'Garden Patio', category: 'Fitness', capacity: 30, tickets_sold: 8, is_free: true, ticket_price_cents: 0 },
  { id: 'de4', name: 'Spring Art Exhibition', description: 'Showcasing 15 local artists. Opening reception with complimentary wine.', event_date: '2026-04-05', start_time: '17:00', end_time: '21:00', venue: 'Gallery Space', category: 'Exhibitions', capacity: 100, tickets_sold: 34, is_free: true, ticket_price_cents: 0 },
  { id: 'de5', name: 'Photography Masterclass', description: 'Advanced techniques for portrait and landscape photography.', event_date: '2026-04-12', start_time: '14:00', end_time: '17:00', venue: 'Workshop Room', category: 'Workshops', capacity: 12, tickets_sold: 10, ticket_price_cents: 7500, is_free: false },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Helpers ────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatEventDate(dateStr: string): { month: string; day: string; weekday: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const month = MONTH_NAMES[d.getMonth()];
  const day = String(d.getDate());
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  return { month, day, weekday };
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

// ─── Component ──────────────────────────────────────────────────

export const EventsWidget: React.FC<EventsWidgetProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Upcoming Events',
  showCapacity = true,
  accentColor = '#1A1A1A',
  viewportWidth = 1200,
}) => {
  const [events, setEvents] = useState<EventInfo[]>(DEMO_EVENTS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<EventInfo | null>(null);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', tickets: 1 });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const buttonTextColor = isColorLight(accentColor) ? '#1A1A1A' : '#FFFFFF';

  // ─── Fetch events ────────────────────────────────────────────
  useEffect(() => {
    if (inBuilder) return;
    const subdomain = getSubdomain();
    if (!subdomain) return;

    setLoading(true);
    fetch(`/api/public/events?subdomain=${subdomain}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.events?.length > 0) {
          setEvents(data.events);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [inBuilder]);

  // ─── Categories ──────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set<string>();
    events.forEach(e => { if (e.category) cats.add(e.category); });
    return ['All', ...Array.from(cats).sort()];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (activeCategory === 'All') return events;
    return events.filter(e => e.category === activeCategory);
  }, [events, activeCategory]);

  // ─── Registration ────────────────────────────────────────────
  const handleRegister = useCallback(async () => {
    if (!selectedEvent || !regForm.name || !regForm.email) return;
    setRegSubmitting(true);
    try {
      const res = await fetch('/api/public/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          attendee_name: regForm.name,
          attendee_email: regForm.email,
          attendee_phone: regForm.phone || undefined,
          tickets: regForm.tickets,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegSuccess(true);
      }
    } catch {
      // silent fail for demo
    } finally {
      setRegSubmitting(false);
    }
  }, [selectedEvent, regForm]);

  // ─── Builder preview ────────────────────────────────────────
  if (inBuilder) {
    return (
      <div {...blockProps} className={styles || 'w-full'} style={{ height: '100%' }}>
        <div style={{
          fontFamily: FONT_STACK, width: '100%', boxSizing: 'border-box',
          opacity: 0.85, pointerEvents: 'none', flex: 1,
        }}>
          {heading && (
            <h3 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 16, color: '#1A1A1A' }}>
              {heading}
            </h3>
          )}

          {/* Category pills */}
          {categories.length > 2 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap', padding: '0 16px' }}>
              {categories.slice(0, 5).map((cat, i) => (
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

          {/* Event cards preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            {events.slice(0, 3).map(event => {
              const { month, day } = formatEventDate(event.event_date);
              return (
                <div key={event.id} style={{
                  display: 'flex', gap: 14, padding: 14,
                  borderRadius: 14, border: '1px solid #E5E7EB', backgroundColor: '#fff',
                }}>
                  {/* Date badge */}
                  <div style={{
                    width: 52, height: 56, borderRadius: 10, flexShrink: 0,
                    backgroundColor: hexToRgba(accentColor, 0.08),
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: accentColor, textTransform: 'uppercase' }}>{month}</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{day}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{event.name}</p>
                    {event.venue && (
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{event.venue}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: event.is_free ? '#059669' : accentColor }}>
                        {event.is_free ? 'Free' : formatCents(event.ticket_price_cents || 0)}
                      </span>
                      {showCapacity && event.capacity && (
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                          {event.capacity - (event.tickets_sold || 0)} spots left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div {...blockProps} className={styles || 'w-full'} style={{ height: '100%' }}>
        <div style={{ fontFamily: FONT_STACK, textAlign: 'center', padding: 60 }}>
          <div style={{
            width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: accentColor,
            borderRadius: '50%', margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#6B7280', fontSize: 14 }}>Loading events...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ─── Public site: Full events list ──────────────────────────
  return (
    <div {...blockProps} className={styles || 'w-full'} style={{ height: '100%' }}>
      <div style={{ fontFamily: FONT_STACK, maxWidth: 720, margin: '0 auto', padding: '32px 20px', position: 'relative' }}>
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
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Event cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredEvents.map(event => {
            const { month, day, weekday } = formatEventDate(event.event_date);
            const remaining = event.capacity ? event.capacity - (event.tickets_sold || 0) : null;
            const soldOut = remaining !== null && remaining <= 0;
            const isHovered = hoveredEvent === event.id;

            return (
              <button
                key={event.id}
                onClick={() => { if (!soldOut) { setSelectedEvent(event); setRegForm({ name: '', email: '', phone: '', tickets: 1 }); setRegSuccess(false); } }}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
                disabled={soldOut}
                style={{
                  display: 'flex', gap: 16, padding: 16,
                  borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff',
                  cursor: soldOut ? 'default' : 'pointer', textAlign: 'left', width: '100%',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  boxShadow: isHovered && !soldOut ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
                  transform: isHovered && !soldOut ? 'translateY(-1px)' : 'none',
                  opacity: soldOut ? 0.6 : 1,
                  fontFamily: FONT_STACK,
                }}
              >
                {/* Date badge */}
                <div style={{
                  width: 60, height: 64, borderRadius: 12, flexShrink: 0,
                  backgroundColor: hexToRgba(accentColor, 0.08),
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: accentColor, textTransform: 'uppercase' }}>{month}</span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{day}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginTop: 2 }}>{weekday}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{event.name}</span>
                      {event.category && (
                        <span style={{
                          marginLeft: 8, padding: '2px 8px', borderRadius: 6,
                          fontSize: 10, fontWeight: 600, color: accentColor,
                          backgroundColor: hexToRgba(accentColor, 0.08),
                        }}>
                          {event.category}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: event.is_free ? '#059669' : accentColor, whiteSpace: 'nowrap', marginLeft: 12 }}>
                      {soldOut ? 'SOLD OUT' : event.is_free ? 'Free' : formatCents(event.ticket_price_cents || 0)}
                    </span>
                  </div>

                  {event.description && (
                    <p style={{
                      fontSize: 13, color: '#6B7280', margin: '4px 0 0', lineHeight: 1.5,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {event.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    {/* Time */}
                    <span style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                      {formatTime(event.start_time)}{event.end_time ? ` – ${formatTime(event.end_time)}` : ''}
                    </span>
                    {/* Venue */}
                    {event.venue && (
                      <span style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d={MAP_PIN_ICON} />
                        </svg>
                        {event.venue}
                      </span>
                    )}
                    {/* Capacity */}
                    {showCapacity && remaining !== null && !soldOut && (
                      <span style={{ fontSize: 12, fontWeight: 500, color: remaining <= 5 ? '#EF4444' : '#9CA3AF' }}>
                        {remaining} spot{remaining !== 1 ? 's' : ''} left
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── Registration modal ───────────────────────────────── */}
        {selectedEvent && (
          <>
            <div
              onClick={() => { setSelectedEvent(null); setRegSuccess(false); }}
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
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1A1A1A' }}>{selectedEvent.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>
                        {formatEventDate(selectedEvent.event_date).month} {formatEventDate(selectedEvent.event_date).day} · {formatTime(selectedEvent.start_time)}
                      </span>
                      {selectedEvent.venue && (
                        <span style={{ fontSize: 13, color: '#6B7280' }}>· {selectedEvent.venue}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedEvent(null); setRegSuccess(false); }}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none',
                      backgroundColor: '#F3F4F6', cursor: 'pointer',
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
                {regSuccess ? (
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
                    <h4 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>You&apos;re registered!</h4>
                    <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
                      A confirmation has been sent to <strong>{regForm.email}</strong>
                    </p>
                    <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                      {selectedEvent.name} · {formatEventDate(selectedEvent.event_date).month} {formatEventDate(selectedEvent.event_date).day} at {formatTime(selectedEvent.start_time)}
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedEvent.description && (
                      <p style={{ fontSize: 14, color: '#374151', marginBottom: 20, lineHeight: 1.6 }}>
                        {selectedEvent.description}
                      </p>
                    )}

                    {/* Price display */}
                    <div style={{
                      padding: 14, borderRadius: 12, backgroundColor: '#F9FAFB',
                      marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        {selectedEvent.is_free ? 'Free event' : `${formatCents(selectedEvent.ticket_price_cents || 0)} per ticket`}
                      </span>
                      {selectedEvent.capacity && (
                        <span style={{ fontSize: 12, color: '#6B7280' }}>
                          {selectedEvent.capacity - (selectedEvent.tickets_sold || 0)} spots remaining
                        </span>
                      )}
                    </div>

                    {/* Registration form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Name *</label>
                        <input
                          type="text" value={regForm.name}
                          onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
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
                          type="email" value={regForm.email}
                          onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                          style={{
                            width: '100%', padding: '10px 12px', borderRadius: 10,
                            border: '1px solid #E5E7EB', fontSize: 14, fontFamily: FONT_STACK,
                            boxSizing: 'border-box',
                          }}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Phone</label>
                        <input
                          type="tel" value={regForm.phone}
                          onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                          style={{
                            width: '100%', padding: '10px 12px', borderRadius: 10,
                            border: '1px solid #E5E7EB', fontSize: 14, fontFamily: FONT_STACK,
                            boxSizing: 'border-box',
                          }}
                          placeholder="(optional)"
                        />
                      </div>
                      {!selectedEvent.is_free && (
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Tickets</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                              onClick={() => setRegForm(f => ({ ...f, tickets: Math.max(1, f.tickets - 1) }))}
                              style={{
                                width: 32, height: 32, borderRadius: 8,
                                border: '1px solid #E5E7EB', backgroundColor: '#fff',
                                cursor: 'pointer', fontSize: 16, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >−</button>
                            <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{regForm.tickets}</span>
                            <button
                              onClick={() => setRegForm(f => ({ ...f, tickets: f.tickets + 1 }))}
                              style={{
                                width: 32, height: 32, borderRadius: 8,
                                border: '1px solid #E5E7EB', backgroundColor: '#fff',
                                cursor: 'pointer', fontSize: 16, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >+</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!regSuccess && (
                <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #E5E7EB' }}>
                  <button
                    onClick={handleRegister}
                    disabled={regSubmitting || !regForm.name || !regForm.email}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                      backgroundColor: (!regForm.name || !regForm.email) ? '#D1D5DB' : accentColor,
                      color: (!regForm.name || !regForm.email) ? '#6B7280' : buttonTextColor,
                      fontSize: 15, fontWeight: 600, cursor: (!regForm.name || !regForm.email) ? 'default' : 'pointer',
                    }}
                  >
                    {regSubmitting ? 'Registering...'
                      : selectedEvent.is_free ? 'Register — Free'
                      : `Get Tickets — ${formatCents((selectedEvent.ticket_price_cents || 0) * regForm.tickets)}`
                    }
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
