'use client';

import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  colors: DashboardColors;
}

export default function ComingSoonCard({ title, description, icon, colors }: ComingSoonCardProps) {
  const cardBg = colors.cards || '#FFFFFF';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.text || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';

  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
      style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, minHeight: 320 }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: `${buttonColor}10` }}
      >
        {icon || (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={buttonColor} strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold mb-2" style={{ color: textMain }}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm max-w-sm" style={{ color: textMuted }}>
        {description}
      </p>

      {/* Badge */}
      <span
        className="mt-5 px-4 py-1.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}
      >
        Coming Soon
      </span>
    </div>
  );
}
