export interface IndustryTourContent {
  primaryEntity: string;
  tabDescriptions: Record<string, string>;
  servicesLabel: string;
  firstRecordPrompt: string;
  bookingDescription: string;
  checklist: string[];
}

export const TOUR_CONTENT: Record<string, IndustryTourContent> = {
  nail_salon: {
    primaryEntity: 'client',
    tabDescriptions: {
      'Dashboard': 'Your business overview and key stats',
      'Clients': 'Track clients through stages: Requested, Confirmed, Checked In, In Service, Completed',
      'VIP Program': 'Membership tiers to reward your regulars',
      'Schedule': 'All nail appointments on one calendar, no double-bookings',
      'Services': 'Your service menu with pricing -- gel manicures, pedicures, acrylics, nail art, dip powder',
      'Gallery': 'Showcase your nail art to attract new clients',
      'Staff': 'Your nail techs, availability, and roles',
      'Payments': 'Invoices and payment tracking',
    },
    servicesLabel: 'nail services',
    firstRecordPrompt: 'Click + Add Client on the Clients tab. They\'ll start in the \'Requested\' stage and move through your pipeline as they visit.',
    bookingDescription: 'Clients pick a date, time, and fill in their details. Share your booking link on Instagram and Google.',
    checklist: [
      'Add your nail services with prices and durations',
      'Add your nail techs to the Staff tab',
      'Connect Stripe or Square to accept payments',
      'Import your existing client list (if you have one)',
      'Share your booking link on social media',
    ],
  },
  // Generic fallback for any industry
  _default: {
    primaryEntity: 'client',
    tabDescriptions: {
      'Dashboard': 'Your business overview and key stats',
      'Clients': 'Manage your customer relationships',
      'Schedule': 'All your appointments in one place',
      'Services': 'Your services and pricing',
      'Staff': 'Your team members and their roles',
      'Payments': 'Invoices and payment tracking',
    },
    servicesLabel: 'services',
    firstRecordPrompt: 'Click + Add Client to create your first client record.',
    bookingDescription: 'Clients can book appointments through your public booking link.',
    checklist: [
      'Add your services with prices',
      'Add team members to the Staff tab',
      'Connect a payment processor',
      'Import your existing data',
      'Share your booking link',
    ],
  },
};

export function getTourContent(businessType: string): IndustryTourContent {
  // Normalize business type to match keys
  const normalized = businessType?.toLowerCase().replace(/[\s-]+/g, '_') || '';
  return TOUR_CONTENT[normalized] || TOUR_CONTENT._default;
}
