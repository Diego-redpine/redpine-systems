/**
 * Home & Field Services — Template Family
 *
 * Enterprise-first templates. Each business type has its OWN complete template.
 * AI customizes labels, removes _removable tabs, adds user-requested components.
 * Locked components (_locked: true) cannot be removed by AI.
 *
 * Covers: plumber, electrician, hvac, landscaping, lawn_care, cleaning_service,
 *         pest_control, roofing, painting, handyman, moving_company, locksmith,
 *         pressure_washing, pool_service, contractor,
 *         general_contractor, home_services
 */

import type { TemplateConfig, TemplateResult } from './beauty-body';

// All business types in this family
export const HOME_FIELD_SERVICES_TYPES = new Set([
  'plumber', 'electrician', 'hvac', 'landscaping', 'lawn_care',
  'cleaning_service', 'pest_control', 'roofing', 'painting', 'handyman',
  'moving_company', 'locksmith', 'pressure_washing',
  'pool_service', 'contractor', 'general_contractor', 'home_services',
]);

// ── Enterprise Templates ─────────────────────────────────────────────

const TEMPLATES: Record<string, TemplateConfig> = {

  // ── PLUMBER ─────────────────────────────────────────────────────────
  // Flat-rate pricebook workflow. GPS dispatch, truck stock, before/after
  // photos, emergency job flagging. Solo-first (no Crew tab by default).
  plumber: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Jobs', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Estimate Scheduled', 'Estimate Sent', 'Approved', 'Scheduled', 'In Progress', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
          { id: 'properties', label: 'Properties', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Dispatch Board', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Pricebook', view: 'cards' },
          { id: 'parts', label: 'Parts & Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Technicians', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── ELECTRICIAN ─────────────────────────────────────────────────────
  // Permit tracking critical. Multi-day jobs, progress billing,
  // load calculations. Panel upgrades, EV charger installs growing.
  electrician: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Jobs', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Site Assessment', 'Estimate Sent', 'Approved', 'Permit Pulled', 'Scheduled', 'In Progress', 'Inspection', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Dispatch Board', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'parts', label: 'Parts & Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Permits', icon: 'file',
        components: [
          { id: 'permits', label: 'Permits & Inspections', view: 'pipeline',
            stages: ['Applied', 'Issued', 'Inspection Scheduled', 'Passed', 'Failed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Electricians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Electricians', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── HVAC ────────────────────────────────────────────────────────────
  // Seasonal business (AC summer, heating winter). Equipment database
  // per property is mission-critical. Financing for $5K-15K replacements.
  // Membership plans drive recurring revenue.
  hvac: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Service Calls', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Incoming Call', 'Diagnostic Scheduled', 'Diagnostic Complete', 'Estimate Presented', 'Approved', 'Parts Ordered', 'Scheduled', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Dispatch Board', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'equipment', label: 'Equipment Database', view: 'table' },
          { id: 'parts', label: 'Parts & Inventory', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Memberships', icon: 'users',
        components: [
          { id: 'membership_plans', label: 'Maintenance Plans', view: 'cards' },
          { id: 'memberships', label: 'Members', view: 'pipeline',
            stages: ['Prospect', 'Enrolled', 'Active', 'Renewal Due', 'Cancelled'] },
        ],
      },
      {
        id: 'tab_7', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Technicians', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── LANDSCAPING ─────────────────────────────────────────────────────
  // Property-centric: lot size, irrigation, gate codes. Crew-based
  // scheduling. Route optimization. Seasonal transitions
  // (mowing -> leaf removal -> snow removal).
  landscaping: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Properties', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Property Visit', 'Estimate Sent', 'Approved', 'Recurring Set', 'Active Service', 'Enhancement Quote', 'Winter Pause'] },
          { id: 'customers', label: 'Customers', view: 'table' },
          { id: 'properties', label: 'Properties', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
          { id: 'routes', label: 'Routes', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'recurring_services', label: 'Recurring Services', view: 'table' },
          { id: 'materials', label: 'Materials & Supplies', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Crews', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Crews', view: 'cards' },
          { id: 'equipment', label: 'Equipment', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── LAWN CARE ───────────────────────────────────────────────────────
  // Similar to landscaping but simpler. Recurring mowing,
  // fertilization, weed control. Route-based daily scheduling.
  lawn_care: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Properties', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Property Visit', 'Estimate Sent', 'Approved', 'Recurring Set', 'Active Service', 'Upsell Opportunity', 'Winter Pause'] },
          { id: 'customers', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
          { id: 'routes', label: 'Routes', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Plans', view: 'cards' },
          { id: 'materials', label: 'Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Crew', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Crew Members', view: 'cards' },
          { id: 'equipment', label: 'Equipment', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── CLEANING SERVICE ────────────────────────────────────────────────
  // Online booking with instant pricing critical. Recurring schedules
  // (weekly, bi-weekly, monthly). Cleaner safety features.
  // Card-on-file auto-charge model.
  cleaning_service: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Jobs', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Quote Sent', 'Confirmed', 'Scheduled', 'Cleaner Assigned', 'In Progress', 'Completed'] },
          { id: 'customers', label: 'Clients', view: 'table' },
          { id: 'booking_requests', label: 'Booking Requests', view: 'list' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Cleaning Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-Ons', view: 'cards' },
          { id: 'checklists', label: 'Cleaning Checklists', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Cleaners', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Cleaners', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── PEST CONTROL ────────────────────────────────────────────────────
  // Route-based scheduling. Chemical tracking is regulatory requirement.
  // Subscription model (quarterly/monthly). Follow-up treatments.
  pest_control: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Jobs', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Inspection Scheduled', 'Inspection Complete', 'Estimate Sent', 'Approved', 'Initial Treatment', 'Follow-Up', 'Subscription Enrolled'] },
          { id: 'customers', label: 'Customers', view: 'table' },
          { id: 'properties', label: 'Properties', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
          { id: 'routes', label: 'Routes', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Treatment Plans', view: 'cards' },
          { id: 'chemical_log', label: 'Chemical Log', view: 'table' },
          { id: 'subscriptions', label: 'Subscriptions', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Technicians', view: 'cards' },
          { id: 'equipment', label: 'Equipment', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── ROOFING ─────────────────────────────────────────────────────────
  // Project-centric, long sales cycle. Aerial measurements,
  // insurance claims, multi-day installs. Crew-based scheduling.
  // Materials ordering integration critical.
  roofing: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Projects', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Project Pipeline', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Inspection', 'Estimate Sent', 'Negotiation', 'Contract Signed', 'Permit Applied', 'Materials Ordered', 'Production Scheduled', 'In Progress', 'Quality Check', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Production Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'materials', label: 'Materials & Orders', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
          { id: 'inspections', label: 'Inspections', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Project Photos', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_7', label: 'Crews', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Crews', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'deposits', label: 'Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── PAINTING ────────────────────────────────────────────────────────
  // Project-based with multi-day scheduling. Room-by-room estimating
  // with sq ft. Color selections per room. Prep vs paint day planning.
  painting: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Projects', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Project Pipeline', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Site Visit', 'Estimate Sent', 'Color Consultation', 'Approved', 'Deposit Collected', 'Materials Purchased', 'Prep', 'Painting', 'Touch-Up', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'colors', label: 'Color Selections', view: 'table' },
          { id: 'materials', label: 'Paint & Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Project Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_7', label: 'Painters', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Painters', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'deposits', label: 'Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── HANDYMAN ────────────────────────────────────────────────────────
  // Multi-trade, diverse job types. Quick scheduling (same-day/next-day).
  // Photo-based remote quoting. 3-5 jobs per day, shorter durations.
  // Simplest template in the family.
  handyman: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Jobs', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Assessment', 'Estimate Sent', 'Approved', 'Scheduled', 'In Progress', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'materials', label: 'Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── MOVING COMPANY ──────────────────────────────────────────────────
  // Move-centric: origin/destination, inventory lists, crew + truck
  // dispatch. Virtual survey estimating. Fleet management. Storage.
  moving_company: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Moves', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Move Pipeline', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Survey Scheduled', 'Estimate Sent', 'Follow-Up', 'Booked', 'Pre-Move Call', 'Move Day', 'Delivered', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
          { id: 'inventory_lists', label: 'Inventory Lists', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Dispatch Board', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Move Packages', view: 'cards' },
          { id: 'packing_services', label: 'Packing Services', view: 'cards' },
          { id: 'storage', label: 'Storage Units', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Fleet & Crews', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Movers & Crews', view: 'cards' },
          { id: 'fleet', label: 'Trucks & Fleet', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'deposits', label: 'Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── LOCKSMITH ───────────────────────────────────────────────────────
  // Emergency-heavy (lockouts). Mobile-first, rapid dispatch.
  // Mix of residential, commercial, and automotive services.
  // Solo operator common.
  locksmith: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Jobs', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Emergency Call', 'Dispatched', 'En Route', 'On Site', 'In Progress', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'parts', label: 'Locks & Hardware', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Locksmiths', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── PRESSURE WASHING ────────────────────────────────────────────────
  // Property-based: driveways, decks, siding, fences. Before/after
  // photos are the #1 marketing tool. Route-based for efficiency.
  // Often seasonal. Simple estimates by surface area.
  pressure_washing: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Jobs', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Estimate Sent', 'Approved', 'Scheduled', 'In Progress', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
          { id: 'routes', label: 'Routes', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'equipment', label: 'Equipment', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Before & After', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_7', label: 'Crew', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Crew', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── POOL SERVICE ────────────────────────────────────────────────────
  // Route-based recurring service (weekly pool cleaning). Chemical
  // testing and treatment logging. Equipment tracking per pool.
  // Seasonal in northern markets. Subscription model.
  pool_service: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Pools', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Job Pipeline', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Site Visit', 'Estimate Sent', 'Approved', 'Recurring Set', 'Active Service', 'Repair Needed', 'Winter Close'] },
          { id: 'customers', label: 'Customers', view: 'table' },
          { id: 'pool_profiles', label: 'Pool Profiles', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
          { id: 'routes', label: 'Routes', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Plans', view: 'cards' },
          { id: 'chemical_log', label: 'Chemical Log', view: 'table' },
          { id: 'pool_equipment', label: 'Pool Equipment', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Technicians', view: 'cards' },
          { id: 'equipment', label: 'Equipment', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── CONTRACTOR (General) ────────────────────────────────────────────
  // Project-based with multi-phase work. Subcontractor management,
  // permits, inspections. Change orders, progress billing. Longer
  // sales cycles and larger ticket sizes.
  contractor: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Projects', icon: 'briefcase',
        components: [
          { id: 'jobs', label: 'Project Pipeline', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Site Visit', 'Estimate Sent', 'Negotiation', 'Contract Signed', 'Permit Applied', 'In Progress', 'Inspection', 'Punch List', 'Completed'] },
          { id: 'customers', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Project Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'materials', label: 'Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Estimates', icon: 'clipboard',
        components: [
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
          { id: 'change_orders', label: 'Change Orders', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Permits', icon: 'file',
        components: [
          { id: 'permits', label: 'Permits & Inspections', view: 'pipeline',
            stages: ['Applied', 'Issued', 'Inspection Scheduled', 'Passed', 'Failed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Crew & Subs', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Crew', view: 'cards' },
          { id: 'subcontractors', label: 'Subcontractors', view: 'table' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'deposits', label: 'Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },
};

// Generic aliases clone sensible defaults
TEMPLATES.general_contractor = structuredClone(TEMPLATES.contractor);
TEMPLATES.home_services = structuredClone(TEMPLATES.handyman);

// ── Public API ────────────────────────────────────────────────────────

/**
 * Get the full template config for a Home & Field Services business type.
 * Returns { template, lockedIds } or null if not found.
 */
export function getHomeFieldServicesTemplate(businessType: string): TemplateResult | null {
  if (!HOME_FIELD_SERVICES_TYPES.has(businessType)) return null;

  const templateData = TEMPLATES[businessType];
  if (!templateData) return null;

  const template = structuredClone(templateData);

  // Collect locked component IDs
  const lockedIds = new Set<string>();
  for (const tab of template.tabs) {
    for (const comp of tab.components) {
      if (comp._locked) {
        lockedIds.add(comp.id);
      }
    }
  }

  return { template, lockedIds };
}

/**
 * Get the template formatted as a JSON string for injection into the AI prompt.
 * Includes _locked flags so AI knows what it cannot remove.
 */
export function getTemplateAsPromptJson(businessType: string): string | null {
  const result = getHomeFieldServicesTemplate(businessType);
  if (!result) return null;
  return JSON.stringify(result.template, null, 2);
}
