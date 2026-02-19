/**
 * Free-Form Editor State Hook
 * Manages elements with absolute positioning for Canva-style editing
 * Supports breakpoint-specific layouts (desktop, tablet, mobile)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Type Interfaces
// ---------------------------------------------------------------------------

export interface ElementBreakpoint {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditorElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  visible: boolean;
  deletable: boolean;
  properties: Record<string, unknown>;
  breakpoints: Record<string, ElementBreakpoint>;
  sectionId?: string;
}

export interface Section {
  id: string;
  type: string;
  height: number;
  properties: Record<string, unknown>;
  elements?: string[];
  locked: boolean;
}

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  keyframes: string;
  defaultDuration: number;
  iterationCount?: number | 'infinite';
}

export interface FontOption {
  value: string;
  label: string;
  category: string;
  webSafe?: boolean;
}

export interface PageTransition {
  id: string;
  name: string;
  description: string;
}

export interface AnimationSpeed {
  value: number;
  label: string;
}

export interface ElementSize {
  width: number;
  height: number;
}

export interface AnimationConfig {
  type?: string;
  speed?: number;
  delay?: number;
}

export interface AnimationCSS {
  animationName?: string;
  animationDuration?: string;
  animationDelay?: string;
  animationIterationCount?: number | string;
  animationTimingFunction?: string;
  animationFillMode?: string;
}

export interface SectionPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface FreeFormEditorOptions {
  viewportWidth?: number;
  viewportMode?: ViewportMode;
}

export interface FreeFormEditorReturn {
  elements: EditorElement[];
  rawElements: EditorElement[];
  selectedIds: Set<string>;
  selectedElement: EditorElement | null;
  selectedElements: EditorElement[];
  canUndo: boolean;
  canRedo: boolean;

  addElement: (
    type: string,
    x: number,
    y: number,
    vpMode?: ViewportMode,
    vpWidth?: number,
    canvasHt?: number,
    options?: Record<string, unknown>,
  ) => string;
  setPageElements: (newElements: EditorElement[]) => void;
  updatePosition: (id: string, x: number, y: number, vpMode?: ViewportMode) => void;
  commitPositionChange: () => void;
  updateSize: (
    id: string,
    width: number,
    height: number,
    scaleFont?: boolean,
    vpMode?: ViewportMode,
  ) => void;
  commitSizeChange: () => void;
  updateProperties: (id: string, updates: Record<string, unknown>) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  deleteElements: (ids: Set<string> | string) => void;
  duplicateElements: (ids: Set<string> | string) => void;
  selectElement: (id: string, addToSelection?: boolean) => void;
  clearSelection: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  toggleLock: (id: string) => void;
  generateBreakpointPositions: (targetMode: ViewportMode, targetWidth: number) => void;
  undo: () => void;
  redo: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_HISTORY = 50;

// Viewport breakpoint widths
export const BREAKPOINTS: Record<ViewportMode, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 375,
};


/**
 * Animation Presets for Elements
 */
