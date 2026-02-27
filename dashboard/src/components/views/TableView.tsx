'use client';

import { useState, useRef, useEffect } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { getStatusBadgeStyle } from '@/lib/badge-styles';

interface TableViewProps {
  data: Record<string, unknown>[];
  entityType: string;
  configColors: DashboardColors;
  fields: { columns: string[] } | null;
  onRecordClick?: (record: Record<string, unknown>) => void;
  onRecordUpdate?: (record: Record<string, unknown>) => void;
  onBulkDelete?: (ids: string[]) => void;
  onSort?: (columnName: string, direction: 'asc' | 'desc') => void;
}

// Format column name to readable label
function formatColumnLabel(column: string): string {
  // Common abbreviations that should be all-caps
  const upperCaseWords: Record<string, string> = { sku: 'SKU', url: 'URL', api: 'API', pdf: 'PDF', csv: 'CSV', sms: 'SMS' };
  return column
    .replace(/_/g, ' ')
    .replace(/\bid\b/gi, 'ID')
    .split(' ')
    .map((word) => upperCaseWords[word.toLowerCase()] || word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Format cell value for display
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        if (value.includes('T')) {
          return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
  }
  return String(value);
}


function isStatusColumn(column: string): boolean {
  return ['status', 'type', 'priority', 'category'].includes(column.toLowerCase());
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const PEOPLE_ENTITIES = new Set([
  'clients', 'leads', 'staff', 'vendors', 'contacts',
  'guests', 'members', 'patients', 'students',
]);

export default function TableView({
  data,
  entityType,
  configColors,
  fields,
  onRecordClick,
  onRecordUpdate,
  onBulkDelete,
  onSort,
}: TableViewProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ rowId: string; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const showAvatar = PEOPLE_ENTITIES.has(entityType);
  const headingColor = configColors.headings || '#1A1A1A';
  const textColor = configColors.text || '#1A1A1A';
  const cardBg = configColors.cards || '#FFFFFF';
  const borderColor = configColors.borders || '#E5E7EB';
  const buttonColor = configColors.buttons || '#DC2626';

  const columns = fields?.columns || (data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== 'id' && !k.startsWith('_') && !k.startsWith('color_') && k !== 'stage_id')
    : []);

  const hasBulk = !!onBulkDelete;
  const hasInlineEdit = !!onRecordUpdate;
  const allSelected = data.length > 0 && selectedIds.size === data.length;

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  // Bulk select handlers
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(r => String(r.id))));
    }
  };

  const handleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Don't trigger row click
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Inline edit handlers
  const handleCellDoubleClick = (e: React.MouseEvent, rowId: string, col: string, value: unknown) => {
    if (!hasInlineEdit) return;
    e.stopPropagation();
    setEditingCell({ rowId, col });
    setEditValue(value === null || value === undefined ? '' : String(value));
  };

  const handleEditSave = () => {
    if (!editingCell || !onRecordUpdate) return;
    const record = data.find(r => String(r.id) === editingCell.rowId);
    if (record) {
      const oldValue = String(record[editingCell.col] ?? '');
      if (oldValue !== editValue) {
        onRecordUpdate({ ...record, [editingCell.col]: editValue });
      }
    }
    setEditingCell(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    onBulkDelete?.(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (columns.length === 0 && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full shadow-sm p-12" style={{ backgroundColor: cardBg, color: textColor }}>
        No data to display
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="h-full overflow-auto shadow-sm" style={{ backgroundColor: cardBg }}>
        <table className="w-full min-w-max">
          <thead className="sticky top-0" style={{ backgroundColor: cardBg }}>
            <tr className="border-b" style={{ borderColor }}>
              {/* Bulk select checkbox */}
              {hasBulk && (
                <th className="w-10 px-3 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: buttonColor }}
                  />
                </th>
              )}
              {showAvatar && <th className="w-14 px-4 py-4" />}
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wide cursor-pointer select-none transition-colors hover:bg-black/[0.02]"
                  style={{ color: configColors.icons || '#6B7280' }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{formatColumnLabel(column)}</span>
                    {sortColumn === column && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: headingColor }}>
                        {sortDirection === 'asc' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record) => {
              const recordId = String(record.id || Math.random());
              const isSelected = selectedIds.has(recordId);
              const nameValue = (record.name as string) || (record.title as string) || (record.contact_id as string) || (columns.length > 0 ? String(record[columns[0]] || '') : '');

              return (
                <tr
                  key={recordId}
                  className="border-b last:border-b-0 transition-colors hover:bg-black/[0.02] cursor-pointer"
                  style={{
                    borderColor,
                    backgroundColor: isSelected ? `${buttonColor}08` : undefined,
                  }}
                  onClick={() => onRecordClick?.(record)}
                >
                  {/* Bulk select checkbox */}
                  {hasBulk && (
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => handleSelectRow(e, recordId)}
                        onChange={() => {}} // Controlled by onClick
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: buttonColor }}
                      />
                    </td>
                  )}

                  {/* Avatar */}
                  {showAvatar && (
                    <td className="px-4 py-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: (record.color_primary as string) || '#F3F4F6',
                          color: (record.color_primary as string) ? '#FFFFFF' : '#6B7280',
                        }}
                      >
                        {nameValue ? getInitials(nameValue) : '?'}
                      </div>
                    </td>
                  )}

                  {columns.map((column, i) => {
                    const rawValue = record[column];
                    const displayValue = formatCellValue(rawValue);
                    const isEditing = editingCell?.rowId === recordId && editingCell?.col === column;

                    // Status columns as pill badges (not editable inline)
                    if (isStatusColumn(column) && typeof rawValue === 'string' && rawValue !== '-') {
                      const badge = getStatusBadgeStyle(rawValue);
                      return (
                        <td key={column} className="px-4 py-4">
                          <span
                            className="inline-flex px-3 py-1 text-xs font-medium capitalize"
                            style={{ backgroundColor: badge.bg, color: badge.text }}
                          >
                            {rawValue}
                          </span>
                        </td>
                      );
                    }

                    // Inline editing cell
                    if (isEditing) {
                      return (
                        <td key={column} className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleEditSave}
                            onKeyDown={handleEditKeyDown}
                            className="w-full px-2 py-1 text-sm border outline-none"
                            style={{
                              borderColor: buttonColor,
                              color: textColor,
                              backgroundColor: configColors.background || '#F9FAFB',
                            }}
                          />
                        </td>
                      );
                    }

                    return (
                      <td
                        key={column}
                        className={`px-4 py-4 text-sm ${i === 0 ? 'font-medium' : ''}`}
                        style={{ color: i === 0 ? headingColor : textColor }}
                        onDoubleClick={(e) => handleCellDoubleClick(e, recordId, column, rawValue)}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="flex items-center justify-center py-16" style={{ color: configColors.icons || '#6B7280' }}>
            No data to display
          </div>
        )}
      </div>

      {/* Bulk actions floating bar */}
      {selectedIds.size > 0 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 shadow-lg border"
          style={{
            backgroundColor: cardBg,
            borderColor,
          }}
        >
          <span className="text-sm font-medium" style={{ color: textColor }}>
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1.5 text-sm border transition-opacity hover:opacity-70"
            style={{ borderColor, color: textColor }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
