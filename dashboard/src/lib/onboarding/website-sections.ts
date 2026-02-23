/**
 * Website section templates -- maps business types to pre-built website layouts.
 *
 * Generates FreeFormSaveData format that the editor understands:
 * - Pages with sections (blank for content, widget types for features)
 * - Elements positioned within blank sections (heading, text, button, contactForm)
 * - Widget sections (bookingWidget, galleryWidget, productGrid, reviewCarousel)
 *   render themselves
 *
 * Each section type has multiple layout variants. A random variant is picked per
 * section at generation time, giving 432+ unique layout combinations.
 *
 * Ported from onboarding/templates/website_sections.py (759 lines).
 */

import type { EditorElement, Section } from '@/hooks/useFreeFormEditor';

// Re-export the FreeFormSaveData shape so callers don't need to import the editor
export interface FreeFormSaveData {
  format: 'freeform';
  version: 1;
  pages: PageData[];
  elements: EditorElement[];
  currentPageIndex: number;
}

export interface PageData {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
  headerConfig: Record<string, unknown>;
  footerConfig: Record<string, unknown>;
  canvasConfig: Record<string, unknown>;
}

// ============================================================
// Input types
// ============================================================

export interface WebsiteCopy {
  hero_headline?: string;
  hero_subheadline?: string;
  hero_cta?: string;
  about_title?: string;
  about_text?: string;
  features_title?: string;
  features?: string[];
  cta_headline?: string;
  cta_text?: string;
  cta_button?: string;
}

export interface WebsiteColors {
  sidebar_bg?: string;
  buttons?: string;
  background?: string;
  cards?: string;
  headings?: string;
  text?: string;
}

// ============================================================
// HELPERS
// ============================================================

const VIEWPORT_WIDTH = 1200;

let _counter = 0;

function uid(): string {
  // Lightweight unique-enough ID for element/section keys.
  // Uses a counter + random suffix to avoid collisions without crypto.
  _counter += 1;
  const rand = Math.random().toString(36).slice(2, 10);
  return `${_counter.toString(36)}${rand}`.slice(0, 8);
}

function element(
  type: string,
  sectionId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  props: Record<string, unknown>,
): EditorElement {
  return {
    id: `el_${uid()}`,
    type,
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    locked: false,
    visible: true,
    deletable: true,
    properties: props,
    breakpoints: {},
    sectionId,
  };
}

function section(
  type: string = 'blank',
  height: number = 600,
  props: Record<string, unknown> = {},
): Section {
  return {
    id: `sec_${uid()}`,
    type,
    height,
    properties: props,
    locked: false,
  };
}

/**
 * Split text roughly in half at a sentence boundary.
 */
function splitTextMidpoint(text: string): [string, string] {
  if (!text) return [text, ''];
  const mid = Math.floor(text.length / 2);
  const maxOffset = Math.min(mid, 80);
  for (let offset = 0; offset < maxOffset; offset++) {
    for (const pos of [mid + offset, mid - offset]) {
      if (pos > 0 && pos < text.length - 1 && text[pos] === '.') {
        return [text.slice(0, pos + 1).trim(), text.slice(pos + 1).trim()];
      }
    }
  }
  const space = text.lastIndexOf(' ', mid + 20);
  if (space > 0) {
    return [text.slice(0, space).trim(), text.slice(space).trim()];
  }
  return [text, ''];
}

// ============================================================
// Variant type — each variant returns a section + its elements
// ============================================================

type SectionVariant = (
  copy: WebsiteCopy,
  colors: WebsiteColors,
) => [Section, EditorElement[]];

