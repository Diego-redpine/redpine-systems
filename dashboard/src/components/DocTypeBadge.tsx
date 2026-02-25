'use client';

import { DOC_TYPE_COLORS, DocType } from '@/lib/form-templates';

interface DocTypeBadgeProps {
  docType: string;
  size?: 'sm' | 'md';
}

const FALLBACK_COLOR = { bg: '#f3f4f6', text: '#6b7280', label: '' };

export default function DocTypeBadge({ docType, size = 'md' }: DocTypeBadgeProps) {
  const colorEntry = DOC_TYPE_COLORS[docType as DocType] ?? FALLBACK_COLOR;
  const label = colorEntry.label || docType.charAt(0).toUpperCase() + docType.slice(1);

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-block rounded-full font-medium whitespace-nowrap ${sizeClasses}`}
      style={{ backgroundColor: colorEntry.bg, color: colorEntry.text }}
    >
      {label}
    </span>
  );
}
