/**
 * Template registry — maps business descriptions to template families.
 *
 * Flow: description text → detectTemplateType() → { businessType, family } → getTemplate()
 */

import { getBeautyBodyTemplate, type TemplateResult } from './templates/beauty-body';

// Maps freeform keywords found in descriptions to normalized business_type values
// Order matters: longer/more-specific aliases checked first via sorted matching
const BEAUTY_BODY_ALIASES: Record<string, string> = {
  // Nail
  'nail tech': 'nail_salon',
  'nail salon': 'nail_salon',
  'nail art': 'nail_salon',
  'gel nails': 'nail_salon',
  'acrylics': 'nail_salon',
  'manicure': 'nail_salon',
  'pedicure': 'nail_salon',
  'nails': 'nail_salon',
  'nail': 'nail_salon',
  // Barber
  'barber shop': 'barbershop',
  'barbershop': 'barbershop',
  'barber': 'barbershop',
  // Hair salon
  'hair salon': 'hair_salon',
  'hair stylist': 'hair_salon',
  'hairstylist': 'hair_salon',
  'hairdresser': 'hair_salon',
  // Lash / brow
  'lash tech': 'lash_brow',
  'brow tech': 'lash_brow',
  'lash and brow': 'lash_brow',
  'lash & brow': 'lash_brow',
  'lashes': 'lash_brow',
  'lash': 'lash_brow',
  'brows': 'lash_brow',
  'brow': 'lash_brow',
  'eyelash': 'lash_brow',
  // Makeup
  'makeup artist': 'makeup_artist',
  'make up artist': 'makeup_artist',
  'makeup': 'makeup_artist',
  'mua': 'makeup_artist',
  // Tattoo / piercing
  'tattoo artist': 'tattoo',
  'tattoo shop': 'tattoo',
  'tattoo studio': 'tattoo',
  'tattoo and piercing': 'tattoo',
  'tattoo & piercing': 'tattoo',
  'piercing': 'tattoo',
  'tattoo': 'tattoo',
  // Spa / massage
  'day spa': 'spa',
  'massage therapist': 'spa',
  'massage therapy': 'spa',
  'massage': 'spa',
  'spa': 'spa',
  // Med spa
  'med spa': 'med_spa',
  'medspa': 'med_spa',
  'medical spa': 'med_spa',
  'aesthetician': 'med_spa',
  'aesthetics': 'med_spa',
  // Pet grooming
  'pet grooming': 'pet_grooming',
  'pet groomer': 'pet_grooming',
  'dog grooming': 'pet_grooming',
  'dog groomer': 'pet_grooming',
  'cat grooming': 'pet_grooming',
  'groomer': 'pet_grooming',
  // Generic salon (least specific — checked last)
  'salon': 'salon',
};

// Sort aliases longest-first so "nail salon" matches before "nail"
const SORTED_ALIASES = Object.keys(BEAUTY_BODY_ALIASES).sort(
  (a, b) => b.length - a.length
);

export type TemplateFamily = 'beauty_body';

export interface DetectionResult {
  businessType: string;
  family: TemplateFamily;
}

/**
 * Check if a business description matches a known template.
 * Returns { businessType, family } if matched, or null if no match.
 */
export function detectTemplateType(description: string): DetectionResult | null {
  const descLower = description.toLowerCase();
  for (const alias of SORTED_ALIASES) {
    if (descLower.includes(alias)) {
      return {
        businessType: BEAUTY_BODY_ALIASES[alias],
        family: 'beauty_body',
      };
    }
  }
  return null;
}

/**
 * Load a template config for the given businessType and family.
 * Returns { template, lockedIds } or null if no template exists.
 */
export function getTemplate(
  businessType: string,
  family: TemplateFamily
): TemplateResult | null {
  if (family === 'beauty_body') {
    return getBeautyBodyTemplate(businessType);
  }
  return null;
}
