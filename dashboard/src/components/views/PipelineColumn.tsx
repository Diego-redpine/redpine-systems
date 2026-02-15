'use client';

import { memo } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DashboardColors, PipelineStage } from '@/types/config';
import { EntityFieldConfig } from '@/lib/entity-fields';
import { getContrastText, getDualColorStyle, getVerticalDualColorStyle } from '@/lib/view-colors';

interface PipelineColumnProps {
  stage: PipelineStage;
  items: Record<string, unknown>[];
  configColors: DashboardColors;
  fields: EntityFieldConfig['pipeline'] | null;
  stageValue?: number;
  onItemClick?: (record: Record<string, unknown>) => void;
  onAddClick?: () => void;
}

// Individual draggable pipeline card
function DraggableCard({
  record,
  stageId,
  configColors,
  fields,
  stageColor,
  onItemClick,
}: {
  record: Record<string, unknown>;
  stageId: string;
  configColors: DashboardColors;
  fields: EntityFieldConfig['pipeline'] | null;
  stageColor: string;
  onItemClick?: (record: Record<string, unknown>) => void;
}) {
  const recordId = String(record.id);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: recordId,
    data: { record, stageId },
  });

  const title = fields?.title
    ? String(record[fields.title] || '')
    : String(record.name || record.title || '');
  const subtitle = fields?.subtitle ? String(record[fields.subtitle] || '') : '';
  const value = fields?.valueField ? record[fields.valueField] : null;

  const colorPrimary = record.color_primary as string | null | undefined;
  const colorSecondary = record.color_secondary as string | null | undefined;
  const stripeColorStyle = getVerticalDualColorStyle(colorPrimary, colorSecondary);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onItemClick?.(record)}
      className="relative flex cursor-grab active:cursor-grabbing rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: configColors.cards || '#FFFFFF',
      }}
    >
      {/* Color stripe */}
      {stripeColorStyle && (
        <div className="w-1.5 flex-shrink-0" style={stripeColorStyle} />
      )}

      {/* Card content */}
      <div className="flex-1 p-4 min-w-0">
        <p
          className="font-medium text-sm truncate"
          style={{ color: configColors.headings || '#1A1A1A' }}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-xs truncate mt-1" style={{ color: '#6B7280' }}>
            {subtitle}
          </p>
        )}
        {value !== null && value !== undefined && (
          <p className="text-xs font-semibold mt-2" style={{ color: stageColor }}>
            {typeof value === 'number'
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(value / 100)
              : String(value)}
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(function PipelineColumn({
  stage,
  items,
  configColors,
  fields,
  stageValue,
  onItemClick,
  onAddClick,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const hasDualColor = !!stage.color_secondary;
  const headerStyle = hasDualColor
    ? getDualColorStyle(stage.color, stage.color_secondary) || { backgroundColor: stage.color }
    : { backgroundColor: stage.color };
  // For dual-color headers, use contrast text for primary color on left, secondary on right
  const leftText = getContrastText(stage.color);
  const rightText = hasDualColor ? getContrastText(stage.color_secondary!) : leftText;

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-[300px] min-w-[300px] min-h-[600px] rounded-2xl overflow-hidden transition-shadow"
      style={{
        backgroundColor: isOver ? `${stage.color}10` : '#F9FAFB',
        boxShadow: isOver ? `inset 0 0 0 2px ${stage.color}` : undefined,
      }}
    >
      {/* Stage header — solid or dual-color */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={headerStyle as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: leftText }}>
            {stage.name}
          </span>
          <span
            className="px-2.5 py-0.5 text-xs font-medium rounded-full"
            style={{
              backgroundColor: `${rightText}20`,
              color: rightText,
            }}
          >
            {items.length}
          </span>
        </div>
        {/* Deal value rollup */}
        {stageValue != null && stageValue > 0 && (
          <span
            className="text-xs font-medium"
            style={{ color: rightText, opacity: 0.8 }}
          >
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(stageValue / 100)}
          </span>
        )}
      </div>

      {/* Items container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {items.map((record) => (
          <DraggableCard
            key={String(record.id)}
            record={record}
            stageId={stage.id}
            configColors={configColors}
            fields={fields}
            stageColor={stage.color}
            onItemClick={onItemClick}
          />
        ))}

        {items.length === 0 && (
          <div
            className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed"
            style={{ borderColor: '#E5E7EB', color: '#9CA3AF' }}
          >
            <span className="text-sm">Drop items here</span>
          </div>
        )}
      </div>

      {/* Add button at bottom of column — uses brand color */}
      {onAddClick && (
        <button
          onClick={onAddClick}
          className="mx-3 mb-3 py-2 rounded-xl border-2 border-dashed text-sm font-medium hover:opacity-70 transition-opacity"
          style={{
            borderColor: `${configColors.buttons || stage.color}40`,
            color: configColors.buttons || stage.color,
          }}
        >
          + Add
        </button>
      )}
    </div>
  );
})
