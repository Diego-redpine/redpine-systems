// Default color scheme for Red Pine dashboards
// Used when config.colors is empty or null

import { DashboardColors } from '@/types/config';

// ─── Color math helpers ─────────────────────────────────────────────────────

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

/** Mix two hex colors by ratio (0 = c1, 1 = c2) */
function mixColor(c1: string, c2: string, ratio: number): string {
  const [r1, g1, b1] = parseHex(c1);
  const [r2, g2, b2] = parseHex(c2);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * ratio);
  return toHex(mix(r1, r2), mix(g1, g2), mix(b1, b2));
}

/** Lighten a color by amount (0-1) toward white */
function lighten(hex: string, amount: number): string {
  return mixColor(hex, '#FFFFFF', amount);
}

/** Darken a color by amount (0-1) toward black */
function darken(hex: string, amount: number): string {
  return mixColor(hex, '#000000', amount);
}

/** WCAG luminance */
function getLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Returns true if background is dark (needs light text) */
function isDark(hex: string): boolean {
  return getLuminance(hex) <= 0.179;
}

/** Get contrasting text color */
function contrastText(bg: string): string {
  return isDark(bg) ? '#FFFFFF' : '#000000';
}

// ─── Static defaults (light theme — used when no user colors) ───────────────

export const defaultColors: DashboardColors = {
  primary: '#1A1A1A',
  secondary: '#F5F5F5',
  accent: '#1A1A1A',

  sidebar_bg: '#1A1A1A',
  sidebar_text: '#E5E7EB',
  sidebar_icons: '#9CA3AF',
  sidebar_buttons: '#333333',
  sidebar_hover: '#2D2D2D',
  sidebar_active: '#333333',

  header_bg: '#FFFFFF',
  header_text: '#1A1A1A',

  background: '#F5F5F5',
  content_bg: '#F5F5F5',
  content_text: '#1A1A1A',

  cards: '#FFFFFF',
  card_bg: '#FFFFFF',
  card_border: '#E5E7EB',

  buttons: '#1A1A1A',
  button_bg: '#1A1A1A',
  button_text: '#FFFFFF',

  text: '#1A1A1A',
  headings: '#1A1A1A',
  links: '#1A1A1A',

  icons: '#6B7280',
  highlights: '#1A1A1A',
  borders: '#E5E7EB',
};

/**
 * Derive a complete color palette from the user's background + buttons.
 * Cards, text, borders, sidebar, header — all adapt to the bg luminance.
 */
function deriveFromBackground(bg: string, buttons: string): DashboardColors {
  const dark = isDark(bg);
  const textColor = dark ? '#F1F5F9' : '#1A1A1A';
  const mutedText = dark ? '#94A3B8' : '#6B7280';

  // Cards: slightly offset from bg so they stand out
  const cardColor = dark ? lighten(bg, 0.08) : lighten(bg, 0.6);
  // Borders: subtle separator derived from bg+text mix
  const borderColor = dark ? lighten(bg, 0.15) : darken(bg, 0.12);
  // Header: matches main background exactly (no color mismatch)
  const headerBg = bg;
  const headerText = contrastText(headerBg);
  // Button text: contrast against button bg
  const buttonText = contrastText(buttons);

  return {
    primary: buttons,
    secondary: bg,
    accent: buttons,

    sidebar_bg: dark ? darken(bg, 0.15) : darken(bg, 0.6),
    sidebar_text: dark ? '#F1F5F9' : '#E5E7EB',
    sidebar_icons: dark ? mixColor(bg, '#FFFFFF', 0.5) : '#9CA3AF',
    sidebar_buttons: buttons,
    sidebar_hover: dark ? lighten(bg, 0.1) : darken(bg, 0.5),
    sidebar_active: dark ? lighten(bg, 0.12) : darken(bg, 0.45),

    header_bg: headerBg,
    header_text: headerText,

    background: bg,
    content_bg: bg,
    content_text: textColor,

    cards: cardColor,
    card_bg: cardColor,
    card_border: borderColor,

    buttons: buttons,
    button_bg: buttons,
    button_text: buttonText,

    text: textColor,
    headings: textColor,
    links: buttons,

    icons: mutedText,
    highlights: buttons,
    borders: borderColor,
  };
}

/**
 * Merge user colors with intelligent defaults.
 * If the user has set a background color, derive cards/text/borders from it
 * instead of using static light-theme defaults.
 */
export function mergeWithDefaults(userColors?: DashboardColors | null): DashboardColors {
  if (!userColors || Object.keys(userColors).length === 0) {
    return { ...defaultColors };
  }

  // Filter out internal keys (prefixed with _) from color derivation
  const cleanColors: DashboardColors = {};
  for (const [k, v] of Object.entries(userColors)) {
    if (v && !k.startsWith('_')) {
      cleanColors[k] = v;
    }
  }

  const bg = cleanColors.background || defaultColors.background!;
  const buttons = cleanColors.buttons || defaultColors.buttons!;

  // Derive a full palette from the user's bg + buttons
  const derived = deriveFromBackground(bg, buttons);

  // User-set values override derived values
  return { ...derived, ...cleanColors };
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
