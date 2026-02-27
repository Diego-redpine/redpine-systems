'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { PortalConfig } from '@/lib/portal-templates';

interface Review {
  id: string;
  rating: number;
  comment: string;
  response?: string;
  platform: string;
  status: string;
  is_gated: boolean;
  created_at: string;
  updated_at?: string;
}

interface GateConfig {
  enabled: boolean;
  star_threshold: number;
  positive_platforms: string[];
}

interface GateResult {
  meets_threshold: boolean;
  positive_platforms: string[];
}

interface PortalReviewsSectionProps {
  clientId: string;
  portalConfig: PortalConfig;
  accentColor: string;
  accentTextColor: string;
  portalToken: string;
  loyaltyActive?: boolean;
  loyaltyPointsForReview?: number;
}

function StarPicker({
  value,
  onChange,
  size = 'lg',
  accentColor,
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'lg';
  accentColor: string;
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;
  const sizeClass = size === 'lg' ? 'w-10 h-10' : 'w-5 h-5';

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHoverValue(star)}
          onMouseLeave={() => onChange && setHoverValue(0)}
          className={`${sizeClass} transition-colors ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!onChange}
        >
          <svg
            viewBox="0 0 24 24"
            fill={star <= displayValue ? accentColor : 'none'}
            stroke={star <= displayValue ? accentColor : '#d1d5db'}
            strokeWidth={1.5}
          >
            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const PLATFORM_LINKS: Record<string, string> = {
  google: 'https://g.page/review/',
  facebook: 'https://www.facebook.com/',
  yelp: 'https://www.yelp.com/',
};

export function PortalReviewsSection({
  clientId,
  portalConfig,
  accentColor,
  accentTextColor,
  portalToken,
  loyaltyActive = false,
  loyaltyPointsForReview = 10,
}: PortalReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gate, setGate] = useState<GateConfig>({ enabled: false, star_threshold: 4, positive_platforms: ['google'] });
  const [loading, setLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gateResult, setGateResult] = useState<GateResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/portal/data?type=reviews', {
          headers: { 'x-portal-token': portalToken },
        });
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          if (data.gate) setGate(data.gate);
        }
      } catch {
        // Silently fail
      }
      setLoading(false);
    }
    load();
  }, [portalToken]);

  const handleSubmitReview = useCallback(async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({
          action: 'submit_review',
          student_id: clientId,
          rating,
          comment,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmitted(true);
        if (data.gate_result) {
          setGateResult(data.gate_result);
        }
        if (data.review) {
          setReviews(prev => [data.review, ...prev]);
        }
      }
    } catch {
      // Silently fail
    }
    setSubmitting(false);
  }, [rating, comment, clientId, portalToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading reviews...</div>
      </div>
    );
  }

  // Check if user has a recent review (within last 7 days)
  const hasRecentReview = reviews.some(r => {
    const reviewDate = new Date(r.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return reviewDate > weekAgo;
  });

  return (
    <div className="space-y-6">
      {/* Leave a Review Card */}
      {!hasRecentReview && !submitted && (
        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {portalConfig.reviewPrompt}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            We&apos;d love to hear about your experience
          </p>

          {/* Loyalty nudge */}
          {loyaltyActive && (
            <div
              className="mb-4 p-3 text-sm font-medium"
              style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
            >
              Earn {loyaltyPointsForReview} points for leaving a review!
            </div>
          )}

          {/* Star Picker */}
          <div className="flex justify-center mb-4">
            <StarPicker
              value={rating}
              onChange={setRating}
              accentColor={accentColor}
            />
          </div>

          {rating > 0 && (
            <div className="text-center text-sm font-medium text-gray-600 mb-4">
              {rating === 5 && 'Amazing!'}
              {rating === 4 && 'Great!'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Could be better'}
              {rating === 1 && 'Sorry to hear that'}
            </div>
          )}

          {/* Comment */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Tell us more about your experience (optional)..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 resize-none mb-4"
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
          />

          <button
            onClick={handleSubmitReview}
            disabled={rating === 0 || submitting}
            className="w-full py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: accentColor, color: accentTextColor }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}

      {/* Gate Result (after submission) */}
      {submitted && gateResult && (
        <div className="bg-white p-6 shadow-sm border border-gray-200 text-center">
          {gateResult.meets_threshold ? (
            <>
              <div className="w-14 h-14 bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Thank you for your review!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Would you also leave us a review on one of these platforms?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {gateResult.positive_platforms.map(platform => (
                  <a
                    key={platform}
                    href={PLATFORM_LINKS[platform] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-sm font-semibold transition-opacity"
                    style={{ backgroundColor: accentColor, color: accentTextColor }}
                  >
                    Leave a {platform.charAt(0).toUpperCase() + platform.slice(1)} Review
                  </a>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Thank you for your feedback
              </h3>
              <p className="text-sm text-gray-500">
                We appreciate your honesty and will use this feedback to improve our service.
              </p>
            </>
          )}
        </div>
      )}

      {/* Submitted without gate */}
      {submitted && !gateResult && (
        <div className="bg-white p-6 shadow-sm border border-gray-200 text-center">
          <div className="w-14 h-14 bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Thank you for your review!
          </h3>
          <p className="text-sm text-gray-500">
            Your feedback helps us improve.
          </p>
        </div>
      )}

      {/* Past Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Your Reviews</h2>
          <div className="space-y-3">
            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-white p-5 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <StarPicker
                    value={review.rating}
                    size="sm"
                    accentColor={accentColor}
                  />
                  <span className="text-xs text-gray-400">
                    {formatDate(review.created_at)}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                )}

                {/* Business Response */}
                {review.response && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Business Response
                    </p>
                    <p className="text-sm text-gray-600">{review.response}</p>
                  </div>
                )}

                {/* Status badge */}
                <div className="mt-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize"
                    style={{
                      backgroundColor: review.status === 'published' ? '#dcfce7' : review.status === 'private' ? '#fef3c7' : '#f3f4f6',
                      color: review.status === 'published' ? '#166534' : review.status === 'private' ? '#92400e' : '#6b7280',
                    }}
                  >
                    {review.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {reviews.length === 0 && !submitted && hasRecentReview && (
        <div className="bg-white border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No reviews yet</p>
        </div>
      )}
    </div>
  );
}
