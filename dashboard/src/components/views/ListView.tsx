'use client';

import { DashboardColors } from '@/types/config';
import { EntityFieldConfig } from '@/lib/entity-fields';
import { getTextColor, getHeadingColor } from '@/lib/view-colors';
import { getStatusBadgeStyle, isStatusValue } from '@/lib/badge-styles';

interface ListViewProps {
  data: Record<string, unknown>[];
  entityType: string;
  configColors: DashboardColors;
  fields: EntityFieldConfig['list'] | null;
  onRecordClick?: (record: Record<string, unknown>) => void;
  onRecordUpdate?: (record: Record<string, unknown>) => void;
}


export default function ListView({
  data,
  configColors,
  fields,
  onRecordClick,
  onRecordUpdate,
}: ListViewProps) {
  const headingColor = configColors.headings || '#1A1A1A';
  const textColor = configColors.text || '#1A1A1A';
  const cardBg = configColors.cards || '#FFFFFF';
  const borderColor = configColors.borders || '#E5E7EB';

  const primaryField = fields?.primary || 'name';
  const secondaryField = fields?.secondary;
  const trailingField = fields?.trailing;
  const showCheckbox = fields?.checkbox || false;
  const boldWhen = fields?.boldWhen;

  const getPrimaryValue = (record: Record<string, unknown>): unknown => {
    if (record[primaryField] !== undefined) return record[primaryField];
    if (record.name !== undefined) return record.name;
    if (record.title !== undefined) return record.title;
    const firstStringField = Object.entries(record).find(
      ([key, val]) => typeof val === 'string' && key !== 'id' && !key.startsWith('_')
    );
    return firstStringField ? firstStringField[1] : 'Untitled';
  };

  const shouldBeBold = (record: Record<string, unknown>): boolean => {
    if (!boldWhen) return false;
    return record[boldWhen.field] === boldWhen.value;
  };

  const handleCheckboxChange = (record: Record<string, unknown>, checked: boolean) => {
    if (!onRecordUpdate) return;
    const updatedRecord = { ...record, status: checked ? 'complete' : 'pending' };
    onRecordUpdate(updatedRecord);
  };

  const isCompleted = (record: Record<string, unknown>): boolean => {
    const status = record.status as string | undefined;
    return status === 'complete' || status === 'completed' || status === 'done';
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value.toLocaleString();
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'string') {
      const dateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }
    }
    return String(value);
  };

  if (!fields && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full rounded-2xl shadow-sm p-12" style={{ backgroundColor: cardBg, color: '#6B7280' }}>
        No items to display
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto rounded-2xl shadow-sm" style={{ backgroundColor: cardBg }}>
      {data.map((record) => {
        const recordId = String(record.id);
        const isBold = shouldBeBold(record);
        const completed = isCompleted(record);

        return (
          <div
            key={recordId}
            className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0 transition-colors hover:bg-black/[0.02] cursor-pointer"
            style={{ borderColor }}
            onClick={() => onRecordClick?.(record)}
          >
            {/* Checkbox */}
            {showCheckbox && (
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => {
                  e.stopPropagation();
                  handleCheckboxChange(record, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded-md cursor-pointer border-2 border-gray-300 checked:bg-gray-900 checked:border-gray-900"
                style={{ accentColor: configColors.buttons || '#1A1A1A' }}
              />
            )}

            {/* Primary field */}
            <div
              className={`flex-1 min-w-0 truncate text-sm ${isBold ? 'font-semibold' : 'font-medium'} ${completed ? 'line-through opacity-50' : ''}`}
              style={{ color: headingColor }}
            >
              {formatValue(getPrimaryValue(record))}
            </div>

            {/* Secondary field */}
            {secondaryField && (
              <div
                className={`text-sm truncate max-w-[200px] ${completed ? 'line-through opacity-50' : ''}`}
                style={{ color: '#6B7280' }}
              >
                {formatValue(record[secondaryField])}
              </div>
            )}

            {/* Trailing field - render as badge if it's a status */}
            {trailingField && (() => {
              const val = formatValue(record[trailingField]);
              if (typeof record[trailingField] === 'string' && isStatusValue(record[trailingField] as string)) {
                const badge = getStatusBadgeStyle(record[trailingField] as string);
                return (
                  <span
                    className="inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize flex-shrink-0"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {record[trailingField] as string}
                  </span>
                );
              }
              return (
                <div
                  className={`text-sm text-right flex-shrink-0 ${completed ? 'opacity-50' : ''}`}
                  style={{ color: '#9CA3AF' }}
                >
                  {val}
                </div>
              );
            })()}
          </div>
        );
      })}

      {data.length === 0 && (
        <div className="flex items-center justify-center py-16" style={{ color: '#6B7280' }}>
          No items to display
        </div>
      )}
    </div>
  );
}
