/**
 * Universal Portal Skeleton — Industry Config System
 *
 * Every business gets the same 8 portal sections. The template controls
 * "flavor" via config flags (preference fields, action labels, booking mode, etc.)
 *
 * The skeleton is universal — industry configs only change labels, fields, and modes.
 */

// ============================================================
// Portal Config Interface
// ============================================================

export interface PortalPreferenceField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
}

export interface PortalConfig {
  /** Industry-specific preference fields shown in Account section */
  preferenceFields: PortalPreferenceField[];
  /** Primary action on invoice history items */
  primaryAction: 'book_again' | 'reorder' | 'schedule_again' | 'book_class';
  /** Label for the primary action button */
  primaryActionLabel: string;
  /** Chat prominence: 'primary' = chat front-and-center, 'secondary' = announcements prominent */
  chatProminence: 'primary' | 'secondary';
  /** Review prompt text shown to the client */
  reviewPrompt: string;
  /** Booking flow mode */
  bookingMode: 'service' | 'class' | 'menu' | 'scheduler';
  /** Default notification preferences for this industry */
  defaultNotifications: { promotions: boolean };
}

// ============================================================
// Industry Configs
// ============================================================

const INDUSTRY_CONFIGS: Record<string, Partial<PortalConfig>> = {
  // ── Beauty & Personal Care ─────────────────────────────────
  nail_salon: {
    preferenceFields: [
      { key: 'nail_shape', label: 'Preferred Nail Shape', type: 'select', options: ['Almond', 'Coffin', 'Oval', 'Square', 'Stiletto', 'Round'] },
      { key: 'gel_type', label: 'Preferred Gel Type', type: 'text' },
      { key: 'allergies', label: 'Allergies', type: 'textarea' },
    ],
    chatProminence: 'primary',
    reviewPrompt: 'Rate your visit',
  },
  hair_salon: {
    preferenceFields: [
      { key: 'color_formula', label: 'Color Formula', type: 'textarea' },
      { key: 'stylist_notes', label: 'Stylist Notes', type: 'textarea' },
    ],
    chatProminence: 'primary',
    reviewPrompt: 'Rate your appointment',
  },
  barbershop: {
    preferenceFields: [
      { key: 'cut_style', label: 'Preferred Style', type: 'text' },
    ],
    chatProminence: 'primary',
    reviewPrompt: 'Rate your cut',
  },
  spa: {
    preferenceFields: [
      { key: 'allergies', label: 'Allergies/Sensitivities', type: 'textarea' },
      { key: 'pressure', label: 'Preferred Pressure', type: 'select', options: ['Light', 'Medium', 'Firm', 'Deep'] },
    ],
    chatProminence: 'primary',
    reviewPrompt: 'Rate your experience',
  },

  // ── Fitness & Wellness ─────────────────────────────────────
  gym: {
    primaryAction: 'book_class',
    primaryActionLabel: 'Book Class',
    bookingMode: 'class',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the class',
    preferenceFields: [
      { key: 'fitness_goals', label: 'Fitness Goals', type: 'textarea' },
    ],
  },
  fitness: {
    primaryAction: 'book_class',
    primaryActionLabel: 'Book Class',
    bookingMode: 'class',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the session',
  },
  yoga_studio: {
    primaryAction: 'book_class',
    primaryActionLabel: 'Book Class',
    bookingMode: 'class',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the class',
  },
  martial_arts: {
    primaryAction: 'book_class',
    primaryActionLabel: 'Book Class',
    bookingMode: 'class',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the class',
  },

  // ── Food & Beverage ────────────────────────────────────────
  restaurant: {
    primaryAction: 'reorder',
    primaryActionLabel: 'Reorder',
    bookingMode: 'menu',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate your meal',
    preferenceFields: [
      { key: 'dietary', label: 'Dietary Preferences', type: 'textarea' },
    ],
  },
  cafe: {
    primaryAction: 'reorder',
    primaryActionLabel: 'Order Again',
    bookingMode: 'menu',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate your visit',
  },
  bakery: {
    primaryAction: 'reorder',
    primaryActionLabel: 'Order Again',
    bookingMode: 'menu',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate your order',
  },

  // ── Home Services ──────────────────────────────────────────
  lawn_care: {
    primaryAction: 'schedule_again',
    primaryActionLabel: 'Schedule Service',
    bookingMode: 'scheduler',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the service',
    preferenceFields: [
      { key: 'gate_code', label: 'Gate Code', type: 'text' },
      { key: 'property_notes', label: 'Property Notes', type: 'textarea' },
    ],
  },
  cleaning: {
    primaryAction: 'schedule_again',
    primaryActionLabel: 'Schedule Cleaning',
    bookingMode: 'scheduler',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the service',
    preferenceFields: [
      { key: 'access_notes', label: 'Access Instructions', type: 'textarea' },
    ],
  },
  plumbing: {
    primaryAction: 'schedule_again',
    primaryActionLabel: 'Schedule Service',
    bookingMode: 'scheduler',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the service',
  },
  electrical: {
    primaryAction: 'schedule_again',
    primaryActionLabel: 'Schedule Service',
    bookingMode: 'scheduler',
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the service',
  },

  // ── Professional Services ──────────────────────────────────
  dental: {
    chatProminence: 'secondary',
    reviewPrompt: 'Rate your appointment',
    preferenceFields: [
      { key: 'insurance', label: 'Insurance Provider', type: 'text' },
    ],
  },
  medical: {
    chatProminence: 'secondary',
    reviewPrompt: 'Rate your visit',
    preferenceFields: [
      { key: 'insurance', label: 'Insurance Provider', type: 'text' },
    ],
  },
  legal: {
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the service',
  },
  accounting: {
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the service',
  },
  consulting: {
    chatProminence: 'secondary',
    reviewPrompt: 'Rate the consultation',
  },
};

