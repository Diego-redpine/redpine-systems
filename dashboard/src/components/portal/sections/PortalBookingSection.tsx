'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { PortalConfig } from '@/lib/portal-templates';

interface Service {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  duration_minutes: number;
  category: string;
  image_url: string | null;
}

interface Invoice {
  id: string;
  description: string;
  amount: number;
  status: string;
}

interface PortalBookingSectionProps {
  clientId: string;
  portalConfig: PortalConfig;
  accentColor: string;
  accentTextColor: string;
  portalToken: string;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// Booking mode labels
const MODE_LABELS: Record<string, { title: string; empty: string; action: string }> = {
  service: { title: 'Book a Service', empty: 'No services available', action: 'Book Now' },
  class: { title: 'Book a Class', empty: 'No classes available', action: 'Register' },
  menu: { title: 'Order', empty: 'No items available', action: 'Add to Order' },
  scheduler: { title: 'Schedule Service', empty: 'No services available', action: 'Schedule' },
};

export function PortalBookingSection({
  clientId,
  portalConfig,
  accentColor,
  accentTextColor,
  portalToken,
}: PortalBookingSectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingStep, setBookingStep] = useState<'browse' | 'details' | 'confirm'>('browse');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [servicesRes, historyRes] = await Promise.all([
          fetch('/api/portal/data?type=services', {
            headers: { 'x-portal-token': portalToken },
          }),
          fetch('/api/portal/data?type=billing', {
            headers: { 'x-portal-token': portalToken },
          }),
        ]);

        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(data.services || []);
        }
        if (historyRes.ok) {
          const data = await historyRes.json();
          setInvoiceHistory(data.invoices || []);
        }
      } catch {
        // Silently fail
      }
      setLoading(false);
    }
    load();
  }, [portalToken]);

  // Determine "Your usual" — most booked service (3+ times)
  const serviceFrequency: Record<string, number> = {};
  for (const inv of invoiceHistory) {
    if (inv.status === 'paid') {
      const desc = inv.description.toLowerCase();
      serviceFrequency[desc] = (serviceFrequency[desc] || 0) + 1;
    }
  }

  const usualService = Object.entries(serviceFrequency)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])[0];

  const usualMatch = usualService
    ? services.find(s => s.name.toLowerCase().includes(usualService[0]) || usualService[0].includes(s.name.toLowerCase()))
    : null;

  // Recent unique services for quick-book
  const recentServiceNames = new Set<string>();
  const recentServices: Service[] = [];
  for (const inv of invoiceHistory.slice(0, 10)) {
    if (inv.status === 'paid') {
      const match = services.find(s =>
        inv.description.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(inv.description.toLowerCase())
      );
      if (match && !recentServiceNames.has(match.id)) {
        recentServiceNames.add(match.id);
        recentServices.push(match);
      }
    }
  }

  // Filter services by search
  const filteredServices = searchQuery
    ? services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : services;

  // Group by category
  const categories = new Map<string, Service[]>();
  for (const s of filteredServices) {
    const cat = s.category || 'General';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(s);
  }

  const modeLabels = MODE_LABELS[portalConfig.bookingMode] || MODE_LABELS.service;

  const handleSelectService = useCallback((service: Service) => {
    setSelectedService(service);
    setBookingStep('details');
  }, []);

  const handleBack = useCallback(() => {
    if (bookingStep === 'confirm') {
      setBookingStep('details');
    } else {
      setBookingStep('browse');
      setSelectedService(null);
    }
  }, [bookingStep]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading services...</div>
      </div>
    );
  }

  // Service detail / confirmation view
  if (bookingStep !== 'browse' && selectedService) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        {/* Service Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{selectedService.name}</h2>
          {selectedService.description && (
            <p className="text-sm text-gray-500 mt-2">{selectedService.description}</p>
          )}

          <div className="flex items-center gap-4 mt-4">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(selectedService.price_cents)}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {formatDuration(selectedService.duration_minutes)}
            </span>
          </div>
        </div>

        {/* Booking Form Placeholder */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          {bookingStep === 'details' && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {portalConfig.bookingMode === 'class' ? 'Select a Time' : 'Choose Date & Time'}
              </h3>

              {/* Date/Time selection placeholder */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white"
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  >
                    <option>9:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>12:00 PM</option>
                    <option>1:00 PM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                    <option>4:00 PM</option>
                    <option>5:00 PM</option>
                  </select>
                </div>

                {portalConfig.bookingMode === 'service' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any special requests..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 resize-none"
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => setBookingStep('confirm')}
                className="w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: accentColor, color: accentTextColor }}
              >
                Continue to Confirm
              </button>
            </>
          )}

          {bookingStep === 'confirm' && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Confirm Booking</h3>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-medium text-gray-900">{selectedService.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium text-gray-900">
                    {formatDuration(selectedService.duration_minutes)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedService.price_cents)}</span>
                </div>
              </div>

              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: accentColor, color: accentTextColor }}
              >
                Confirm & Pay
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Payment will be charged to your default card on file
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Browse view
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">{modeLabels.title}</h2>

      {/* "Your Usual" Shortcut */}
      {usualMatch && (
        <div
          className="rounded-2xl p-5 shadow-sm border-2"
          style={{ borderColor: accentColor, backgroundColor: `${accentColor}08` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: accentColor }}>
                Your Usual
              </p>
              <p className="font-bold text-gray-900 mt-1">{usualMatch.name}</p>
              <p className="text-sm text-gray-500">
                {formatCurrency(usualMatch.price_cents)} · {formatDuration(usualMatch.duration_minutes)}
              </p>
            </div>
            <button
              onClick={() => handleSelectService(usualMatch)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: accentColor, color: accentTextColor }}
            >
              Book Your Usual
            </button>
          </div>
        </div>
      )}

      {/* Recent Services */}
      {recentServices.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Recent</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recentServices.slice(0, 4).map(service => (
              <button
                key={service.id}
                onClick={() => handleSelectService(service)}
                className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-gray-300 transition-colors min-w-[160px]"
              >
                <p className="text-sm font-medium text-gray-900 truncate">{service.name}</p>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(service.price_cents)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        />
      </div>

      {/* Service List */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">{modeLabels.empty}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(categories.entries()).map(([category, categoryServices]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryServices.map(service => (
                  <button
                    key={service.id}
                    onClick={() => handleSelectService(service)}
                    className="w-full bg-white rounded-2xl border border-gray-200 p-4 text-left hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(service.price_cents)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDuration(service.duration_minutes)}
                          </span>
                        </div>
                      </div>
                      <span
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 ml-3"
                        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                      >
                        {modeLabels.action}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
