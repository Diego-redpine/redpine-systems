'use client';

import { useState, useEffect } from 'react';
import { DashboardColors } from '@/types/config';
import { singularize } from '@/lib/entity-utils';
import { getContrastText, getDualColorStyle } from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';
import FileAttachments from '@/components/editors/FileAttachments';
import RichTextEditor from '@/components/editors/RichTextEditor';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import LinkedRecords from '@/components/editors/LinkedRecords';
import CenterModal from '@/components/ui/CenterModal';
import type { CustomFieldDefinition } from '@/hooks/useCustomFields';

interface DetailPanelProps {
  record: Record<string, unknown> | null;
  entityType: string;
  fields: string[];
  configColors: DashboardColors;
  isOpen: boolean;
  titleField?: string;
  onClose: () => void;
  onSave: (updatedRecord: Record<string, unknown>) => void;
  onDelete: (recordId: string) => void;
  mode?: 'create' | 'edit';
  isSaving?: boolean;
  isDeleting?: boolean;
  customFields?: CustomFieldDefinition[];
}

// Infer input type from field value
function getInputType(key: string, value: unknown): string {
  if (key.includes('date') || key.includes('_at')) return 'date';
  if (key.includes('time') && !key.includes('date')) return 'datetime-local';
  if (key.includes('email')) return 'email';
  if (key.includes('phone')) return 'tel';
  if (key.includes('url') || key.includes('link')) return 'url';
  if (key.includes('color')) return 'color';
  if (key.includes('password')) return 'password';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'checkbox';
  if (typeof value === 'string' && value.length > 100) return 'textarea';
  return 'text';
}

// Format value for input
function formatInputValue(value: unknown, inputType: string): string {
  if (value === null || value === undefined) return '';
  if (inputType === 'date' && typeof value === 'string') {
    return value.split('T')[0];
  }
  if (inputType === 'datetime-local' && typeof value === 'string') {
    return value.slice(0, 16);
  }
  return String(value);
}

// Parse input value back to appropriate type
function parseInputValue(value: string, originalValue: unknown, inputType: string): unknown {
  if (value === '') return null;
  if (inputType === 'number') return parseFloat(value) || 0;
  if (inputType === 'checkbox') return value === 'true';
  return value;
}