export const ELEMENT_ANIMATIONS: AnimationPreset[] = [
  {
    id: 'fadeIn',
    name: 'Fade In',
    description: 'Opacity 0 to 1',
    category: 'Entrance',
    keyframes: `
      0% { opacity: 0; }
      100% { opacity: 1; }
    `,
    defaultDuration: 0.5,
  },
  {
    id: 'slideInLeft',
    name: 'Slide In Left',
    description: 'Enter from the left',
    category: 'Entrance',
    keyframes: `
      0% { opacity: 0; transform: translateX(-50px); }
      100% { opacity: 1; transform: translateX(0); }
    `,
    defaultDuration: 0.5,
  },
  {
    id: 'slideInRight',
    name: 'Slide In Right',
    description: 'Enter from the right',
    category: 'Entrance',
    keyframes: `
      0% { opacity: 0; transform: translateX(50px); }
      100% { opacity: 1; transform: translateX(0); }
    `,
    defaultDuration: 0.5,
  },
  {
    id: 'slideInUp',
    name: 'Slide In Up',
    description: 'Enter from below',
    category: 'Entrance',
    keyframes: `
      0% { opacity: 0; transform: translateY(50px); }
      100% { opacity: 1; transform: translateY(0); }
    `,
    defaultDuration: 0.5,
  },
  {
    id: 'slideInDown',
    name: 'Slide In Down',
    description: 'Enter from above',
    category: 'Entrance',
    keyframes: `
      0% { opacity: 0; transform: translateY(-50px); }
      100% { opacity: 1; transform: translateY(0); }
    `,
    defaultDuration: 0.5,
  },
  {
    id: 'bounce',
    name: 'Bounce',
    description: 'Spring scale effect',
    category: 'Attention',
    keyframes: `
      0% { opacity: 0; transform: scale(0.3); }
      50% { opacity: 1; transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); }
    `,
    defaultDuration: 0.6,
  },
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Subtle scale oscillation',
    category: 'Attention',
    keyframes: `
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    `,
    defaultDuration: 1,
    iterationCount: 'infinite',
  },
  {
    id: 'wiggle',
    name: 'Wiggle',
    description: 'Rotation oscillation',
    category: 'Attention',
    keyframes: `
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-5deg); }
      75% { transform: rotate(5deg); }
    `,
    defaultDuration: 0.5,
    iterationCount: 3,
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'Scale from 0 to 1.1 to 1',
    category: 'Entrance',
    keyframes: `
      0% { opacity: 0; transform: scale(0); }
      70% { opacity: 1; transform: scale(1.1); }
      100% { transform: scale(1); }
    `,
    defaultDuration: 0.4,
  },
  {
    id: 'rotateIn',
    name: 'Rotate In',
    description: 'Rotation with fade',
    category: 'Entrance',
    keyframes: `
      0% { opacity: 0; transform: rotate(-180deg) scale(0.5); }
      100% { opacity: 1; transform: rotate(0deg) scale(1); }
    `,
    defaultDuration: 0.6,
  },
  {
    id: 'glow',
    name: 'Neon Glow',
    description: 'Animated box-shadow glow',
    category: 'Attention',
    keyframes: `
      0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.5); }
    `,
    defaultDuration: 1.5,
    iterationCount: 'infinite',
  },
  {
    id: 'zoomIn',
    name: 'Zoom In',
    description: 'Scale up entrance',
    category: 'Entrance',
    keyframes: `
      0% { opacity: 0; transform: scale(0.5); }
      100% { opacity: 1; transform: scale(1); }
    `,
    defaultDuration: 0.4,
  },
  {
    id: 'flip',
    name: 'Flip',
    description: '3D flip entrance',
    category: 'Entrance',
    keyframes: `
      0% { opacity: 0; transform: perspective(400px) rotateY(90deg); }
      40% { transform: perspective(400px) rotateY(-10deg); }
      70% { transform: perspective(400px) rotateY(10deg); }
      100% { opacity: 1; transform: perspective(400px) rotateY(0); }
    `,
    defaultDuration: 0.6,
  },
  {
    id: 'shake',
    name: 'Shake',
    description: 'Horizontal shake',
    category: 'Attention',
    keyframes: `
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    `,
    defaultDuration: 0.6,
    iterationCount: 1,
  },
  {
    id: 'float',
    name: 'Float',
    description: 'Gentle floating motion',
    category: 'Attention',
    keyframes: `
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    `,
    defaultDuration: 2,
    iterationCount: 'infinite',
  },
];

/**
 * Page Transition Animations
 */
export const PAGE_TRANSITIONS: PageTransition[] = [
  { id: 'none', name: 'None', description: 'Instant transition' },
  { id: 'fade', name: 'Fade', description: 'Cross-fade between pages' },
  { id: 'slideLeft', name: 'Slide Left', description: 'Slide in from right' },
  { id: 'slideRight', name: 'Slide Right', description: 'Slide in from left' },
  { id: 'slideUp', name: 'Slide Up', description: 'Slide in from bottom' },
  { id: 'slideDown', name: 'Slide Down', description: 'Slide in from top' },
];

/**
 * Animation speed multipliers
 */
export const ANIMATION_SPEEDS: AnimationSpeed[] = [
  { value: 0.5, label: '0.5x (Slow)' },
  { value: 1, label: '1x (Normal)' },
  { value: 1.5, label: '1.5x (Fast)' },
  { value: 2, label: '2x (Very Fast)' },
];

/**
 * Get animation by ID
 */
export function getAnimationById(id: string): AnimationPreset | null {
  return ELEMENT_ANIMATIONS.find(a => a.id === id) || null;
}

/**
 * Generate CSS animation string for an element
 */
export function generateAnimationCSS(animation: AnimationConfig | null | undefined): AnimationCSS {
  if (!animation || !animation.type) return {};

  const preset = getAnimationById(animation.type);
  if (!preset) return {};

  const duration = (preset.defaultDuration / (animation.speed || 1)).toFixed(2);
  const delay = animation.delay || 0;
  const iterationCount = preset.iterationCount || 1;

  return {
    animationName: `rp-${animation.type}`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    animationIterationCount: iterationCount,
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  };
}

/**
 * Font Library - 50 fonts for typography
 */
