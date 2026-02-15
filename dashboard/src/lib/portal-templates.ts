/**
 * Default ChaiBuilder block templates for portal pages.
 * Each template is an array of ChaiBuilder block definitions
 * that get saved as `blocks` in site_pages.
 */

// Block helper — creates a ChaiBuilder block structure
function block(type: string, props: Record<string, unknown>) {
  const id = `block_${type.toLowerCase()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    _id: id,
    _type: type,
    _name: type.replace(/([A-Z])/g, ' $1').trim(),
    ...props,
  };
}

/**
 * Studio portal template — martial arts, dance, yoga, boxing, fitness, music
 * Includes: Header, Schedule, Progress, Billing, Documents, Announcements, Shop, Account
 */
export function getStudioPortalPages(accentColor = '#1A1A1A') {
  return [
    {
      title: 'Home',
      slug: 'home',
      blocks: [
        block('PortalHeader', { heading: 'Welcome back', accentColor, showLogo: true }),
        block('PortalSchedule', { heading: 'My Schedule', accentColor, allowRegistration: true }),
        block('PortalAnnouncements', { heading: 'News & Events', accentColor }),
      ],
    },
    {
      title: 'Progress',
      slug: 'progress',
      blocks: [
        block('PortalProgress', { heading: 'My Progress', accentColor, progressType: 'belt' }),
      ],
    },
    {
      title: 'Billing',
      slug: 'billing',
      blocks: [
        block('PortalBilling', { heading: 'Billing & Payments', accentColor, showPayButton: true }),
        block('PortalShop', { heading: 'Shop', accentColor }),
      ],
    },
    {
      title: 'Documents',
      slug: 'documents',
      blocks: [
        block('PortalDocuments', { heading: 'Documents & Waivers', accentColor, allowSigning: true }),
      ],
    },
    {
      title: 'Account',
      slug: 'account',
      blocks: [
        block('PortalAccount', { heading: 'My Account', accentColor }),
      ],
    },
  ];
}

/**
 * Professional portal template — legal, accounting, consulting, medical, dental, spa
 * Includes: Header, Schedule, Billing, Documents, Account (no Progress)
 */
export function getProfessionalPortalPages(accentColor = '#1A1A1A') {
  return [
    {
      title: 'Home',
      slug: 'home',
      blocks: [
        block('PortalHeader', { heading: 'Welcome back', accentColor, showLogo: true }),
        block('PortalSchedule', { heading: 'Upcoming Appointments', accentColor, allowRegistration: false }),
        block('PortalAnnouncements', { heading: 'Updates', accentColor }),
      ],
    },
    {
      title: 'Billing',
      slug: 'billing',
      blocks: [
        block('PortalBilling', { heading: 'Billing & Invoices', accentColor, showPayButton: true }),
      ],
    },
    {
      title: 'Documents',
      slug: 'documents',
      blocks: [
        block('PortalDocuments', { heading: 'Documents & Forms', accentColor, allowSigning: true }),
      ],
    },
    {
      title: 'Account',
      slug: 'account',
      blocks: [
        block('PortalAccount', { heading: 'My Account', accentColor }),
      ],
    },
  ];
}

/**
 * Education portal template — tutoring, coaching, training
 * Includes: Header, Schedule, Progress, Billing, Documents, Account
 */
export function getEducationPortalPages(accentColor = '#1A1A1A') {
  return [
    {
      title: 'Home',
      slug: 'home',
      blocks: [
        block('PortalHeader', { heading: 'Welcome back', accentColor, showLogo: true }),
        block('PortalSchedule', { heading: 'My Sessions', accentColor, allowRegistration: true }),
        block('PortalAnnouncements', { heading: 'Announcements', accentColor }),
      ],
    },
    {
      title: 'Progress',
      slug: 'progress',
      blocks: [
        block('PortalProgress', { heading: 'My Progress', accentColor, progressType: 'level' }),
      ],
    },
    {
      title: 'Billing',
      slug: 'billing',
      blocks: [
        block('PortalBilling', { heading: 'Billing', accentColor, showPayButton: true }),
      ],
    },
    {
      title: 'Documents',
      slug: 'documents',
      blocks: [
        block('PortalDocuments', { heading: 'Documents', accentColor, allowSigning: true }),
      ],
    },
    {
      title: 'Account',
      slug: 'account',
      blocks: [
        block('PortalAccount', { heading: 'My Account', accentColor }),
      ],
    },
  ];
}

/**
 * Fitness portal template — gym, crossfit, personal training
 * Uses tier system instead of belts
 */
export function getFitnessPortalPages(accentColor = '#1A1A1A') {
  return [
    {
      title: 'Home',
      slug: 'home',
      blocks: [
        block('PortalHeader', { heading: 'Welcome back', accentColor, showLogo: true }),
        block('PortalSchedule', { heading: 'My Classes', accentColor, allowRegistration: true }),
        block('PortalAnnouncements', { heading: 'Gym Updates', accentColor }),
      ],
    },
    {
      title: 'Progress',
      slug: 'progress',
      blocks: [
        block('PortalProgress', { heading: 'Membership Tier', accentColor, progressType: 'tier' }),
      ],
    },
    {
      title: 'Billing',
      slug: 'billing',
      blocks: [
        block('PortalBilling', { heading: 'Billing & Membership', accentColor, showPayButton: true }),
        block('PortalShop', { heading: 'Supplements & Gear', accentColor }),
      ],
    },
    {
      title: 'Account',
      slug: 'account',
      blocks: [
        block('PortalAccount', { heading: 'My Account', accentColor }),
      ],
    },
  ];
}

// Business types that should have a portal
const STUDIO_TYPES = new Set([
  'martial_arts', 'dance_studio', 'dance', 'yoga', 'yoga_studio',
  'boxing', 'mma', 'karate', 'taekwondo', 'jiu_jitsu', 'music_studio',
]);

const FITNESS_TYPES = new Set([
  'fitness', 'gym', 'crossfit', 'personal_training', 'pilates',
]);

const PROFESSIONAL_TYPES = new Set([
  'legal', 'law_firm', 'accounting', 'consulting', 'freelancer',
  'medical', 'dental', 'spa', 'chiropractic', 'therapy',
  'veterinary', 'vet_clinic',
]);

const EDUCATION_TYPES = new Set([
  'tutoring', 'coaching', 'training', 'education',
]);

/**
 * Check if a business type should have a client portal
 */
export function shouldHavePortal(businessType?: string): boolean {
  if (!businessType) return false;
  const type = businessType.toLowerCase().replace(/\s+/g, '_');
  return (
    STUDIO_TYPES.has(type) ||
    FITNESS_TYPES.has(type) ||
    PROFESSIONAL_TYPES.has(type) ||
    EDUCATION_TYPES.has(type)
  );
}

/**
 * Get the right portal template for a business type
 */
export function getPortalPages(businessType?: string, accentColor = '#1A1A1A') {
  if (!businessType) return getProfessionalPortalPages(accentColor);

  const type = businessType.toLowerCase().replace(/\s+/g, '_');

  if (STUDIO_TYPES.has(type)) return getStudioPortalPages(accentColor);
  if (FITNESS_TYPES.has(type)) return getFitnessPortalPages(accentColor);
  if (EDUCATION_TYPES.has(type)) return getEducationPortalPages(accentColor);
  return getProfessionalPortalPages(accentColor);
}
