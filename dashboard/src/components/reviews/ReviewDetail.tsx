'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { StarDisplay, formatDate } from './ReviewInbox';

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

interface ReviewDetailProps {
  review: ReviewRecord;
  colors: DashboardColors;
  onClose: () => void;
  onUpdate: (reviewId: string, updates: Partial<ReviewRecord>) => void;
  onDelete: (reviewId: string) => void;
}

const PLATFORM_LABELS: Record<string, string> = {
  direct: 'Direct',
  google: 'Google',
  facebook: 'Facebook',
  yelp: 'Yelp',
  email_request: 'Email Request',
};

type ResponseMode = 'manual' | 'ai_suggest' | 'autopilot';

export default function ReviewDetail({
  review,
  colors,
  onClose,
  onUpdate,
  onDelete,
}: ReviewDetailProps) {
  const [responseText, setResponseText] = useState(review.response || '');
  const [responseMode, setResponseMode] = useState<ResponseMode>('manual');
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;
    setSending(true);
    try {
      await onUpdate(review.id, {
        response: responseText.trim(),
        responded_at: new Date().toISOString(),
        status: 'replied',
      });
    } finally {
      setSending(false);
    }
  };

  const handlePublish = () => {
    onUpdate(review.id, { status: 'published' });
  };

  const handleHide = () => {
    onUpdate(review.id, { status: 'hidden' });
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(review.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const responseModes: { id: ResponseMode; label: string }[] = [
    { id: 'manual', label: 'Manual' },
    { id: 'ai_suggest', label: 'AI Suggest' },
    { id: 'autopilot', label: 'Auto-pilot' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg h-full overflow-y-auto shadow-xl"
        style={{ backgroundColor: colors.background || '#F9FAFB' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-5 border-b"
          style={{ backgroundColor: cardBg, borderColor }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: textMain }}>
              {review.customer}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <StarDisplay rating={review.rating} size={16} />
              <span className="text-sm" style={{ color: textMuted }}>
                via {PLATFORM_LABELS[review.source] || review.source}
              </span>
              <span className="text-sm" style={{ color: textMuted }}>
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={textMuted}
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Full review text */}
          <div
            className="p-5"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <p className="text-sm leading-relaxed" style={{ color: textMain }}>
              {review.comment || 'No comment provided.'}
            </p>
          </div>

          {/* Contact match section */}
          <div
            className="p-5"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: textMain }}
            >
              Contact Match
            </h3>
            {review.client_id ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: `${buttonColor}15`,
                    color: buttonColor,
                  }}
                >
                  {review.customer
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: textMain }}>
                    Matched to: {review.customer}
                  </p>
                  <p className="text-xs" style={{ color: textMuted }}>
                    {review.email || 'No email on file'}
                  </p>
                </div>
                <button
                  className="ml-auto text-xs font-medium px-3 py-1"
                  style={{
                    color: buttonColor,
                    border: `1px solid ${buttonColor}30`,
                  }}
                >
                  View Client
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: textMuted }}>
                  Not matched to any client
                </p>
                <button
                  className="text-xs font-medium px-3 py-1.5"
                  style={{
                    color: buttonColor,
                    border: `1px solid ${buttonColor}30`,
                  }}
                >
                  Link to Client
                </button>
              </div>
            )}
          </div>

          {/* Response composer */}
          <div
            className="p-5"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: textMain }}
            >
              Response
            </h3>

            {/* Existing response */}
            {review.response && (
              <div
                className="p-4 mb-4"
                style={{
                  backgroundColor: `${buttonColor}05`,
                  border: `1px solid ${buttonColor}15`,
                }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: buttonColor }}>
                  Your Response
                  {review.responded_at && (
                    <span style={{ color: textMuted }}>
                      {' '}&middot; {formatDate(review.responded_at)}
                    </span>
                  )}
                </p>
                <p className="text-sm" style={{ color: textMain }}>
                  {review.response}
                </p>
              </div>
            )}

            {/* Response mode tabs */}
            <div className="flex gap-1 mb-3">
              {responseModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setResponseMode(mode.id)}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor:
                      responseMode === mode.id ? `${buttonColor}10` : 'transparent',
                    color:
                      responseMode === mode.id ? buttonColor : textMuted,
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Manual mode */}
            {responseMode === 'manual' && (
              <div className="space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response..."
                  rows={4}
                  className="w-full p-3 text-sm resize-none focus:outline-none focus:ring-2"
                  style={{
                    border: `1px solid ${borderColor}`,
                    color: textMain,
                    backgroundColor: colors.background || '#F9FAFB',
                    // @ts-expect-error CSS custom property for ring color
                    '--tw-ring-color': `${buttonColor}40`,
                  }}
                />
                <button
                  onClick={handleSendResponse}
                  disabled={!responseText.trim() || sending}
                  className="px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{
                    backgroundColor: buttonColor,
                    color: buttonText,
                  }}
                >
                  {sending ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            )}

            {/* AI Suggest mode (placeholder) */}
            {responseMode === 'ai_suggest' && (
              <div
                className="p-6 text-center"
                style={{
                  backgroundColor: colors.background || '#F9FAFB',
                  border: `1px dashed ${borderColor}`,
                }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${buttonColor}10` }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={buttonColor}
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: textMain }}>
                  AI-Generated Responses
                </p>
                <p className="text-xs" style={{ color: textMuted }}>
                  Coming with Reputation Agent ($15/mo). AI will draft responses using your brand voice and client history.
                </p>
              </div>
            )}

            {/* Autopilot mode (upsell) */}
            {responseMode === 'autopilot' && (
              <div
                className="p-6 text-center"
                style={{
                  backgroundColor: colors.background || '#F9FAFB',
                  border: `1px dashed ${borderColor}`,
                }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${buttonColor}10` }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={buttonColor}
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: textMain }}>
                  Reputation Agent
                </p>
                <p className="text-xs mb-3" style={{ color: textMuted }}>
                  Auto-respond to reviews based on star rating rules, with configurable delays and brand voice training.
                </p>
                <div
                  className="inline-block px-3 py-1.5 text-xs font-semibold"
                  style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}
                >
                  $15/mo add-on
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div
            className="p-5"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: textMain }}
            >
              Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              {review.status !== 'published' && (
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: '#D1FAE5',
                    color: '#047857',
                  }}
                >
                  Publish
                </button>
              )}
              {review.status !== 'hidden' && (
                <button
                  onClick={handleHide}
                  className="px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                  }}
                >
                  Hide
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: confirmDelete ? '#EF4444' : '#FEE2E2',
                  color: confirmDelete ? '#FFFFFF' : '#B91C1C',
                }}
              >
                {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
