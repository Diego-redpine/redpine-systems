export const TEST_EMAIL = 'luxe.nails.e2e@redpine.systems';
export const TEST_PASSWORD = 'TestNails2026!';
export const TEST_SUBDOMAIN = 'luxe-nails';
export const BASE_URL = 'http://localhost:3000';

export const ROUTES = {
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  onboarding: '/onboarding',
  brandBoard: '/brand-board',
  booking: `/book/luxe-nails`,
  portal: `/portal/luxe-nails`,
  ordering: `/order/luxe-nails`,
  form: `/form/luxe-nails`,
  review: `/review/luxe-nails`,
  sign: `/sign/luxe-nails`,
  site: `/site/luxe-nails`,
} as const;

export const SIDEBAR_TABS = [
  'Dashboard', 'Clients', 'Services', 'Appointments',
  'Staff', 'Payments', 'Gallery',
] as const;

export const TOOL_STRIP_IDS = [
  'tool-comms', 'tool-brand', 'tool-website',
  'tool-marketplace', 'tool-marketing',
] as const;
