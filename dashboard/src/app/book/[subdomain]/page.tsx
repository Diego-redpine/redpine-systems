'use client';

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
  category?: string;
}

// Generate time slots dynamically from business hours and slot duration
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

// Fallback: Generate 9am–5pm in 30min intervals (original behavior)
function generateFallbackSlots(): SlotInfo[] {
  return generateTimeSlotsFromHours('09:00', '17:00', 30, []);
}

// Generate next 14 days
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

export default function BookingPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking form state
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

  // Service selection state
  const [services, setServices] = useState<ServiceInfo[] | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);
  const [servicesLoading, setServicesLoading] = useState(true);

  const dates = useMemo(() => generateDates(), []);

  // Dynamic slot state (replaces old hardcoded timeSlots)
  const [timeSlots, setTimeSlots] = useState<SlotInfo[]>(() => generateFallbackSlots());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dayIsClosed, setDayIsClosed] = useState(false);

  // Staff picker state
  const [staffList, setStaffList] = useState<{ id: string; name: string }[] | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignmentMode, setAssignmentMode] = useState('manual');

  // Fetch real availability when date is selected
  useEffect(() => {
    if (selectedDate === null) return;
    const dateObj = dates[selectedDate].date;
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    setLoadingSlots(true);
    setDayIsClosed(false);
    setSelectedStaff('');

    const serviceParam = selectedService ? `&service_id=${selectedService.id}` : '';
    fetch(`/api/public/bookings/availability?subdomain=${subdomain}&date=${dateStr}${serviceParam}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setTimeSlots(generateFallbackSlots());
          return;
        }

        if (data.closed) {
          setDayIsClosed(true);
          setTimeSlots([]);
          return;
        }

        // Generate real slots from business hours
        if (data.businessHours) {
          setTimeSlots(generateTimeSlotsFromHours(
            data.businessHours.start,
            data.businessHours.end,
            data.slotDuration || 60,
            data.takenSlots || []
          ));
        } else {
          // No business hours configured — fallback with taken slots
          setTimeSlots(generateTimeSlotsFromHours(
            '09:00', '17:00', 30,
            data.takenSlots || []
          ));
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
        setTimeSlots(generateFallbackSlots());
        setDayIsClosed(false);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, dates, subdomain, selectedService]);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/subdomain`, {
          headers: { 'x-subdomain': subdomain },
        });
        if (!res.ok) {
          setError('Business not found');
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        if (data.success && data.data) {
          setConfig({
            businessName: data.data.businessName || 'Business',
            businessType: data.data.businessType || 'service',
            colors: data.data.colors || {},
            subdomain: data.data.subdomain || subdomain,
            logoUrl: data.data.logoUrl,
          });
        } else {
          setError('Business not found');
        }
      } catch {
        setError('Unable to load booking page');
      }
      setIsLoading(false);
    }
    fetchConfig();
  }, [subdomain]);

  // Fetch services for this business
  useEffect(() => {
    fetch(`/api/public/services?subdomain=${subdomain}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.services?.length > 0) {
          setServices(data.services);
        } else {
          setServices([]);
          // No services — skip to date step
          setStep('date');
        }
      })
      .catch(() => {
        setServices([]);
        setStep('date');
      })
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
      const body: Record<string, string> = {
        subdomain,
        name,
        email,
        phone,
        date: dateStr,
        time: selectedTime,
        notes,
      };
      if (selectedStaff) {
        body.staff_id = selectedStaff;
      }
      if (selectedService) {
        body.service_id = selectedService.id;
      }

      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Time slot conflict — go back to time selection
        setBookingError('This time slot was just taken. Please choose another time.');
        setSelectedTime(null);
        setStep('time');
        return;
      }

      if (!res.ok) {
        setBookingError(data.error || 'Failed to create booking. Please try again.');
        return;
      }

      setBookingRef(data.refNumber || '');
      setStep('confirmed');
    } catch {
      setBookingError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Red Pine OS"
            className="mx-auto mb-8"
            style={{ height: '10rem', animation: 'heartbeat 1.2s ease-in-out infinite' }}
          />
          <p className="text-xl font-semibold text-gray-900">Loading<span className="loading-dots" /></p>
          <style>{`
            @keyframes heartbeat {
              0% { transform: scale(1); }
              14% { transform: scale(1.1); }
              28% { transform: scale(1); }
              42% { transform: scale(1.1); }
              70% { transform: scale(1); }
            }
            .loading-dots::after {
              content: '';
              animation: dots 1.5s steps(4, end) infinite;
            }
            @keyframes dots {
              0% { content: ''; }
              25% { content: '.'; }
              50% { content: '..'; }
              75% { content: '...'; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500 text-sm">This booking page doesn&apos;t exist or has been disabled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
          ) : (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: accentColor, color: accentTextColor }}
            >
              {config.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">{config.businessName}</h1>
            <p className="text-xs text-gray-500">Book an appointment</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress indicator */}
        {step !== 'confirmed' && (() => {
          const hasServices = services && services.length > 0;
          const allSteps = hasServices ? ['service', 'date', 'time', 'details'] : ['date', 'time', 'details'];
          const currentIdx = allSteps.indexOf(step);
          return (
            <div className="flex items-center gap-2 mb-8">
              {allSteps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: step === s ? accentColor : i < currentIdx ? accentColor : '#E5E7EB',
                      color: step === s || i < currentIdx ? accentTextColor : '#9CA3AF',
                    }}
                  >
                    {i < currentIdx ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < allSteps.length - 1 && <div className="w-12 h-0.5 bg-gray-200 rounded" />}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Step 0: Service selection (if services exist) */}
        {step === 'service' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose a service</h2>
            <p className="text-sm text-gray-500 mb-6">Select the service you would like to book</p>
            {servicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <div className="space-y-3">
                {services?.map(svc => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedService(svc); setStep('date'); }}
                    className="w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm"
                    style={{
                      borderColor: selectedService?.id === svc.id ? accentColor : '#E5E7EB',
                      backgroundColor: selectedService?.id === svc.id ? `${accentColor}08` : '#FFFFFF',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{svc.name}</p>
                        {svc.description && <p className="text-sm text-gray-500 mt-0.5">{svc.description}</p>}
                        {svc.duration_minutes && (
                          <p className="text-xs text-gray-400 mt-1">
                            {svc.duration_minutes < 60
                              ? `${svc.duration_minutes} min`
                              : `${Math.floor(svc.duration_minutes / 60)}h${svc.duration_minutes % 60 ? ` ${svc.duration_minutes % 60}m` : ''}`}
                          </p>
                        )}
                      </div>
                      <span className="text-lg font-bold" style={{ color: accentColor }}>
                        ${(svc.price_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Date selection */}
        {step === 'date' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900">Select a date</h2>
              {selectedService && (
                <button
                  onClick={() => setStep('service')}
                  className="text-sm font-medium hover:underline"
                  style={{ color: accentColor }}
                >
                  Change service
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {selectedService ? `${selectedService.name} — $${(selectedService.price_cents / 100).toFixed(2)}` : 'Choose your preferred appointment date'}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {dates.map((d, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(i); setSelectedTime(null); setStep('time'); }}
                  className="flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-sm"
                  style={{
                    borderColor: selectedDate === i ? accentColor : '#E5E7EB',
                    backgroundColor: selectedDate === i ? accentColor : '#FFFFFF',
                    color: selectedDate === i ? accentTextColor : '#374151',
                  }}
                >
                  <span className="text-[10px] font-medium uppercase opacity-70">{d.dayName}</span>
                  <span className="text-base font-bold">{d.date.getDate()}</span>
                  <span className="text-[10px] opacity-70">{d.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time selection */}
        {step === 'time' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Select a time</h2>
                <p className="text-sm text-gray-500">{selectedDate !== null ? dates[selectedDate].label : ''}</p>
              </div>
              <button
                onClick={() => setStep('date')}
                className="text-sm font-medium hover:underline"
                style={{ color: accentColor }}
              >
                Change date
              </button>
            </div>
            {bookingError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {bookingError}
              </div>
            )}

            {/* Loading spinner */}
            {loadingSlots ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
              </div>
            ) : dayIsClosed ? (
              /* Closed day message */
              <div className="py-8 text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">Closed on this day</p>
                <p className="text-sm text-gray-500 mb-4">This business is not available on the selected date.</p>
                <button
                  onClick={() => setStep('date')}
                  className="text-sm font-medium hover:underline"
                  style={{ color: accentColor }}
                >
                  Choose a different date
                </button>
              </div>
            ) : timeSlots.length === 0 ? (
              /* No slots */
              <div className="py-8 text-center">
                <p className="text-gray-500">No available times on this date</p>
                <button
                  onClick={() => setStep('date')}
                  className="mt-3 text-sm font-medium hover:underline"
                  style={{ color: accentColor }}
                >
                  Choose a different date
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => {
                        if (slot.available) {
                          setSelectedTime(slot.time);
                          // If staff selection needed, don't advance yet
                          if (!staffList || staffList.length === 0) {
                            setStep('details');
                          }
                        }
                      }}
                      className="p-3 rounded-xl border-2 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-sm"
                      style={{
                        borderColor: selectedTime === slot.time ? accentColor : '#E5E7EB',
                        backgroundColor: selectedTime === slot.time ? accentColor : '#FFFFFF',
                        color: selectedTime === slot.time ? accentTextColor : !slot.available ? '#9CA3AF' : '#374151',
                        textDecoration: !slot.available ? 'line-through' : 'none',
                      }}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>

                {/* Staff picker (direct_booking mode) */}
                {selectedTime && staffList && staffList.length > 0 && assignmentMode === 'direct_booking' && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Choose your provider</p>
                    <div className="grid grid-cols-2 gap-2">
                      {staffList.map(s => {
                        const isSel = selectedStaff === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => { setSelectedStaff(s.id); setStep('details'); }}
                            className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:shadow-sm text-left"
                            style={{
                              borderColor: isSel ? accentColor : '#E5E7EB',
                              backgroundColor: isSel ? `${accentColor}10` : '#FFFFFF',
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{
                                backgroundColor: isSel ? accentColor : '#E5E7EB',
                                color: isSel ? accentTextColor : '#6B7280',
                              }}
                            >
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium" style={{ color: isSel ? accentColor : '#374151' }}>
                              {s.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Contact details */}
        {step === 'details' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Your details</h2>
                <p className="text-sm text-gray-500">
                  {selectedService ? `${selectedService.name} · ` : ''}
                  {selectedDate !== null ? dates[selectedDate].label : ''} at {selectedTime}
                  {selectedStaff && staffList ? ` with ${staffList.find(s => s.id === selectedStaff)?.name}` : ''}
                </p>
              </div>
              <button
                onClick={() => setStep('time')}
                className="text-sm font-medium hover:underline"
                style={{ color: accentColor }}
              >
                Change time
              </button>
            </div>
            {bookingError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {bookingError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none transition-colors"
                  style={{ borderColor: name ? accentColor : undefined }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none transition-colors"
                  style={{ borderColor: email ? accentColor : undefined }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none transition-colors"
                  style={{ borderColor: phone ? accentColor : undefined }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special requests..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none transition-colors resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!name || !email || isSubmitting}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
                style={{ backgroundColor: accentColor, color: accentTextColor }}
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {step === 'confirmed' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: accentColor }}
            >
              <svg className="w-8 h-8" fill="none" stroke={accentTextColor} viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your appointment with {config.businessName} has been booked.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
              {bookingRef && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-medium text-gray-900 font-mono">{bookingRef}</span>
                </div>
              )}
              {selectedService && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service</span>
                    <span className="font-medium text-gray-900">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="font-medium text-gray-900">${(selectedService.price_cents / 100).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{selectedDate !== null ? dates[selectedDate].label : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{selectedTime}</span>
              </div>
              {selectedStaff && staffList && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Provider</span>
                  <span className="font-medium text-gray-900">{staffList.find(s => s.id === selectedStaff)?.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-900">{name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{email}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">A confirmation email has been sent to {email}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-fira-code), monospace' }}>
            Powered by <span className="font-semibold text-gray-500">Red Pine</span>
          </p>
        </div>
      </main>
    </div>
  );
}