/**
 * Pick a random item from an array.
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// HERO VARIANTS -- dark bg, 550px tall
// ============================================================

/** Classic centered hero -- heading, subtext, button all centered. */
function heroCentered(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const bg = colors.sidebar_bg ?? '#1A1A1A';
  const accent = colors.buttons ?? '#3B82F6';
  const sec = section('blank', 550, { backgroundColor: bg });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 150, 140, 900, 80, {
      content: copy.hero_headline ?? 'Welcome',
      fontSize: 56, fontWeight: 700, fontFamily: 'Inter',
      color: '#FFFFFF', textAlign: 'center',
    }),
    element('text', sid, 250, 240, 700, 60, {
      content: copy.hero_subheadline ?? 'Your business tagline here',
      fontSize: 18, fontWeight: 400, fontFamily: 'Inter',
      color: '#CBD5E1', textAlign: 'center',
    }),
    element('button', sid, 490, 340, 220, 52, {
      content: copy.hero_cta ?? 'Get Started',
      fontSize: 16, fontWeight: 600, fontFamily: 'Inter',
      backgroundColor: accent, color: '#FFFFFF',
      borderRadius: 8,
    }),
  ]];
}

/** Left-aligned hero -- everything hugs the left with 80px margin. */
function heroLeft(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const bg = colors.sidebar_bg ?? '#1A1A1A';
  const accent = colors.buttons ?? '#3B82F6';
  const sec = section('blank', 550, { backgroundColor: bg });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 80, 120, 700, 80, {
      content: copy.hero_headline ?? 'Welcome',
      fontSize: 56, fontWeight: 700, fontFamily: 'Inter',
      color: '#FFFFFF', textAlign: 'left',
    }),
    element('text', sid, 80, 220, 600, 60, {
      content: copy.hero_subheadline ?? 'Your business tagline here',
      fontSize: 18, fontWeight: 400, fontFamily: 'Inter',
      color: '#CBD5E1', textAlign: 'left',
    }),
    element('button', sid, 80, 320, 220, 52, {
      content: copy.hero_cta ?? 'Get Started',
      fontSize: 16, fontWeight: 600, fontFamily: 'Inter',
      backgroundColor: accent, color: '#FFFFFF',
      borderRadius: 8,
    }),
  ]];
}

/** Split hero -- heading+subtext on left, CTA button floated right. */
function heroSplit(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const bg = colors.sidebar_bg ?? '#1A1A1A';
  const accent = colors.buttons ?? '#3B82F6';
  const sec = section('blank', 550, { backgroundColor: bg });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 80, 140, 600, 100, {
      content: copy.hero_headline ?? 'Welcome',
      fontSize: 52, fontWeight: 700, fontFamily: 'Inter',
      color: '#FFFFFF', textAlign: 'left',
    }),
    element('text', sid, 80, 260, 500, 60, {
      content: copy.hero_subheadline ?? 'Your business tagline here',
      fontSize: 18, fontWeight: 400, fontFamily: 'Inter',
      color: '#CBD5E1', textAlign: 'left',
    }),
    element('button', sid, 750, 260, 240, 52, {
      content: copy.hero_cta ?? 'Get Started',
      fontSize: 16, fontWeight: 600, fontFamily: 'Inter',
      backgroundColor: accent, color: '#FFFFFF',
      borderRadius: 8,
    }),
  ]];
}

/** Bottom-heavy hero -- smaller heading at top, large subtext dominates, button bottom-left. */
function heroBottomHeavy(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const bg = colors.sidebar_bg ?? '#1A1A1A';
  const accent = colors.buttons ?? '#3B82F6';
  const sec = section('blank', 550, { backgroundColor: bg });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 150, 80, 900, 70, {
      content: copy.hero_headline ?? 'Welcome',
      fontSize: 44, fontWeight: 700, fontFamily: 'Inter',
      color: '#FFFFFF', textAlign: 'center',
    }),
    element('text', sid, 100, 200, 1000, 120, {
      content: copy.hero_subheadline ?? 'Your business tagline here',
      fontSize: 22, fontWeight: 400, fontFamily: 'Inter',
      color: '#CBD5E1', textAlign: 'center',
    }),
    element('button', sid, 80, 380, 250, 52, {
      content: copy.hero_cta ?? 'Get Started',
      fontSize: 16, fontWeight: 600, fontFamily: 'Inter',
      backgroundColor: accent, color: '#FFFFFF',
      borderRadius: 8,
    }),
  ]];
}