export default function DetailPanel({
  record,
  entityType,
  fields,
  configColors,
  isOpen,
  titleField = 'name',
  onClose,
  onSave,
  onDelete,
  mode = 'edit',
  isSaving = false,
  isDeleting = false,
  customFields = [],
}: DetailPanelProps) {
  const [editedRecord, setEditedRecord] = useState<Record<string, unknown>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSecondaryColor, setShowSecondaryColor] = useState(false);
  const [attachments, setAttachments] = useState<Array<{
    id: string; file_name: string; file_url: string;
    file_type: string | null; file_size: number | null; created_at: string;
  }>>([]);

  // Reset state when record changes or mode changes
  useEffect(() => {
    if (mode === 'create') {
      // Start with empty record for create mode, initialized with field keys
      const emptyRecord: Record<string, unknown> = {};
      fields.forEach(field => {
        // Initialize with empty values based on field name hints
        if (field.includes('color')) {
          // Skip color fields - they'll be added if user wants
        } else {
          emptyRecord[field] = '';
        }
      });
      setEditedRecord(emptyRecord);
      setShowSecondaryColor(false);
    } else if (record) {
      setEditedRecord({ ...record });
      setShowSecondaryColor(!!record.color_secondary);
    }
    setShowDeleteConfirm(false);
  }, [record, mode, fields]);

  // Load attachments when record opens
  useEffect(() => {
    if (isOpen && mode === 'edit' && record?.id) {
      fetch(`/api/attachments?entityType=${entityType}&recordId=${String(record.id)}`)
        .then(res => res.ok ? res.json() : { attachments: [] })
        .then(data => setAttachments(data.attachments || []))
        .catch(() => setAttachments([]));
    } else {
      setAttachments([]);
    }
  }, [isOpen, mode, record?.id, entityType]);

  // Auto-focus first input in create mode
  useEffect(() => {
    if (isOpen && mode === 'create') {
      setTimeout(() => {
        const firstInput = document.querySelector<HTMLInputElement>('.detail-panel-input');
        firstInput?.focus();
      }, 100);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;
  if (mode === 'edit' && !record) return null;

  const singularName = singularize(entityType);
  const buttonBg = configColors.buttons || '#DC2626';
  const buttonText = getContrastText(buttonBg);
  const isCreateMode = mode === 'create';
  const recordTitle = isCreateMode
    ? `New ${singularName.charAt(0).toUpperCase() + singularName.slice(1)}`
    : String(editedRecord[titleField] || editedRecord.title || editedRecord.name || 'Record');

  const handleFieldChange = (key: string, value: unknown) => {
    setEditedRecord(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(editedRecord);
  };

  const handleDelete = () => {
    if (isCreateMode) return; // Can't delete in create mode
    if (showDeleteConfirm) {
      onDelete(String(record?.id));
    } else {
      setShowDeleteConfirm(true);
    }
  };

  // Get all editable fields (exclude system fields)
  const systemFields = ['id', 'user_id', 'created_at', 'updated_at', 'custom_fields'];
  const editableFields = Object.keys(editedRecord).filter(
    key => !systemFields.includes(key)
  );

  // Separate color fields and recurrence meta fields
  const colorFields = ['color_primary', 'color_secondary'];
  const recurrenceMetaFields = ['recurring_template_id', 'is_recurring_template'];
  const regularFields = editableFields.filter(key => !colorFields.includes(key) && !recurrenceMetaFields.includes(key));

  // Recurrence options for appointment/invoice entities
  const RECURRENCE_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Every 2 Weeks' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];
  const hasRecurrence = editedRecord.recurrence !== undefined || ['appointments', 'invoices'].includes(entityType);

  // Dual color preview
  const dualColorStyle = getDualColorStyle(
    editedRecord.color_primary as string | null,
    editedRecord.color_secondary as string | null
  );

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title={recordTitle}
      maxWidth="max-w-lg"
      configColors={configColors}
    >
      {/* Content */}
      <div className="space-y-4">
        {/* Color Fields Section */}
        {(editedRecord.color_primary !== undefined || showSecondaryColor) && (
          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: configColors.borders || '#E5E7EB' }}
          >
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: configColors.headings || '#111827' }}
            >
              Colors
            </label>

            {/* Dual color preview */}
            {dualColorStyle && (
              <div
                className="h-8 rounded-md mb-3"
                style={dualColorStyle}
              />
            )}

            <div className="flex gap-4">
              {/* Primary color */}
              <div className="flex-1">
                <label
                  className="block text-xs mb-1"
                  style={{ color: configColors.text || '#6B7280' }}
                >
                  Primary
                </label>
                <input
                  type="color"
                  value={(editedRecord.color_primary as string) || '#DC2626'}
                  onChange={(e) => handleFieldChange('color_primary', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer border"
                  style={{ borderColor: configColors.borders || '#E5E7EB' }}
                />
              </div>

              {/* Secondary color */}
              {showSecondaryColor ? (
                <div className="flex-1">
                  <label
                    className="block text-xs mb-1"
                    style={{ color: configColors.text || '#6B7280' }}
                  >
                    Secondary
                  </label>
                  <input
                    type="color"
                    value={(editedRecord.color_secondary as string) || '#3B82F6'}
                    onChange={(e) => handleFieldChange('color_secondary', e.target.value)}
                    className="w-full h-10 rounded cursor-pointer border"
                    style={{ borderColor: configColors.borders || '#E5E7EB' }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowSecondaryColor(true);
                    handleFieldChange('color_secondary', '#3B82F6');
                  }}
                  className="flex-1 flex items-center justify-center text-sm hover:opacity-70 transition-opacity"
                  style={{ color: buttonBg }}
                >
                  + Add second color
                </button>
              )}
            </div>
          </div>
        )}

        {/* Regular Fields */}
        {regularFields.map((key) => {
          const value = editedRecord[key];
          const inputType = getInputType(key, value);
          const displayLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

          // Custom recurrence dropdown
          if (key === 'recurrence') {
            return (
              <div key={key}>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: configColors.headings || '#111827' }}
                >
                  Repeat
                </label>
                <select
                  value={String(value || 'none')}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="detail-panel-input w-full px-3 py-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: configColors.background || '#F9FAFB',
                    borderColor: configColors.borders || '#E5E7EB',
                    color: configColors.text || '#111827',
                  }}
                >
                  {RECURRENCE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            );
          }

          // Conditionally hide recurrence_end_date when recurrence is 'none'
          if (key === 'recurrence_end_date' && (!editedRecord.recurrence || editedRecord.recurrence === 'none')) {
            return null;
          }

          if (inputType === 'checkbox') {
            return (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={key}
                  checked={Boolean(value)}
                  onChange={(e) => handleFieldChange(key, e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: buttonBg }}
                />
                <label
                  htmlFor={key}
                  className="text-sm"
                  style={{ color: configColors.text || '#111827' }}
                >
                  {displayLabel}
                </label>
              </div>
            );
          }

          return (
            <div key={key}>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: configColors.headings || '#111827' }}
              >
                {displayLabel}
              </label>
              {inputType === 'textarea' ? (
                ['description', 'notes', 'content', 'body', 'details', 'summary'].includes(key) ? (
                  <RichTextEditor
                    content={formatInputValue(value, inputType)}
                    onChange={(html) => handleFieldChange(key, html)}
                    configColors={configColors}
                    placeholder={`Enter ${displayLabel.toLowerCase()}...`}
                  />
                ) : (
                  <textarea
                    value={formatInputValue(value, inputType)}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    rows={3}
                    className="detail-panel-input w-full px-3 py-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: configColors.background || '#F9FAFB',
                      borderColor: configColors.borders || '#E5E7EB',
                      color: configColors.text || '#111827',
                    }}
                  />
                )
              ) : (
                <input
                  type={inputType}
                  value={formatInputValue(value, inputType)}
                  onChange={(e) => handleFieldChange(key, parseInputValue(e.target.value, value, inputType))}
                  className="detail-panel-input w-full px-3 py-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: configColors.background || '#F9FAFB',
                    borderColor: configColors.borders || '#E5E7EB',
                    color: configColors.text || '#111827',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Custom Fields Section */}
        {customFields.length > 0 && (
          <div
            className="pt-4 mt-4 border-t space-y-4"
            style={{ borderColor: configColors.borders || '#E5E7EB' }}
          >
            <label
              className="block text-xs font-bold uppercase tracking-wider opacity-50"
              style={{ color: configColors.headings || '#111827' }}
            >
              Custom Fields
            </label>
            {customFields.map((cf) => {
              const cfValues = (editedRecord.custom_fields || {}) as Record<string, unknown>;
              const cfValue = cfValues[cf.field_key];

              const handleCustomFieldChange = (val: unknown) => {
                const updated = { ...(editedRecord.custom_fields as Record<string, unknown> || {}), [cf.field_key]: val };
                handleFieldChange('custom_fields', updated);
              };

              if (cf.field_type === 'checkbox') {
                return (
                  <div key={cf.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(cfValue)}
                      onChange={e => handleCustomFieldChange(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: buttonBg }}
                    />
                    <label className="text-sm" style={{ color: configColors.text || '#111827' }}>
                      {cf.field_label}{cf.is_required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                  </div>
                );
              }

              if (cf.field_type === 'dropdown') {
                return (
                  <div key={cf.id}>
                    <label className="block text-sm font-medium mb-1" style={{ color: configColors.headings || '#111827' }}>
                      {cf.field_label}{cf.is_required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <select
                      value={String(cfValue || '')}
                      onChange={e => handleCustomFieldChange(e.target.value)}
                      className="detail-panel-input w-full px-3 py-2 rounded-md border text-sm"
                      style={{
                        backgroundColor: configColors.background || '#F9FAFB',
                        borderColor: configColors.borders || '#E5E7EB',
                        color: configColors.text || '#111827',
                      }}
                    >
                      <option value="">Select...</option>
                      {(cf.options || []).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (cf.field_type === 'textarea') {
                return (
                  <div key={cf.id}>
                    <label className="block text-sm font-medium mb-1" style={{ color: configColors.headings || '#111827' }}>
                      {cf.field_label}{cf.is_required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <textarea
                      value={String(cfValue || '')}
                      onChange={e => handleCustomFieldChange(e.target.value)}
                      rows={2}
                      className="detail-panel-input w-full px-3 py-2 rounded-md border text-sm"
                      style={{
                        backgroundColor: configColors.background || '#F9FAFB',
                        borderColor: configColors.borders || '#E5E7EB',
                        color: configColors.text || '#111827',
                      }}
                    />
                  </div>
                );
              }

              // Default: text, number, date, email, phone, url, currency
              const inputType = cf.field_type === 'currency' ? 'number' : cf.field_type;
              return (
                <div key={cf.id}>
                  <label className="block text-sm font-medium mb-1" style={{ color: configColors.headings || '#111827' }}>
                    {cf.field_label}{cf.is_required && <span className="text-red-500 ml-0.5">*</span>}
                    {cf.field_type === 'currency' && <span className="text-xs opacity-40 ml-1">($)</span>}
                  </label>
                  <input
                    type={inputType}
                    value={cfValue != null ? String(cfValue) : ''}
                    onChange={e => handleCustomFieldChange(
                      cf.field_type === 'number' || cf.field_type === 'currency'
                        ? (e.target.value ? parseFloat(e.target.value) : '')
                        : e.target.value
                    )}
                    step={cf.field_type === 'currency' ? '0.01' : undefined}
                    className="detail-panel-input w-full px-3 py-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: configColors.background || '#F9FAFB',
                      borderColor: configColors.borders || '#E5E7EB',
                      color: configColors.text || '#111827',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Linked Records — only in edit mode with saved record */}
        {!isCreateMode && !!record?.id && (
          <div
            className="pt-4 mt-4 border-t"
            style={{ borderColor: configColors.borders || '#E5E7EB' }}
          >
            <LinkedRecords
              entityType={entityType}
              recordId={String(record.id)}
              configColors={configColors}
            />
          </div>
        )}

        {/* File Attachments — only in edit mode with saved record */}
        {!isCreateMode && !!record?.id && (
          <div
            className="pt-4 mt-4 border-t"
            style={{ borderColor: configColors.borders || '#E5E7EB' }}
          >
            <FileAttachments
              entityType={entityType}
              recordId={String(record.id)}
              configColors={configColors}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div
        className="flex gap-3 pt-4 mt-4 border-t"
        style={{
          borderColor: configColors.borders || '#E5E7EB',
        }}
      >
        {/* PDF download for invoices */}
        {!isCreateMode && ['invoices', 'estimates', 'payments'].includes(entityType) && (
          <button
            onClick={() => {
              generateInvoicePDF(editedRecord);
              toast.success('PDF downloaded');
            }}
            className="px-3 py-2 rounded-md text-sm border transition-opacity hover:opacity-80"
            style={{
              borderColor: configColors.borders || '#E5E7EB',
              color: configColors.text || '#374151',
            }}
          >
            PDF
          </button>
        )}

        {/* Delete button - only in edit mode */}
        {!isCreateMode && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: showDeleteConfirm ? '#DC2626' : 'transparent',
              color: showDeleteConfirm ? '#FFFFFF' : '#DC2626',
              border: '1px solid #DC2626',
            }}
          >
            {isDeleting ? 'Deleting...' : showDeleteConfirm ? `Delete this ${singularName}? This cannot be undone.` : 'Delete'}
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: buttonBg,
            color: buttonText,
          }}
        >
          {isSaving ? 'Saving...' : isCreateMode ? 'Create' : 'Save Changes'}
        </button>
      </div>
    </CenterModal>
  );
}
