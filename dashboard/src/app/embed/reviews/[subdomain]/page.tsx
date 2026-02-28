'use client';

/**
 * Embeddable Review Carousel Widget
 * Renders review carousel for a subdomain in iframe-friendly minimal layout.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface BusinessConfig {
  businessName: string;
  colors: Record<string, string>;
  logoUrl?: string;
}

interface PublicReview {
  id: string;
  customer: string;
  rating: number;
  comment?: string;
  created_at: string;
}

function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={`text-sm ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function EmbedReviewsPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [configRes, reviewsRes] = await Promise.all([
          fetch(`/api/subdomain`, { headers: { 'x-subdomain': subdomain } }),
          fetch(`/api/public/reviews?subdomain=${subdomain}`),
        ]);

        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.success && configData.data) {
            setConfig({
              businessName: configData.data.businessName || 'Business',
              colors: configData.data.colors || {},
              logoUrl: configData.data.logoUrl,
            });
          }
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          if (reviewsData.reviews) {
            setReviews(reviewsData.reviews);
          }
        }
      } catch {
        setError('Unable to load reviews');
      }
      setIsLoading(false);
    }
    load();
  }, [subdomain]);

  const nextReview = useCallback(() => {
    if (reviews.length > 0) {
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }
  }, [reviews.length]);

  const prevReview = useCallback(() => {
    if (reviews.length > 0) {
      setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
    }
  }, [reviews.length]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(nextReview, 5000);
    return () => clearInterval(timer);
  }, [reviews.length, nextReview]);

  const accentColor = config?.colors?.buttons || config?.colors?.sidebar_bg || '#1A1A1A';
  const accentTextColor = isColorLight(accentColor) ? '#000000' : '#FFFFFF';

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0;

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
        <p className="text-sm text-gray-500">Reviews unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-lg mx-auto p-4">
        {/* Header with aggregate rating */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            {config.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: accentColor, color: accentTextColor }}>
                {config.businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-base font-bold text-gray-900">{config.businessName}</h1>
          </div>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-xs text-gray-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">No reviews yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Carousel card */}
            <div className="bg-gray-50 rounded-2xl p-5 min-h-[140px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: accentColor, color: accentTextColor }}>
                  {reviews[currentIndex].customer.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{reviews[currentIndex].customer}</p>
                  <StarRating rating={reviews[currentIndex].rating} />
                </div>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(reviews[currentIndex].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {reviews[currentIndex].comment && (
                <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{reviews[currentIndex].comment}&rdquo;</p>
              )}
            </div>

            {/* Navigation */}
            {reviews.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={prevReview} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex gap-1.5">
                  {reviews.map((_, i) => (
                    <button key={i} onClick={() => setCurrentIndex(i)}
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{ backgroundColor: i === currentIndex ? accentColor : '#D1D5DB' }} />
                  ))}
                </div>
                <button onClick={nextReview} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
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
