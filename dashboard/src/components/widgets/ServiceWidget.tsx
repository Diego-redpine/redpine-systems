'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getSubdomain,
  generateTimeSlots,
  generateFallbackSlots,
  formatCents,
  isColorLight,
  formatDateISO,
  formatDateDisplay,
  SlotInfo,
  ServiceInfo,
} from '@/lib/widget-utils';
import { MonthCalendar } from './MonthCalendar';

// ─── Types ──────────────────────────────────────────────────────

interface ServiceWidgetProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  showCategories?: boolean;
  showPrices?: boolean;
  showDurations?: boolean;
  accentColor?: string;
  viewportWidth?: number;
  sectionHeight?: number;
  [key: string]: unknown;
}

interface StaffOption {
  id: string;
  name: string;
}

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

// ─── Constants ──────────────────────────────────────────────────

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const CALENDAR_ICON = 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5';

const DEMO_SERVICES: ServiceInfo[] = [
  { id: 'demo_1', name: 'Initial Consultation', description: 'Comprehensive first visit assessment', price_cents: 7500, duration_minutes: 60, category: 'Consultations' },
  { id: 'demo_2', name: 'Follow-up Visit', description: 'Progress check-in appointment', price_cents: 5000, duration_minutes: 30, category: 'Consultations' },
  { id: 'demo_3', name: 'Full Treatment', description: 'Complete service session', price_cents: 15000, duration_minutes: 90, category: 'Treatments' },
  { id: 'demo_4', name: 'Express Service', description: 'Quick focused session', price_cents: 3500, duration_minutes: 20, category: 'Express' },
  { id: 'demo_5', name: 'Premium Package', description: 'Our signature experience', price_cents: 25000, duration_minutes: 120, category: 'Treatments' },
  { id: 'demo_6', name: 'Quick Touch-up', description: 'Fast maintenance service', price_cents: 2000, duration_minutes: 15, category: 'Express' },
];

// ─── Helpers ────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Component ──────────────────────────────────────────────────

