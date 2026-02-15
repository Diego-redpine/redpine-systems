'use client';

import { useState, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { FormField, FormFieldType, FormType } from '@/types/data';
import { getContrastText } from '@/lib/view-colors';
import CenterModal from '@/components/ui/CenterModal';

interface FormBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Record<string, unknown>) => void;
  configColors: DashboardColors;
  existingForm?: {
    id?: string;
    name?: string;
    description?: string;
    type?: FormType;
    fields?: FormField[];
    status?: string;
  } | null;
  isSaving?: boolean;
}

const FIELD_TYPES: { type: FormFieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'email', label: 'Email', icon: '@' },
  { type: 'phone', label: 'Phone', icon: '#' },
  { type: 'textarea', label: 'Long Text', icon: '¶' },
  { type: 'number', label: 'Number', icon: '1' },
  { type: 'date', label: 'Date', icon: 'D' },
  { type: 'dropdown', label: 'Dropdown', icon: '▼' },
  { type: 'checkbox', label: 'Checkbox', icon: '☐' },
  { type: 'radio', label: 'Radio', icon: '◉' },
  { type: 'file', label: 'File Upload', icon: '↑' },
  { type: 'signature', label: 'Signature', icon: '✍' },
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'paragraph', label: 'Paragraph', icon: 'P' },
];

const FORM_TYPES: { value: FormType; label: string }[] = [
  { value: 'intake', label: 'Client Intake' },
  { value: 'contact', label: 'Contact Form' },
  { value: 'lead_capture', label: 'Lead Capture' },
  { value: 'survey', label: 'Survey' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'medical', label: 'Medical / Health' },
  { value: 'booking', label: 'Booking Request' },
  { value: 'custom', label: 'Custom' },
];

function generateFieldId(): string {
  return 'field_' + Math.random().toString(36).slice(2, 8);
}

function createField(type: FormFieldType): FormField {
  const base: FormField = {
    id: generateFieldId(),
    type,
    label: type === 'heading' ? 'Section Title' : type === 'paragraph' ? 'Description text here' : '',
    required: false,
  };
  if (type === 'dropdown' || type === 'radio' || type === 'checkbox') {
    base.options = ['Option 1', 'Option 2'];
  }
  if (type === 'email') {
    base.label = 'Email';
    base.placeholder = 'your@email.com';
    base.required = true;
  }
  if (type === 'phone') {
    base.label = 'Phone';
    base.placeholder = '(555) 123-4567';
  }
  if (type === 'text') {
    base.placeholder = 'Enter text...';
  }
  return base;
}

