'use client';

import React, { useState, useCallback } from 'react';
import { DataSelector, DataItem } from './DataSelector';

// Form field definitions keyed by demo form IDs
const FORM_FIELDS: Record<string, { label: string; type: string; required: boolean; placeholder: string }[]> = {
  form_1: [
    { label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
    { label: 'Email', type: 'email', required: true, placeholder: 'your@email.com' },
    { label: 'Phone', type: 'tel', required: false, placeholder: '(555) 000-0000' },
    { label: 'Date of Birth', type: 'date', required: true, placeholder: '' },
    { label: 'Reason for Visit', type: 'textarea', required: true, placeholder: 'Tell us why you\'re here...' },
  ],
  form_2: [
    { label: 'Your Name', type: 'text', required: false, placeholder: 'Optional' },
    { label: 'Overall Rating', type: 'select', required: true, placeholder: 'Select a rating' },
    { label: 'What did you enjoy most?', type: 'textarea', required: false, placeholder: 'Tell us what went well...' },
    { label: 'What could we improve?', type: 'textarea', required: false, placeholder: 'Any suggestions...' },
  ],
  form_3: [
    { label: 'Patient Name', type: 'text', required: true, placeholder: 'Full name' },
    { label: 'Date of Birth', type: 'date', required: true, placeholder: '' },
    { label: 'Allergies', type: 'textarea', required: false, placeholder: 'List any known allergies...' },
    { label: 'Current Medications', type: 'textarea', required: false, placeholder: 'List medications...' },
    { label: 'Emergency Contact', type: 'text', required: true, placeholder: 'Name and phone number' },
  ],
  form_4: [
    { label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
    { label: 'Email', type: 'email', required: true, placeholder: 'your@email.com' },
    { label: 'Subject', type: 'text', required: true, placeholder: 'How can we help?' },
    { label: 'Message', type: 'textarea', required: true, placeholder: 'Your message...' },
  ],
  form_5: [
    { label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
    { label: 'Email', type: 'email', required: true, placeholder: 'your@email.com' },
    { label: 'Phone', type: 'tel', required: true, placeholder: '(555) 000-0000' },
    { label: 'Preferred Date', type: 'date', required: true, placeholder: '' },
    { label: 'Preferred Time', type: 'select', required: true, placeholder: 'Select a time' },
    { label: 'Notes', type: 'textarea', required: false, placeholder: 'Anything else we should know...' },
  ],
};

const FORM_ICON = 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z';

interface ContactFormProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  description?: string;
  submitText?: string;
  showPhone?: boolean;
  accentColor?: string;
  linkedFormId?: string;
  linkedFormName?: string;
  [key: string]: unknown;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Get in Touch',
  description = "Fill out the form below and we'll get back to you shortly.",
  submitText = 'Send Message',
  showPhone = true,
  accentColor = '#1A1A1A',
  linkedFormId = '',
  linkedFormName = '',
}) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [localLinkedId, setLocalLinkedId] = useState(linkedFormId);
  const [localLinkedName, setLocalLinkedName] = useState(linkedFormName);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSelect = useCallback((item: DataItem) => {
    setLocalLinkedId(item.id);
    setLocalLinkedName(item.name);
    setSelectorOpen(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inBuilder) return;
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box', outline: 'none',
  };

  // --- In Builder: No form linked → blank placeholder ---
  if (inBuilder && !localLinkedId) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          maxWidth: 520, margin: '0 auto', padding: 48,
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
              <path strokeLinecap="round" strokeLinejoin="round" d={FORM_ICON} />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No form connected</p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
            Select a form from your dashboard to display here
          </p>
          <button
            onClick={() => setSelectorOpen(true)}
            style={{
              padding: '10px 24px', borderRadius: 10,
              backgroundColor: accentColor, color: '#fff',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            Select Form
          </button>
        </div>
        <DataSelector
          entityType="forms"
          isOpen={selectorOpen}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // --- In Builder: Form linked → preview card with dimmed fields ---
  if (inBuilder && localLinkedId) {
    const fields = FORM_FIELDS[localLinkedId] || [];
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          maxWidth: 520, margin: '0 auto', padding: 32,
          borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff',
        }}>
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
                  <path strokeLinecap="round" strokeLinejoin="round" d={FORM_ICON} />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{localLinkedName}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{fields.length} fields</p>
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

          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{heading}</h3>
          {description && (
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' }}>{description}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.6, pointerEvents: 'none' }}>
            {fields.slice(0, 4).map((field, i) => (
              <div key={i}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  {field.label}{field.required && ' *'}
                </label>
                <div style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB',
                  fontSize: 13, color: '#9CA3AF', boxSizing: 'border-box',
                  minHeight: field.type === 'textarea' ? 60 : undefined,
                }}>
                  {field.placeholder || field.label}
                </div>
              </div>
            ))}
            {fields.length > 4 && (
              <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>+{fields.length - 4} more fields</p>
            )}
          </div>
        </div>
        <DataSelector
          entityType="forms"
          isOpen={selectorOpen}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // --- Public site: Form linked → render real form fields ---
  if (localLinkedId) {
    const fields = FORM_FIELDS[localLinkedId] || [];
    if (submitted) {
      return (
        <div {...blockProps} className={styles || 'w-full'}>
          <div style={{ maxWidth: 520, margin: '0 auto', padding: 32, textAlign: 'center', borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#10B98120', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Submitted!</h3>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Thank you for your submission. We&apos;ll be in touch soon.</p>
          </div>
        </div>
      );
    }

    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: 32, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{heading}</h3>
          {description && (
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' }}>{description}</p>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {fields.map((field, i) => (
              <div key={i}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  {field.label}{field.required && ' *'}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={3}
                    value={formData[field.label] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [field.label]: e.target.value }))}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.label] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [field.label]: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">{field.placeholder}</option>
                    {field.label.includes('Rating') && ['5 - Excellent', '4 - Good', '3 - Average', '2 - Below Average', '1 - Poor'].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                    {field.label.includes('Time') && ['Morning (9am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)'].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.label] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [field.label]: e.target.value }))}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              style={{
                width: '100%', padding: '12px 24px', borderRadius: 12,
                backgroundColor: accentColor, color: '#fff',
                fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 4,
              }}
            >
              {submitText}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Public site: No form linked → fallback generic contact form ---
  if (submitted) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: 32, textAlign: 'center', borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#10B98120', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Message Sent!</h3>
          <p style={{ fontSize: 14, color: '#6B7280' }}>We&apos;ll get back to you as soon as possible.</p>
        </div>
      </div>
    );
  }

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 32, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{heading}</h3>
        {description && (
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' }}>{description}</p>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: showPhone ? '1fr 1fr' : '1fr', gap: 12 }}>
            <input type="text" placeholder="Your name" value={formData.name || ''} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required style={inputStyle} />
            <input type="email" placeholder="Email address" value={formData.email || ''} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} required style={inputStyle} />
          </div>
          {showPhone && (
            <input type="tel" placeholder="Phone number (optional)" value={formData.phone || ''} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} style={inputStyle} />
          )}
          <textarea placeholder="Your message..." value={formData.message || ''} onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))} required rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          <button type="submit" style={{ width: '100%', padding: '12px 24px', borderRadius: 12, backgroundColor: accentColor, color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            {submitText}
          </button>
        </form>
      </div>
    </div>
  );
};
