'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataSelector, DataItem } from './DataSelector';

interface ReviewCarouselProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  autoPlay?: boolean;
  accentColor?: string;
  linkedReviewId?: string;
  linkedReviewName?: string;
  [key: string]: unknown;
}

const DEMO_REVIEWS = [
  { id: '1', customer: 'Jessica M.', rating: 5, comment: 'Absolutely amazing experience! The staff was so friendly and professional. My nails have never looked better. Will definitely be coming back!', date: '2 weeks ago' },
  { id: '2', customer: 'David K.', rating: 5, comment: 'Best salon in town, hands down. The attention to detail is incredible. I always leave feeling like a million bucks.', date: '1 month ago' },
  { id: '3', customer: 'Sarah L.', rating: 4, comment: 'Great service and lovely atmosphere. The only reason for 4 stars is the wait time, but the quality more than makes up for it.', date: '3 weeks ago' },
  { id: '4', customer: 'Mike R.', rating: 5, comment: 'I was nervous about trying a new place, but the team here put me at ease right away. Exceptional results every single time.', date: '1 week ago' },
  { id: '5', customer: 'Anna P.', rating: 5, comment: 'I have been a loyal customer for over a year now. Consistently excellent service and always up-to-date with the latest trends.', date: '5 days ago' },
];

// Filter by review source
const getFilteredReviews = (sourceId: string) => {
  if (sourceId === 'rev_source_recent') return DEMO_REVIEWS.filter(r => r.date.includes('week') || r.date.includes('day'));
  if (sourceId === 'rev_source_top') return DEMO_REVIEWS.filter(r => r.rating === 5);
  return DEMO_REVIEWS; // rev_source_all or fallback
};

const REVIEW_ICON = 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z';

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'What Our Clients Say',
  autoPlay = true,
  accentColor = '#1A1A1A',
  linkedReviewId = '',
  linkedReviewName = '',
}) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [localLinkedId, setLocalLinkedId] = useState(linkedReviewId);
  const [localLinkedName, setLocalLinkedName] = useState(linkedReviewName);
  const [current, setCurrent] = useState(0);

  const handleSelectSource = useCallback((item: DataItem) => {
    setLocalLinkedId(item.id);
    setLocalLinkedName(item.name);
    setSelectorOpen(false);
  }, []);

  const reviews = localLinkedId ? getFilteredReviews(localLinkedId) : DEMO_REVIEWS;

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prev = () => {
    setCurrent(p => (p - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (!autoPlay || inBuilder) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, inBuilder, next]);

  // Reset index when reviews change
  useEffect(() => {
    setCurrent(0);
  }, [localLinkedId]);

  const review = reviews[current] || DEMO_REVIEWS[0];

  // --- In Builder: No review source linked → blank placeholder ---
  if (inBuilder && !localLinkedId) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          maxWidth: 640, margin: '0 auto', padding: 48,
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
              <path strokeLinecap="round" strokeLinejoin="round" d={REVIEW_ICON} />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No reviews connected</p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
            Select a review source to display customer testimonials
          </p>
          <button
            onClick={() => setSelectorOpen(true)}
            style={{
              padding: '10px 24px', borderRadius: 10,
              backgroundColor: accentColor, color: '#fff',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            Select Reviews
          </button>
        </div>
        <DataSelector
          entityType="reviews"
          isOpen={selectorOpen}
          onSelect={handleSelectSource}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // --- In Builder: Reviews linked → preview with header badge ---
  if (inBuilder && localLinkedId) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24, padding: '12px 16px', borderRadius: 10,
            backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20`,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: `${accentColor}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={REVIEW_ICON} />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{localLinkedName}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{reviews.length} reviews</p>
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

          {heading && (
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>{heading}</h3>
          )}

          {/* Preview review */}
          <div style={{ opacity: 0.7 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} width="20" height="20" viewBox="0 0 24 24" fill={star <= review.rating ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: '#374151', marginBottom: 20, fontStyle: 'italic', padding: '0 16px' }}>
              &ldquo;{review.comment}&rdquo;
            </p>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{review.customer}</p>
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>{review.date}</p>
          </div>
        </div>
        <DataSelector
          entityType="reviews"
          isOpen={selectorOpen}
          onSelect={handleSelectSource}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // --- Public site: full carousel ---
  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
        {heading && (
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>{heading}</h3>
        )}

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <svg key={star} width="20" height="20" viewBox="0 0 24 24" fill={star <= review.rating ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#374151', marginBottom: 20, fontStyle: 'italic', padding: '0 16px' }}>
          &ldquo;{review.comment}&rdquo;
        </p>

        {/* Author */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>{review.customer}</p>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>{review.date}</p>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button onClick={prev} style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB',
            backgroundColor: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: i === current ? 24 : 8, height: 8, borderRadius: 4,
                backgroundColor: i === current ? accentColor : '#D1D5DB',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              }} />
            ))}
          </div>

          <button onClick={next} style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB',
            backgroundColor: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
