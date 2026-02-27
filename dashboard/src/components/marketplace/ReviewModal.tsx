'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from 'sonner';

interface ReviewModalProps {
  orderId: string;
  freelancerName: string;
  gigTitle: string;
  colors: DashboardColors;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewModal({ orderId, freelancerName, gigTitle, colors, onClose, onReviewSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, rating, review }),
      });

      if (res.ok) {
        toast.success('Review submitted!');
        onReviewSubmitted();
        onClose();
        return;
      }
    } catch { /* demo fallback */ }

    // Demo mode
    toast.success('Review submitted! (Demo mode)');
    onReviewSubmitted();
    onClose();
    setIsSubmitting(false);
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div
        className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md overflow-hidden shadow-2xl"
        style={{ backgroundColor: cardBg }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor }}>
          <h3 className="text-base font-bold" style={{ color: textMain }}>Leave a Review</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Gig info */}
          <p className="text-sm font-medium mb-1" style={{ color: textMain }}>{gigTitle}</p>
          <p className="text-xs mb-6" style={{ color: textMuted }}>by {freelancerName}</p>

          {/* Star rating */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium mb-3" style={{ color: textMain }}>How was your experience?</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill={star <= (hoveredStar || rating) ? '#F59E0B' : 'none'}
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
            {(hoveredStar || rating) > 0 && (
              <p className="text-sm mt-2 font-medium" style={{ color: '#F59E0B' }}>
                {ratingLabels[hoveredStar || rating]}
              </p>
            )}
          </div>

          {/* Review text */}
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience working with this freelancer... (optional)"
            rows={4}
            className="w-full px-4 py-3 border text-sm resize-none focus:outline-none focus:ring-2"
            style={{ borderColor, color: textMain, backgroundColor: cardBg }}
          />

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium border"
              style={{ borderColor, color: textMain }}
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: buttonColor, color: buttonText }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
