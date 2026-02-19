'use client';

/**
 * Drag Preview Component
 * Shows ghost preview of dragged component in DragOverlay
 */

import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ComponentMeta {
  label: string;
  icon: string;
}

interface DragPreviewProps {
  type: string;
  isValid: boolean;
  /** Optional component metadata map — if omitted, the type string is used as the label. */
  componentMeta?: Record<string, ComponentMeta>;
  accentColor?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * DragPreview Component
 * Renders a small floating badge that follows the cursor during a drag operation.
 */
export default function DragPreview({ type, isValid, componentMeta, accentColor = '#E11D48' }: DragPreviewProps) {
  const meta = componentMeta?.[type];
  const label = meta?.label || type;

  // Resolve the icon from lucide-react by name
  const iconName = meta?.icon || 'Square';
  const IconComponent: LucideIcon =
    (Icons as unknown as Record<string, LucideIcon>)[iconName] || Icons.Square;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-xl font-sans text-sm pointer-events-none transition-colors duration-150 text-white border-2"
      style={{
        opacity: 0.9,
        transform: 'rotate(2deg)',
        backgroundColor: isValid ? accentColor : '#DC2626',
        borderColor: isValid ? `${accentColor}99` : '#F87171',
      }}
    >
      <IconComponent className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
}
