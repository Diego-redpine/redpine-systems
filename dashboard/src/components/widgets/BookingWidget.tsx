'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataSelector, DataItem } from './DataSelector';

interface BookingWidgetProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  buttonText?: string;
  accentColor?: string;
  linkedServiceId?: string;
  linkedServiceName?: string;
  [key: string]: unknown;
}

const DEMO_SLOTS = [
  { time: '9:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: false },
  { time: '12:00 PM', available: true },
  { time: '1:00 PM', available: true },
  { time: '2:00 PM', available: false },
  { time: '3:00 PM', available: true },
  { time: '4:00 PM', available: true },
];

// Duration info per service for display
const SERVICE_DURATIONS: Record<string, string> = {
  svc_1: '30 min',
  svc_2: '15 min',
  svc_3: '60 min',
  svc_4: '20 min',
};

const SERVICE_ICON = 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5';

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Book an Appointment',
  buttonText = 'Confirm Booking',
  accentColor = '#1A1A1A',
  linkedServiceId = '',
  linkedServiceName = '',
}) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [localLinkedId, setLocalLinkedId] = useState(linkedServiceId);
  const [localLinkedName, setLocalLinkedName] = useState(linkedServiceName);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState(DEMO_SLOTS);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [booked, setBooked] = useState(false);

  const handleSelect = useCallback((item: DataItem) => {
    setLocalLinkedId(item.id);
    setLocalLinkedName(item.name);
    setSelectorOpen(false);
  }, []);

  useEffect(() => {
    if (inBuilder || !selectedDate) return;
    setSlots(DEMO_SLOTS);
  }, [selectedDate, inBuilder]);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleBook = () => {
    if (inBuilder) return;
    setBooked(true);
  };

  const duration = SERVICE_DURATIONS[localLinkedId] || '';

  // --- In Builder: No service linked → blank placeholder ---
  if (inBuilder && !localLinkedId) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          maxWidth: 480, margin: '0 auto', padding: 48,
          borderRadius: 16, border: '2px dashed #D1D5DB',
          backgroundColor: '#FAFAFA', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            backgroundColor: `${accentColor}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={SERVICE_ICON} />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No service connected</p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
            Select a service from your dashboard for customers to book
          </p>
          <button
            onClick={() => setSelectorOpen(true)}
            style={{
              padding: '10px 24px', borderRadius: 10,
              backgroundColor: accentColor, color: '#fff',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            Select Service
          </button>
        </div>
        <DataSelector
          entityType="services"
          isOpen={selectorOpen}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // --- In Builder: Service linked → preview with header badge ---
  if (inBuilder && localLinkedId) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 32, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20, padding: '12px 16px', borderRadius: 10,
            backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: `${accentColor}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={SERVICE_ICON} />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{localLinkedName}</p>
                {duration && <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{duration}</p>}
              </div>
            </div>
            <button
              onClick={() => setSelectorOpen(true)}
              style={{
                padding: '5px 12px', borderRadius: 6,
                backgroundColor: 'transparent', border: `1px solid ${accentColor}30`,
                color: accentColor, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Change
            </button>
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>{heading}</h3>

          {/* Dimmed preview of date picker */}
          <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Select a date</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {dates.slice(0, 5).map(d => {
                const dateStr = `${monthNames[d.getMonth()]} ${d.getDate()}`;
                return (
                  <div key={dateStr} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '8px 12px', borderRadius: 12, border: '2px solid #E5E7EB',
                    backgroundColor: '#fff', minWidth: 56, fontSize: 13, fontWeight: 600,
                  }}>
                    <span style={{ fontSize: 11, opacity: 0.7 }}>{dayNames[d.getDay()]}</span>
                    <span>{d.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <DataSelector
          entityType="services"
          isOpen={selectorOpen}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // --- Public site: booked confirmation ---
  if (booked) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 32, textAlign: 'center', borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#10B98120', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Booking Confirmed!</h3>
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            {localLinkedName && <>{localLinkedName} &mdash; </>}{selectedDate} at {selectedSlot}
          </p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>A confirmation email has been sent to {email}</p>
        </div>
      </div>
    );
  }

  // --- Public site: full booking flow ---
  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 32, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>{heading}</h3>
        {localLinkedName && (
          <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 }}>
            {localLinkedName}{duration && <> &middot; {duration}</>}
          </p>
        )}

        {/* Date selector */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Select a date</p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {dates.map(d => {
              const dateStr = `${monthNames[d.getMonth()]} ${d.getDate()}`;
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={dateStr}
                  onClick={() => { setSelectedDate(dateStr); setSelectedSlot(''); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '8px 12px', borderRadius: 12, border: `2px solid ${isSelected ? accentColor : '#E5E7EB'}`,
                    backgroundColor: isSelected ? accentColor : '#fff',
                    color: isSelected ? '#fff' : '#1A1A1A',
                    cursor: 'pointer', minWidth: 56, fontSize: 13, fontWeight: 600,
                  }}
                >
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{dayNames[d.getDay()]}</span>
                  <span>{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Available times</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {slots.map(slot => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedSlot(slot.time)}
                  disabled={!slot.available}
                  style={{
                    padding: '8px 4px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                    border: `1px solid ${selectedSlot === slot.time ? accentColor : '#E5E7EB'}`,
                    backgroundColor: selectedSlot === slot.time ? accentColor : slot.available ? '#fff' : '#F3F4F6',
                    color: selectedSlot === slot.time ? '#fff' : slot.available ? '#1A1A1A' : '#9CA3AF',
                    cursor: slot.available ? 'pointer' : 'not-allowed',
                    textDecoration: slot.available ? 'none' : 'line-through',
                  }}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contact info */}
        {selectedSlot && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Your info</p>
            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        )}

        {/* Book button */}
        {selectedSlot && name && email && (
          <button onClick={handleBook} style={{
            width: '100%', padding: '12px 24px', borderRadius: 12,
            backgroundColor: accentColor, color: '#fff',
            fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
          }}>
            {buttonText}
          </button>
        )}

        {!localLinkedId && !selectedDate && (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF', padding: '16px 0' }}>
            Booking widget — customers will see available dates and times
          </p>
        )}
      </div>
    </div>
  );
};
