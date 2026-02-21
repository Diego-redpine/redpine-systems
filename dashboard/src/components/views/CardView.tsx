'use client';

import { DashboardColors } from '@/types/config';
import { EntityFieldConfig } from '@/lib/entity-fields';
import {
  getDualColorStyle,
  getContrastText,
} from '@/lib/view-colors';
import { getStatusBadgeStyle } from '@/lib/badge-styles';

// Entity category sets for card layout differentiation
const FINANCIAL_ENTITIES = new Set([
  'invoices', 'payments', 'expenses', 'estimates', 'payroll',
  'subscriptions', 'tip_pools', 'orders', 'purchase_orders',
]);

const PEOPLE_ENTITIES = new Set([
  'clients', 'staff', 'leads', 'vendors', 'contacts',
  'guests', 'members', 'patients', 'students',
]);

const TASK_ENTITIES = new Set([
  'tasks', 'todos', 'jobs', 'workflows', 'checklists', 'tickets',
]);

const EVENT_ENTITIES = new Set([
  'appointments', 'calendar', 'schedules', 'shifts',
  'reservations', 'classes', 'bookings',
]);

type EntityCategory = 'financial' | 'people' | 'task' | 'event' | 'default';

function getEntityCategory(entityType: string): EntityCategory {
  if (FINANCIAL_ENTITIES.has(entityType)) return 'financial';
  if (PEOPLE_ENTITIES.has(entityType)) return 'people';
  if (TASK_ENTITIES.has(entityType)) return 'task';
  if (EVENT_ENTITIES.has(entityType)) return 'event';
  return 'default';
}

// Format currency values
function formatCurrency(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const str = String(value).replace(/[^0-9.-]/g, '');
  const num = parseFloat(str);
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

// Get initials from a name string
function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
}

// Parse a date string into month/day display
function formatDateBadge(dateStr: string): { month: string; day: string } | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return {
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: String(date.getDate()),
    };
  } catch {
    return null;
  }
}

// Format time from ISO string or time string
function formatTime(timeStr: string): string {
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return timeStr;
  }
}

// Determine financial status color for top bar
function getFinancialBarColor(status: string): string {
  const lower = status.toLowerCase();
  if (['paid', 'complete', 'completed', 'success', 'active'].includes(lower)) return '#059669';
  if (['overdue', 'failed', 'cancelled', 'rejected'].includes(lower)) return '#DC2626';
  if (['pending', 'draft', 'sent', 'new'].includes(lower)) return '#D97706';
  return '#9CA3AF';
}

// Get priority border color for task cards
function getPriorityColor(priority: string): string {
  const p = priority.toLowerCase();
  if (p === 'high' || p === 'urgent') return '#DC2626';
  if (p === 'medium' || p === 'normal') return '#D97706';
  if (p === 'low') return '#059669';
  return '#9CA3AF';
}

interface CardViewProps {
  data: Record<string, unknown>[];
  entityType: string;
  configColors: DashboardColors;
  fields: EntityFieldConfig['card'] | null;
  onRecordClick?: (record: Record<string, unknown>) => void;
  onRecordUpdate?: (record: Record<string, unknown>) => void;
  onQuickDelete?: (recordId: string) => void;
}

function getTitleValue(record: Record<string, unknown>, titleField?: string): string {
  if (titleField && record[titleField] !== undefined) return String(record[titleField]);
  if (record.name !== undefined) return String(record.name);
  if (record.title !== undefined) return String(record.title);
  const firstStringField = Object.entries(record).find(
    ([key, val]) => typeof val === 'string' && key !== 'id' && !key.startsWith('_')
  );
  return firstStringField ? String(firstStringField[1]) : 'Untitled';
}


