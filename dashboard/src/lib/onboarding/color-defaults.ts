/**
 * Industry-specific color palettes — ported from onboarding/app.py (lines 54-110).
 * Used when the dashboard needs color defaults before or without AI generation.
 */

export interface ColorConfig {
  sidebar_bg: string;
  sidebar_icons: string;
  sidebar_buttons: string;
  sidebar_text: string;
  background: string;
  buttons: string;
  cards: string;
  text: string;
  headings: string;
  borders: string;
}

const DEFAULT_PALETTE: ColorConfig = {
  sidebar_bg: '#0F172A',
  sidebar_text: '#F1F5F9',
  sidebar_icons: '#94A3B8',
  sidebar_buttons: '#3B82F6',
  background: '#F8FAFC',
  buttons: '#3B82F6',
  cards: '#FFFFFF',
  text: '#1A1A1A',
  headings: '#111827',
  borders: '#E5E7EB',
};

export const COLOR_DEFAULTS: Record<string, ColorConfig> = {
  // Food & Beverage
  restaurant:       { sidebar_bg: '#1C1917', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#EA580C', background: '#FFFBEB', buttons: '#EA580C', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  cafe:             { sidebar_bg: '#1C1917', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#D97706', background: '#FFFBEB', buttons: '#D97706', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  bakery:           { sidebar_bg: '#451A03', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#D97706', background: '#FFFBEB', buttons: '#D97706', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  catering:         { sidebar_bg: '#2D1B4E', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#A855F7', background: '#FAF5FF', buttons: '#A855F7', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  food_truck:       { sidebar_bg: '#431407', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#EA580C', background: '#FFF7ED', buttons: '#EA580C', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Beauty & Body
  barber:           { sidebar_bg: '#0F172A', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#3B82F6', background: '#F8FAFC', buttons: '#3B82F6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  barbershop:       { sidebar_bg: '#0F172A', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#3B82F6', background: '#F8FAFC', buttons: '#3B82F6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  salon:            { sidebar_bg: '#4C0519', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#E11D48', background: '#FFF1F2', buttons: '#E11D48', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  nail_salon:       { sidebar_bg: '#4C0519', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#E11D48', background: '#FFF1F2', buttons: '#E11D48', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  hair_salon:       { sidebar_bg: '#4C0519', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#E11D48', background: '#FFF1F2', buttons: '#E11D48', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  lash_brow:        { sidebar_bg: '#2E1065', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#8B5CF6', background: '#F5F3FF', buttons: '#8B5CF6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  makeup_artist:    { sidebar_bg: '#831843', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#DB2777', background: '#FDF2F8', buttons: '#DB2777', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  tattoo:           { sidebar_bg: '#0F172A', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#475569', background: '#F8FAFC', buttons: '#475569', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Wellness & Fitness
  spa:              { sidebar_bg: '#134E4A', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#0D9488', background: '#F0FDFA', buttons: '#0D9488', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  med_spa:          { sidebar_bg: '#134E4A', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#0D9488', background: '#F0FDFA', buttons: '#0D9488', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  fitness:          { sidebar_bg: '#1E1B4B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#4F46E5', background: '#EEF2FF', buttons: '#4F46E5', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  crossfit:         { sidebar_bg: '#0F172A', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#EF4444', background: '#FEF2F2', buttons: '#EF4444', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  martial_arts:     { sidebar_bg: '#4C0519', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#E11D48', background: '#FFF1F2', buttons: '#E11D48', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  yoga:             { sidebar_bg: '#134E4A', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#0D9488', background: '#F0FDFA', buttons: '#0D9488', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  dance_studio:     { sidebar_bg: '#1E1B4B', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#A855F7', background: '#FAF5FF', buttons: '#A855F7', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Home Services
  landscaping:      { sidebar_bg: '#14532D', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#16A34A', background: '#F0FDF4', buttons: '#16A34A', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  plumbing:         { sidebar_bg: '#451A03', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#D97706', background: '#FFFBEB', buttons: '#D97706', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  electrical:       { sidebar_bg: '#1E293B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#F59E0B', background: '#FFFBEB', buttons: '#F59E0B', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  cleaning:         { sidebar_bg: '#0C4A6E', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#0284C7', background: '#F0F9FF', buttons: '#0284C7', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  pest_control:     { sidebar_bg: '#1E293B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#059669', background: '#ECFDF5', buttons: '#059669', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  hvac:             { sidebar_bg: '#1E293B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#0284C7', background: '#F0F9FF', buttons: '#0284C7', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  construction:     { sidebar_bg: '#1E293B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#F59E0B', background: '#FFFBEB', buttons: '#F59E0B', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  moving:           { sidebar_bg: '#1E293B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#3B82F6', background: '#EFF6FF', buttons: '#3B82F6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Professional Services
  legal:            { sidebar_bg: '#1E1B4B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#7C3AED', background: '#FAF5FF', buttons: '#7C3AED', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  accounting:       { sidebar_bg: '#1E1B4B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#6366F1', background: '#EEF2FF', buttons: '#6366F1', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  consulting:       { sidebar_bg: '#0F172A', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#6366F1', background: '#EEF2FF', buttons: '#6366F1', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  insurance:        { sidebar_bg: '#1E293B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#0EA5E9', background: '#F0F9FF', buttons: '#0EA5E9', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  recruiting:       { sidebar_bg: '#0F172A', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#6366F1', background: '#EEF2FF', buttons: '#6366F1', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  professional:     { sidebar_bg: '#0F172A', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#6366F1', background: '#EEF2FF', buttons: '#6366F1', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Real Estate & Property
  real_estate:      { sidebar_bg: '#1E293B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#0EA5E9', background: '#F0F9FF', buttons: '#0EA5E9', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  property_management: { sidebar_bg: '#1E293B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#0EA5E9', background: '#F0F9FF', buttons: '#0EA5E9', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Healthcare
  dental:           { sidebar_bg: '#1E3A5F', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#3B82F6', background: '#EFF6FF', buttons: '#3B82F6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  medical:          { sidebar_bg: '#1E3A5F', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#3B82F6', background: '#EFF6FF', buttons: '#3B82F6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  veterinary:       { sidebar_bg: '#164E63', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#14B8A6', background: '#F0FDFA', buttons: '#14B8A6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Creative & Education
  photography:      { sidebar_bg: '#2E1065', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#8B5CF6', background: '#F5F3FF', buttons: '#8B5CF6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  music_studio:     { sidebar_bg: '#18181B', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#8B5CF6', background: '#F5F3FF', buttons: '#8B5CF6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  tutoring:         { sidebar_bg: '#1B2E4B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#6366F1', background: '#EEF2FF', buttons: '#6366F1', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Hospitality & Events
  event_planning:   { sidebar_bg: '#1E1B4B', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#EC4899', background: '#FDF4FF', buttons: '#EC4899', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  hotel:            { sidebar_bg: '#1E293B', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#0EA5E9', background: '#F0F9FF', buttons: '#0EA5E9', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Retail & Automotive
  retail:           { sidebar_bg: '#1E1B4B', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#EC4899', background: '#FDF4FF', buttons: '#EC4899', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  auto:             { sidebar_bg: '#0F172A', sidebar_text: '#F1F5F9', sidebar_icons: '#94A3B8', sidebar_buttons: '#3B82F6', background: '#F8FAFC', buttons: '#3B82F6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Animals
  pet_grooming:     { sidebar_bg: '#164E63', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#14B8A6', background: '#F0FDFA', buttons: '#14B8A6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },

  // Other
  florist:          { sidebar_bg: '#14532D', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#16A34A', background: '#F0FDF4', buttons: '#16A34A', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  coworking:        { sidebar_bg: '#18181B', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#8B5CF6', background: '#F5F3FF', buttons: '#8B5CF6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
  freelancer:       { sidebar_bg: '#18181B', sidebar_text: '#F1F5F9', sidebar_icons: '#A0AEC0', sidebar_buttons: '#8B5CF6', background: '#F5F3FF', buttons: '#8B5CF6', cards: '#FFFFFF', text: '#1A1A1A', headings: '#111827', borders: '#E5E7EB' },
};

// Known default/bad colors that indicate AI didn't generate a proper palette
export const BAD_BUTTON_COLORS = new Set([
  '#ce0707', '#CE0707',
  '#dc2626', '#DC2626',
  '#ef4444', '#EF4444',
  '#3b82f6', '#3B82F6',
]);

/** Returns the color palette for a business type, falling back to a generic default. */
export function getColorDefaults(businessType: string): ColorConfig {
  return COLOR_DEFAULTS[businessType] ?? DEFAULT_PALETTE;
}

/** Returns the generic default palette (no industry context). */
export function getDefaultPalette(): ColorConfig {
  return { ...DEFAULT_PALETTE };
}

/** Check if a button color is a known bad/default that should be replaced. */
export function isBadButtonColor(color: string): boolean {
  return BAD_BUTTON_COLORS.has(color);
}
