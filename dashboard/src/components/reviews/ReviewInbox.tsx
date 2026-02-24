'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import ReviewDetail from './ReviewDetail';

interface ReviewInboxProps {
  colors: DashboardColors;
  onStatsChange?: () => void;
}

interface ReviewRecord {
  id: string;
  customer: string;
  email?: string;
  rating: number;
  comment?: string;
  source: string;
  status: string;
  response?: string;
  responded_at?: string;
  client_id?: string;
  platform_review_id?: string;
  is_gated?: boolean;
  request_id?: string;
  created_at: string;
  updated_at: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  direct: 'Direct',
  google: 'Google',
  facebook: 'Facebook',
  yelp: 'Yelp',
  email_request: 'Email',
};

const PLATFORM_ICONS: Record<string, string> = {
  direct: '\u2605',
  google: 'G',
  facebook: 'f',
  yelp: 'Y',
  email_request: '@',
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  new: { bg: '#DBEAFE', text: '#1D4ED8' },
  published: { bg: '#D1FAE5', text: '#047857' },
  replied: { bg: '#F3F4F6', text: '#374151' },
  hidden: { bg: '#FEE2E2', text: '#B91C1C' },
};

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? '#F59E0B' : 'none'}
          stroke="#F59E0B"
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReviewInbox({ colors, onStatsChange }: ReviewInboxProps) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null);

  // Filters
  const [platformFilter, setPlatformFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/reviews?pageSize=200&sort=created_at&sortDir=desc');
      const json = await res.json();
      if (json.success && json.data) {
        setReviews(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateReview = async (
    reviewId: string,
    updates: Partial<ReviewRecord>
  ) => {
    try {
      const res = await fetch(`/api/data/reviews?id=${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, ...updates } : r))
        );
        if (selectedReview?.id === reviewId) {
          setSelectedReview((prev) => (prev ? { ...prev, ...updates } : null));
        }
        onStatsChange?.();
      }
    } catch (err) {
      console.error('Failed to update review:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/data/reviews?id=${reviewId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setSelectedReview(null);
        onStatsChange?.();
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  // Apply filters
  const filteredReviews = reviews.filter((r) => {
    if (platformFilter !== 'all' && r.source !== platformFilter) return false;
    if (ratingFilter !== 'all' && r.rating !== parseInt(ratingFilter))
      return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'direct', label: 'Direct' },
    { value: 'yelp', label: 'Yelp' },
    { value: 'email_request', label: 'Email' },
  ];

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'replied', label: 'Replied' },
    { value: 'published', label: 'Published' },
    { value: 'hidden', label: 'Hidden' },
  ];

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {[
          { options: platformOptions, value: platformFilter, onChange: setPlatformFilter },
          { options: ratingOptions, value: ratingFilter, onChange: setRatingFilter },
          { options: statusOptions, value: statusFilter, onChange: setStatusFilter },
        ].map(({ options, value, onChange }, idx) => (
          <select
            key={idx}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-medium appearance-none cursor-pointer"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              color: textMain,
            }}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        <span className="ml-auto text-sm" style={{ color: textMuted }}>
          {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Review list */}
      {loading ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <p style={{ color: textMuted }}>Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${buttonColor}10` }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={buttonColor}
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: textMain }}>
            No reviews yet
          </p>
          <p className="text-sm" style={{ color: textMuted }}>
            Send your first review request to start collecting feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredReviews.map((review) => {
            const statusStyle = STATUS_STYLES[review.status] || STATUS_STYLES.new;
            const initials = review.customer
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <button
                key={review.id}
                onClick={() => setSelectedReview(review)}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left"
                style={{
                  backgroundColor:
                    selectedReview?.id === review.id
                      ? `${buttonColor}08`
                      : cardBg,
                  border: `1px solid ${
                    selectedReview?.id === review.id ? buttonColor : borderColor
                  }`,
                }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                  style={{
                    backgroundColor: `${buttonColor}15`,
                    color: buttonColor,
                  }}
                >
                  {initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-medium text-sm"
                      style={{ color: textMain }}
                    >
                      {review.customer}
                    </span>
                    <StarDisplay rating={review.rating} size={14} />
                  </div>
                  <p
                    className="text-sm truncate"
                    style={{ color: textMuted }}
                  >
                    {review.comment || 'No comment provided'}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Platform icon */}
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                    }}
                    title={PLATFORM_LABELS[review.source] || review.source}
                  >
                    {PLATFORM_ICONS[review.source] || '?'}
                  </span>

                  {/* Date */}
                  <span className="text-xs whitespace-nowrap" style={{ color: textMuted }}>
                    {formatDate(review.created_at)}
                  </span>

                  {/* Status pill */}
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                    }}
                  >
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Review Detail panel */}
      {selectedReview && (
        <ReviewDetail
          review={selectedReview}
          colors={colors}
          onClose={() => setSelectedReview(null)}
          onUpdate={handleUpdateReview}
          onDelete={handleDeleteReview}
        />
      )}
    </>
  );
}

export { StarDisplay, formatDate };
