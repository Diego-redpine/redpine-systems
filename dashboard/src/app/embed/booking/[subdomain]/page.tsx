'use client';

/**
 * Embeddable Booking Widget
 * Renders the booking widget for a subdomain in iframe-friendly minimal layout.
 * No nav shell, no sidebar — just the widget in a clean layout.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';

interface BusinessConfig {
  businessName: string;
  businessType: string;
  colors: Record<string, string>;
  subdomain: string;
  logoUrl?: string;
}

interface SlotInfo {
  time: string;
  available: boolean;
}

interface ServiceInfo {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  duration_minutes?: number;
}

function generateTimeSlotsFromHours(
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

function generateFallbackSlots(): SlotInfo[] {
  return generateTimeSlotsFromHours('09:00', '17:00', 30, []);
}

function generateDates(): { date: Date; label: string; dayName: string }[] {
  const dates = [];
  const now = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push({
      date: d,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }
  return dates;
}

function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

export default function EmbedBookingPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'service' | 'date' | 'time' | 'details' | 'confirmed'>('service');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [bookingError, setBookingError] = useState('');

  const [services, setServices] = useState<ServiceInfo[] | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);
  const [servicesLoading, setServicesLoading] = useState(true);

  const dates = useMemo(() => generateDates(), []);
  const [timeSlots, setTimeSlots] = useState<SlotInfo[]>(() => generateFallbackSlots());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dayIsClosed, setDayIsClosed] = useState(false);

  useEffect(() => {
    if (selectedDate === null) return;
    const dateObj = dates[selectedDate].date;
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    setLoadingSlots(true);
    setDayIsClosed(false);

    const serviceParam = selectedService ? `&service_id=${selectedService.id}` : '';
    fetch(`/api/public/bookings/availability?subdomain=${subdomain}&date=${dateStr}${serviceParam}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) { setTimeSlots(generateFallbackSlots()); return; }
        if (data.closed) { setDayIsClosed(true); setTimeSlots([]); return; }
        if (data.businessHours) {
          setTimeSlots(generateTimeSlotsFromHours(data.businessHours.start, data.businessHours.end, data.slotDuration || 60, data.takenSlots || []));
        } else {
          setTimeSlots(generateTimeSlotsFromHours('09:00', '17:00', 30, data.takenSlots || []));
        }
      })
      .catch(() => { setTimeSlots(generateFallbackSlots()); setDayIsClosed(false); })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, dates, subdomain, selectedService]);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/subdomain`, { headers: { 'x-subdomain': subdomain } });
        if (!res.ok) { setError('Business not found'); setIsLoading(false); return; }
        const data = await res.json();
        if (data.success && data.data) {
          setConfig({
            businessName: data.data.businessName || 'Business',
            businessType: data.data.businessType || 'service',
            colors: data.data.colors || {},
            subdomain: data.data.subdomain || subdomain,
            logoUrl: data.data.logoUrl,
          });
        } else { setError('Business not found'); }
      } catch { setError('Unable to load booking widget'); }
      setIsLoading(false);
    }
    fetchConfig();
  }, [subdomain]);

  useEffect(() => {
    fetch(`/api/public/services?subdomain=${subdomain}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.services?.length > 0) { setServices(data.services); }
        else { setServices([]); setStep('date'); }
      })
      .catch(() => { setServices([]); setStep('date'); })
      .finally(() => setServicesLoading(false));
  }, [subdomain]);

  const accentColor = config?.colors?.buttons || config?.colors?.sidebar_bg || '#1A1A1A';
  const accentTextColor = isColorLight(accentColor) ? '#000000' : '#FFFFFF';

  const handleSubmit = async () => {
    if (!name || !email || selectedDate === null || !selectedTime) return;
    setIsSubmitting(true);
    setBookingError('');
    const dateObj = dates[selectedDate].date;
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    try {
      const body: Record<string, string | number> = { subdomain, name, email, phone, date: dateStr, time: selectedTime, notes };
      if (selectedService) body.service_id = selectedService.id;
      const res = await fetch('/api/public/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.status === 409) { setBookingError('This time slot was just taken. Please choose another time.'); setSelectedTime(null); setStep('time'); return; }
      if (!res.ok) { setBookingError(data.error || 'Failed to create booking.'); return; }
      setBookingRef(data.refNumber || '');
      setStep('confirmed');
    } catch { setBookingError('Something went wrong. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="p-6 bg-white text-center">
        <p className="text-sm text-gray-500">Booking widget unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {config.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: accentColor, color: accentTextColor }}>
              {config.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-base font-bold text-gray-900">{config.businessName}</h1>
            <p className="text-xs text-gray-500">Book an appointment</p>
          </div>
        </div>

        {/* Service selection */}
        {step === 'service' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Choose a service</h2>
            {servicesLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <div className="space-y-2">
                {services?.map(svc => (
                  <button key={svc.id} onClick={() => { setSelectedService(svc); setStep('date'); }}
                    className="w-full text-left p-3 rounded-xl border-2 transition-all hover:shadow-sm"
                    style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{svc.name}</p>
                        {svc.duration_minutes && <p className="text-xs text-gray-400 mt-0.5">{svc.duration_minutes} min</p>}
                      </div>
                      <span className="text-sm font-bold" style={{ color: accentColor }}>${(svc.price_cents / 100).toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Date selection */}
        {step === 'date' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Select a date</h2>
            <div className="grid grid-cols-4 gap-2">
              {dates.map((d, i) => (
                <button key={i} onClick={() => { setSelectedDate(i); setSelectedTime(null); setStep('time'); }}
                  className="flex flex-col items-center p-2 rounded-xl border-2 transition-all text-xs"
                  style={{ borderColor: selectedDate === i ? accentColor : '#E5E7EB', backgroundColor: selectedDate === i ? accentColor : '#FFF', color: selectedDate === i ? accentTextColor : '#374151' }}>
                  <span className="font-medium opacity-70">{d.dayName}</span>
                  <span className="text-sm font-bold">{d.date.getDate()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time selection */}
        {step === 'time' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Select a time</h2>
              <button onClick={() => setStep('date')} className="text-xs font-medium" style={{ color: accentColor }}>Change date</button>
            </div>
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
              </div>
            ) : dayIsClosed ? (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500">Closed on this day</p>
                <button onClick={() => setStep('date')} className="mt-2 text-xs font-medium" style={{ color: accentColor }}>Choose another date</button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(slot => (
                  <button key={slot.time} disabled={!slot.available}
                    onClick={() => { if (slot.available) { setSelectedTime(slot.time); setStep('details'); } }}
                    className="p-2 rounded-xl border-2 text-xs font-medium transition-all disabled:opacity-30"
                    style={{ borderColor: selectedTime === slot.time ? accentColor : '#E5E7EB', backgroundColor: selectedTime === slot.time ? accentColor : '#FFF', color: selectedTime === slot.time ? accentTextColor : '#374151' }}>
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details */}
        {step === 'details' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Your details</h2>
              <button onClick={() => setStep('time')} className="text-xs font-medium" style={{ color: accentColor }}>Change time</button>
            </div>
            {bookingError && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{bookingError}</div>}
            <div className="space-y-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name *"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" />
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none resize-none" />
              <button onClick={handleSubmit} disabled={!name || !email || isSubmitting}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
                style={{ backgroundColor: accentColor, color: accentTextColor }}>
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {/* Confirmed */}
        {step === 'confirmed' && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: accentColor }}>
              <svg className="w-6 h-6" fill="none" stroke={accentTextColor} viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Booking Confirmed</h2>
            <p className="text-sm text-gray-500 mb-3">Your appointment has been booked.</p>
            {bookingRef && <p className="text-xs text-gray-400 font-mono">Ref: {bookingRef}</p>}
          </div>
        )}

        {/* Powered by Red Pine */}
        <div className="text-center mt-6 pb-2">
          <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-fira-code), monospace' }}>
            Powered by <span className="font-semibold text-red-600">Red Pine</span>
          </p>
        </div>
      </div>
    </div>
  );
}
