import { describe, it, expect } from 'vitest';
import { FORM_TEMPLATES, DOC_TYPE_COLORS } from '@/lib/form-templates';

describe('FORM_TEMPLATES', () => {
  it('has at least 15 templates', () => {
    expect(FORM_TEMPLATES.length).toBeGreaterThanOrEqual(15);
  });

  it('every template has required fields', () => {
    for (const template of FORM_TEMPLATES) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.category).toBeTruthy();
      expect(template.docType).toBeTruthy();
      expect(template.fields.length).toBeGreaterThan(0);
    }
  });

  it('every template field has required properties', () => {
    for (const template of FORM_TEMPLATES) {
      for (const field of template.fields) {
        expect(field.id).toBeTruthy();
        expect(field.label).toBeTruthy();
        expect(field.type).toBeTruthy();
        expect(typeof field.required).toBe('boolean');
      }
    }
  });

  it('select and radio fields have options', () => {
    for (const template of FORM_TEMPLATES) {
      for (const field of template.fields) {
        if (field.type === 'select' || field.type === 'radio') {
          expect(field.options).toBeDefined();
          expect(field.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('template IDs are unique', () => {
    const ids = FORM_TEMPLATES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('DOC_TYPE_COLORS', () => {
  it('has colors for all doc types', () => {
    const expectedTypes = ['intake', 'waiver', 'contract', 'survey', 'invoice', 'consent', 'checklist'];
    for (const type of expectedTypes) {
      expect(DOC_TYPE_COLORS[type as keyof typeof DOC_TYPE_COLORS]).toBeTruthy();
    }
  });

  it('each color entry has bg, text, and label', () => {
    for (const [, colors] of Object.entries(DOC_TYPE_COLORS)) {
      expect(colors.bg).toBeTruthy();
      expect(colors.text).toBeTruthy();
      expect(colors.label).toBeTruthy();
    }
  });
});