const HERO_VARIANTS: SectionVariant[] = [heroCentered, heroLeft, heroSplit, heroBottomHeavy];

// ============================================================
// ABOUT VARIANTS -- light bg
// ============================================================

/** Classic centered about -- heading and body centered. */
function aboutCentered(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 400, { backgroundColor: colors.background ?? '#F5F5F5' });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 150, 60, 900, 60, {
      content: copy.about_title ?? 'About Us',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'center',
    }),
    element('text', sid, 200, 150, 800, 120, {
      content: copy.about_text ?? 'Tell your story here.',
      fontSize: 16, fontWeight: 400, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'center',
      lineHeight: 1.7,
    }),
  ]];
}

/** Left-aligned about -- heading and body left with 80px margin. */
function aboutLeft(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 400, { backgroundColor: colors.background ?? '#F5F5F5' });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 80, 60, 700, 60, {
      content: copy.about_title ?? 'About Us',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'left',
    }),
    element('text', sid, 80, 150, 700, 150, {
      content: copy.about_text ?? 'Tell your story here.',
      fontSize: 16, fontWeight: 400, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'left',
      lineHeight: 1.7,
    }),
  ]];
}

/** Two-column about -- heading spans top, body split into two columns. */
function aboutTwoColumn(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 480, { backgroundColor: colors.background ?? '#F5F5F5' });
  const sid = sec.id;
  const text = copy.about_text ?? 'Tell your story here.';
  const [leftText, rightText] = splitTextMidpoint(text);
  const elements: EditorElement[] = [
    element('heading', sid, 80, 50, 1040, 60, {
      content: copy.about_title ?? 'About Us',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'left',
    }),
    element('text', sid, 80, 150, 500, 160, {
      content: leftText,
      fontSize: 16, fontWeight: 400, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'left',
      lineHeight: 1.7,
    }),
  ];
  if (rightText) {
    elements.push(element('text', sid, 620, 150, 500, 160, {
      content: rightText,
      fontSize: 16, fontWeight: 400, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'left',
      lineHeight: 1.7,
    }));
  }
  return [sec, elements];
}

/** Offset about -- short heading on left, indented body spanning wide. */
function aboutOffset(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 400, { backgroundColor: colors.background ?? '#F5F5F5' });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 80, 60, 400, 60, {
      content: copy.about_title ?? 'About Us',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'left',
    }),
    element('text', sid, 200, 160, 900, 140, {
      content: copy.about_text ?? 'Tell your story here.',
      fontSize: 16, fontWeight: 400, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'left',
      lineHeight: 1.7,
    }),
  ]];
}

const ABOUT_VARIANTS: SectionVariant[] = [aboutCentered, aboutLeft, aboutTwoColumn, aboutOffset];

// ============================================================
// FEATURES VARIANTS -- 3 features
// ============================================================

/** Classic 3-column -- features side by side. */
function features3col(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 450, { backgroundColor: colors.cards ?? '#FFFFFF' });
  const sid = sec.id;
  const features = copy.features ?? ['Quality Service', 'Experienced Team', 'Great Value'];
  const elements: EditorElement[] = [
    element('heading', sid, 150, 50, 900, 60, {
      content: copy.features_title ?? 'Why Choose Us',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'center',
    }),
  ];
  const colWidth = 300;
  const gap = 50;
  const startX = Math.floor((VIEWPORT_WIDTH - (colWidth * 3 + gap * 2)) / 2);
  for (let i = 0; i < Math.min(features.length, 3); i++) {
    const x = startX + i * (colWidth + gap);
    elements.push(element('text', sid, x, 160, colWidth, 80, {
      content: features[i],
      fontSize: 16, fontWeight: 500, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'center',
      lineHeight: 1.6,
    }));
  }
  return [sec, elements];
}

