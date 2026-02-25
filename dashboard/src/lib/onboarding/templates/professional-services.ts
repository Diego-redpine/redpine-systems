/**
 * Professional Services — Template Family
 *
 * Enterprise-first templates. Each business type has its OWN complete template.
 * AI customizes labels, removes _removable tabs, adds user-requested components.
 * Locked components (_locked: true) cannot be removed by AI.
 *
 * Covers: lawyer, law_firm, accountant, bookkeeper, tax_preparer, consultant,
 *         coaching, life_coach, business_coach, real_estate_agent, insurance_agent,
 *         financial_advisor, marketing_agency, web_agency, architecture_firm,
 *         notary, translator, staffing_agency, professional
 */

import type { TemplateConfig, TemplateResult } from './beauty-body';

// All business types in this family
export const PROFESSIONAL_SERVICES_TYPES = new Set([
  'lawyer', 'law_firm', 'accountant', 'bookkeeper', 'tax_preparer',
  'consultant', 'coaching', 'life_coach', 'business_coach',
  'real_estate_agent', 'insurance_agent', 'financial_advisor',
  'marketing_agency', 'web_agency', 'architecture_firm',
  'notary', 'translator', 'staffing_agency', 'professional',
]);

// ── Enterprise Templates ─────────────────────────────────────────────