export const FONT_LIBRARY: FontOption[] = [
  // Web-safe fonts (10)
  { value: 'Arial', label: 'Arial', category: 'Sans Serif', webSafe: true },
  { value: 'Helvetica', label: 'Helvetica', category: 'Sans Serif', webSafe: true },
  { value: 'Verdana', label: 'Verdana', category: 'Sans Serif', webSafe: true },
  { value: 'Tahoma', label: 'Tahoma', category: 'Sans Serif', webSafe: true },
  { value: 'Trebuchet MS', label: 'Trebuchet MS', category: 'Sans Serif', webSafe: true },
  { value: 'Georgia', label: 'Georgia', category: 'Serif', webSafe: true },
  { value: 'Times New Roman', label: 'Times New Roman', category: 'Serif', webSafe: true },
  { value: 'Palatino Linotype', label: 'Palatino', category: 'Serif', webSafe: true },
  { value: 'Courier New', label: 'Courier New', category: 'Monospace', webSafe: true },
  { value: 'Lucida Console', label: 'Lucida Console', category: 'Monospace', webSafe: true },
  // Google Fonts - Sans Serif (20)
  { value: 'Inter', label: 'Inter', category: 'Sans Serif' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans Serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Sans Serif' },
  { value: 'Lato', label: 'Lato', category: 'Sans Serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans Serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans Serif' },
  { value: 'Nunito', label: 'Nunito', category: 'Sans Serif' },
  { value: 'Raleway', label: 'Raleway', category: 'Sans Serif' },
  { value: 'Work Sans', label: 'Work Sans', category: 'Sans Serif' },
  { value: 'Outfit', label: 'Outfit', category: 'Sans Serif' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Sans Serif' },
  { value: 'Manrope', label: 'Manrope', category: 'Sans Serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Sans Serif' },
  { value: 'Sora', label: 'Sora', category: 'Sans Serif' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Sans Serif' },
  { value: 'Barlow', label: 'Barlow', category: 'Sans Serif' },
  { value: 'Lexend', label: 'Lexend', category: 'Sans Serif' },
  { value: 'Quicksand', label: 'Quicksand', category: 'Sans Serif' },
  { value: 'Karla', label: 'Karla', category: 'Sans Serif' },
  { value: 'Figtree', label: 'Figtree', category: 'Sans Serif' },
  // Google Fonts - Serif (10)
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'Lora', label: 'Lora', category: 'Serif' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', category: 'Serif' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond', category: 'Serif' },
  { value: 'Crimson Text', label: 'Crimson Text', category: 'Serif' },
  { value: 'EB Garamond', label: 'EB Garamond', category: 'Serif' },
  { value: 'Bitter', label: 'Bitter', category: 'Serif' },
  { value: 'Spectral', label: 'Spectral', category: 'Serif' },
  { value: 'DM Serif Display', label: 'DM Serif Display', category: 'Serif' },
  // Google Fonts - Monospace (6)
  { value: 'Fira Code', label: 'Fira Code', category: 'Monospace' },
  { value: 'Source Code Pro', label: 'Source Code Pro', category: 'Monospace' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono', category: 'Monospace' },
  { value: 'Roboto Mono', label: 'Roboto Mono', category: 'Monospace' },
  { value: 'Space Mono', label: 'Space Mono', category: 'Monospace' },
  // Display/Decorative (4)
  { value: 'Bebas Neue', label: 'Bebas Neue', category: 'Display' },
  { value: 'Oswald', label: 'Oswald', category: 'Display' },
  { value: 'Anton', label: 'Anton', category: 'Display' },
  { value: 'Archivo Black', label: 'Archivo Black', category: 'Display' },
];

/**
 * Load Google Font dynamically
 */
export function loadGoogleFont(fontFamily: string): void {
  const font = FONT_LIBRARY.find(f => f.value === fontFamily);
  if (!font || font.webSafe) return; // Skip web-safe fonts

  const formattedFont = fontFamily.replace(/ /g, '+');
  const linkId = `google-font-${fontFamily.replace(/ /g, '-').toLowerCase()}`;

  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Generate unique ID
 */
function generateId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique section ID
 */
function generateSectionId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Section Types & Defaults
// ---------------------------------------------------------------------------

/**
 * Section Types
 * Sections are full-width, vertically stacking containers
 */
export const SECTION_TYPES = {
  BLANK: 'blank',
  BOOKING_WIDGET: 'bookingWidget',
  GALLERY_WIDGET: 'galleryWidget',
  PRODUCT_GRID: 'productGrid',
  REVIEW_CAROUSEL: 'reviewCarousel',
} as const;

/**
 * Section type labels for UI
 */
export const SECTION_LABELS: Record<string, string> = {
  blank: 'Blank Section',
  bookingWidget: 'Booking Calendar',
  galleryWidget: 'Photo Gallery',
  productGrid: 'Services / Products',
  reviewCarousel: 'Reviews',
};


/**
 * Default heights for each section type
 */
export const SECTION_DEFAULT_HEIGHTS: Record<string, number> = {
  blank: 400,
  bookingWidget: 500,
  galleryWidget: 500,
  productGrid: 450,
  reviewCarousel: 400,
};

/**
 * Default section properties by type
 */
export const DEFAULT_SECTION_PROPS: Record<string, Record<string, unknown>> = {
  blank: {
    backgroundColor: 'transparent',
    padding: { top: 40, right: 40, bottom: 40, left: 40 } as SectionPadding,
  },
  bookingWidget: {
    backgroundColor: 'transparent',
    heading: 'Book an Appointment',
    buttonText: 'Book Now',
    accentColor: '#3B82F6',
  },
  galleryWidget: {
    backgroundColor: 'transparent',
    heading: 'Our Gallery',
    viewMode: 'gallery',
    layout: 'masonry',
    columns: 3,
    showCaptions: true,
    lightbox: true,
    maxPhotos: 9,
    accentColor: '#1A1A1A',
  },
  productGrid: {
    backgroundColor: 'transparent',
    heading: 'Our Services',
    columns: 3,
    showPrice: true,
    accentColor: '#1A1A1A',
  },
  reviewCarousel: {
    backgroundColor: 'transparent',
    heading: 'What Our Clients Say',
    autoPlay: true,
    accentColor: '#1A1A1A',
  },
};

/**
 * Create a new section
 */
export function createSection(
  type: string,
  options: { height?: number; properties?: Record<string, unknown>; locked?: boolean } = {},
): Section {
  const defaultProps = DEFAULT_SECTION_PROPS[type] || {};
  const height = options.height || SECTION_DEFAULT_HEIGHTS[type] || 400;

  return {
    id: generateSectionId(),
    type,
    height,
    properties: { ...defaultProps, ...options.properties },
    // Only blank sections can contain elements
    elements: type === 'blank' ? [] : undefined,
    locked: options.locked || false,
  };
}

// ---------------------------------------------------------------------------
// Default Element Properties
// ---------------------------------------------------------------------------

/**
 * Default element properties by type
 */
const DEFAULT_ELEMENT_PROPS: Record<string, Record<string, unknown>> = {
  heading: {
    content: 'New Heading',
    fontSize: 48,
    fontWeight: 700,
    fontFamily: 'Inter',
    color: '#1A1A1A',
    textAlign: 'left',
    lineHeight: 1.2,
    letterSpacing: 0,
    // Advanced text features
    textTransform: 'none',
    highlightColor: 'transparent',
    textOutline: false,
    textOutlineColor: '#000000',
    textOutlineWidth: 1,
    textShadow: false,
    textShadowColor: '#000000',
    textShadowX: 2,
    textShadowY: 2,
    textShadowBlur: 4,
    gradientText: false,
    gradientStart: '#3B82F6',
    gradientEnd: '#f97316',
    curvedText: 0,
  },
  text: {
    content: 'Click to edit text',
    fontSize: 16,
    fontWeight: 400,
    fontFamily: 'Inter',
    color: '#6B7280',
    textAlign: 'left',
    lineHeight: 1.5,
    letterSpacing: 0,
    // Advanced text features
    textTransform: 'none',
    highlightColor: 'transparent',
    textOutline: false,
    textOutlineColor: '#000000',
    textOutlineWidth: 1,
    textShadow: false,
    textShadowColor: '#000000',
    textShadowX: 2,
    textShadowY: 2,
    textShadowBlur: 4,
    gradientText: false,
    gradientStart: '#3B82F6',
    gradientEnd: '#f97316',
    curvedText: 0,
  },
  subheading: {
    content: 'Subheading',
    fontSize: 24,
    fontWeight: 600,
    fontFamily: 'Inter',
    color: '#374151',
    textAlign: 'left',
    lineHeight: 1.3,
    letterSpacing: 0,
    textTransform: 'none',
    highlightColor: 'transparent',
    textOutline: false,
    textOutlineColor: '#000000',
    textOutlineWidth: 1,
    textShadow: false,
    textShadowColor: '#000000',
    textShadowX: 2,
    textShadowY: 2,
    textShadowBlur: 4,
    gradientText: false,
    gradientStart: '#3B82F6',
    gradientEnd: '#f97316',
    curvedText: 0,
  },
  caption: {
    content: 'Caption text',
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Inter',
    color: '#9CA3AF',
    textAlign: 'left',
    lineHeight: 1.4,
    letterSpacing: 0.5,
    textTransform: 'none',
    highlightColor: 'transparent',
    textOutline: false,
    textOutlineColor: '#000000',
    textOutlineWidth: 1,
    textShadow: false,
    textShadowColor: '#000000',
    textShadowX: 2,
    textShadowY: 2,
    textShadowBlur: 4,
    gradientText: false,
    gradientStart: '#3B82F6',
    gradientEnd: '#f97316',
    curvedText: 0,
  },
  quote: {
    content: '"Your inspirational quote goes here"',
    fontSize: 20,
    fontWeight: 400,
    fontFamily: 'Playfair Display',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 1.6,
    letterSpacing: 0,
    fontStyle: 'italic',
    textTransform: 'none',
    highlightColor: 'transparent',
    textOutline: false,
    textOutlineColor: '#000000',
    textOutlineWidth: 1,
    textShadow: false,
    textShadowColor: '#000000',
    textShadowX: 2,
    textShadowY: 2,
    textShadowBlur: 4,
    gradientText: false,
    gradientStart: '#3B82F6',
    gradientEnd: '#f97316',
    curvedText: 0,
    showQuoteIcon: true,
    quoteIconColor: '#3B82F6',
  },
  button: {
    content: 'Click Me',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: 'Inter',
    backgroundColor: '#3B82F6',
    color: '#ffffff',
    borderRadius: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingX: 24,
    paddingY: 12,
  },
  image: {
    src: '',
    alt: 'Image',
    objectFit: 'cover',
    objectPosition: 'center',
    shape: 'rectangle',
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderRadius: 0,
    opacity: 100,
    // Shadow
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 12,
    // Filters
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: false,
    sepia: false,
    // Transform
    flipHorizontal: false,
    flipVertical: false,
    // Crop data (stored as percentages)
    cropX: 0,
    cropY: 0,
    cropWidth: 100,
    cropHeight: 100,
  },
  // Frame Elements - shape masks for images
  frame: {
    frameType: 'circle',
    imageSrc: '',
    imageAlt: 'Frame image',
    objectFit: 'cover',
    borderColor: '#D1D5DB',
    borderWidth: 0,
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 12,
  },
  // Grid Elements - layout containers for multiple images
  grid: {
    gridType: '2-up',
    gap: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    cells: [],
  },
  divider: {
    color: '#D1D5DB',
    thickness: 1,
    style: 'solid',
  },
  spacer: {
    height: 40,
  },
  // Form Elements
  contactForm: {
    formTitle: 'Get In Touch',
    fields: [
      { id: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: true },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
      { id: 'message', type: 'textarea', label: 'Message', placeholder: 'How can we help?', required: true },
    ],
    submitButtonText: 'Send Message',
    successMessage: 'Thank you! We\'ll get back to you soon.',
    // Styling
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Input styling
    inputBackgroundColor: '#f5f5f5',
    inputBorderColor: '#D1D5DB',
    inputTextColor: '#1A1A1A',
    inputPlaceholderColor: '#9CA3AF',
    // Label styling
    labelColor: '#1A1A1A',
    // Button styling
    buttonBackgroundColor: '#3B82F6',
    buttonTextColor: '#ffffff',
    buttonBorderRadius: 8,
    // Font
    fontFamily: 'Inter',
  },
  customForm: {
    formTitle: 'Custom Form',
    fields: [],
    submitButtonText: 'Submit',
    successMessage: 'Form submitted successfully!',
    // Styling
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Input styling
    inputBackgroundColor: '#f5f5f5',
    inputBorderColor: '#D1D5DB',
    inputTextColor: '#1A1A1A',
    inputPlaceholderColor: '#9CA3AF',
    // Label styling
    labelColor: '#1A1A1A',
    // Button styling
    buttonBackgroundColor: '#3B82F6',
    buttonTextColor: '#ffffff',
    buttonBorderRadius: 8,
    // Font
    fontFamily: 'Inter',
  },
};

// ---------------------------------------------------------------------------
// Base Element Sizes
// ---------------------------------------------------------------------------

/**
 * Base element sizes for desktop viewport (1200px)
 */
export const BASE_ELEMENT_SIZES: Record<string, ElementSize> = {
  heading: { width: 400, height: 60 },
  subheading: { width: 350, height: 40 },
  text: { width: 300, height: 100 },
  caption: { width: 250, height: 30 },
  quote: { width: 400, height: 120 },
  button: { width: 160, height: 48 },
  image: { width: 300, height: 200 },
  // Frame & Grid Elements
  frame: { width: 200, height: 200 },
  grid: { width: 400, height: 300 },
  divider: { width: 400, height: 20 },
  spacer: { width: 100, height: 40 },
  // Form Elements
  contactForm: { width: 400, height: 420 },
  customForm: { width: 400, height: 300 },
};


// ---------------------------------------------------------------------------
// Position & Layout Helpers
// ---------------------------------------------------------------------------

/**
 * Get element position for a specific breakpoint
 */
export function getElementPosition(
  element: EditorElement,
  viewportMode: ViewportMode = 'desktop',
): ElementBreakpoint {
  // If breakpoint data exists, use it
  if (element.breakpoints && element.breakpoints[viewportMode]) {
    return element.breakpoints[viewportMode];
  }
  // Otherwise use base (desktop) position
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
}

/**
 * Generate responsive positions for an element when switching to a new viewport
 */
function generateBreakpointPosition(
  element: EditorElement,
  targetMode: ViewportMode,
  targetWidth: number,
  elements: EditorElement[],
  sortedIndex: number,
  sortedIndices: number[] | null = null,
): ElementBreakpoint {
  const baseSize = BASE_ELEMENT_SIZES[element.type] || { width: 200, height: 100 };
  const padding = 20;

  if (targetMode === 'mobile') {
    // Mobile: Stack vertically, center horizontally, scale down if needed
    const maxWidth = Math.min(baseSize.width, targetWidth - (padding * 2));
    const centerX = (targetWidth - maxWidth) / 2;

    // Calculate Y based on stacking previous elements IN SORTED ORDER
    let stackedY = padding;
    if (sortedIndices) {
      // Use sorted order for stacking calculation
      for (let i = 0; i < sortedIndex; i++) {
        const originalIndex = sortedIndices[i];
        const prevEl = elements[originalIndex];
        const prevPos = prevEl.breakpoints?.mobile || { height: prevEl.height };
        stackedY += prevPos.height + padding;
      }
    } else {
      // Fallback to original array order
      for (let i = 0; i < sortedIndex; i++) {
        const prevEl = elements[i];
        const prevPos = prevEl.breakpoints?.mobile || { height: prevEl.height };
        stackedY += prevPos.height + padding;
      }
    }

    const height = element.height;

    return {
      x: Math.max(padding, centerX),
      y: stackedY,
      width: maxWidth,
      height,
    };
  }

  if (targetMode === 'tablet') {
    // Tablet: Scale down width proportionally, keep relative positions
    const scaleFactor = targetWidth / BREAKPOINTS.desktop;
    const scaledWidth = Math.min(element.width * scaleFactor, targetWidth - (padding * 2));
    const scaledX = Math.min(element.x * scaleFactor, targetWidth - scaledWidth - padding);

    return {
      x: Math.max(padding, scaledX),
      y: element.y,
      width: scaledWidth,
      height: element.height,
    };
  }

  // Desktop: Use original positions
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
}

// ---------------------------------------------------------------------------
// Element Factory
// ---------------------------------------------------------------------------

/**
 * Create a new element with breakpoint-aware sizing
 */
export function createElement(
  type: string,
  x: number = 100,
  y: number = 100,
  viewportMode: ViewportMode = 'desktop',
  viewportWidth: number = 1200,
  canvasHeight: number = 800,
  options: Record<string, unknown> = {},
): EditorElement {
  const baseSize = BASE_ELEMENT_SIZES[type] || { width: 200, height: 100 };
  const padding = 20;

  // Auto-scale if element is too tall for canvas
  let scaledWidth = baseSize.width;
  let scaledHeight = baseSize.height;
  const maxHeight = canvasHeight - (padding * 2);

  if (baseSize.height > maxHeight) {
    const scaleFactor = maxHeight / baseSize.height;
    scaledHeight = Math.floor(baseSize.height * scaleFactor);
    scaledWidth = Math.floor(baseSize.width * scaleFactor);
  }

  // Also scale width if too wide for viewport
  const maxWidth = viewportWidth - (padding * 2);
  if (scaledWidth > maxWidth) {
    const widthScaleFactor = maxWidth / scaledWidth;
    scaledWidth = Math.floor(scaledWidth * widthScaleFactor);
    scaledHeight = Math.floor(scaledHeight * widthScaleFactor);
  }

  // For all modes, use the passed x,y (which should already be centered by the caller)
  // Just ensure they stay within bounds
  const finalWidth = scaledWidth;
  const finalHeight = scaledHeight;
  const finalX = Math.max(0, Math.min(x, viewportWidth - scaledWidth));
  const finalY = Math.max(0, Math.min(y, canvasHeight - scaledHeight));

  // Extract sectionId from options so it's a top-level property (not buried in properties)
  const { sectionId, ...restOptions } = options as { sectionId?: string; [key: string]: unknown };

  const element: EditorElement = {
    id: generateId(),
    type,
    // Base (desktop) position - always use the calculated values
    x: finalX,
    y: finalY,
    width: finalWidth,
    height: finalHeight,
    rotation: 0,
    locked: false,
    visible: true,
    deletable: true,
    sectionId,
    properties: { ...(DEFAULT_ELEMENT_PROPS[type] || {}), ...restOptions },
    // Store breakpoint-specific positions - ALWAYS include current viewport
    breakpoints: {
      [viewportMode]: {
        x: finalX,
        y: finalY,
        width: finalWidth,
        height: finalHeight,
      },
    },
  };

  return element;
}

// ---------------------------------------------------------------------------
// Deep Clone
// ---------------------------------------------------------------------------

/**
 * Deep clone elements array with breakpoints
 */
function cloneElements(elements: EditorElement[]): EditorElement[] {
  return elements.map(el => ({
    ...el,
    properties: { ...el.properties },
    breakpoints: el.breakpoints ? { ...el.breakpoints } : {},
  }));
}

// ---------------------------------------------------------------------------
// Main Hook
// ---------------------------------------------------------------------------

/**
 * Free-form editor hook with breakpoint support
 */
export function useFreeFormEditor(
  initialElements: EditorElement[] = [],
  options: FreeFormEditorOptions = {},
): FreeFormEditorReturn {
  const { viewportWidth = 1200, viewportMode = 'desktop' } = options;

  const [elements, setElements] = useState<EditorElement[]>(initialElements);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<EditorElement[][]>([initialElements]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Use ref to track historyIndex to avoid stale closures
  const historyIndexRef = useRef<number>(historyIndex);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // Use refs to track current viewport settings to avoid stale closures
  const viewportModeRef = useRef<ViewportMode>(viewportMode);
  const viewportWidthRef = useRef<number>(viewportWidth);
  useEffect(() => {
    viewportModeRef.current = viewportMode;
    viewportWidthRef.current = viewportWidth;
  }, [viewportMode, viewportWidth]);

  // Push to history
  const pushHistory = useCallback((newElements: EditorElement[]) => {
    const currentIndex = historyIndexRef.current;
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(cloneElements(newElements));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, []);

  // Add element with viewport-aware sizing
  const addElement = useCallback((
    type: string,
    x: number,
    y: number,
    vpMode?: ViewportMode,
    vpWidth?: number,
    canvasHt?: number,
    elementOptions: Record<string, unknown> = {},
  ): string => {
    const currentMode = vpMode || viewportModeRef.current;
    const currentWidth = vpWidth || viewportWidthRef.current;
    const currentCanvasHeight = canvasHt || 800;
    const newElement = createElement(type, x, y, currentMode, currentWidth, currentCanvasHeight, elementOptions);
    setElements(prev => {
      const newElements = [...prev, newElement];
      pushHistory(newElements);
      return newElements;
    });
    setSelectedIds(new Set([newElement.id]));
    return newElement.id;
  }, [pushHistory]);

  // Set elements directly (for page switching)
  const setPageElements = useCallback((newElements: EditorElement[]) => {
    setElements(newElements);
    setSelectedIds(new Set());
    setHistory([newElements]);
    setHistoryIndex(0);
  }, []);

  // Update element position for current breakpoint
  const updatePosition = useCallback((id: string, x: number, y: number, vpMode?: ViewportMode) => {
    const currentMode = vpMode || viewportModeRef.current;
    setElements(prev => {
      const newElements = prev.map(el => {
        if (el.id !== id) return el;

        // Get current breakpoint data or default to element dimensions
        const currentBp = el.breakpoints?.[currentMode] || { width: el.width, height: el.height };

        // Always update both base position (for desktop) AND breakpoint
        const updatedEl: EditorElement = {
          ...el,
          breakpoints: {
            ...el.breakpoints,
            [currentMode]: { ...currentBp, x, y },
          },
        };

        // Also update base x,y for desktop mode (backwards compatibility)
        if (currentMode === 'desktop') {
          updatedEl.x = x;
          updatedEl.y = y;
        }

        return updatedEl;
      });
      return newElements;
    });
  }, []);

  // Commit position change to history
  const commitPositionChange = useCallback(() => {
    setElements(current => {
      pushHistory(current);
      return current;
    });
  }, [pushHistory]);

  // Update element size for current breakpoint (with optional font scaling)
  const updateSize = useCallback((
    id: string,
    width: number,
    height: number,
    scaleFont: boolean = false,
    vpMode?: ViewportMode,
  ) => {
    const currentMode = vpMode || viewportModeRef.current;
    setElements(prev => {
      const newElements = prev.map(el => {
        if (el.id !== id) return el;

        // Get current breakpoint data or default to element position
        const currentBp = el.breakpoints?.[currentMode] || { x: el.x, y: el.y };

        // Always update breakpoint
        let updatedEl: EditorElement = {
          ...el,
          breakpoints: {
            ...el.breakpoints,
            [currentMode]: { ...currentBp, width, height },
          },
        };

        // Also update base width,height for desktop mode (backwards compatibility)
        if (currentMode === 'desktop') {
          updatedEl.width = width;
          updatedEl.height = height;
        }

        // Auto-scale font for text elements if enabled
        if (scaleFont && (el.type === 'heading' || el.type === 'text' || el.type === 'button')) {
          const currentWidth = el.breakpoints?.[currentMode]?.width || el.width;
          const widthRatio = width / currentWidth;

          const currentFontSize = el.properties.fontSize as number | undefined;
          if (currentFontSize) {
            const newFontSize = Math.round(currentFontSize * widthRatio);
            const clampedFontSize = Math.max(8, Math.min(200, newFontSize));
            updatedEl = {
              ...updatedEl,
              properties: {
                ...updatedEl.properties,
                fontSize: clampedFontSize,
              },
            };
          }
        }

        return updatedEl;
      });
      return newElements;
    });
  }, []);

  // Commit size change to history
  const commitSizeChange = useCallback(() => {
    setElements(current => {
      pushHistory(current);
      return current;
    });
  }, [pushHistory]);

  // Update element properties
  const updateProperties = useCallback((id: string, updates: Record<string, unknown>) => {
    setElements(prev => {
      const newElements = prev.map(el =>
        el.id === id
          ? { ...el, properties: { ...el.properties, ...updates } }
          : el
      );
      pushHistory(newElements);
      return newElements;
    });
  }, [pushHistory]);

  // Update element directly (for layout changes)
  const updateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
    setElements(prev => {
      const newElements = prev.map(el =>
        el.id === id ? { ...el, ...updates } : el
      );
      pushHistory(newElements);
      return newElements;
    });
  }, [pushHistory]);

  // Delete element(s)
  const deleteElements = useCallback((ids: Set<string> | string) => {
    const idsSet = ids instanceof Set ? ids : new Set([ids]);
    setElements(prev => {
      const newElements = prev.filter(el => {
        if (idsSet.has(el.id)) {
          return el.deletable === false;
        }
        return true;
      });
      pushHistory(newElements);
      return newElements;
    });
    setSelectedIds(new Set());
  }, [pushHistory]);

  // Duplicate element(s)
  const duplicateElements = useCallback((ids: Set<string> | string) => {
    const idsSet = ids instanceof Set ? ids : new Set([ids]);
    setElements(prev => {
      const toDuplicate = prev.filter(el => idsSet.has(el.id) && el.deletable !== false);
      const duplicated = toDuplicate.map(el => ({
        ...el,
        id: generateId(),
        x: el.x + 20,
        y: el.y + 20,
        deletable: true,
        properties: { ...el.properties },
        breakpoints: el.breakpoints ? { ...el.breakpoints } : {},
      }));
      const newElements = [...prev, ...duplicated];
      pushHistory(newElements);
      setSelectedIds(new Set(duplicated.map(el => el.id)));
      return newElements;
    });
  }, [pushHistory]);

  // Select element
  const selectElement = useCallback((id: string, addToSelection: boolean = false) => {
    setSelectedIds(prev => {
      if (addToSelection) {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }
      return new Set([id]);
    });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bring to front
  const bringToFront = useCallback((id: string) => {
    setElements(prev => {
      const element = prev.find(el => el.id === id);
      if (!element) return prev;
      const newElements = [...prev.filter(el => el.id !== id), element];
      pushHistory(newElements);
      return newElements;
    });
  }, [pushHistory]);

  // Send to back
  const sendToBack = useCallback((id: string) => {
    setElements(prev => {
      const element = prev.find(el => el.id === id);
      if (!element) return prev;
      const newElements = [element, ...prev.filter(el => el.id !== id)];
      pushHistory(newElements);
      return newElements;
    });
  }, [pushHistory]);

  // Toggle lock on element
  const toggleLock = useCallback((id: string) => {
    setElements(prev => {
      const newElements = prev.map(el =>
        el.id === id ? { ...el, locked: !el.locked } : el
      );
      pushHistory(newElements);
      return newElements;
    });
  }, [pushHistory]);

  // Generate breakpoint positions for all elements (called when switching viewports)
  const generateBreakpointPositions = useCallback((targetMode: ViewportMode, targetWidth: number) => {
    // Desktop always uses base x/y/width/height - no breakpoint data needed
    if (targetMode === 'desktop') return;

    setElements(prev => {
      // For mobile, sort elements by desktop position (Y first, then X)
      // This creates natural reading order: top-to-bottom, left-to-right
      let sortedIndices: number[] | null = null;
      let sortedPositionMap: Map<number, number> | null = null;

      if (targetMode === 'mobile') {
        const ROW_THRESHOLD = 50; // Elements within 50px are considered same row

        // Create array of {index, x, y} and sort by position
        sortedIndices = prev
          .map((el, index) => ({ index, x: el.x, y: el.y }))
          .sort((a, b) => {
            const yDiff = a.y - b.y;
            // If within threshold, consider same row - sort by X
            if (Math.abs(yDiff) <= ROW_THRESHOLD) {
              return a.x - b.x;
            }
            // Different rows - sort by Y
            return yDiff;
          })
          .map(item => item.index);

        // Create reverse mapping: original index -> sorted position
        sortedPositionMap = new Map();
        sortedIndices.forEach((originalIndex, sortedPosition) => {
          sortedPositionMap!.set(originalIndex, sortedPosition);
        });
      }

      const newElements = prev.map((el, index) => {
        // Skip if breakpoint already exists
        if (el.breakpoints?.[targetMode]) {
          return el;
        }

        // Get sorted position for mobile stacking
        const sortedIndex = targetMode === 'mobile' && sortedPositionMap
          ? sortedPositionMap.get(index) ?? index
          : index;

        // Generate new breakpoint position using sorted order for mobile
        const newPos = generateBreakpointPosition(
          el,
          targetMode,
          targetWidth,
          prev,
          sortedIndex,
          sortedIndices,
        );

        return {
          ...el,
          breakpoints: {
            ...el.breakpoints,
            [targetMode]: newPos,
          },
        };
      });

      // Don't push to history - this is just viewport switching
      return newElements;
    });
  }, []);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(cloneElements(history[newIndex]));
    }
  }, [historyIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(cloneElements(history[newIndex]));
    }
  }, [historyIndex, history]);

  // Get elements with current breakpoint positions applied
  const elementsForViewport = useMemo(() => {
    return elements.map(el => {
      const pos = getElementPosition(el, viewportMode);
      return {
        ...el,
        // Override base positions with breakpoint-specific ones for rendering
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
      };
    });
  }, [elements, viewportMode]);

  // Selected elements data
  const selectedElements = useMemo(() => {
    return elementsForViewport.filter(el => selectedIds.has(el.id));
  }, [elementsForViewport, selectedIds]);

  // First selected element (for properties panel)
  const selectedElement = selectedElements[0] || null;

  return {
    elements: elementsForViewport,
    rawElements: elements, // Original elements with all breakpoint data
    selectedIds,
    selectedElement,
    selectedElements,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    addElement,
    setPageElements,
    updatePosition,
    commitPositionChange,
    updateSize,
    commitSizeChange,
    updateProperties,
    updateElement,
    deleteElements,
    duplicateElements,
    selectElement,
    clearSelection,
    bringToFront,
    sendToBack,
    toggleLock,
    generateBreakpointPositions,
    undo,
    redo,
  };
}

export default useFreeFormEditor;