/** Stacked left -- features listed vertically on the left side. */
function featuresStackedLeft(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 550, { backgroundColor: colors.cards ?? '#FFFFFF' });
  const sid = sec.id;
  const features = copy.features ?? ['Quality Service', 'Experienced Team', 'Great Value'];
  const elements: EditorElement[] = [
    element('heading', sid, 80, 50, 600, 60, {
      content: copy.features_title ?? 'Why Choose Us',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'left',
    }),
  ];
  for (let i = 0; i < Math.min(features.length, 3); i++) {
    elements.push(element('text', sid, 80, 150 + i * 100, 700, 70, {
      content: features[i],
      fontSize: 16, fontWeight: 500, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'left',
      lineHeight: 1.6,
    }));
  }
  return [sec, elements];
}

/** 2+1 layout -- two features on top row, one centered below. */
function features2plus1(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 500, { backgroundColor: colors.cards ?? '#FFFFFF' });
  const sid = sec.id;
  const features = copy.features ?? ['Quality Service', 'Experienced Team', 'Great Value'];
  const elements: EditorElement[] = [
    element('heading', sid, 150, 50, 900, 60, {
      content: copy.features_title ?? 'Why Choose Us',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'center',
    }),
  ];
  // Top row: 2 features
  if (features.length >= 1) {
    elements.push(element('text', sid, 80, 160, 500, 80, {
      content: features[0],
      fontSize: 16, fontWeight: 500, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'center',
      lineHeight: 1.6,
    }));
  }
  if (features.length >= 2) {
    elements.push(element('text', sid, 620, 160, 500, 80, {
      content: features[1],
      fontSize: 16, fontWeight: 500, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'center',
      lineHeight: 1.6,
    }));
  }
  // Bottom row: 1 feature centered
  if (features.length >= 3) {
    elements.push(element('text', sid, 250, 300, 700, 80, {
      content: features[2],
      fontSize: 16, fontWeight: 500, fontFamily: 'Inter',
      color: colors.text ?? '#4B5563', textAlign: 'center',
      lineHeight: 1.6,
    }));
  }
  return [sec, elements];
}

const FEATURES_VARIANTS: SectionVariant[] = [features3col, featuresStackedLeft, features2plus1];

// ============================================================
// CTA VARIANTS -- accent bg, 300px tall
// ============================================================

/** Classic centered CTA. */
function ctaCentered(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const accent = colors.buttons ?? '#3B82F6';
  const sec = section('blank', 300, { backgroundColor: accent });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 200, 60, 800, 60, {
      content: copy.cta_headline ?? 'Ready to Get Started?',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: '#FFFFFF', textAlign: 'center',
    }),
    element('text', sid, 300, 130, 600, 40, {
      content: copy.cta_text ?? 'Book your appointment today.',
      fontSize: 16, fontWeight: 400, fontFamily: 'Inter',
      color: '#FFFFFFCC', textAlign: 'center',
    }),
    element('button', sid, 475, 200, 250, 52, {
      content: copy.cta_button ?? 'Book Now',
      fontSize: 16, fontWeight: 600, fontFamily: 'Inter',
      backgroundColor: '#FFFFFF', color: accent,
      borderRadius: 8,
    }),
  ]];
}

/** Left-aligned CTA -- strong directional push. */
function ctaLeft(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const accent = colors.buttons ?? '#3B82F6';
  const sec = section('blank', 300, { backgroundColor: accent });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 80, 60, 700, 60, {
      content: copy.cta_headline ?? 'Ready to Get Started?',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: '#FFFFFF', textAlign: 'left',
    }),
    element('text', sid, 80, 130, 600, 40, {
      content: copy.cta_text ?? 'Book your appointment today.',
      fontSize: 16, fontWeight: 400, fontFamily: 'Inter',
      color: '#FFFFFFCC', textAlign: 'left',
    }),
    element('button', sid, 80, 200, 250, 52, {
      content: copy.cta_button ?? 'Book Now',
      fontSize: 16, fontWeight: 600, fontFamily: 'Inter',
      backgroundColor: '#FFFFFF', color: accent,
      borderRadius: 8,
    }),
  ]];
}

