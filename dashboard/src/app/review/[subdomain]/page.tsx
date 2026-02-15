'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

function StarRating({ rating, onRate, interactive = false }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`text-2xl transition-colors ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!interactive}
        >
          <span className={(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}

interface PublicReview {
  id: string;
  customer: string;
  rating: number;
  comment?: string;
  response?: string;
  created_at: string;
}

export default function PublicReviewPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [businessName, setBusinessName] = useState('');
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!subdomain) return;
    fetch(`/api/public/reviews?subdomain=${subdomain}`)
      .then(res => res.ok ? res.json() : Promise.reject('Not found'))
      .then(data => {
        setBusinessName(data.businessName);
        setReviews(data.reviews || []);
      })
      .catch(() => setError('Business not found'))
      .finally(() => setLoading(false));
  }, [subdomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rating) {
      setError('Please enter your name and select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/public/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, customer: name, email, rating, comment }),
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

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
          <h1 className="text-xl font-bold text-gray-900">{businessName || subdomain}</h1>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-2xl font-bold text-gray-900">{avgRating}</span>
              <StarRating rating={Math.round(Number(avgRating))} />
              <span className="text-sm text-gray-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {/* Submit Review Form */}
        {submitted ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Thank You!</h2>
            <p className="text-sm text-gray-500">Your review has been submitted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-4">Leave a Review</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
              <StarRating rating={rating} onRate={setRating} interactive />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Optional" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Experience</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                placeholder="Tell us about your experience..." />
            </div>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Existing Reviews */}
        {reviews.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">Recent Reviews</h2>
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {review.customer.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{review.customer}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                )}
                {review.response && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Owner Response</p>
                    <p className="text-sm text-gray-600">{review.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">Powered by Red Pine</p>
      </div>
    </div>
  );
}