// ============================================================
// Default Config
// ============================================================

const DEFAULT_CONFIG: PortalConfig = {
  preferenceFields: [],
  primaryAction: 'book_again',
  primaryActionLabel: 'Book Again',
  chatProminence: 'primary',
  reviewPrompt: 'Rate your experience',
  bookingMode: 'service',
  defaultNotifications: { promotions: false },
};

// ============================================================
// Exported Functions
// ============================================================

/**
 * Get the portal config for a business type.
 * Merges industry-specific overrides on top of defaults.
 */
export function getPortalConfig(businessType?: string): PortalConfig {
  if (!businessType) return DEFAULT_CONFIG;
  const type = businessType.toLowerCase().replace(/\s+/g, '_');
  const override = INDUSTRY_CONFIGS[type];
  if (!override) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...override };
}

/**
 * Every business gets a portal. Always returns true. (Sticky #11)
 */
export function shouldHavePortal(_businessType?: string): boolean {
  return true;
}

/**
 * Universal portal section descriptor.
 */
export interface PortalSection {
  id: string;
  title: string;
  slug: string;
  icon: string;
  description: string;
}

/**
 * The 8 universal portal sections. Every business gets all 8.
 * Section components read from getPortalConfig() for industry flavor.
 */
export function getPortalSections(): PortalSection[] {
  return [
    { id: 'account', title: 'Account', slug: 'account', icon: 'user', description: 'Profile, preferences, and family members' },
    { id: 'history', title: 'History', slug: 'history', icon: 'receipt', description: 'Payment history and past services' },
    { id: 'loyalty', title: 'Loyalty', slug: 'loyalty', icon: 'gift', description: 'Points, tier, and rewards' },
    { id: 'messages', title: 'Messages', slug: 'messages', icon: 'chat', description: 'Chat with the business' },
    { id: 'reviews', title: 'Reviews', slug: 'reviews', icon: 'star', description: 'Leave and view reviews' },
    { id: 'cards', title: 'Cards', slug: 'cards', icon: 'credit-card', description: 'Saved payment methods' },
    { id: 'notifications', title: 'Notifications', slug: 'notifications', icon: 'bell', description: 'Notification preferences' },
    { id: 'book', title: 'Book', slug: 'book', icon: 'calendar-plus', description: 'Book an appointment or reorder' },
  ];
}

/**
 * Get portal pages in the legacy ChaiBuilder block format.
 * Kept for backward compatibility with existing portal page rendering.
 * New portal shell uses getPortalSections() + section components directly.
 */
export function getPortalPages(businessType?: string, _accentColor = '#1A1A1A') {
  const config = getPortalConfig(businessType);
  const sections = getPortalSections();

  return sections.map(section => ({
    title: section.title,
    slug: section.slug,
    blocks: [
      {
        _id: `block_portal_${section.id}`,
        _type: `Portal${section.title}Section`,
        _name: section.title,
        sectionId: section.id,
        portalConfig: config,
      },
    ],
  }));
}