/** Right-aligned CTA -- content pushed to right side. */
function ctaRight(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const accent = colors.buttons ?? '#3B82F6';
  const sec = section('blank', 300, { backgroundColor: accent });
  const sid = sec.id;
  return [sec, [
    element('heading', sid, 400, 60, 720, 60, {
      content: copy.cta_headline ?? 'Ready to Get Started?',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: '#FFFFFF', textAlign: 'right',
    }),
    element('text', sid, 500, 130, 620, 40, {
      content: copy.cta_text ?? 'Book your appointment today.',
      fontSize: 16, fontWeight: 400, fontFamily: 'Inter',
      color: '#FFFFFFCC', textAlign: 'right',
    }),
    element('button', sid, 870, 200, 250, 52, {
      content: copy.cta_button ?? 'Book Now',
      fontSize: 16, fontWeight: 600, fontFamily: 'Inter',
      backgroundColor: '#FFFFFF', color: accent,
      borderRadius: 8,
    }),
  ]];
}

const CTA_VARIANTS: SectionVariant[] = [ctaCentered, ctaLeft, ctaRight];

// ============================================================
// CONTACT VARIANTS -- light bg
// ============================================================

/** Shared contact form properties. */
function contactFormProps(accent: string): Record<string, unknown> {
  return {
    formTitle: '',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: false },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
    ],
    submitButtonText: 'Send Message',
    submitButtonColor: accent,
  };
}

/** Classic centered contact -- heading centered, form centered below. */
function contactCentered(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 550, { backgroundColor: colors.background ?? '#F5F5F5' });
  const sid = sec.id;
  const accent = colors.buttons ?? '#3B82F6';
  return [sec, [
    element('heading', sid, 150, 40, 900, 50, {
      content: 'Get In Touch',
      fontSize: 32, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'center',
    }),
    element('contactForm', sid, 300, 120, 600, 400, contactFormProps(accent)),
  ]];
}

/** Split contact -- heading+subtext on left, form on right. */
function contactSplit(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 580, { backgroundColor: colors.background ?? '#F5F5F5' });
  const sid = sec.id;
  const accent = colors.buttons ?? '#3B82F6';
  return [sec, [
    element('heading', sid, 80, 50, 400, 50, {
      content: 'Get In Touch',
      fontSize: 32, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'left',
    }),
    element('text', sid, 80, 120, 400, 60, {
      content: "We'd love to hear from you. Send us a message and we'll get back to you shortly.",
      fontSize: 15, fontWeight: 400, fontFamily: 'Inter',
      color: '#6B7280', textAlign: 'left',
      lineHeight: 1.6,
    }),
    element('contactForm', sid, 560, 200, 560, 350, contactFormProps(accent)),
  ]];
}

/** Full-width contact -- wide heading, wider form below. */
function contactFullWidth(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  const sec = section('blank', 600, { backgroundColor: colors.background ?? '#F5F5F5' });
  const sid = sec.id;
  const accent = colors.buttons ?? '#3B82F6';
  return [sec, [
    element('heading', sid, 80, 40, 1040, 50, {
      content: 'Get In Touch',
      fontSize: 36, fontWeight: 700, fontFamily: 'Inter',
      color: colors.headings ?? '#111827', textAlign: 'left',
    }),
    element('contactForm', sid, 200, 130, 800, 420, contactFormProps(accent)),
  ]];
}

const CONTACT_VARIANTS: SectionVariant[] = [contactCentered, contactSplit, contactFullWidth];

