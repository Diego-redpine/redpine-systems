// Default color scheme for Red Pine dashboards
// Used when config.colors is empty or null

import { DashboardColors } from '@/types/config';

export const defaultColors: DashboardColors = {
  // Core brand
  primary: '#1A1A1A',
  secondary: '#F5F5F5',
  accent: '#1A1A1A',

  // Sidebar
  sidebar_bg: '#1A1A1A',
  sidebar_text: '#E5E7EB',
  sidebar_icons: '#9CA3AF',
  sidebar_buttons: '#333333',
  sidebar_hover: '#2D2D2D',
  sidebar_active: '#333333',

  // Header
  header_bg: '#FFFFFF',
  header_text: '#1A1A1A',

  // Content area
  background: '#F5F5F5',
  content_bg: '#F5F5F5',
  content_text: '#1A1A1A',

  // Cards
  cards: '#FFFFFF',
  card_bg: '#FFFFFF',
  card_border: '#E5E7EB',

  // Buttons
  buttons: '#1A1A1A',
  button_bg: '#1A1A1A',
  button_text: '#FFFFFF',

  // Text
  text: '#1A1A1A',
  headings: '#1A1A1A',
  links: '#1A1A1A',

  // Other UI
  icons: '#6B7280',
  highlights: '#1A1A1A',
  borders: '#E5E7EB',
};

// Merge user colors with defaults (user colors take precedence)
export function mergeWithDefaults(userColors?: DashboardColors | null): DashboardColors {
  if (!userColors || Object.keys(userColors).length === 0) {
    return { ...defaultColors };
  }
  return { ...defaultColors, ...userColors };
}

// Apply colors as CSS custom properties to the document
export function applyColorsToDocument(colors: DashboardColors): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Map color keys to CSS variable names
  Object.entries(colors).forEach(([key, value]) => {
    if (value) {
      // Convert key from snake_case to kebab-case for CSS
      const cssVarName = `--color-${key.replace(/_/g, '-')}`;
      root.style.setProperty(cssVarName, value);
    }
  });
}

// Remove applied color CSS custom properties
export function removeColorsFromDocument(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  Object.keys(defaultColors).forEach((key) => {
    const cssVarName = `--color-${key.replace(/_/g, '-')}`;
    root.style.removeProperty(cssVarName);
  });
}
