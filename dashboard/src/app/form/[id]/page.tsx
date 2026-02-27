'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { FormField } from '@/types/data';

const SignaturePad = lazy(() => import('@/components/SignaturePad'));

interface FormDefinition {
  id: string;
  name: string;
  description?: string;
  type: string;
  fields: FormField[];
}

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!formId) return;
    fetch(`/api/public/forms?id=${formId}`)
      .then(res => res.ok ? res.json() : Promise.reject('Form not found'))
      .then(data => {
        setForm(data.form);
        // Initialize values
        const initial: Record<string, unknown> = {};
        (data.form.fields || []).forEach((f: FormField) => {
          if (f.type === 'checkbox') initial[f.id] = false;
          else if (f.type !== 'heading' && f.type !== 'paragraph') initial[f.id] = '';
        });
        setValues(initial);
      })
      .catch(() => setError('This form is no longer available.'))
      .finally(() => setLoading(false));
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && !values[field.id]) {
        setError(`"${field.label}" is required`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/public/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          data: values,
          submittedByName: values['name'] || values['full_name'] || undefined,
          submittedByEmail: values['email'] || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (fieldId: string, value: unknown) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  if (loading) {
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

  if (!form || (error && !form)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-sm text-gray-500">{error || 'This form is no longer available.'}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-sm text-gray-500">Your response has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h1 className="text-xl font-bold text-gray-900">{form.name}</h1>
          {form.description && (
            <p className="text-sm text-gray-500 mt-1">{form.description}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          {form.fields.map((field) => (
            <FormFieldRenderer
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={(val) => handleChange(field.id, val)}
            />
          ))}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4" style={{ fontFamily: 'var(--font-fira-code), monospace' }}>
          Powered by <span className="font-semibold text-red-600">Red Pine</span>
        </p>
      </form>
    </div>
  );
}

function FormFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const inputClasses = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400';

  if (field.type === 'heading') {
    return <h2 className="text-base font-bold text-gray-900 pt-2">{field.label}</h2>;
  }

  if (field.type === 'paragraph') {
    return <p className="text-sm text-gray-500">{field.label}</p>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-gray-400 mb-1">{field.description}</p>
      )}

      {field.type === 'text' && (
        <input type="text" value={String(value || '')} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder} className={inputClasses} />
      )}

      {field.type === 'email' && (
        <input type="email" value={String(value || '')} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'email@example.com'} className={inputClasses} />
      )}

      {field.type === 'phone' && (
        <input type="tel" value={String(value || '')} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || '(555) 123-4567'} className={inputClasses} />
      )}

      {field.type === 'number' && (
        <input type="number" value={String(value || '')} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder} className={inputClasses} />
      )}

      {field.type === 'date' && (
        <input type="date" value={String(value || '')} onChange={(e) => onChange(e.target.value)}
          className={inputClasses} />
      )}

      {field.type === 'textarea' && (
        <textarea value={String(value || '')} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder} rows={4} className={inputClasses} />
      )}

      {field.type === 'dropdown' && (
        <select value={String(value || '')} onChange={(e) => onChange(e.target.value)} className={inputClasses}>
          <option value="">Select...</option>
          {(field.options || []).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === 'radio' && (
        <div className="space-y-2">
          {(field.options || []).map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="radio" name={field.id} value={opt} checked={value === opt}
                onChange={() => onChange(opt)} className="accent-gray-900" />
              {opt}
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)}
            className="accent-gray-900" />
          {field.placeholder || 'Yes'}
        </label>
      )}

      {field.type === 'file' && (
        <input type="file" onChange={(e) => onChange(e.target.files?.[0]?.name || '')}
          className="text-sm text-gray-500" />
      )}

      {field.type === 'signature' && (
        <Suspense fallback={<div className="h-[200px] bg-gray-50 rounded-xl animate-pulse" />}>
          <SignaturePad
            width={Math.min(460, typeof window !== 'undefined' ? window.innerWidth - 80 : 460)}
            height={180}
            onSave={(dataUrl) => onChange(dataUrl)}
          />
        </Suspense>
      )}
    </div>
  );
}
