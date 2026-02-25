/**
 * Creative & Events — Template Family
 *
 * Enterprise-first templates. Each business type has its OWN complete template.
 * AI customizes labels, removes _removable tabs, adds user-requested components.
 * Locked components (_locked: true) cannot be removed by AI.
 *
 * These businesses share a common workflow: inquiry -> proposal/quote ->
 * contract + deposit -> project execution -> delivery -> final payment.
 * They are project-based, rely on portfolio presentation, and use
 * milestone-based payments. Trust and personal brand are everything.
 *
 * Covers: photographer, videographer, wedding_planner, event_planner, dj,
 *         florist, graphic_designer, interior_designer, musician, band,
 *         art_studio, print_shop, content_creator, creative, entertainer,
 *         wedding_photographer, event_photographer, film_maker
 */

import type { TemplateConfig, TemplateResult } from './beauty-body';

// All business types in this family
export const CREATIVE_EVENTS_TYPES = new Set([
  'photographer', 'videographer', 'wedding_planner', 'event_planner', 'dj',
  'florist', 'graphic_designer', 'interior_designer', 'musician', 'band',
  'art_studio', 'print_shop', 'content_creator', 'creative', 'entertainer',
  'wedding_photographer', 'event_photographer', 'film_maker',
]);

// ── Enterprise Templates ─────────────────────────────────────────────