// ============================================================
// DISPATCHERS -- randomly pick a variant per section
// ============================================================

/** Dark hero section -- randomly picks a layout variant. */
function buildHeroSection(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  return randomChoice(HERO_VARIANTS)(copy, colors);
}

/** About section -- randomly picks a layout variant. */
function buildAboutSection(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  return randomChoice(ABOUT_VARIANTS)(copy, colors);
}

/** Features section -- randomly picks a layout variant. */
function buildFeaturesSection(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  return randomChoice(FEATURES_VARIANTS)(copy, colors);
}

/** CTA section -- randomly picks a layout variant. */
function buildCtaSection(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  return randomChoice(CTA_VARIANTS)(copy, colors);
}

/** Contact section -- randomly picks a layout variant. */
function buildContactSection(copy: WebsiteCopy, colors: WebsiteColors): [Section, EditorElement[]] {
  return randomChoice(CONTACT_VARIANTS)(copy, colors);
}

// ============================================================
// WIDGET SECTION BUILDERS -- no elements, widget renders itself
// ============================================================

/** Create a widget section (bookingWidget, galleryWidget, productGrid, reviewCarousel). */
function buildWidgetSection(widgetType: string, height: number = 500): [Section, EditorElement[]] {
  return [section(widgetType, height), []];
}

// ============================================================
// SECTION REGISTRY -- maps section name to builder
// ============================================================

const SECTION_BUILDERS: Record<string, SectionVariant> = {
  hero: buildHeroSection,
  about: buildAboutSection,
  features: buildFeaturesSection,
  cta: buildCtaSection,
  contact: buildContactSection,
};

const WIDGET_SECTIONS = new Set([
  'bookingWidget',
  'galleryWidget',
  'productGrid',
  'reviewCarousel',
]);

// ============================================================
// WEBSITE TEMPLATES -- which sections each business type gets
// ============================================================

interface TemplatePageDef {
  title: string;
  slug: string;
  sections: string[];
}

interface WebsiteTemplate {
  pages: TemplatePageDef[];
}

const WEBSITE_TEMPLATES: Record<string, WebsiteTemplate> = {
  // Default for all businesses
  default: {
    pages: [{
      title: 'Home', slug: 'home',
      sections: ['hero', 'features', 'cta', 'contact'],
    }],
  },

  // Appointment-based businesses (salons, spas, tattoo, etc.)
  appointment_based: {
    pages: [{
      title: 'Home', slug: 'home',
      sections: ['hero', 'bookingWidget', 'galleryWidget', 'reviewCarousel', 'contact'],
    }],
  },

  // Retail / food businesses
  retail: {
    pages: [{
      title: 'Home', slug: 'home',
      sections: ['hero', 'productGrid', 'about', 'reviewCarousel', 'contact'],
    }],
  },

  // Professional services (legal, consulting, accounting)
  professional: {
    pages: [{
      title: 'Home', slug: 'home',
      sections: ['hero', 'features', 'about', 'contact'],
    }],
  },

  // Fitness / classes (gym, yoga, martial arts, dance)
  fitness: {
    pages: [{
      title: 'Home', slug: 'home',
      sections: ['hero', 'bookingWidget', 'features', 'reviewCarousel', 'contact'],
    }],
  },

  // Creative / portfolio (photography, art)
  creative: {
    pages: [{
      title: 'Home', slug: 'home',
      sections: ['hero', 'galleryWidget', 'about', 'reviewCarousel', 'contact'],
    }],
  },

  // Home services (landscaping, cleaning, plumbing, etc.)
  home_services: {
    pages: [{
      title: 'Home', slug: 'home',
      sections: ['hero', 'features', 'reviewCarousel', 'cta', 'contact'],
    }],
  },
};