export default function CardView({
  data,
  entityType,
  configColors,
  fields,
  onRecordClick,
  onRecordUpdate,
  onQuickDelete,
}: CardViewProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full rounded-2xl shadow-sm p-12" style={{ backgroundColor: configColors.cards || '#FFFFFF', color: '#6B7280' }}>
        No data to display
      </div>
    );
  }

  const cardBg = configColors.cards || '#FFFFFF';
  const headingColor = configColors.headings || '#1A1A1A';
  const buttonColor = configColors.buttons || '#1A1A1A';
  const category = getEntityCategory(entityType);

  // Hover actions overlay — shared across all card types
  const renderHoverActions = (record: Record<string, unknown>) => (
    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#6B7280' }}
        onClick={(e) => { e.stopPropagation(); onRecordClick?.(record); }}
        title="Edit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
      {onQuickDelete && (
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#6B7280' }}
          onClick={(e) => {
            e.stopPropagation();
            const id = String(record.id || '');
            if (id) onQuickDelete(id);
          }}
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );

  // Badge renderer — shared
  const renderBadge = (badge: string, extraClass?: string) => {
    if (!badge) return null;
    const badgeStyle = getStatusBadgeStyle(badge);
    return (
      <span
        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${extraClass || ''}`}
        style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
      >
        {badge.replace(/_/g, ' ')}
      </span>
    );
  };

  // Meta fields renderer — shared
  const renderMeta = (metaValues: string[]) => {
    if (metaValues.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
        {metaValues.map((value, i) => (
          <span key={i} className="text-xs" style={{ color: '#9CA3AF' }}>{value}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {data.map((record, index) => {
        const recordId = String(record.id || index);
        const title = getTitleValue(record, fields?.title);
        const subtitle = fields?.subtitle ? String(record[fields.subtitle] || '') : '';
        const badge = fields?.badge ? String(record[fields.badge] || '') : '';
        const metaValues = (fields?.meta || [])
          .map((field) => record[field])
          .filter((val) => val !== null && val !== undefined && val !== '')
          .map(String);

        // --- FINANCIAL CARDS ---
        if (category === 'financial') {
          const amount = record.amount ?? record.total ?? record.value;
          return (
            <div
              key={recordId}
              onClick={() => onRecordClick?.(record)}
              className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group relative"
              style={{ backgroundColor: cardBg }}
            >
              <div className="h-1.5 rounded-t-2xl" style={{ backgroundColor: badge ? getFinancialBarColor(badge) : buttonColor }} />
              <div className="p-6">
                {amount !== undefined && amount !== '' && (
                  <p className="text-2xl font-bold mb-1" style={{ color: headingColor }}>
                    {formatCurrency(amount)}
                  </p>
                )}
                <h3 className="font-medium text-sm truncate mb-2" style={{ color: '#6B7280' }}>{title}</h3>
                {renderBadge(badge)}
                {renderMeta(metaValues)}
              </div>
              {renderHoverActions(record)}
            </div>
          );
        }

        // --- PEOPLE CARDS ---
        if (category === 'people') {
          const avatarColor = (record.color_primary as string) || buttonColor;
          return (
            <div
              key={recordId}
              onClick={() => onRecordClick?.(record)}
              className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group relative"
              style={{ backgroundColor: cardBg }}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                    style={{ backgroundColor: avatarColor, color: getContrastText(avatarColor) }}
                  >
                    {getInitials(title)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate" style={{ color: headingColor }}>{title}</h3>
                    {subtitle && <p className="text-sm truncate" style={{ color: '#6B7280' }}>{subtitle}</p>}
                  </div>
                </div>
                {badge && <div className="mt-3">{renderBadge(badge)}</div>}
                {renderMeta(metaValues)}
              </div>
              {renderHoverActions(record)}
            </div>
          );
        }

        // --- TASK CARDS ---
        if (category === 'task') {
          const isComplete = ['complete', 'completed', 'done'].includes(
            String(record.status || '').toLowerCase()
          );
          const priorityStr = String(record.priority || badge || '');
          const priorityColor = getPriorityColor(priorityStr);

          return (
            <div
              key={recordId}
              className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group relative"
              style={{ backgroundColor: cardBg, borderLeft: `4px solid ${priorityColor}` }}
              onClick={() => onRecordClick?.(record)}
            >
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div
                    className="pt-0.5 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecordUpdate?.({ ...record, status: isComplete ? 'pending' : 'complete' });
                    }}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${isComplete ? '' : 'hover:bg-gray-50'}`}
                      style={{
                        borderColor: isComplete ? '#059669' : '#D1D5DB',
                        backgroundColor: isComplete ? '#059669' : 'transparent',
                      }}
                    >
                      {isComplete && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`font-semibold text-base truncate ${isComplete ? 'line-through opacity-50' : ''}`}
                      style={{ color: headingColor }}
                    >
                      {title}
                    </h3>
                    {record.due_date != null && (
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        Due: {String(record.due_date).split('T')[0]}
                      </p>
                    )}
                  </div>
                </div>
                {badge && <div className="mt-3">{renderBadge(badge)}</div>}
              </div>
              {renderHoverActions(record)}
            </div>
          );
        }

        // --- EVENT CARDS ---
        if (category === 'event') {
          const startStr = String(record.start_time || record.date || '');
          const endStr = String(record.end_time || '');
          const dateBadge = formatDateBadge(startStr);
          const timeStart = startStr ? formatTime(startStr) : '';
          const timeEnd = endStr ? formatTime(endStr) : '';

          return (
            <div
              key={recordId}
              onClick={() => onRecordClick?.(record)}
              className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group relative"
              style={{ backgroundColor: cardBg }}
            >
              <div className="p-6 flex gap-4">
                {dateBadge && (
                  <div
                    className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0"
                    style={{ backgroundColor: buttonColor, color: getContrastText(buttonColor) }}
                  >
                    <span className="text-[10px] font-bold leading-none">{dateBadge.month}</span>
                    <span className="text-xl font-bold leading-none mt-0.5">{dateBadge.day}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base truncate" style={{ color: headingColor }}>{title}</h3>
                  {timeStart && (
                    <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                      {timeStart}{timeEnd ? ` – ${timeEnd}` : ''}
                    </p>
                  )}
                  {subtitle && <p className="text-xs mt-1 truncate" style={{ color: '#9CA3AF' }}>{subtitle}</p>}
                </div>
              </div>
              {badge && (
                <div className="px-6 pb-4">
                  {renderBadge(badge)}
                </div>
              )}
              {renderHoverActions(record)}
            </div>
          );
        }

        // --- DEFAULT CARDS (products, equipment, documents, etc.) ---
        const colorPrimary = record.color_primary as string | null | undefined;
        const colorSecondary = record.color_secondary as string | null | undefined;
        const dualColorStyle = getDualColorStyle(colorPrimary, colorSecondary);
        const defaultBarStyle = { backgroundColor: buttonColor };

        return (
          <div
            key={recordId}
            onClick={() => onRecordClick?.(record)}
            className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group relative"
            style={{ backgroundColor: cardBg }}
          >
            <div className="h-2 rounded-t-2xl" style={dualColorStyle || defaultBarStyle} />
            <div className="p-6">
              <h3 className="font-semibold text-base truncate mb-1" style={{ color: headingColor }}>{title}</h3>
              {subtitle && <p className="text-sm truncate mb-3" style={{ color: '#6B7280' }}>{subtitle}</p>}
              {renderBadge(badge, 'mb-3')}
              {renderMeta(metaValues)}
            </div>
            {renderHoverActions(record)}
          </div>
        );
      })}
    </div>
  );
}
