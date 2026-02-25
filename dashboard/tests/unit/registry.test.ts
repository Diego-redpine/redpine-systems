import { describe, it, expect } from 'vitest';
import { detectTemplateType, getTemplate } from '@/lib/onboarding/registry';

describe('detectTemplateType', () => {
  describe('beauty_body family', () => {
    it.each([
      ['I run a nail salon', 'nail_salon'],
      ['I own a barbershop', 'barbershop'],
      ['I am a hair stylist', 'hair_salon'],
      ['lash tech business', 'lash_brow'],
      ['makeup artist', 'makeup_artist'],
      ['tattoo shop', 'tattoo'],
      ['day spa', 'spa'],
      ['medical spa', 'med_spa'],
      ['pet grooming business', 'pet_grooming'],
    ])('"%s" detects as %s', (description, expectedType) => {
      const result = detectTemplateType(description);
      expect(result).not.toBeNull();
      expect(result!.businessType).toBe(expectedType);
      expect(result!.family).toBe('beauty_body');
    });
  });

  describe('food_beverage family', () => {
    it.each([
      ['restaurant', 'restaurant'],
      ['coffee shop', 'coffee_shop'],
      ['bakery', 'bakery'],
      ['food truck', 'food_truck'],
      ['pizza shop', 'pizza_shop'],
    ])('"%s" detects as %s', (description, expectedType) => {
      const result = detectTemplateType(description);
      expect(result).not.toBeNull();
      expect(result!.businessType).toBe(expectedType);
      expect(result!.family).toBe('food_beverage');
    });
  });

  describe('professional_services family', () => {
    it.each([
      ['law firm', 'law_firm'],
      ['accountant', 'accountant'],
      ['real estate agent', 'real_estate_agent'],
      ['marketing agency', 'marketing_agency'],
    ])('"%s" detects as %s', (description, expectedType) => {
      const result = detectTemplateType(description);
      expect(result).not.toBeNull();
      expect(result!.businessType).toBe(expectedType);
      expect(result!.family).toBe('professional_services');
    });
  });

  describe('longest-first matching', () => {
    it('nail salon matches nail_salon not just nail', () => {
      const result = detectTemplateType('I own a nail salon');
      expect(result!.businessType).toBe('nail_salon');
    });

    it('hair salon matches hair_salon not just salon', () => {
      const result = detectTemplateType('I run a hair salon');
      expect(result!.businessType).toBe('hair_salon');
    });
  });

  it('returns null for unknown business type', () => {
    expect(detectTemplateType('I sell widgets from another dimension')).toBeNull();
  });

  it('is case-insensitive', () => {
    const result = detectTemplateType('NAIL SALON');
    expect(result).not.toBeNull();
    expect(result!.businessType).toBe('nail_salon');
  });
});

describe('getTemplate', () => {
  it('returns template for known business type', () => {
    const result = getTemplate('nail_salon', 'beauty_body');
    expect(result).not.toBeNull();
    expect(result!.template).toBeTruthy();
  });

  it('returns null for unknown family', () => {
    expect(getTemplate('nail_salon', 'nonexistent' as any)).toBeNull();
  });

  it('returns template with tabs array', () => {
    const result = getTemplate('restaurant', 'food_beverage');
    expect(result).not.toBeNull();
    expect(result!.template.tabs).toBeDefined();
    expect(Array.isArray(result!.template.tabs)).toBe(true);
  });
});
