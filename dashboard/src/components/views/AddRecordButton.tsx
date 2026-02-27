'use client';

import { DashboardColors } from '@/types/config';
import { singularize } from '@/lib/entity-utils';
import { getContrastText } from '@/lib/view-colors';

interface AddRecordButtonProps {
  entityType: string;
  componentId?: string;
  configColors: DashboardColors;
  onClick: () => void;
  isLoading?: boolean;
}

export default function AddRecordButton({
  entityType,
  componentId,
  configColors,
  onClick,
  isLoading = false,
}: AddRecordButtonProps) {
  const singularName = singularize(componentId || entityType);
  const buttonBg = configColors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: buttonBg, color: buttonText }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <span>Add {singularName}</span>
    </button>
  );
}
