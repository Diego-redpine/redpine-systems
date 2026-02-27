'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface WidgetConfig {
  name: string;
  layout_type: 'list' | 'grid' | 'carousel' | 'badge';
  min_rating: number;
  max_reviews: number;
  platforms: string[];
  show_ai_summary: boolean;
}

interface ReviewData {
  id: string;
  customer: string;
  rating: number;
  comment?: string;
  source: string;
  created_at: string;
}

interface ReviewWidgetPreviewProps {
  config: WidgetConfig;
  colors: DashboardColors;
  reviews?: ReviewData[];
}

const DEMO_REVIEWS: ReviewData[] = [
  { id: '1', customer: 'Jessica M.', rating: 5, comment: 'Absolutely amazing experience! The staff was so friendly and professional. My nails have never looked better.', source: 'google', created_at: '2026-02-10T10:00:00Z' },
  { id: '2', customer: 'David K.', rating: 5, comment: 'Best salon in town, hands down. The attention to detail is incredible.', source: 'facebook', created_at: '2026-02-08T14:00:00Z' },
  { id: '3', customer: 'Sarah L.', rating: 4, comment: 'Great service and lovely atmosphere. Really enjoyed my visit.', source: 'direct', created_at: '2026-02-05T09:00:00Z' },
  { id: '4', customer: 'Mike R.', rating: 5, comment: 'I was nervous about trying a new place, but the team put me at ease right away. Exceptional results.', source: 'google', created_at: '2026-02-03T16:00:00Z' },
  { id: '5', customer: 'Anna P.', rating: 5, comment: 'Consistently excellent service and always up-to-date with the latest trends. Highly recommend!', source: 'yelp', created_at: '2026-02-01T11:00:00Z' },
  { id: '6', customer: 'Tom W.', rating: 4, comment: 'Very professional and clean environment. Will definitely be back.', source: 'direct', created_at: '2026-01-28T13:00:00Z' },
];

function StarDisplay({ rating, size = 14, accentColor = '#F59E0B' }: { rating: number; size?: number; accentColor?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? accentColor : 'none'}
          stroke={accentColor}
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function ReviewCard({
  review,
  colors,
  compact = false,
}: {
  review: ReviewData;
  colors: DashboardColors;
  compact?: boolean;
}) {
  const buttonColor = colors.buttons || '#1A1A1A';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';

  const initials = review.customer
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${compact ? 'p-3' : 'p-4'}`}
      style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`${compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
          style={{ backgroundColor: `${buttonColor}12`, color: buttonColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: textMain }}>
              {review.customer}
            </span>
            <span className={compact ? 'text-[10px]' : 'text-xs'} style={{ color: textMuted }}>
              {formatRelativeDate(review.created_at)}
            </span>
          </div>
          <StarDisplay rating={review.rating} size={compact ? 12 : 14} accentColor="#F59E0B" />
          {review.comment && (
            <p
              className={`mt-1.5 leading-relaxed ${compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}
              style={{ color: textMuted }}
            >
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewWidgetPreview({
  config,
  colors,
  reviews: externalReviews,
}: ReviewWidgetPreviewProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const buttonColor = colors.buttons || '#1A1A1A';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';

  // Filter reviews based on config
  const allReviews = externalReviews || DEMO_REVIEWS;
  const filteredReviews = allReviews
    .filter((r) => r.rating >= config.min_rating)
    .filter((r) => config.platforms.length === 0 || config.platforms.includes(r.source))
    .slice(0, config.max_reviews);

  const avgRating =
    filteredReviews.length > 0
      ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length
      : 0;

  // Auto-rotate carousel
  const nextSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev + 1) % Math.max(filteredReviews.length, 1));
  }, [filteredReviews.length]);

  useEffect(() => {
    if (config.layout_type !== 'carousel') return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [config.layout_type, nextSlide]);

  // Reset carousel index when reviews change
  useEffect(() => {
    setCarouselIndex(0);
  }, [config.min_rating, config.max_reviews, config.platforms]);

  if (filteredReviews.length === 0) {
    return (
      <div
        className="p-8 text-center"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        <p className="text-sm" style={{ color: textMuted }}>
          No reviews match the current filters.
        </p>
      </div>
    );
  }

  // AI Summary line
  const aiSummary = config.show_ai_summary ? (
    <div className="mb-4 text-center">
      <p className="text-sm font-medium" style={{ color: textMain }}>
        <span style={{ color: '#F59E0B' }}>{'\u2605'}</span>{' '}
        {avgRating.toFixed(1)} stars from {filteredReviews.length} happy client
        {filteredReviews.length !== 1 ? 's' : ''}
      </p>
    </div>
  ) : null;

  // LIST layout
  if (config.layout_type === 'list') {
    return (
      <div>
        {aiSummary}
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} colors={colors} />
          ))}
        </div>
      </div>
    );
  }

  // GRID layout
  if (config.layout_type === 'grid') {
    return (
      <div>
        {aiSummary}
        <div className="grid grid-cols-2 gap-3">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} colors={colors} compact />
          ))}
        </div>
      </div>
    );
  }

  // CAROUSEL layout
  if (config.layout_type === 'carousel') {
    const current = filteredReviews[carouselIndex] || filteredReviews[0];
    if (!current) return null;

    return (
      <div>
        {aiSummary}
        <div
          className="p-6 text-center"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <div className="flex justify-center mb-3">
            <StarDisplay rating={current.rating} size={20} accentColor="#F59E0B" />
          </div>
          <p
            className="text-sm leading-relaxed mb-4 italic px-4"
            style={{ color: textMain }}
          >
            &ldquo;{current.comment}&rdquo;
          </p>
          <p className="text-sm font-semibold" style={{ color: textMain }}>
            {current.customer}
          </p>
          <p className="text-xs" style={{ color: textMuted }}>
            {formatRelativeDate(current.created_at)}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() =>
                setCarouselIndex(
                  (carouselIndex - 1 + filteredReviews.length) %
                    filteredReviews.length
                )
              }
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={textMuted}
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="flex gap-1.5">
              {filteredReviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === carouselIndex ? 20 : 6,
                    height: 6,
                    backgroundColor:
                      i === carouselIndex ? buttonColor : '#D1D5DB',
                  }}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={textMuted}
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // BADGE layout
  if (config.layout_type === 'badge') {
    return (
      <div>
        {aiSummary}
        <div className="flex justify-center">
          <div
            className="inline-flex items-center gap-3 px-5 py-3 shadow-sm"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ backgroundColor: `${buttonColor}10` }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#F59E0B"
                stroke="#F59E0B"
                strokeWidth="1"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: textMain }}>
                {avgRating.toFixed(1)}
              </p>
              <p className="text-xs" style={{ color: textMuted }}>
                {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
