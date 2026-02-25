'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';

const SignaturePad = lazy(() => import('@/components/SignaturePad'));

interface WaiverData {
  id: string;
  name: string;
  description?: string;
  template_content?: string;
  client?: string;
  businessName?: string;
}

export default function PublicSigningPage() {
  const params = useParams();
  const waiverId = params.id as string;

  const [waiver, setWaiver] = useState<WaiverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!waiverId) return;
    fetch(`/api/public/sign?id=${waiverId}`)
      .then(res => res.ok ? res.json() : Promise.reject('Not found'))
      .then(data => {
        setWaiver(data);
        if (data.client) setSignerName(data.client);
      })
      .catch(() => setError('Waiver not found or has expired'))
      .finally(() => setLoading(false));
  }, [waiverId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName || !signatureData) {
      setError('Please enter your name and sign below');
      return;
    }
    if (!agreed) {
      setError('Please confirm you agree to the terms');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/public/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waiver_id: waiverId,
          signer: signerName,
          signer_email: signerEmail,
          signature_data: signatureData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Signed Successfully</h1>
          <p className="text-gray-500">Your signature has been recorded. You may close this page.</p>
        </div>
      </div>
    );
  }

  if (!waiver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-500">{error || 'This waiver could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
          <p className="text-sm text-gray-500 mb-1">{waiver.businessName || 'Document'}</p>
          <h1 className="text-xl font-bold text-gray-900">{waiver.name}</h1>
          {waiver.description && (
            <p className="text-sm text-gray-500 mt-1">{waiver.description}</p>
          )}
        </div>

        {/* Waiver Content */}
        {waiver.template_content && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: waiver.template_content }}
            />
          </div>
        )}

        {/* Signing Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-4">Sign Below</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={signerName}
                onChange={e => setSignerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={signerEmail}
                onChange={e => setSignerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Signature Pad */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signature <span className="text-red-500">*</span>
            </label>
            <Suspense fallback={<div className="h-[200px] bg-gray-50 rounded-xl animate-pulse" />}>
              <SignaturePad
                width={Math.min(500, typeof window !== 'undefined' ? window.innerWidth - 80 : 500)}
                height={200}
                onSave={setSignatureData}
              />
            </Suspense>
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              I agree that this electronic signature is the legal equivalent of my handwritten signature
              and I consent to be legally bound by this document.
            </span>
          </label>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Signing...' : 'Sign Document'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6" style={{ fontFamily: 'var(--font-fira-code), monospace' }}>Powered by <span className="font-semibold text-red-600">Red Pine</span></p>
      </div>
    </div>
  );
}