const TEMPLATES: Record<string, TemplateConfig> = {

  // ── PHOTOGRAPHER ──────────────────────────────────────────────────
  // Inquiry-to-gallery pipeline. Portfolio is the #1 marketing tool.
  // Deposit + final payment model. Questionnaires for pre-shoot planning.
  // Calendar prevents double-booking on shoot dates.
  photographer: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Bookings', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Consultation', 'Proposal Sent', 'Contract Signed', 'Deposit Paid', 'Shoot Day', 'Editing', 'Gallery Delivered'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Shoot Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Session Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-Ons', view: 'cards' },
          { id: 'questionnaires', label: 'Questionnaires', view: 'table' },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Portfolio', view: 'cards', _locked: true },
          { id: 'client_galleries', label: 'Client Galleries', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Photographers', view: 'cards' },
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

  // ── VIDEOGRAPHER ──────────────────────────────────────────────────
  // Multi-deliverable projects (highlight reel, full film, social clips).
  // Longer editing timelines. Revision round tracking. Milestone payments.
  // Crew management for larger shoots.
  videographer: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Projects', icon: 'people',
        components: [
          { id: 'clients', label: 'Projects', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Discovery Call', 'Proposal Sent', 'Contract Signed', 'Deposit Paid', 'Pre-Production', 'Filming', 'Editing', 'Review', 'Delivered'] },
          { id: 'contacts', label: 'Clients', view: 'table' },
          { id: 'deliverables', label: 'Deliverables', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Production Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Video Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-Ons', view: 'cards' },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Showreel', view: 'cards', _locked: true },
          { id: 'client_galleries', label: 'Client Films', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Crew', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Crew', view: 'cards' },
          { id: 'equipment', label: 'Equipment', view: 'table' },
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

  // ── WEDDING PLANNER ───────────────────────────────────────────────
  // Vendor coordination is the core skill. Detailed budget tracking.
  // Couple-focused. Day-of timeline shared with all vendors.
  // Guest list, seating, design boards. Long engagement planning cycles.
  wedding_planner: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Weddings', icon: 'people',
        components: [
          { id: 'clients', label: 'Weddings', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Chemistry Meeting', 'Proposal Sent', 'Contract Signed', 'Deposit Paid', 'Vendor Selection', 'Design Planning', 'Final Details', 'Rehearsal', 'Wedding Day', 'Wrap-Up'] },
          { id: 'contacts', label: 'Couples', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Planning Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Vendors', icon: 'box',
        components: [
          { id: 'vendors', label: 'Vendor Roster', view: 'table', _locked: true },
          { id: 'vendor_contracts', label: 'Vendor Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Planning', icon: 'list',
        components: [
          { id: 'budgets', label: 'Budget Tracker', view: 'table' },
          { id: 'timelines', label: 'Day-of Timeline', view: 'list' },
          { id: 'guest_lists', label: 'Guest List', view: 'table' },
          { id: 'checklists', label: 'Planning Checklist', view: 'list' },
        ],
      },
      {
        id: 'tab_6', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Planning Packages', view: 'cards' },
          { id: 'contracts', label: 'Client Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Wedding Portfolio', view: 'cards', _locked: true },
          { id: 'design_boards', label: 'Style Boards', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Coordinators', view: 'cards' },
        ],
      },
      {
        id: 'tab_9', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'deposits', label: 'Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── EVENT PLANNER ─────────────────────────────────────────────────
  // Multi-vendor coordination. Budget tracking with estimated vs actual.
  // Day-of timeline. Guest management. Floor plan & seating.
  // Handles corporate, social, and private events.
  event_planner: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Events', icon: 'people',
        components: [
          { id: 'clients', label: 'Events', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Consultation', 'Proposal Sent', 'Contract Signed', 'Deposit Paid', 'Vendor Selection', 'Design Planning', 'Final Details', 'Event Day', 'Wrap-Up'] },
          { id: 'contacts', label: 'Clients', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Event Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Vendors', icon: 'box',
        components: [
          { id: 'vendors', label: 'Vendor Directory', view: 'table', _locked: true },
          { id: 'vendor_contracts', label: 'Vendor Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Planning', icon: 'list',
        components: [
          { id: 'budgets', label: 'Budget Tracker', view: 'table' },
          { id: 'timelines', label: 'Event Timeline', view: 'list' },
          { id: 'guest_lists', label: 'Guest List', view: 'table' },
          { id: 'checklists', label: 'Task Checklist', view: 'list' },
        ],
      },
      {
        id: 'tab_6', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Event Packages', view: 'cards' },
          { id: 'contracts', label: 'Client Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Event Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_8', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Planners', view: 'cards' },
        ],
      },
      {
        id: 'tab_9', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'deposits', label: 'Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── DJ / ENTERTAINER ──────────────────────────────────────────────
  // Date-based availability (one gig per night). Song request management.
  // Event timeline coordination. Equipment tracking. MC services.
  dj: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Events', icon: 'people',
        components: [
          { id: 'clients', label: 'Gigs', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Availability Check', 'Consultation', 'Proposal Sent', 'Contract Signed', 'Deposit Paid', 'Planning', 'Event Day', 'Completed'] },
          { id: 'contacts', label: 'Clients', view: 'table' },
          { id: 'song_requests', label: 'Song Requests', view: 'list' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Gig Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'DJ Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-Ons', view: 'cards' },
          { id: 'event_timelines', label: 'Event Timelines', view: 'list' },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Event Highlights', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Equipment', icon: 'box', _removable: true,
        components: [
          { id: 'equipment', label: 'Sound & Lighting', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'DJs & MCs', view: 'cards' },
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

  // ── FLORIST ───────────────────────────────────────────────────────
  // Dual workflow: everyday orders (quick pipeline) and event florals
  // (consultation-to-setup). Delivery route management. Perishable inventory.
  // Seasonal availability. Subscription programs for recurring deliveries.
  florist: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Orders', icon: 'people',
        components: [
          { id: 'clients', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Received', 'Designing', 'Arranged', 'Ready', 'Out for Delivery', 'Delivered'] },
          { id: 'contacts', label: 'Customers', view: 'table' },
          { id: 'event_orders', label: 'Event Orders', view: 'pipeline',
            stages: ['Inquiry', 'Consultation', 'Proposal Sent', 'Approved', 'Deposit Paid', 'Flowers Ordered', 'Design Day', 'Setup', 'Completed'] },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Delivery & Events', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'arrangements', label: 'Arrangements', view: 'cards' },
          { id: 'event_packages', label: 'Event Packages', view: 'cards' },
          { id: 'subscriptions', label: 'Subscriptions', view: 'table' },
          { id: 'products', label: 'Plants & Gifts', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Arrangement Gallery', view: 'cards', _locked: true },
          { id: 'event_gallery', label: 'Event Florals', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Designers & Drivers', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'deposits', label: 'Event Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── GRAPHIC DESIGNER / FREELANCE CREATIVE ─────────────────────────
  // Project-based work: logo, brand identity, website, packaging, print.
  // Creative brief collection. Revision tracking with contractual limits.
  // File delivery management. Retainer clients for ongoing work.
  // Typically solo — Staff tab removable.
  graphic_designer: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Projects', icon: 'people',
        components: [
          { id: 'clients', label: 'Projects', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Discovery Call', 'Creative Brief', 'Proposal Sent', 'Contract Signed', 'Deposit Paid', 'Concepts', 'Feedback', 'Revisions', 'Approved', 'Files Delivered'] },
          { id: 'contacts', label: 'Clients', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Deadlines', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Packages', view: 'cards' },
          { id: 'questionnaires', label: 'Creative Briefs', view: 'table' },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Portfolio', view: 'cards', _locked: true },
          { id: 'case_studies', label: 'Case Studies', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Designers', view: 'cards' },
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

  // ── INTERIOR DESIGNER ─────────────────────────────────────────────
  // Product sourcing and procurement is the most complex workflow.
  // Multi-room project management. Mood board presentations.
  // Trade discount / markup tracking. Long lead times on furniture.
  // Installation coordination. Retainer + markup pricing.
  interior_designer: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Projects', icon: 'people',
        components: [
          { id: 'clients', label: 'Projects', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Consultation', 'Agreement Signed', 'Retainer Paid', 'Concept Development', 'Presentation', 'Client Approval', 'Sourcing', 'Procurement', 'Ordering', 'Installation', 'Styling', 'Reveal'] },
          { id: 'contacts', label: 'Clients', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Project Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Sourcing', icon: 'box',
        components: [
          { id: 'products', label: 'Product Selections', view: 'table', _locked: true },
          { id: 'purchase_orders', label: 'Purchase Orders', view: 'pipeline',
            stages: ['Quoted', 'Ordered', 'Shipped', 'Received', 'Installed'] },
          { id: 'vendors', label: 'Trade Vendors', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Design Packages', view: 'cards' },
          { id: 'contracts', label: 'Design Agreements', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'proposals', label: 'Proposals', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Design Portfolio', view: 'cards', _locked: true },
          { id: 'mood_boards', label: 'Mood Boards', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Designers', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'retainers', label: 'Retainers', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── MUSICIAN (SOLO) ───────────────────────────────────────────────
  // Gig-based booking. Song/setlist management. Equipment tracking.
  // Press kit / portfolio for booking agents. Merch sales.
  // Calendar prevents double-booking. Deposits hold dates.
  musician: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Gigs', icon: 'people',
        components: [
          { id: 'clients', label: 'Gigs', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Availability Check', 'Quote Sent', 'Contract Signed', 'Deposit Paid', 'Rehearsal', 'Performance Day', 'Completed'] },
          { id: 'contacts', label: 'Clients & Venues', view: 'table' },
          { id: 'setlists', label: 'Setlists', view: 'list' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Gig Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Performance Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-Ons', view: 'cards' },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Press Kit', view: 'cards', _locked: true },
          { id: 'media', label: 'Music & Videos', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Merch', icon: 'box', _removable: true,
        components: [
          { id: 'products', label: 'Merchandise', view: 'cards' },
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

  // ── BAND ──────────────────────────────────────────────────────────
  // Similar to musician but multi-member. Member management is key.
  // Shared calendar for availability. Setlists per event.
  // Split payments/earnings tracking. Merch sales.
  band: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Gigs', icon: 'people',
        components: [
          { id: 'clients', label: 'Gigs', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Availability Check', 'Quote Sent', 'Contract Signed', 'Deposit Paid', 'Rehearsal', 'Sound Check', 'Show Day', 'Completed'] },
          { id: 'contacts', label: 'Clients & Venues', view: 'table' },
          { id: 'setlists', label: 'Setlists', view: 'list' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Band Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Performance Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-Ons', view: 'cards' },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Press Kit', view: 'cards', _locked: true },
          { id: 'media', label: 'Music & Videos', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Members', icon: 'users',
        components: [
          { id: 'staff', label: 'Band Members', view: 'cards' },
          { id: 'equipment', label: 'Gear', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Merch', icon: 'box', _removable: true,
        components: [
          { id: 'products', label: 'Merchandise', view: 'cards' },
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

  // ── ART STUDIO ────────────────────────────────────────────────────
  // Classes/workshops + commissions + retail sales. Gallery is central.
  // Commission pipeline for custom work. Class scheduling via calendar.
  // Student/client management. Exhibits and shows tracking.
  art_studio: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Commissions', icon: 'people',
        components: [
          { id: 'clients', label: 'Commissions', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Consultation', 'Quote Sent', 'Deposit Paid', 'Sketching', 'In Progress', 'Review', 'Completed', 'Delivered'] },
          { id: 'contacts', label: 'Clients & Students', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Studio Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'classes', label: 'Classes & Workshops', view: 'cards' },
          { id: 'packages', label: 'Commission Packages', view: 'cards' },
          { id: 'products', label: 'Art & Prints', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Art Gallery', view: 'cards', _locked: true },
          { id: 'exhibits', label: 'Exhibits & Shows', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Artists & Instructors', view: 'cards' },
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

  // ── PRINT SHOP ────────────────────────────────────────────────────
  // Order-based workflow. Custom vs standard orders. Production tracking.
  // Proof approval pipeline. File upload management. Rush orders.
  // Pickup and delivery options.
  print_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Orders', icon: 'people',
        components: [
          { id: 'clients', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Received', 'Files Reviewed', 'Proof Sent', 'Proof Approved', 'In Production', 'Quality Check', 'Ready for Pickup', 'Completed'] },
          { id: 'contacts', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Production Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Print Services', view: 'cards' },
          { id: 'products', label: 'Products & Materials', view: 'table' },
          { id: 'custom_orders', label: 'Custom Design', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Work Samples', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Production Team', view: 'cards' },
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

  // ── CONTENT CREATOR ───────────────────────────────────────────────
  // Brand deal / sponsorship pipeline. Content calendar for posting schedule.
  // Media kit as portfolio. Deliverables tracking per campaign.
  // UGC, sponsored posts, affiliate partnerships. Rate card.
  content_creator: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Campaigns', icon: 'people',
        components: [
          { id: 'clients', label: 'Campaigns', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Negotiation', 'Contract Sent', 'Signed', 'Deposit Paid', 'Content Creation', 'Client Review', 'Revisions', 'Published', 'Reporting'] },
          { id: 'contacts', label: 'Brands & Clients', view: 'table' },
          { id: 'deliverables', label: 'Deliverables', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Content Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Rate Card', view: 'cards' },
          { id: 'add_ons', label: 'Content Add-Ons', view: 'cards' },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Portfolio', icon: 'image',
        components: [
          { id: 'galleries', label: 'Media Kit', view: 'cards', _locked: true },
          { id: 'content_samples', label: 'Content Samples', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Team', view: 'cards' },
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
};

// ── Generic aliases ──────────────────────────────────────────────────

// "creative" generic → graphic_designer (most common solo creative type)
TEMPLATES.creative = structuredClone(TEMPLATES.graphic_designer);

// "entertainer" → dj (most common entertainer type)
TEMPLATES.entertainer = structuredClone(TEMPLATES.dj);

// "wedding_photographer" → photographer (same pipeline, wedding-focused)
TEMPLATES.wedding_photographer = structuredClone(TEMPLATES.photographer);

// "event_photographer" → photographer (same pipeline, event-focused)
TEMPLATES.event_photographer = structuredClone(TEMPLATES.photographer);

// "film_maker" → videographer (same project pipeline)
TEMPLATES.film_maker = structuredClone(TEMPLATES.videographer);

// ── Public API ────────────────────────────────────────────────────────

/**
 * Get the full template config for a Creative & Events business type.
 * Returns { template, lockedIds } or null if not found.
 */
export function getCreativeEventsTemplate(businessType: string): TemplateResult | null {
  if (!CREATIVE_EVENTS_TYPES.has(businessType)) return null;

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
  const result = getCreativeEventsTemplate(businessType);
  if (!result) return null;
  return JSON.stringify(result.template, null, 2);
}