const TEMPLATES: Record<string, TemplateConfig> = {

  // ── LAWYER / SOLO ATTORNEY ──────────────────────────────────────────
  // Pipeline follows case lifecycle: intake through resolution.
  // Matters tab is the core entity. Trust accounting and conflict checks
  // are critical compliance features. Documents tab for attorney-client
  // privileged files and engagement letters.
  lawyer: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Conflict Check', 'Consultation', 'Engagement Sent', 'Retainer Received', 'Active'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Cases', icon: 'briefcase',
        components: [
          { id: 'matters', label: 'Matters', view: 'table', _locked: true },
          { id: 'case_pipeline', label: 'Case Pipeline', view: 'pipeline',
            stages: ['Active', 'Discovery', 'Settlement/Trial Prep', 'Resolution', 'Closed', 'Follow-Up'] },
          { id: 'tasks', label: 'Tasks', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'practice_areas', label: 'Practice Areas', view: 'cards' },
          { id: 'consultations', label: 'Consultation Types', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table', _locked: true },
          { id: 'contracts', label: 'Engagement Letters', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Attorneys', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'trust_ledger', label: 'Trust / Retainer', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── ACCOUNTANT ──────────────────────────────────────────────────────
  // Tax season pipeline is the heartbeat. Engagement letters drive onboarding.
  // Documents tab critical for client document exchange (W-2s, 1099s, etc.).
  // Workflow tasks organized by engagement type (1040, 1120S, bookkeeping).
  accountant: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Prospect', 'Consultation', 'Proposal Sent', 'Signed', 'Onboarding', 'Active', 'Recurring'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'engagements', label: 'Engagements', view: 'cards' },
          { id: 'tax_services', label: 'Tax Services', view: 'cards' },
          { id: 'advisory', label: 'Advisory Services', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Workflow', icon: 'list',
        components: [
          { id: 'tasks', label: 'Tasks', view: 'list', _locked: true },
          { id: 'tax_returns', label: 'Tax Returns', view: 'pipeline',
            stages: ['Not Started', 'Documents Requested', 'In Progress', 'Review', 'E-Filed', 'Accepted'] },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table', _locked: true },
          { id: 'engagement_letters', label: 'Engagement Letters', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Accountants', view: 'cards' },
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

  // ── BOOKKEEPER ──────────────────────────────────────────────────────
  // Simpler than accountant — focuses on recurring monthly clients.
  // No tax return pipeline. Tasks-driven workflow for monthly close.
  bookkeeper: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Prospect', 'Consultation', 'Proposal Sent', 'Signed', 'Onboarding', 'Active Monthly'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-On Services', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Workflow', icon: 'list',
        components: [
          { id: 'tasks', label: 'Tasks', view: 'list', _locked: true },
          { id: 'monthly_close', label: 'Monthly Close', view: 'pipeline',
            stages: ['Bank Reconciliation', 'Categorization', 'Reports', 'Client Review', 'Closed'] },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table' },
          { id: 'contracts', label: 'Engagement Letters', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
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

  // ── TAX PREPARER ────────────────────────────────────────────────────
  // Seasonal-heavy: Jan-April is the sprint. Tax return pipeline is the core.
  // Document collection from clients is the primary bottleneck.
  tax_preparer: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['New', 'Documents Requested', 'Documents Received', 'In Preparation', 'Active', 'Returning'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'tax_services', label: 'Tax Services', view: 'cards' },
          { id: 'add_ons', label: 'Additional Services', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Tax Returns', icon: 'list',
        components: [
          { id: 'tax_returns', label: 'Returns', view: 'pipeline', _locked: true,
            stages: ['Not Started', 'Documents Pending', 'In Progress', 'Review', 'Client Approval', 'E-Filed', 'Accepted', 'Rejected'] },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table', _locked: true },
          { id: 'engagement_letters', label: 'Engagement Letters', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Tax Preparers', view: 'cards' },
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

  // ── CONSULTANT (BUSINESS CONSULTANT) ────────────────────────────────
  // Project-centric: proposals → contracts → deliverables → invoice.
  // Long sales cycle. Discovery call → proposal → negotiation is the pipeline.
  // Retainer or project-based billing. Sessions tracked on calendar.
  consultant: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Discovery Call', 'Proposal Sent', 'Negotiation', 'Signed', 'Active', 'Retainer'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Projects', icon: 'briefcase',
        components: [
          { id: 'projects', label: 'Engagements', view: 'pipeline',
            stages: ['Kickoff', 'In Progress', 'Milestone Delivery', 'Wrap-Up', 'Complete'] },
          { id: 'deliverables', label: 'Deliverables', view: 'table' },
          { id: 'tasks', label: 'Tasks', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Packages', view: 'cards' },
          { id: 'sessions', label: 'Session Types', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'proposals', label: 'Proposals', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Declined'] },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'documents', label: 'Documents', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Consultants', view: 'cards' },
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

  // ── COACHING (GENERIC COACH) ────────────────────────────────────────
  // Session-based model: discovery → enrollment → ongoing sessions.
  // Programs/packages are the service offering. Progress tracking per client.
  coaching: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Discovery Session', 'Enrolled', 'Active', 'Program Complete', 'Alumni'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'programs', label: 'Programs', view: 'cards' },
          { id: 'sessions', label: 'Session Types', view: 'cards' },
          { id: 'workshops', label: 'Workshops', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Documents', icon: 'file',
        components: [
          { id: 'contracts', label: 'Agreements', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'documents', label: 'Resources', view: 'table' },
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

  // ── LIFE COACH ──────────────────────────────────────────────────────
  // Deeper client journey than generic coaching. Transformation-oriented.
  // Discovery → goal-setting → active coaching → breakthrough → graduation.
  life_coach: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Discovery Call', 'Goal Setting', 'Active Coaching', 'Breakthrough', 'Graduation', 'Alumni'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'programs', label: 'Coaching Programs', view: 'cards' },
          { id: 'sessions', label: 'Session Types', view: 'cards' },
          { id: 'group_programs', label: 'Group Programs', view: 'cards' },
          { id: 'workshops', label: 'Workshops & Retreats', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Documents', icon: 'file',
        components: [
          { id: 'contracts', label: 'Coaching Agreements', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'documents', label: 'Resources & Workbooks', view: 'table' },
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

  // ── BUSINESS COACH ──────────────────────────────────────────────────
  // More structured than life coaching: deliverables, KPIs, accountability.
  // Closer to consultant but with session-based delivery.
  business_coach: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Strategy Session', 'Proposal Sent', 'Enrolled', 'Active', 'Graduated', 'Referral'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Programs', icon: 'briefcase',
        components: [
          { id: 'engagements', label: 'Active Engagements', view: 'pipeline',
            stages: ['Onboarding', 'Foundation', 'Growth Phase', 'Optimization', 'Wrap-Up'] },
          { id: 'deliverables', label: 'Deliverables', view: 'table' },
          { id: 'tasks', label: 'Action Items', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'programs', label: 'Coaching Programs', view: 'cards' },
          { id: 'sessions', label: 'Session Types', view: 'cards' },
          { id: 'masterminds', label: 'Masterminds', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'proposals', label: 'Proposals', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Declined'] },
          { id: 'contracts', label: 'Coaching Agreements', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'documents', label: 'Resources', view: 'table' },
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

  // ── REAL ESTATE AGENT ───────────────────────────────────────────────
  // Deal-centric: lead → showing → offer → contract → close.
  // Listings are the inventory. Commission tracking replaces standard billing.
  // Open houses and showings are the calendar events.
  real_estate_agent: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Qualified', 'Active Search', 'Showing', 'Offer Submitted', 'Under Contract', 'Closed'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Listings', icon: 'building',
        components: [
          { id: 'listings', label: 'Listings', view: 'cards', _locked: true },
          { id: 'listing_pipeline', label: 'Listing Pipeline', view: 'pipeline',
            stages: ['Listing Presentation', 'Price Agreement', 'Active', 'Showings', 'Offer Received', 'Under Contract', 'Closed'] },
        ],
      },
      {
        id: 'tab_4', label: 'Transactions', icon: 'briefcase',
        components: [
          { id: 'transactions', label: 'Deals', view: 'pipeline',
            stages: ['Offer Submitted', 'Under Contract', 'Inspection', 'Appraisal', 'Clear to Close', 'Closed'] },
          { id: 'commission', label: 'Commissions', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Services', icon: 'box',
        components: [
          { id: 'buyer_services', label: 'Buyer Services', view: 'cards' },
          { id: 'seller_services', label: 'Seller Services', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table' },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_8', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Agents', view: 'cards' },
        ],
      },
      {
        id: 'tab_9', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Marketing Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── INSURANCE AGENT ─────────────────────────────────────────────────
  // Policy-centric: lead → quote → bind → policy issued → renewal.
  // Renewal tracking is the recurring revenue engine. Multi-policy per client.
  // Commission from carriers, not direct billing.
  insurance_agent: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Policyholders', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Needs Assessment', 'Quote Sent', 'Application', 'Underwriting', 'Bound', 'Policy Issued'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Policies', icon: 'shield',
        components: [
          { id: 'policies', label: 'Active Policies', view: 'table', _locked: true },
          { id: 'renewals', label: 'Renewals', view: 'pipeline',
            stages: ['60+ Days', '30-60 Days', '< 30 Days', 'Re-Marketing', 'Renewed', 'Cancelled'] },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'insurance_products', label: 'Insurance Products', view: 'cards' },
          { id: 'carriers', label: 'Carriers', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table' },
          { id: 'applications', label: 'Applications', view: 'pipeline',
            stages: ['Draft', 'Submitted', 'Underwriting', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Agents', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'commissions', label: 'Commissions', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── FINANCIAL ADVISOR ───────────────────────────────────────────────
  // Household-centric: families with multiple accounts and goals.
  // Long sales cycle (weeks to months). Compliance-heavy (SEC/FINRA).
  // Annual review is the retention mechanism.
  financial_advisor: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Households', view: 'pipeline', _locked: true,
            stages: ['Referral', 'Intro Meeting', 'Discovery', 'Plan Presented', 'Implementation', 'Onboarded', 'Ongoing'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Accounts', icon: 'briefcase',
        components: [
          { id: 'accounts', label: 'Accounts', view: 'table', _locked: true },
          { id: 'financial_plans', label: 'Financial Plans', view: 'cards' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'planning_services', label: 'Planning Services', view: 'cards' },
          { id: 'investment_strategies', label: 'Investment Strategies', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table', _locked: true },
          { id: 'agreements', label: 'Advisory Agreements', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Advisors', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'fees', label: 'Advisory Fees', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── MARKETING AGENCY ────────────────────────────────────────────────
  // Project + account management hybrid. Creative workflow stages.
  // Retainer clients with monthly deliverables. Content calendar.
  // Team capacity planning is critical.
  marketing_agency: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Accounts', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Discovery', 'Pitch', 'Negotiation', 'Signed', 'Onboarding', 'Active'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Projects', icon: 'briefcase',
        components: [
          { id: 'projects', label: 'Projects', view: 'pipeline',
            stages: ['Brief', 'Strategy', 'Creative', 'Review', 'Revisions', 'Approved', 'Live'] },
          { id: 'tasks', label: 'Tasks', view: 'list' },
          { id: 'deliverables', label: 'Deliverables', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'services', label: 'Services', view: 'cards' },
          { id: 'retainer_plans', label: 'Retainer Plans', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'proposals', label: 'Proposals', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Declined'] },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'documents', label: 'Assets & Docs', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Team', view: 'cards' },
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

  // ── WEB AGENCY (WEB DESIGN / DEV AGENCY) ────────────────────────────
  // Project-heavy with clear phases: design → develop → launch.
  // Client approval workflows for mockups and staging sites.
  // Hosting/maintenance as recurring revenue.
  web_agency: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Discovery Call', 'Proposal Sent', 'Negotiation', 'Signed', 'Active', 'Maintenance'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Projects', icon: 'briefcase',
        components: [
          { id: 'projects', label: 'Projects', view: 'pipeline',
            stages: ['Discovery', 'Wireframes', 'Design', 'Development', 'QA', 'Staging Review', 'Launch', 'Post-Launch'] },
          { id: 'tasks', label: 'Tasks', view: 'list' },
          { id: 'bugs', label: 'Bug Tracker', view: 'pipeline',
            stages: ['Reported', 'Confirmed', 'In Progress', 'QA', 'Resolved'] },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'services', label: 'Services', view: 'cards' },
          { id: 'hosting_plans', label: 'Hosting & Maintenance', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'proposals', label: 'Proposals', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Declined'] },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'documents', label: 'Assets & Specs', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Developers & Designers', view: 'cards' },
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

  // ── ARCHITECTURE FIRM ───────────────────────────────────────────────
  // Phase-based project management following AIA standard phases.
  // Fee tracking per phase is critical for profitability.
  // Multi-consultant coordination. RFI/submittal tracking during construction.
  architecture_firm: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Proposal', 'Fee Agreement', 'Pre-Design', 'Active', 'Post-Occupancy'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Projects', icon: 'building',
        components: [
          { id: 'projects', label: 'Projects', view: 'pipeline', _locked: true,
            stages: ['Schematic Design', 'Design Development', 'Construction Docs', 'Permitting', 'Bidding', 'Construction Admin', 'Closeout'] },
          { id: 'tasks', label: 'Tasks', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'services', label: 'Services', view: 'cards' },
          { id: 'project_types', label: 'Project Types', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Drawings & Specs', view: 'table', _locked: true },
          { id: 'proposals', label: 'Fee Proposals', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Declined'] },
          { id: 'rfis', label: 'RFIs', view: 'pipeline',
            stages: ['Submitted', 'Under Review', 'Responded', 'Closed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Architects', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Reimbursables', view: 'table' },
        ],
      },
    ],
  },

  // ── NOTARY ──────────────────────────────────────────────────────────
  // Appointment-driven: signing sessions are the core product.
  // Mobile notary (travel) and in-office. Document tracking for notarial acts.
  // Simple pipeline: request → schedule → sign → complete.
  notary: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Request', 'Scheduled', 'Documents Received', 'Signing', 'Completed', 'Filed'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'services', label: 'Notary Services', view: 'cards' },
          { id: 'signing_types', label: 'Signing Types', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table', _locked: true },
          { id: 'notarial_journal', label: 'Notarial Journal', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'travel_fees', label: 'Travel Fees', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── TRANSLATOR / INTERPRETER ────────────────────────────────────────
  // Project-based: documents in → translated documents out.
  // Language pairs and specializations define services.
  // Interpreting (live) vs translation (document) are distinct service types.
  translator: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Quote Sent', 'Accepted', 'In Progress', 'Active', 'Recurring'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Projects', icon: 'briefcase',
        components: [
          { id: 'projects', label: 'Translation Projects', view: 'pipeline',
            stages: ['Received', 'In Translation', 'Proofreading', 'Quality Check', 'Delivered'] },
          { id: 'tasks', label: 'Tasks', view: 'list' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'translation_services', label: 'Translation Services', view: 'cards' },
          { id: 'interpreting', label: 'Interpreting Services', view: 'cards' },
          { id: 'specializations', label: 'Specializations', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table', _locked: true },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_7', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Translators', view: 'cards' },
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

  // ── STAFFING AGENCY / RECRUITING FIRM ───────────────────────────────
  // Two-sided marketplace: candidates and employers.
  // Pipeline tracks candidates through hiring process.
  // Job orders from employers define demand. Placement is the revenue event.
  staffing_agency: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Employers', view: 'pipeline', _locked: true,
            stages: ['Prospect', 'Outreach', 'Meeting', 'Contract Sent', 'Active Client', 'Inactive'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Candidates', icon: 'users',
        components: [
          { id: 'candidates', label: 'Candidates', view: 'pipeline', _locked: true,
            stages: ['Applied', 'Screening', 'Interviewed', 'Qualified', 'Submitted to Client', 'Client Interview', 'Offer', 'Placed'] },
          { id: 'talent_pool', label: 'Talent Pool', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Job Orders', icon: 'briefcase',
        components: [
          { id: 'job_orders', label: 'Job Orders', view: 'pipeline',
            stages: ['New', 'Sourcing', 'Submittals', 'Interviews', 'Offer Stage', 'Filled', 'Cancelled'] },
          { id: 'tasks', label: 'Tasks', view: 'list' },
        ],
      },
      {
        id: 'tab_5', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Services', icon: 'box',
        components: [
          { id: 'services', label: 'Staffing Services', view: 'cards' },
          { id: 'industries', label: 'Industries Served', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Documents', icon: 'file',
        components: [
          { id: 'documents', label: 'Documents', view: 'table' },
          { id: 'contracts', label: 'Contracts', view: 'pipeline',
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_8', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Recruiters', view: 'cards' },
        ],
      },
      {
        id: 'tab_9', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'placements', label: 'Placement Fees', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },
};

// ── Aliases ────────────────────────────────────────────────────────────

// "law_firm" clones "lawyer" (same template, just different alias)
TEMPLATES.law_firm = structuredClone(TEMPLATES.lawyer);

// Generic "professional" uses consultant template (most versatile default)
TEMPLATES.professional = structuredClone(TEMPLATES.consultant);

// ── Public API ────────────────────────────────────────────────────────

/**
 * Get the full template config for a Professional Services business type.
 * Returns { template, lockedIds } or null if not found.
 */
export function getProfessionalServicesTemplate(businessType: string): TemplateResult | null {
  if (!PROFESSIONAL_SERVICES_TYPES.has(businessType)) return null;

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
  const result = getProfessionalServicesTemplate(businessType);
  if (!result) return null;
  return JSON.stringify(result.template, null, 2);
}