// Map specific business_type to template key
const BUSINESS_TYPE_MAP: Record<string, string> = {
  // Beauty & Body -> appointment_based
  nail_salon: 'appointment_based',
  barbershop: 'appointment_based',
  barber: 'appointment_based',
  hair_salon: 'appointment_based',
  salon: 'appointment_based',
  spa: 'appointment_based',
  med_spa: 'appointment_based',
  tattoo: 'appointment_based',
  lash_brow: 'appointment_based',
  makeup_artist: 'appointment_based',
  pet_grooming: 'appointment_based',

  // Fitness -> fitness
  crossfit: 'fitness',
  fitness: 'fitness',
  yoga: 'fitness',
  martial_arts: 'fitness',
  dance_studio: 'fitness',
  music_studio: 'fitness',
  tutoring: 'fitness',

  // Retail / food -> retail
  restaurant: 'retail',
  cafe: 'retail',
  bakery: 'retail',
  catering: 'retail',
  retail: 'retail',
  florist: 'retail',

  // Professional -> professional
  legal: 'professional',
  accounting: 'professional',
  consulting: 'professional',
  insurance: 'professional',
  real_estate: 'professional',
  recruiting: 'professional',
  professional: 'professional',

  // Creative -> creative
  photography: 'creative',

  // Home services -> home_services
  landscaping: 'home_services',
  cleaning: 'home_services',
  plumbing: 'home_services',
  electrical: 'home_services',
  pest_control: 'home_services',
  moving: 'home_services',

  // Other
  dental: 'appointment_based',
  veterinary: 'appointment_based',
  property_management: 'professional',
  hotel: 'appointment_based',
  coworking: 'professional',
  daycare: 'fitness',
  event_planning: 'creative',
};

/** Get the website template key for a business type. */
export function getTemplateKey(businessType: string): string {
  return BUSINESS_TYPE_MAP[businessType] ?? 'default';
}

// ============================================================
// MAIN BUILDER -- assembles full FreeFormSaveData
// ============================================================

/**
 * Build a complete FreeFormSaveData structure from templates + AI-generated copy.
 *
 * @param businessName - Business name (e.g., "Bella Nails")
 * @param businessType - Business type (e.g., "nail_salon")
 * @param copy - Dict from generate_website_copy() with hero_headline, about_text, etc.
 * @param colors - Dashboard colors dict from config
 * @returns FreeFormSaveData dict ready to store as website_data in configs table
 */
export function generateWebsiteSections(
  businessName: string,
  businessType: string,
  copy: WebsiteCopy,
  colors: WebsiteColors,
): FreeFormSaveData {
  // Reset the ID counter for deterministic-ish IDs per call
  _counter = 0;

  const templateKey = getTemplateKey(businessType);
  const template = WEBSITE_TEMPLATES[templateKey] ?? WEBSITE_TEMPLATES.default;

  const allPages: PageData[] = [];
  const allElements: EditorElement[] = [];

  for (const pageDef of template.pages) {
    const pageSections: Section[] = [];

    for (const sectionName of pageDef.sections) {
      let sec: Section;
      let elements: EditorElement[];

      if (WIDGET_SECTIONS.has(sectionName)) {
        [sec, elements] = buildWidgetSection(sectionName);
      } else if (sectionName in SECTION_BUILDERS) {
        [sec, elements] = SECTION_BUILDERS[sectionName](copy, colors);
      } else {
        continue;
      }

      pageSections.push(sec);
      allElements.push(...elements);
    }

    allPages.push({
      id: pageDef.slug,
      title: pageDef.title,
      slug: pageDef.slug,
      sections: pageSections,
      headerConfig: {},
      footerConfig: {},
      canvasConfig: {},
    });
  }

  return {
    format: 'freeform',
    version: 1,
    pages: allPages,
    elements: allElements,
    currentPageIndex: 0,
  };
}

// Also export as buildWebsiteData for 1:1 parity with the Python function name
export { generateWebsiteSections as buildWebsiteData };
