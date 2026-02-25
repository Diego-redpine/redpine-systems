/**
 * Health & Wellness — Template Family
 *
 * Enterprise-first templates. Each business type has its OWN complete template.
 * AI customizes labels, removes _removable tabs, adds user-requested components.
 * Locked components (_locked: true) cannot be removed by AI.
 *
 * Group A — Fitness/Wellness (Class-Based):
 *   gym, yoga_studio, pilates_studio, fitness_studio, dance_studio, martial_arts
 *
 * Group B — Fitness/Health (1-on-1 Coaching):
 *   personal_trainer, nutritionist
 *
 * Group C — Healthcare (Clinical):
 *   chiropractor, physical_therapy, acupuncture, therapist, counselor,
 *   massage_therapy, dentist, optometrist
 *
 * Catch-all: wellness_center, wellness
 */

import type { TemplateConfig, TemplateResult } from './beauty-body';

// All business types in this family
export const HEALTH_WELLNESS_TYPES = new Set([
  'yoga_studio',
  'pilates_studio',
  'gym',
  'fitness_studio',
  'personal_trainer',
  'martial_arts',
  'dance_studio',
  'chiropractor',
  'physical_therapy',
  'acupuncture',
  'nutritionist',
  'therapist',
  'counselor',
  'dentist',
  'optometrist',
  'massage_therapy',
  'wellness_center',
  'wellness',
]);

// ── Enterprise Templates ─────────────────────────────────────────────