export const ServiceWidget: React.FC<ServiceWidgetProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Book a Service',
  showCategories = true,
  showPrices = true,
  showDurations = true,
  accentColor = '#1A1A1A',
  viewportWidth = 1200,
  sectionHeight,
}) => {
  // ─── State ──────────────────────────────────────────────────
  const [step, setStep] = useState<BookingStep>(1);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Calendar
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);

  // Time slots
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dayIsClosed, setDayIsClosed] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Staff
  const [staffList, setStaffList] = useState<StaffOption[] | null>(null);
  const [assignmentMode, setAssignmentMode] = useState('manual');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  // Contact form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingRef, setBookingRef] = useState('');

  // ─── Derived ────────────────────────────────────────────────
  const btnTextColor = isColorLight(accentColor) ? '#000000' : '#FFFFFF';

  const categories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach(s => { if (s.category) cats.add(s.category); });
    return ['All', ...Array.from(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (activeCategory === 'All') return services;
    return services.filter(s => s.category === activeCategory);
  }, [services, activeCategory]);

  const selectedDateObj = useMemo(() => {
    if (!selectedDateISO) return null;
    const [y, m, d] = selectedDateISO.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDateISO]);

  // ─── Fetch services on mount ────────────────────────────────
  useEffect(() => {
    if (inBuilder) {
      setServices(DEMO_SERVICES);
      return;
    }

    const subdomain = getSubdomain();
    if (!subdomain) {
      setServices(DEMO_SERVICES);
      return;
    }

    setServicesLoading(true);
    fetch(`/api/public/services?subdomain=${subdomain}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.services?.length > 0) {
          setServices(data.services);
        } else {
          setServices(DEMO_SERVICES);
        }
      })
      .catch(() => {
        setServices(DEMO_SERVICES);
      })
      .finally(() => setServicesLoading(false));
  }, [inBuilder]);

  // ─── Fetch availability when date selected ──────────────────
  useEffect(() => {
    if (inBuilder || !selectedDateISO || step !== 3) return;

    const subdomain = getSubdomain();
    if (!subdomain) {
      setSlots(generateFallbackSlots());
      setDayIsClosed(false);
      return;
    }

    setLoadingSlots(true);
    setDayIsClosed(false);
    setSelectedSlot(null);
    setSelectedStaff(null);

    const serviceParam = selectedService ? `&service_id=${selectedService.id}` : '';
    fetch(`/api/public/bookings/availability?subdomain=${subdomain}&date=${selectedDateISO}${serviceParam}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setSlots(generateFallbackSlots());
          return;
        }

        if (data.closed) {
          setDayIsClosed(true);
          setSlots([]);
          return;
        }

        if (data.businessHours) {
          const realSlots = generateTimeSlots(
            data.businessHours.start,
            data.businessHours.end,
            data.slotDuration || 60,
            data.takenSlots || []
          );
          setSlots(realSlots);
        } else {
          setSlots(generateTimeSlots('09:00', '17:00', 30, data.takenSlots || []));
        }

        setAssignmentMode(data.assignmentMode || 'manual');
        if (data.assignmentMode === 'direct_booking' && data.staff?.length > 0) {
          setStaffList(data.staff);
        } else {
          setStaffList(null);
        }
      })
      .catch(() => {
        setSlots(generateFallbackSlots());
        setDayIsClosed(false);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDateISO, step, inBuilder, selectedService]);

  // ─── Handlers ───────────────────────────────────────────────

  const handleSelectService = useCallback((service: ServiceInfo) => {
    setSelectedService(service);
    setStep(2);
  }, []);

  const handleSelectDate = useCallback((dateISO: string) => {
    setSelectedDateISO(dateISO);
    setStep(3);
  }, []);

  const handleSelectSlot = useCallback((time: string) => {
    setSelectedSlot(time);
    if (staffList && staffList.length > 0 && assignmentMode === 'direct_booking') {
      setStep(4);
    } else {
      setStep(5);
    }
  }, [staffList, assignmentMode]);

  const handleSelectStaff = useCallback((staffId: string) => {
    setSelectedStaff(staffId);
    setStep(5);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name || !email || !selectedDateISO || !selectedSlot) return;

    const subdomain = getSubdomain();
    if (!subdomain) {
      // Demo mode — just show confirmation
      setBookingRef('DEMO-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setStep(6);
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const body: Record<string, string> = {
        subdomain,
        name,
        email,
        phone,
        date: selectedDateISO,
        time: selectedSlot,
        notes,
      };
      if (selectedStaff) body.staff_id = selectedStaff;
      if (selectedService) body.service_id = selectedService.id;

      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.status === 409) {
        setBookingError('This slot was just taken. Please choose another time.');
        setSelectedSlot(null);
        setStep(3);
        return;
      }

      if (!res.ok) {
        setBookingError(data.error || 'Failed to create booking. Please try again.');
        return;
      }

      setBookingRef(data.refNumber || '');
      setStep(6);
    } catch {
      setBookingError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, phone, notes, selectedDateISO, selectedSlot, selectedStaff, selectedService]);

  const handleBookAnother = useCallback(() => {
    setStep(1);
    setSelectedService(null);
    setSelectedDateISO(null);
    setSelectedSlot(null);
    setSelectedStaff(null);
    setStaffList(null);
    setAssignmentMode('manual');
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setBookingError('');
    setBookingRef('');
    setActiveCategory('All');
  }, []);

  // ─── Shared Style Helpers ───────────────────────────────────

  const containerStyle: React.CSSProperties = {
    fontFamily: FONT_STACK,
    maxWidth: inBuilder ? undefined : 560,
    margin: inBuilder ? undefined : '0 auto',
    padding: inBuilder ? '20px' : 0,
    boxSizing: 'border-box',
    ...(inBuilder ? { flex: 1 } : {}),
    height: '100%',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid #E5E7EB',
    padding: 28,
    boxSizing: 'border-box',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: '#1A1A1A',
    margin: '0 0 4px 0',
    fontFamily: FONT_STACK,
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#6B7280',
    margin: '0 0 20px 0',
    fontFamily: FONT_STACK,
  };

  const backLinkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 500,
    color: accentColor,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: FONT_STACK,
    marginBottom: 16,
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 24px',
    borderRadius: 12,
    backgroundColor: accentColor,
    color: btnTextColor,
    fontSize: 15,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    fontFamily: FONT_STACK,
    transition: 'opacity 0.15s ease',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '2px solid #E5E7EB',
    fontSize: 14,
    fontFamily: FONT_STACK,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
    fontFamily: FONT_STACK,
  };

  // Chevron left SVG for back links
  const ChevronLeft = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );

  // ─── IN-BUILDER MODE ─────────────────────────────────────────

  if (inBuilder) {
    const previewServices = DEMO_SERVICES.slice(0, 4);
    return (
      <div {...blockProps} className={styles || ''}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            {/* Heading */}
            <h3 style={{ ...headingStyle, textAlign: 'center', marginBottom: 20 }}>{heading}</h3>

            {/* Preview content — dimmed and non-interactive */}
            <div style={{ opacity: 0.7, pointerEvents: 'none' }}>
              {/* Category tabs */}
              {showCategories && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  {['All', 'Consultations', 'Treatments', 'Express'].map((cat, i) => (
                    <div key={cat} style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: FONT_STACK,
                      backgroundColor: i === 0 ? accentColor : '#F3F4F6',
                      color: i === 0 ? btnTextColor : '#6B7280',
                    }}>
                      {cat}
                    </div>
                  ))}
                </div>
              )}

              {/* Service cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: (viewportWidth < 480 || (sectionHeight != null && sectionHeight > 600)) ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
                {previewServices.map(svc => (
                  <div key={svc.id} style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    padding: 16,
                    boxSizing: 'border-box',
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px 0', fontFamily: FONT_STACK }}>
                      {svc.name}
                    </p>
                    {svc.description && (
                      <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 10px 0', fontFamily: FONT_STACK, lineHeight: 1.4 }}>
                        {svc.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {showDurations && svc.duration_minutes && (
                          <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: FONT_STACK }}>
                            {formatDuration(svc.duration_minutes)}
                          </span>
                        )}
                        {showPrices && (
                          <span style={{ fontSize: 13, fontWeight: 700, color: accentColor, fontFamily: FONT_STACK }}>
                            {formatCents(svc.price_cents)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 1: SERVICE CATALOG ──────────────────────────────────

  if (step === 1) {
    return (
      <div {...blockProps} className={styles || ''}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h3 style={{ ...headingStyle, textAlign: 'center' }}>{heading}</h3>
            <p style={{ ...subheadingStyle, textAlign: 'center' }}>Select the service you would like to book</p>

            {/* Loading */}
            {servicesLoading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  border: `3px solid ${accentColor}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'sw-spin 0.6s linear infinite',
                }} />
                <style>{`@keyframes sw-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Category filter tabs */}
            {!servicesLoading && showCategories && categories.length > 2 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {categories.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: FONT_STACK,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: isActive ? accentColor : '#F3F4F6',
                        color: isActive ? btnTextColor : '#6B7280',
                        transition: 'background-color 0.15s ease, color 0.15s ease',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Service cards */}
            {!servicesLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {filteredServices.map(svc => (
                  <div
                    key={svc.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid #E5E7EB',
                      padding: 16,
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px 0', fontFamily: FONT_STACK }}>
                      {svc.name}
                    </p>
                    {svc.description && (
                      <p style={{
                        fontSize: 12,
                        color: '#9CA3AF',
                        margin: '0 0 12px 0',
                        fontFamily: FONT_STACK,
                        lineHeight: 1.45,
                        flex: 1,
                      }}>
                        {svc.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {showDurations && svc.duration_minutes && (
                          <span style={{
                            fontSize: 11,
                            color: '#9CA3AF',
                            fontFamily: FONT_STACK,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {formatDuration(svc.duration_minutes)}
                          </span>
                        )}
                      </div>
                      {showPrices && (
                        <span style={{ fontSize: 15, fontWeight: 700, color: accentColor, fontFamily: FONT_STACK }}>
                          {formatCents(svc.price_cents)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSelectService(svc)}
                      style={{
                        width: '100%',
                        padding: '9px 0',
                        borderRadius: 8,
                        backgroundColor: accentColor,
                        color: btnTextColor,
                        fontSize: 13,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: FONT_STACK,
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* No services */}
            {!servicesLoading && filteredServices.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontSize: 14, color: '#9CA3AF', fontFamily: FONT_STACK }}>
                  No services available in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: MONTH CALENDAR ───────────────────────────────────

  if (step === 2) {
    return (
      <div {...blockProps} className={styles || ''}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            {/* Back link */}
            <button onClick={() => setStep(1)} style={backLinkStyle}>
              <ChevronLeft /> Back to services
            </button>

            {/* Selected service summary */}
            {selectedService && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 10,
                backgroundColor: '#F9FAFB',
                marginBottom: 20,
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0, fontFamily: FONT_STACK }}>
                    {selectedService.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0 0', fontFamily: FONT_STACK }}>
                    {selectedService.duration_minutes ? formatDuration(selectedService.duration_minutes) : ''}
                    {selectedService.duration_minutes && showPrices ? ' \u00B7 ' : ''}
                    {showPrices ? formatCents(selectedService.price_cents) : ''}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: accentColor,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: FONT_STACK,
                  }}
                >
                  Change
                </button>
              </div>
            )}

            <h3 style={headingStyle}>Select a Date</h3>
            <p style={subheadingStyle}>Choose your preferred appointment date</p>

            <MonthCalendar
              selectedDate={selectedDateISO}
              onSelectDate={handleSelectDate}
              accentColor={accentColor}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 3: TIME SLOTS ───────────────────────────────────────

  if (step === 3) {
    return (
      <div {...blockProps} className={styles || ''}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            {/* Back link */}
            <button onClick={() => { setStep(2); setSelectedSlot(null); }} style={backLinkStyle}>
              <ChevronLeft /> Change date
            </button>

            {/* Summary bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 10,
              backgroundColor: '#F9FAFB',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 8,
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0, fontFamily: FONT_STACK }}>
                  {selectedService?.name || 'Appointment'}
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0 0', fontFamily: FONT_STACK }}>
                  {selectedDateObj ? formatDateDisplay(selectedDateObj) : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: accentColor,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: FONT_STACK,
                  }}
                >
                  Change service
                </button>
                <button
                  onClick={() => { setStep(2); setSelectedSlot(null); }}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: accentColor,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: FONT_STACK,
                  }}
                >
                  Change date
                </button>
              </div>
            </div>

            <h3 style={headingStyle}>Select a Time</h3>
            <p style={subheadingStyle}>Choose an available time slot</p>

            {/* Booking error */}
            {bookingError && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 10,
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 13, color: '#DC2626', margin: 0, fontFamily: FONT_STACK }}>{bookingError}</p>
              </div>
            )}

            {/* Loading */}
            {loadingSlots && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  border: `3px solid ${accentColor}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'sw-spin 0.6s linear infinite',
                }} />
                <style>{`@keyframes sw-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Closed day */}
            {!loadingSlots && dayIsClosed && (
              <div style={{
                padding: '28px 20px',
                borderRadius: 12,
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#92400E', margin: '0 0 4px 0', fontFamily: FONT_STACK }}>
                  Closed on this day
                </p>
                <p style={{ fontSize: 13, color: '#A16207', margin: '0 0 12px 0', fontFamily: FONT_STACK }}>
                  Please select a different date.
                </p>
                <button
                  onClick={() => { setStep(2); setSelectedSlot(null); }}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: accentColor,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: FONT_STACK,
                  }}
                >
                  Choose another date
                </button>
              </div>
            )}

            {/* No slots */}
            {!loadingSlots && !dayIsClosed && slots.length === 0 && (
              <div style={{
                padding: '28px 20px',
                borderRadius: 12,
                backgroundColor: '#F3F4F6',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 12px 0', fontFamily: FONT_STACK }}>
                  No available times on this date.
                </p>
                <button
                  onClick={() => { setStep(2); setSelectedSlot(null); }}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: accentColor,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: FONT_STACK,
                  }}
                >
                  Choose another date
                </button>
              </div>
            )}

            {/* Time slot grid */}
            {!loadingSlots && !dayIsClosed && slots.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {slots.map(slot => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && handleSelectSlot(slot.time)}
                      disabled={!slot.available}
                      style={{
                        padding: '10px 4px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: FONT_STACK,
                        border: `1.5px solid ${isSelected ? accentColor : slot.available ? '#E5E7EB' : '#F3F4F6'}`,
                        backgroundColor: isSelected ? accentColor : slot.available ? '#FFFFFF' : '#F9FAFB',
                        color: isSelected ? btnTextColor : slot.available ? '#374151' : '#D1D5DB',
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        textDecoration: slot.available ? 'none' : 'line-through',
                        transition: 'border-color 0.15s ease, background-color 0.15s ease',
                      }}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 4: STAFF SELECTION (CONDITIONAL) ────────────────────

  if (step === 4) {
    return (
      <div {...blockProps} className={styles || ''}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            {/* Back link */}
            <button onClick={() => { setStep(3); setSelectedStaff(null); }} style={backLinkStyle}>
              <ChevronLeft /> Change time
            </button>

            {/* Summary bar */}
            <div style={{
              padding: '12px 16px',
              borderRadius: 10,
              backgroundColor: '#F9FAFB',
              marginBottom: 20,
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0, fontFamily: FONT_STACK }}>
                {selectedService?.name || 'Appointment'}
              </p>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0 0', fontFamily: FONT_STACK }}>
                {selectedDateObj ? formatDateDisplay(selectedDateObj) : ''} at {selectedSlot}
              </p>
            </div>

            <h3 style={headingStyle}>Choose Your Provider</h3>
            <p style={subheadingStyle}>Select who you would like to see</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {staffList?.map(s => {
                const isSelected = selectedStaff === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStaff(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `2px solid ${isSelected ? accentColor : '#E5E7EB'}`,
                      backgroundColor: isSelected ? hexToRgba(accentColor, 0.06) : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: FONT_STACK,
                      transition: 'border-color 0.15s ease, background-color 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? accentColor : '#E5E7EB',
                      color: isSelected ? btnTextColor : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{
                      fontSize: 14,
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? accentColor : '#374151',
                    }}>
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 5: CONTACT INFO ─────────────────────────────────────

  if (step === 5) {
    const staffName = selectedStaff && staffList
      ? staffList.find(s => s.id === selectedStaff)?.name
      : null;

    return (
      <div {...blockProps} className={styles || ''}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            {/* Back link */}
            <button
              onClick={() => {
                if (staffList && staffList.length > 0 && assignmentMode === 'direct_booking') {
                  setStep(4);
                } else {
                  setStep(3);
                }
              }}
              style={backLinkStyle}
            >
              <ChevronLeft /> Back
            </button>

            {/* Booking summary */}
            <div style={{
              padding: '14px 16px',
              borderRadius: 10,
              backgroundColor: '#F9FAFB',
              marginBottom: 24,
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0, fontFamily: FONT_STACK }}>
                {selectedService?.name || 'Appointment'}
                {showPrices && selectedService ? ` \u00B7 ${formatCents(selectedService.price_cents)}` : ''}
              </p>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0 0', fontFamily: FONT_STACK }}>
                {selectedDateObj ? formatDateDisplay(selectedDateObj) : ''} at {selectedSlot}
                {staffName ? ` with ${staffName}` : ''}
              </p>
            </div>

            <h3 style={headingStyle}>Your Details</h3>
            <p style={subheadingStyle}>Please provide your contact information</p>

            {/* Booking error */}
            {bookingError && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 10,
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 13, color: '#DC2626', margin: 0, fontFamily: FONT_STACK }}>{bookingError}</p>
              </div>
            )}

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: name ? accentColor : '#E5E7EB',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = accentColor; }}
                  onBlur={e => { if (!name) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: email ? accentColor : '#E5E7EB',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = accentColor; }}
                  onBlur={e => { if (!email) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: phone ? accentColor : '#E5E7EB',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = accentColor; }}
                  onBlur={e => { if (!phone) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  placeholder="Any special requests or notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'none' as const,
                    borderColor: notes ? accentColor : '#E5E7EB',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = accentColor; }}
                  onBlur={e => { if (!notes) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name || !email || isSubmitting}
                style={{
                  ...primaryBtnStyle,
                  opacity: (!name || !email || isSubmitting) ? 0.4 : 1,
                  cursor: (!name || !email || isSubmitting) ? 'not-allowed' : 'pointer',
                  marginTop: 4,
                }}
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 6: CONFIRMATION ─────────────────────────────────────

  if (step === 6) {
    return (
      <div {...blockProps} className={styles || ''}>
        <div style={containerStyle}>
          <div style={{ ...cardStyle, textAlign: 'center' as const }}>
            {/* Checkmark circle */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={btnTextColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h3 style={{ ...headingStyle, fontSize: 22, textAlign: 'center', marginBottom: 8 }}>
              Booking Confirmed!
            </h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px 0', fontFamily: FONT_STACK }}>
              Your appointment has been booked successfully.
            </p>

            {/* Summary card */}
            <div style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 12,
              padding: '16px 20px',
              textAlign: 'left' as const,
              marginBottom: 24,
            }}>
              {bookingRef && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: 13, color: '#6B7280', fontFamily: FONT_STACK }}>Reference</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: 'monospace' }}>{bookingRef}</span>
                </div>
              )}
              {selectedService && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: 13, color: '#6B7280', fontFamily: FONT_STACK }}>Service</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: FONT_STACK }}>{selectedService.name}</span>
                </div>
              )}
              {selectedService && showPrices && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: 13, color: '#6B7280', fontFamily: FONT_STACK }}>Price</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: FONT_STACK }}>{formatCents(selectedService.price_cents)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 13, color: '#6B7280', fontFamily: FONT_STACK }}>Date</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: FONT_STACK }}>
                  {selectedDateObj ? formatDateDisplay(selectedDateObj) : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: selectedStaff ? '1px solid #E5E7EB' : 'none' }}>
                <span style={{ fontSize: 13, color: '#6B7280', fontFamily: FONT_STACK }}>Time</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: FONT_STACK }}>{selectedSlot}</span>
              </div>
              {selectedStaff && staffList && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: 13, color: '#6B7280', fontFamily: FONT_STACK }}>Provider</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: FONT_STACK }}>
                    {staffList.find(s => s.id === selectedStaff)?.name || ''}
                  </span>
                </div>
              )}
            </div>

            {email && (
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 20px 0', fontFamily: FONT_STACK }}>
                A confirmation email has been sent to {email}
              </p>
            )}

            <button
              onClick={handleBookAnother}
              style={{
                ...primaryBtnStyle,
                backgroundColor: 'transparent',
                color: accentColor,
                border: `2px solid ${accentColor}`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = hexToRgba(accentColor, 0.06);
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback — should never reach here
  return null;
};
