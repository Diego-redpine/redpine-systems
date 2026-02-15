// View Color Resolution Utilities
// Resolves colors for view components from config and record data
// Pure functions - no React, no hooks, no side effects

import { DashboardColors } from '@/types/config';

// Record type with optional color fields
interface ColorableRecord {
  color_primary?: string | null;
  color_secondary?: string | null;
  [key: string]: unknown;
}

/**
 * Get the background color for a card
 * Uses record's color_primary if available, otherwise falls back to configColors.cards
 */
export function getCardBackground(configColors: DashboardColors, record?: ColorableRecord): string {
  if (record?.color_primary) {
    return record.color_primary;
  }
  return configColors.cards || '#FFFFFF';
}

/**
 * Get the border color for cards
 */
export function getCardBorder(configColors: DashboardColors): string {
  return configColors.borders || '#E5E7EB';
}

/**
 * Get the text color
 */
export function getTextColor(configColors: DashboardColors): string {
  return configColors.text || '#111827';
}

/**
 * Get the heading color
 */
export function getHeadingColor(configColors: DashboardColors): string {
  return configColors.headings || '#111827';
}

/**
 * Get the button color
 */
export function getButtonColor(configColors: DashboardColors): string {
  return configColors.buttons || '#DC2626';
}

/**
 * Extract color_primary and color_secondary from a record
 */
export function getRecordColors(record?: ColorableRecord): { primary: string | null; secondary: string | null } {
  return {
    primary: record?.color_primary ?? null,
    secondary: record?.color_secondary ?? null,
  };
}

/**
 * Get a CSS style object for dual-color display
 * - If both colors exist: returns a 50/50 linear gradient (left half primary, right half secondary)
 * - If only primary: returns solid primary color
 * - If neither: returns null
 */
export function getDualColorStyle(
  primary: string | null | undefined,
  secondary: string | null | undefined
): React.CSSProperties | null {
  if (primary && secondary) {
    return {
      background: `linear-gradient(to right, ${primary} 50%, ${secondary} 50%)`,
    };
  }
  if (primary) {
    return {
      background: primary,
    };
  }
  return null;
}

/**
 * Get a CSS style object for vertical dual-color display (for pipeline cards)
 * - If both colors exist: returns a 50/50 linear gradient (top half primary, bottom half secondary)
 * - If only primary: returns solid primary color
 * - If neither: returns null
 */
export function getVerticalDualColorStyle(
  primary: string | null | undefined,
  secondary: string | null | undefined
): React.CSSProperties | null {
  if (primary && secondary) {
    return {
      background: `linear-gradient(to bottom, ${primary} 50%, ${secondary} 50%)`,
    };
  }
  if (primary) {
    return {
      background: primary,
    };
  }
  return null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getLuminance(hexColor: string): number {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Get contrasting text color (black or white) based on background color luminance
 * Returns '#FFFFFF' for dark backgrounds, '#000000' for light backgrounds
 */
export function getContrastText(bgColor: string): string {
  try {
    const luminance = getLuminance(bgColor);
    // Use 0.179 as the threshold (WCAG recommendation)
    return luminance > 0.179 ? '#000000' : '#FFFFFF';
  } catch {
    // Default to black text if color parsing fails
    return '#000000';
  }
}

/**
 * Get background color with optional opacity
 */
export function getBackgroundColor(configColors: DashboardColors): string {
  return configColors.background || '#F9FAFB';
}

/**
 * Get sidebar colors
 */
export function getSidebarColors(configColors: DashboardColors): {
  bg: string;
  text: string;
  icons: string;
  buttons: string;
} {
  return {
    bg: configColors.sidebar_bg || '#1F2937',
    text: configColors.sidebar_text || '#D1D5DB',
    icons: configColors.sidebar_icons || '#9CA3AF',
    buttons: configColors.sidebar_buttons || '#DC2626',
  };
}