const TEMPLATES: Record<string, TemplateConfig> = {

  // ── GYM ─────────────────────────────────────────────────────────────
  // Members, not clients. Classes/programs, not services.
  // Lead funnel pipeline. Membership tiers with auto-progress.
  // Coaches tab removable (solo trainer gyms exist).
  gym: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Members', icon: 'people',
        components: [
          { id: 'clients', label: 'Lead Funnel', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Trial / Guest Pass', 'Follow-Up', 'Signed Up', 'Active Member', 'At-Risk', 'Frozen', 'Cancelled'] },
          { id: 'contacts', label: 'All Members', view: 'table' },
          { id: 'membership_tiers', label: 'Membership Tiers', view: 'pipeline',
            stages: ['Day Pass', 'Basic', 'Premium', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Class Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Programs', icon: 'box',
        components: [
          { id: 'classes', label: 'Classes', view: 'cards' },
          { id: 'memberships', label: 'Membership Plans', view: 'cards' },
          { id: 'products', label: 'Retail / Merchandise', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Coaches', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Coaches', view: 'cards' },
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

  // ── YOGA STUDIO ─────────────────────────────────────────────────────
  // Students, not clients. Teachers, not staff. Class packs + memberships.
  // Workshop booking separate from regular schedule.
  yoga_studio: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Student Journey', view: 'pipeline', _locked: true,
            stages: ['New Lead', 'Intro Offer', 'Trial Class', 'Regular Student', 'Loyal Member', 'At-Risk', 'Lapsed'] },
          { id: 'contacts', label: 'All Students', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Newcomer', 'Regular', 'Dedicated', 'Yogi'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Class Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Classes & Pricing', icon: 'box',
        components: [
          { id: 'classes', label: 'Class Types', view: 'cards' },
          { id: 'packages', label: 'Class Packs & Memberships', view: 'cards' },
          { id: 'workshops', label: 'Workshops & Retreats', view: 'cards' },
          { id: 'products', label: 'Retail / Props', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Teachers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Teachers', view: 'cards' },
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

  // ── PILATES STUDIO ──────────────────────────────────────────────────
  // Mixed private + group. Equipment-specific scheduling (reformers).
  // 56% of studios rely on private training. Duet sessions are common.
  pilates_studio: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Client Journey', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Intro Session', 'Follow-Up', 'Package Purchase', 'Regular Client', 'Loyal (Auto-Renew)', 'At-Risk', 'Lapsed'] },
          { id: 'contacts', label: 'All Clients', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Sessions & Pricing', icon: 'box',
        components: [
          { id: 'private_sessions', label: 'Private Sessions', view: 'cards' },
          { id: 'group_classes', label: 'Group Classes', view: 'cards' },
          { id: 'packages', label: 'Packages & Memberships', view: 'cards' },
          { id: 'products', label: 'Retail / Accessories', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Instructors', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Instructors', view: 'cards' },
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

  // ── FITNESS STUDIO ──────────────────────────────────────────────────
  // Boutique fitness (F45, Barry's style). Class-based with memberships.
  // Blends gym + yoga patterns. Challenge/leaderboard focus for engagement.
  fitness_studio: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Members', icon: 'people',
        components: [
          { id: 'clients', label: 'Member Funnel', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Trial Class', 'Follow-Up', 'Signed Up', 'Active', 'At-Risk', 'Cancelled'] },
          { id: 'contacts', label: 'All Members', view: 'table' },
          { id: 'membership_tiers', label: 'Membership Tiers', view: 'pipeline',
            stages: ['Trial', 'Core', 'Unlimited', 'Elite'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Class Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Classes & Pricing', icon: 'box',
        components: [
          { id: 'classes', label: 'Class Types', view: 'cards' },
          { id: 'packages', label: 'Class Packs & Memberships', view: 'cards' },
          { id: 'products', label: 'Retail / Merchandise', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Trainers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Trainers', view: 'cards' },
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

  // ── PERSONAL TRAINER ────────────────────────────────────────────────
  // 1-on-1 coaching model. Client progress tracking is core.
  // Workout programs, nutrition, progress photos, body metrics.
  // Solo-first — no Staff tab by default.
  personal_trainer: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Client Journey', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Free Consultation', 'Assessment', 'Trial Session', 'Package Purchase', 'Active Client', 'Progressing', 'At-Risk', 'Completed Program'] },
          { id: 'contacts', label: 'All Clients', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Workouts', icon: 'box',
        components: [
          { id: 'workout_programs', label: 'Workout Programs', view: 'cards' },
          { id: 'exercises', label: 'Exercise Library', view: 'table' },
          { id: 'session_packages', label: 'Session Packages', view: 'cards' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Session Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Progress', icon: 'image',
        components: [
          { id: 'galleries', label: 'Progress Photos', view: 'cards', _locked: true },
          { id: 'body_metrics', label: 'Body Metrics', view: 'table' },
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

  // ── MARTIAL ARTS ────────────────────────────────────────────────────
  // Belt/rank progression is central. Students, not clients.
  // Class-based with testing events. Waivers are critical (liability).
  martial_arts: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Student Funnel', view: 'pipeline', _locked: true,
            stages: ['Lead', 'Trial Class', 'Enrolled', 'Active', 'Testing', 'Advanced', 'At-Risk', 'Inactive'] },
          { id: 'contacts', label: 'All Students', view: 'table' },
          { id: 'ranks', label: 'Belt Progression', view: 'pipeline',
            stages: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown', 'Black'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Class Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Programs', icon: 'box',
        components: [
          { id: 'classes', label: 'Class Programs', view: 'cards' },
          { id: 'packages', label: 'Memberships & Packs', view: 'cards' },
          { id: 'products', label: 'Gear & Equipment', view: 'table' },
          { id: 'waivers', label: 'Waivers', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Instructors', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Instructors', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'testing_fees', label: 'Testing Fees', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── DANCE STUDIO ────────────────────────────────────────────────────
  // Students with class-level grouping (beginner/intermediate/advanced).
  // Recitals and performances are key events. Costumes as retail.
  dance_studio: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Student Pipeline', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Trial Class', 'Enrolled', 'Active', 'Performing', 'At-Risk', 'Inactive'] },
          { id: 'contacts', label: 'All Students', view: 'table' },
          { id: 'levels', label: 'Skill Levels', view: 'pipeline',
            stages: ['Beginner', 'Intermediate', 'Advanced', 'Pre-Professional'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Class Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Classes & Pricing', icon: 'box',
        components: [
          { id: 'classes', label: 'Dance Classes', view: 'cards' },
          { id: 'packages', label: 'Tuition & Packs', view: 'cards' },
          { id: 'events', label: 'Recitals & Performances', view: 'cards' },
          { id: 'products', label: 'Costumes & Merchandise', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Performance Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Instructors', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Instructors', view: 'cards' },
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

  // ── CHIROPRACTOR ────────────────────────────────────────────────────
  // Patients, not clients. HIPAA-required. SOAP notes are core.
  // Care plan progression (Acute → Corrective → Wellness).
  // Insurance billing with CPT/ICD-10 codes.
  chiropractor: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Patients', icon: 'people',
        components: [
          { id: 'clients', label: 'Care Plan', view: 'pipeline', _locked: true,
            stages: ['New Patient', 'Initial Evaluation', 'Acute / Relief Care', 'Corrective Care', 'Wellness / Maintenance', 'Discharge', 'Recall'] },
          { id: 'contacts', label: 'All Patients', view: 'table' },
          { id: 'intake_forms', label: 'Intake Forms', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'treatments', label: 'Treatments & Adjustments', view: 'cards' },
          { id: 'treatment_plans', label: 'Treatment Plans', view: 'table' },
          { id: 'products', label: 'Supplements & Orthotics', view: 'table' },
          { id: 'waivers', label: 'Consent Forms', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Charting', icon: 'document',
        components: [
          { id: 'soap_notes', label: 'SOAP Notes', view: 'table' },
          { id: 'imaging', label: 'X-Rays & Imaging', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Providers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Providers', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Billing', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'insurance_claims', label: 'Insurance Claims', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── PHYSICAL THERAPY ────────────────────────────────────────────────
  // Patients with referral-based intake. HIPAA-required.
  // Home Exercise Programs (HEP) are a core differentiator.
  // Outcomes tracking with standardized assessments.
  // Treatment plan pipeline from evaluation through discharge.
  physical_therapy: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Patients', icon: 'people',
        components: [
          { id: 'clients', label: 'Treatment Plan', view: 'pipeline', _locked: true,
            stages: ['Referral Received', 'Initial Evaluation', 'Active Treatment', 'Progress Re-eval', 'Reduced Frequency', 'Discharge Planning', 'Discharged', 'Follow-Up'] },
          { id: 'contacts', label: 'All Patients', view: 'table' },
          { id: 'referrals', label: 'Referrals', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'treatments', label: 'Therapies & Treatments', view: 'cards' },
          { id: 'hep', label: 'Home Exercise Programs', view: 'cards' },
          { id: 'exercises', label: 'Exercise Library', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Documentation', icon: 'document',
        components: [
          { id: 'soap_notes', label: 'Documentation', view: 'table' },
          { id: 'outcomes', label: 'Outcomes & Assessments', view: 'table' },
          { id: 'waivers', label: 'Consent Forms', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_6', label: 'Therapists', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Therapists', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Billing', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'insurance_claims', label: 'Insurance Claims', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── ACUPUNCTURE ─────────────────────────────────────────────────────
  // Patients. HIPAA-required. TCM-specific charting.
  // Herbal pharmacy is a core differentiator.
  // Treatment series with decreasing frequency over time.
  acupuncture: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Patients', icon: 'people',
        components: [
          { id: 'clients', label: 'Treatment Plan', view: 'pipeline', _locked: true,
            stages: ['New Patient', 'Initial Consultation', 'Treatment Series (Weekly)', 'Re-evaluation', 'Reduced Frequency', 'Maintenance (Monthly)', 'Seasonal Tune-Up', 'Discharged'] },
          { id: 'contacts', label: 'All Patients', view: 'table' },
          { id: 'intake_forms', label: 'Intake Forms', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'treatments', label: 'Treatments & Sessions', view: 'cards' },
          { id: 'herbal_formulas', label: 'Herbal Pharmacy', view: 'table' },
          { id: 'products', label: 'Herbs & Supplements', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Charting', icon: 'document',
        components: [
          { id: 'soap_notes', label: 'Chart Notes (SOAP + TCM)', view: 'table' },
          { id: 'treatment_records', label: 'Points & Modalities', view: 'table' },
          { id: 'waivers', label: 'Consent Forms', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_6', label: 'Practitioners', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Practitioners', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Billing', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'insurance_claims', label: 'Insurance Claims', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── NUTRITIONIST / DIETITIAN ────────────────────────────────────────
  // 1-on-1 coaching with clinical elements. Protocols are core.
  // Meal plans, food journals, lab results. Telehealth-heavy.
  nutritionist: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Client Journey', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Discovery Call', 'Initial Consultation', 'Assessment', 'Active Protocol', 'Follow-Up Phase', 'Maintenance', 'Program Complete'] },
          { id: 'contacts', label: 'All Clients', view: 'table' },
          { id: 'intake_forms', label: 'Intake Assessments', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Protocols', icon: 'box',
        components: [
          { id: 'protocols', label: 'Treatment Protocols', view: 'cards' },
          { id: 'meal_plans', label: 'Meal Plans', view: 'cards' },
          { id: 'programs', label: 'Group Programs', view: 'cards' },
          { id: 'products', label: 'Supplements', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Charting', icon: 'document',
        components: [
          { id: 'soap_notes', label: 'Session Notes', view: 'table' },
          { id: 'lab_results', label: 'Lab Results', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Billing', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── THERAPIST (MENTAL HEALTH) ───────────────────────────────────────
  // Clients (therapy term, not patients). HIPAA-required.
  // Progress notes, treatment plans, measures/assessments.
  // Insurance billing with superbills. Telehealth is standard.
  // Calendar is the central view (SimplePractice pattern).
  therapist: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Calendar', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Session Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_3', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Client Journey', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Intake / Assessment', 'Treatment Planning', 'Active Treatment', 'Progress Review', 'Maintenance', 'Termination', 'Post-Treatment Follow-Up'] },
          { id: 'contacts', label: 'All Clients', view: 'table' },
          { id: 'intake_forms', label: 'Intake Assessments', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Notes', icon: 'document',
        components: [
          { id: 'progress_notes', label: 'Progress Notes', view: 'table' },
          { id: 'treatment_plans', label: 'Treatment Plans', view: 'table' },
          { id: 'measures', label: 'Measures & Assessments', view: 'table' },
          { id: 'waivers', label: 'Consent & Intake Forms', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'session_types', label: 'Session Types', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Clinicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Clinicians', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Billing', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'insurance_claims', label: 'Insurance Claims', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── MASSAGE THERAPY ─────────────────────────────────────────────────
  // Clients. SOAP notes with body charts. Treatment packages for retention.
  // Solo-first model (most massage therapists work alone).
  // Intake forms with contraindication screening.
  massage_therapy: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Client Journey', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'First Appointment', 'Post-Session Follow-Up', 'Regular Client', 'Package Purchase', 'Loyal Client', 'Decreased Visits', 'Lapsed'] },
          { id: 'contacts', label: 'All Clients', view: 'table' },
          { id: 'intake_forms', label: 'Health History & Intake', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'modalities', label: 'Modalities & Services', view: 'cards' },
          { id: 'packages', label: 'Treatment Packages', view: 'cards' },
          { id: 'gift_certificates', label: 'Gift Certificates', view: 'table' },
          { id: 'products', label: 'Retail Products', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'SOAP Notes', icon: 'document',
        components: [
          { id: 'soap_notes', label: 'Treatment Notes', view: 'table' },
          { id: 'waivers', label: 'Consent Forms', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_6', label: 'Therapists', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Therapists', view: 'cards' },
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

  // ── DENTIST ─────────────────────────────────────────────────────────
  // Patients. HIPAA-required. Insurance-heavy. Treatment plans with
  // multiple procedures. Recall system for cleanings/checkups.
  // Imaging (X-rays) is core. High-volume short appointments.
  dentist: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Patients', icon: 'people',
        components: [
          { id: 'clients', label: 'Patient Flow', view: 'pipeline', _locked: true,
            stages: ['New Patient', 'Exam & Cleaning', 'Treatment Plan Presented', 'Treatment In Progress', 'Treatment Complete', 'Recall Due', 'Overdue', 'Inactive'] },
          { id: 'contacts', label: 'All Patients', view: 'table' },
          { id: 'intake_forms', label: 'Medical History Forms', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'procedures', label: 'Procedures & Services', view: 'cards' },
          { id: 'treatment_plans', label: 'Treatment Plans', view: 'table' },
          { id: 'products', label: 'Dental Products', view: 'table' },
          { id: 'waivers', label: 'Consent Forms', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Charting', icon: 'document',
        components: [
          { id: 'clinical_notes', label: 'Clinical Notes', view: 'table' },
          { id: 'imaging', label: 'X-Rays & Imaging', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Dental Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Billing', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'insurance_claims', label: 'Insurance Claims', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── OPTOMETRIST ─────────────────────────────────────────────────────
  // Patients. HIPAA-required. Insurance billing + optical retail.
  // Exams + prescriptions + eyewear dispensing.
  // Recall system for annual exams. Frame/lens inventory.
  optometrist: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Patients', icon: 'people',
        components: [
          { id: 'clients', label: 'Patient Flow', view: 'pipeline', _locked: true,
            stages: ['New Patient', 'Exam Scheduled', 'Exam Complete', 'Rx Issued', 'Eyewear Order', 'Dispensed', 'Recall Due', 'Overdue'] },
          { id: 'contacts', label: 'All Patients', view: 'table' },
          { id: 'intake_forms', label: 'Medical History Forms', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'exam_types', label: 'Exam Types', view: 'cards' },
          { id: 'prescriptions', label: 'Prescriptions', view: 'table' },
          { id: 'waivers', label: 'Consent Forms', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Optical Shop', icon: 'image',
        components: [
          { id: 'frames', label: 'Frames', view: 'cards' },
          { id: 'lenses', label: 'Lenses & Contacts', view: 'table' },
          { id: 'orders', label: 'Eyewear Orders', view: 'pipeline',
            stages: ['Ordered', 'Lab Processing', 'Ready for Pickup', 'Dispensed'] },
        ],
      },
      {
        id: 'tab_6', label: 'Charting', icon: 'document',
        components: [
          { id: 'clinical_notes', label: 'Clinical Notes', view: 'table' },
          { id: 'imaging', label: 'Imaging & Scans', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Providers & Opticians', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Billing', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'insurance_claims', label: 'Insurance & Vision Plans', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── WELLNESS CENTER ─────────────────────────────────────────────────
  // Catch-all for holistic/integrative wellness businesses.
  // Blends spa amenities with health coaching.
  // Memberships + services + retail supplements.
  wellness_center: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Client Journey', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Consultation', 'First Visit', 'Active Client', 'Regular', 'Loyal Member', 'At-Risk', 'Inactive'] },
          { id: 'contacts', label: 'All Clients', view: 'table' },
          { id: 'loyalty', label: 'Membership Tiers', view: 'pipeline',
            stages: ['Visitor', 'Member', 'Premium', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments & Classes', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'treatments', label: 'Treatments & Therapies', view: 'cards' },
          { id: 'classes', label: 'Classes & Workshops', view: 'cards' },
          { id: 'memberships', label: 'Membership Plans', view: 'cards' },
          { id: 'products', label: 'Supplements & Retail', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Practitioners', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Practitioners', view: 'cards' },
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
};

// "counselor" uses the same template as "therapist" (same clinical workflow)
TEMPLATES.counselor = structuredClone(TEMPLATES.therapist);

// Generic "wellness" aliases to wellness_center
TEMPLATES.wellness = structuredClone(TEMPLATES.wellness_center);

// ── Public API ────────────────────────────────────────────────────────

/**
 * Get the full template config for a Health & Wellness business type.
 * Returns { template, lockedIds } or null if not found.
 */
export function getHealthWellnessTemplate(businessType: string): TemplateResult | null {
  if (!HEALTH_WELLNESS_TYPES.has(businessType)) return null;

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
  const result = getHealthWellnessTemplate(businessType);
  if (!result) return null;
  return JSON.stringify(result.template, null, 2);
}
