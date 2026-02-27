'use client';

import { DashboardColors } from '@/types/config';
import { singularize, entityToLabel } from '@/lib/entity-utils';
import { getContrastText } from '@/lib/view-colors';

interface EmptyStateProps {
  entityType: string;
  configColors: DashboardColors;
  onAdd?: () => void;
}

export default function EmptyState({ entityType, configColors, onAdd }: EmptyStateProps) {
  const singularName = singularize(entityType);
  const buttonBg = configColors.buttons || '#DC2626';
  const buttonText = getContrastText(buttonBg);

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-8 border-2 border-dashed"
      style={{
        backgroundColor: configColors.cards || '#FFFFFF',
        borderColor: configColors.borders || '#E5E7EB',
      }}
    >
      {/* Icon placeholder - simple SVG box */}
      <div
        className="w-16 h-16 flex items-center justify-center mb-4"
        style={{
          backgroundColor: configColors.background || '#F9FAFB',
          border: `2px solid ${configColors.borders || '#E5E7EB'}`,
        }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: configColors.text || '#6B7280' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>

      {/* Empty state text */}
      <p
        className="text-lg font-medium mb-2"
        style={{ color: configColors.text || '#111827' }}
      >
        No {entityToLabel(entityType)} yet
      </p>
      <p
        className="text-sm mb-6"
        style={{ color: configColors.text || '#6B7280', opacity: 0.7 }}
      >
        Get started by adding your first {singularName}
      </p>

      {/* Add button */}
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-4 py-2 font-medium transition-opacity hover:opacity-90"
          style={{
            backgroundColor: buttonBg,
            color: buttonText,
          }}
        >
          Add your first {singularName}
        </button>
      )}
    </div>
  );
}
