'use client';

/**
 * Embeddable Contact Form Widget
 * Renders contact form for a subdomain in iframe-friendly minimal layout.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface BusinessConfig {
  businessName: string;
  colors: Record<string, string>;
  logoUrl?: string;
}

function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

export default function EmbedContactPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/subdomain`, { headers: { 'x-subdomain': subdomain } });
        if (!res.ok) { setError('Business not found'); setIsLoading(false); return; }
        const data = await res.json();
        if (data.success && data.data) {
          setConfig({
            businessName: data.data.businessName || 'Business',
            colors: data.data.colors || {},
            logoUrl: data.data.logoUrl,
          });
        } else { setError('Business not found'); }
      } catch { setError('Unable to load contact form'); }
      setIsLoading(false);
    }
    fetchConfig();
  }, [subdomain]);

  const accentColor = config?.colors?.buttons || config?.colors?.sidebar_bg || '#1A1A1A';
  const accentTextColor = isColorLight(accentColor) ? '#000000' : '#FFFFFF';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, name, email, phone, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
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
        <p className="text-sm text-gray-500">Contact form unavailable</p>
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
            <p className="text-xs text-gray-500">Get in touch</p>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Message Sent</h2>
            <p className="text-sm text-gray-500">We&apos;ll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none transition-colors"
                style={{ borderColor: name ? accentColor : undefined }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none transition-colors"
                style={{ borderColor: email ? accentColor : undefined }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help you?"
                rows={4} className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none resize-none transition-colors"
                style={{ borderColor: message ? accentColor : undefined }} />
            </div>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <button type="submit" disabled={!name || !email || !message || submitting}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ backgroundColor: accentColor, color: accentTextColor }}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
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