export default function FormBuilder({
  isOpen,
  onClose,
  onSave,
  configColors,
  existingForm,
  isSaving = false,
}: FormBuilderProps) {
  const [formName, setFormName] = useState(existingForm?.name || '');
  const [formDescription, setFormDescription] = useState(existingForm?.description || '');
  const [formType, setFormType] = useState<FormType>(existingForm?.type || 'intake');
  const [fields, setFields] = useState<FormField[]>(existingForm?.fields || []);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const buttonBg = configColors.buttons || '#DC2626';
  const buttonText = getContrastText(buttonBg);
  const borderColor = configColors.borders || '#E5E7EB';
  const headingColor = configColors.headings || '#111827';
  const textColor = configColors.text || '#374151';
  const bgColor = configColors.background || '#F9FAFB';

  const addField = useCallback((type: FormFieldType) => {
    setFields(prev => [...prev, createField(type)]);
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (editingFieldId === fieldId) setEditingFieldId(null);
  }, [editingFieldId]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  }, []);

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setFields(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const handleSave = () => {
    if (!formName.trim()) return;
    onSave({
      name: formName,
      description: formDescription,
      type: formType,
      fields,
      status: existingForm?.status || 'active',
    });
  };

  const editingField = fields.find(f => f.id === editingFieldId);

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title={existingForm?.id ? 'Edit Form' : 'New Form'}
      maxWidth="max-w-3xl"
      configColors={configColors}
    >
      <div className="flex flex-col gap-4">
        {/* Form Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: headingColor }}>
              Form Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Client Intake Form"
              className="w-full px-3 py-2 rounded-md border text-sm"
              style={{ backgroundColor: bgColor, borderColor, color: textColor }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: headingColor }}>
              Type
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as FormType)}
              className="w-full px-3 py-2 rounded-md border text-sm"
              style={{ backgroundColor: bgColor, borderColor, color: textColor }}
            >
              {FORM_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: headingColor }}>
            Description
          </label>
          <input
            type="text"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Brief description shown at top of form"
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{ backgroundColor: bgColor, borderColor, color: textColor }}
          />
        </div>

        {/* Two-column: Field palette + Canvas */}
        <div className="flex gap-3" style={{ minHeight: 320 }}>
          {/* Field palette */}
          <div
            className="w-36 shrink-0 rounded-lg border p-2 space-y-1 overflow-y-auto"
            style={{ borderColor, maxHeight: 400 }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: headingColor }}>Add Field</p>
            {FIELD_TYPES.map(ft => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-opacity text-left"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                <span className="w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold"
                  style={{ backgroundColor: buttonBg, color: buttonText }}
                >
                  {ft.icon}
                </span>
                {ft.label}
              </button>
            ))}
          </div>

          {/* Form canvas */}
          <div
            className="flex-1 rounded-lg border p-3 overflow-y-auto space-y-2"
            style={{ borderColor, maxHeight: 400 }}
          >
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <p className="text-sm" style={{ color: textColor }}>No fields yet</p>
                <p className="text-xs mt-1" style={{ color: textColor }}>Click a field type to add it</p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== index) {
                      moveField(dragIndex, index);
                    }
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  onClick={() => setEditingFieldId(field.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    editingFieldId === field.id ? 'ring-2' : ''
                  } ${dragIndex === index ? 'opacity-50' : ''}`}
                  style={{
                    borderColor: editingFieldId === field.id ? buttonBg : borderColor,
                    backgroundColor: editingFieldId === field.id ? bgColor : 'transparent',
                    boxShadow: editingFieldId === field.id ? `0 0 0 2px ${buttonBg}33` : 'none',
                  }}
                >
                  {/* Drag handle */}
                  <span className="cursor-grab text-xs opacity-40" style={{ color: textColor }}>⠿</span>

                  {/* Field preview */}
                  <div className="flex-1 min-w-0">
                    {field.type === 'heading' ? (
                      <p className="text-sm font-bold truncate" style={{ color: headingColor }}>{field.label || 'Heading'}</p>
                    ) : field.type === 'paragraph' ? (
                      <p className="text-xs italic truncate" style={{ color: textColor }}>{field.label || 'Paragraph text'}</p>
                    ) : (
                      <div>
                        <p className="text-sm truncate" style={{ color: headingColor }}>
                          {field.label || '(Untitled field)'}
                          {field.required && <span className="text-red-500 ml-0.5">*</span>}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide opacity-50" style={{ color: textColor }}>
                          {field.type}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                    className="text-xs opacity-40 hover:opacity-100 transition-opacity"
                    style={{ color: '#DC2626' }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Field editor sidebar */}
          {editingField && (
            <div
              className="w-52 shrink-0 rounded-lg border p-3 overflow-y-auto space-y-3"
              style={{ borderColor, maxHeight: 400 }}
            >
              <p className="text-xs font-medium" style={{ color: headingColor }}>Field Settings</p>

              <div>
                <label className="block text-[11px] mb-0.5" style={{ color: textColor }}>Label</label>
                <input
                  type="text"
                  value={editingField.label}
                  onChange={(e) => updateField(editingField.id, { label: e.target.value })}
                  className="w-full px-2 py-1 rounded border text-sm"
                  style={{ borderColor, color: textColor, backgroundColor: bgColor }}
                />
              </div>

              {editingField.type !== 'heading' && editingField.type !== 'paragraph' && (
                <>
                  <div>
                    <label className="block text-[11px] mb-0.5" style={{ color: textColor }}>Placeholder</label>
                    <input
                      type="text"
                      value={editingField.placeholder || ''}
                      onChange={(e) => updateField(editingField.id, { placeholder: e.target.value })}
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor, color: textColor, backgroundColor: bgColor }}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs" style={{ color: textColor }}>
                    <input
                      type="checkbox"
                      checked={editingField.required || false}
                      onChange={(e) => updateField(editingField.id, { required: e.target.checked })}
                      style={{ accentColor: buttonBg }}
                    />
                    Required
                  </label>
                </>
              )}

              {(editingField.type === 'dropdown' || editingField.type === 'radio' || editingField.type === 'checkbox') && (
                <div>
                  <label className="block text-[11px] mb-0.5" style={{ color: textColor }}>Options</label>
                  {(editingField.options || []).map((opt, i) => (
                    <div key={i} className="flex items-center gap-1 mb-1">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(editingField.options || [])];
                          newOpts[i] = e.target.value;
                          updateField(editingField.id, { options: newOpts });
                        }}
                        className="flex-1 px-2 py-1 rounded border text-xs"
                        style={{ borderColor, color: textColor, backgroundColor: bgColor }}
                      />
                      <button
                        onClick={() => {
                          const newOpts = (editingField.options || []).filter((_, j) => j !== i);
                          updateField(editingField.id, { options: newOpts });
                        }}
                        className="text-xs opacity-40 hover:opacity-100"
                        style={{ color: '#DC2626' }}
                      >×</button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOpts = [...(editingField.options || []), `Option ${(editingField.options?.length || 0) + 1}`];
                      updateField(editingField.id, { options: newOpts });
                    }}
                    className="text-xs mt-1"
                    style={{ color: buttonBg }}
                  >
                    + Add option
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[11px] mb-0.5" style={{ color: textColor }}>Help Text</label>
                <input
                  type="text"
                  value={editingField.description || ''}
                  onChange={(e) => updateField(editingField.id, { description: e.target.value })}
                  className="w-full px-2 py-1 rounded border text-xs"
                  placeholder="Optional help text"
                  style={{ borderColor, color: textColor, backgroundColor: bgColor }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor }}>
          <p className="text-xs" style={{ color: textColor }}>
            {fields.length} field{fields.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm border transition-opacity hover:opacity-80"
              style={{ borderColor, color: textColor }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formName.trim() || isSaving}
              className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              {isSaving ? 'Saving...' : existingForm?.id ? 'Save Form' : 'Create Form'}
            </button>
          </div>
        </div>
      </div>
    </CenterModal>
  );
}
