'use client';

import { useState, useMemo } from 'react';
import { FormTemplate, FORM_TEMPLATES, getTemplatesByCategory } from '@/lib/form-templates';
import { getContrastText } from '@/lib/view-colors';
import DocTypeBadge from './DocTypeBadge';

interface FormTemplateLibraryProps {
  colors: { buttons?: string; text?: string; headings?: string; borders?: string; cards?: string };
  onSelectTemplate: (template: FormTemplate) => void;
}

// ── Field type icons for the preview ──────────────────────────

function getFieldIcon(type: string): string {
  switch (type) {
    case 'text': return 'T';
    case 'email': return '@';
    case 'phone': return '#';
    case 'textarea': return '\u00B6';
    case 'number': return '1';
    case 'date': return 'D';
    case 'select': return '\u25BC';
    case 'checkbox': return '\u2610';
    case 'radio': return '\u25C9';
    case 'signature': return '\u270D';
    default: return '\u2022';
  }
}

// ── Preview Modal ─────────────────────────────────────────────

function TemplatePreviewModal({
  template,
  colors,
  onClose,
  onUse,
}: {
  template: FormTemplate;
  colors: FormTemplateLibraryProps['colors'];
  onClose: () => void;
  onUse: () => void;
}) {
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const headingColor = colors.headings || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';
  const textColor = colors.text || '#374151';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-lg overflow-hidden"
          style={{ backgroundColor: cardBg }}
        >
          {/* Header */}
          <div
            className="flex items-start gap-3 px-6 py-5 shrink-0"
            style={{ borderBottom: `1px solid ${borderColor}` }}
          >
            <span className="text-3xl leading-none">{template.icon}</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold" style={{ color: headingColor }}>
                {template.name}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
                {template.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <DocTypeBadge docType={template.docType} size="sm" />
                <span className="text-xs" style={{ color: '#9CA3AF' }}>
                  {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
              aria-label="Close preview"
            >
              <svg className="w-5 h-5" style={{ color: '#9CA3AF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Field Preview (scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {template.fields.map((field) => (
                <div key={field.id}>
                  <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: textColor }}>
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: `${borderColor}60`, color: '#6B7280' }}
                    >
                      {getFieldIcon(field.type)}
                    </span>
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </label>

                  {/* Render a read-only placeholder for each field type */}
                  {field.type === 'textarea' ? (
                    <div
                      className="w-full h-16 rounded-lg px-3 py-2 text-sm"
                      style={{ backgroundColor: `${borderColor}30`, border: `1px solid ${borderColor}`, color: '#9CA3AF' }}
                    >
                      {field.placeholder || 'Enter text...'}
                    </div>
                  ) : field.type === 'select' ? (
                    <div
                      className="w-full rounded-lg px-3 py-2 text-sm flex items-center justify-between"
                      style={{ backgroundColor: `${borderColor}30`, border: `1px solid ${borderColor}`, color: '#9CA3AF' }}
                    >
                      <span>{field.options?.[0] || 'Select...'}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="space-y-1.5">
                      {(field.options || ['Option']).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm" style={{ color: textColor }}>
                          <span
                            className="w-4 h-4 rounded border shrink-0"
                            style={{ borderColor: borderColor }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'radio' ? (
                    <div className="space-y-1.5">
                      {(field.options || ['Option']).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm" style={{ color: textColor }}>
                          <span
                            className="w-4 h-4 rounded-full border shrink-0"
                            style={{ borderColor: borderColor }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'signature' ? (
                    <div
                      className="w-full h-20 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${borderColor}20`, border: `1px dashed ${borderColor}`, color: '#9CA3AF' }}
                    >
                      Signature field
                    </div>
                  ) : (
                    <div
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{ backgroundColor: `${borderColor}30`, border: `1px solid ${borderColor}`, color: '#9CA3AF' }}
                    >
                      {field.placeholder || (field.type === 'date' ? 'mm/dd/yyyy' : field.type === 'number' ? '0' : 'Enter text...')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 flex items-center justify-end gap-3 shrink-0"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-black/5"
              style={{ color: textColor }}
            >
              Cancel
            </button>
            <button
              onClick={onUse}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: buttonColor, color: buttonText }}
            >
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function FormTemplateLibrary({ colors, onSelectTemplate }: FormTemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const headingColor = colors.headings || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';
  const textColor = colors.text || '#374151';

  // Derive categories from templates
  const categories = useMemo(() => {
    const grouped = getTemplatesByCategory();
    return ['All', ...Object.keys(grouped)];
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates = FORM_TEMPLATES;

    if (selectedCategory !== 'All') {
      templates = templates.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.docType.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return templates;
  }, [selectedCategory, searchQuery]);

  const handleCardClick = (template: FormTemplate) => {
    setPreviewTemplate(template);
  };

  const handleUseTemplate = (template: FormTemplate) => {
    setPreviewTemplate(null);
    onSelectTemplate(template);
  };

  return (
    <div className="space-y-5">
      {/* Category Filter Bar */}
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex gap-2 pb-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? buttonColor : `${borderColor}50`,
                  color: isActive ? buttonText : textColor,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: '#9CA3AF' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
          style={{
            backgroundColor: `${borderColor}30`,
            border: `1px solid ${borderColor}`,
            color: textColor,
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-black/5"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" style={{ color: '#9CA3AF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            No templates found{searchQuery ? ` for "${searchQuery}"` : ''}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleCardClick(template)}
              className="text-left bg-white rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 group"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
              }}
            >
              {/* Top row: icon + doc type badge */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl leading-none">{template.icon}</span>
                <DocTypeBadge docType={template.docType} size="sm" />
              </div>

              {/* Name */}
              <h3
                className="text-sm font-semibold mb-1 group-hover:opacity-80 transition-opacity"
                style={{ color: headingColor }}
              >
                {template.name}
              </h3>

              {/* Description */}
              <p
                className="text-xs leading-relaxed line-clamp-2 mb-3"
                style={{ color: '#6B7280' }}
              >
                {template.description}
              </p>

              {/* Footer: field count */}
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  style={{ color: '#9CA3AF' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>
                  {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          colors={colors}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => handleUseTemplate(previewTemplate)}
        />
      )}
    </div>
  );
}
