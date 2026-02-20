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

interface SlotInfo {
  time: string;
  available: boolean;
}

interface StaffOption {
  id: string;
  name: string;
}

const DEMO_SLOTS: SlotInfo[] = [
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

// Generate time slots from business hours and slot duration
function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  takenSlots: string[]
): SlotInfo[] {
  const slots: SlotInfo[] = [];
  const takenSet = new Set(takenSlots);

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let mins = startMinutes; mins + durationMinutes <= endMinutes; mins += durationMinutes) {
    const hour = Math.floor(mins / 60);
    const minute = mins % 60;
    const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const m = minute.toString().padStart(2, '0');
    const label = `${h}:${m} ${ampm}`;
    slots.push({ time: label, available: !takenSet.has(label) });
  }

  return slots;
}

// Extract subdomain from hostname (same pattern as GalleryWidget)
function getSubdomain(): string {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const sub = parts.length >= 3 ? parts[0] : '';
  if (!sub || sub === 'app' || sub === 'www' || sub === 'localhost') return '';
  return sub;
}

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
  const [selectedDateISO, setSelectedDateISO] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState<SlotInfo[]>(DEMO_SLOTS);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dayIsClosed, setDayIsClosed] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [booked, setBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingRef, setBookingRef] = useState('');

  // Staff picker state (for direct_booking mode)
  const [staffList, setStaffList] = useState<StaffOption[] | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignmentMode, setAssignmentMode] = useState('manual');

  const handleSelect = useCallback((item: DataItem) => {
    setLocalLinkedId(item.id);
    setLocalLinkedName(item.name);
    setSelectorOpen(false);
  }, []);

  // Fetch real availability when date changes
  useEffect(() => {
    if (inBuilder || !selectedDateISO) return;

    const subdomain = getSubdomain();
    if (!subdomain) {
      // No subdomain (localhost / demo) → use demo slots
      setSlots(DEMO_SLOTS);
      setDayIsClosed(false);
      return;
    }

    setLoadingSlots(true);
    setDayIsClosed(false);
    setSelectedSlot('');
    setSelectedStaff('');

    fetch(`/api/public/bookings/availability?subdomain=${subdomain}&date=${selectedDateISO}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setSlots(DEMO_SLOTS);
          return;
        }

        if (data.closed) {
          setDayIsClosed(true);
          setSlots([]);
          return;
        }

        // Generate real slots from business hours
        if (data.businessHours) {
          const realSlots = generateTimeSlots(
            data.businessHours.start,
            data.businessHours.end,
            data.slotDuration || 60,
            data.takenSlots || []
          );
          setSlots(realSlots);
        } else {
          // No business hours configured — fallback to 9-5 / 60min
          const fallbackSlots = generateTimeSlots('09:00', '17:00', 60, data.takenSlots || []);
          setSlots(fallbackSlots);
        }

        // Staff for direct booking
        setAssignmentMode(data.assignmentMode || 'manual');
        if (data.assignmentMode === 'direct_booking' && data.staff?.length > 0) {
          setStaffList(data.staff);
        } else {
          setStaffList(null);
        }
      })
      .catch(() => {
        // API failed — fall back to demo slots
        setSlots(DEMO_SLOTS);
        setDayIsClosed(false);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDateISO, inBuilder]);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Book appointment — POST to real API
  const handleBook = async () => {
    if (inBuilder) return;

    const subdomain = getSubdomain();
    if (!subdomain) {
      // No subdomain → just show confirmation (demo mode)
      setBooked(true);
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const body: Record<string, string> = {
        subdomain,
        name,
        email,
        date: selectedDateISO,
        time: selectedSlot,
      };
      if (selectedStaff) {
        body.staff_id = selectedStaff;
      }

      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.status === 409) {
        setBookingError('This time slot was just taken. Please choose another.');
        setSelectedSlot('');
        return;
      }

      if (!res.ok) {
        setBookingError(data.error || 'Failed to create booking. Please try again.');
        return;
      }

      setBookingRef(data.refNumber || '');
      setBooked(true);
    } catch {
      setBookingError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const duration = SERVICE_DURATIONS[localLinkedId] || '';

  // --- In Builder: No service linked → blank placeholder ---
  if (inBuilder && !localLinkedId) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          width: '100%', height: '100%', padding: 48,
          backgroundColor: '#F9FAFB', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            backgroundColor: '#F0F0F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5">
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
          {bookingRef && (
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, fontFamily: 'monospace' }}>
              Ref: {bookingRef}
            </p>
          )}
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
              const isoStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setSelectedDateISO(isoStr);
                    setSelectedSlot('');
                    setSelectedStaff('');
                    setBookingError('');
                  }}
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

        {/* Loading indicator */}
        {loadingSlots && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <div style={{
              width: 24, height: 24, border: `2px solid ${accentColor}`,
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Closed day message */}
        {selectedDate && !loadingSlots && dayIsClosed && (
          <div style={{
            padding: '20px 16px', borderRadius: 12,
            backgroundColor: '#FEF3C7', border: '1px solid #FDE68A',
            textAlign: 'center', marginBottom: 20,
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>Closed on this day</p>
            <p style={{ fontSize: 13, color: '#A16207' }}>Please select a different date</p>
          </div>
        )}

        {/* Time slots */}
        {selectedDate && !loadingSlots && !dayIsClosed && slots.length > 0 && (
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

        {/* No slots available message */}
        {selectedDate && !loadingSlots && !dayIsClosed && slots.length === 0 && (
          <div style={{
            padding: '20px 16px', borderRadius: 12,
            backgroundColor: '#F3F4F6', textAlign: 'center', marginBottom: 20,
          }}>
            <p style={{ fontSize: 14, color: '#6B7280' }}>No available times on this date</p>
          </div>
        )}

        {/* Staff picker (direct_booking mode only) */}
        {selectedSlot && staffList && staffList.length > 0 && assignmentMode === 'direct_booking' && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Choose your provider</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {staffList.map(s => {
                const isSelected = selectedStaff === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStaff(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10,
                      border: `2px solid ${isSelected ? accentColor : '#E5E7EB'}`,
                      backgroundColor: isSelected ? `${accentColor}10` : '#fff',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      backgroundColor: isSelected ? accentColor : '#E5E7EB',
                      color: isSelected ? '#fff' : '#6B7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 600, flexShrink: 0,
                    }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? accentColor : '#374151',
                    }}>
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error message */}
        {bookingError && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
            fontSize: 13, color: '#DC2626', marginBottom: 16,
          }}>
            {bookingError}
          </div>
        )}

        {/* Contact info — show when slot selected (and staff selected if needed) */}
        {selectedSlot && (!staffList || staffList.length === 0 || selectedStaff) && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Your info</p>
            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        )}

        {/* Book button */}
        {selectedSlot && name && email && (!staffList || staffList.length === 0 || selectedStaff) && (
          <button
            onClick={handleBook}
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '12px 24px', borderRadius: 12,
              backgroundColor: accentColor, color: '#fff',
              fontSize: 14, fontWeight: 600, border: 'none',
              cursor: isSubmitting ? 'wait' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Booking...' : buttonText}
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
