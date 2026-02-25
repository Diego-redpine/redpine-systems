/**
 * Education & Childcare — Template Family
 *
 * Enterprise-first templates. Each business type has its OWN complete template.
 * AI customizes labels, removes _removable tabs, adds user-requested components.
 * Locked components (_locked: true) cannot be removed by AI.
 *
 * Covers: tutoring, music_school, daycare, preschool,
 *         after_school, driving_school, language_school,
 *         swim_school, test_prep, cooking_class, art_class, coding_bootcamp,
 *         education, childcare
 */

import type { TemplateConfig, TemplateResult } from './beauty-body';

// All business types in this family
export const EDUCATION_CHILDCARE_TYPES = new Set([
  'tutoring', 'music_school', 'daycare', 'preschool',
  'after_school', 'driving_school', 'language_school',
  'swim_school', 'test_prep', 'cooking_class', 'art_class', 'coding_bootcamp',
  'education', 'childcare',
]);

// ── Enterprise Templates ─────────────────────────────────────────────

const TEMPLATES: Record<string, TemplateConfig> = {

  // ── TUTORING CENTER / PRIVATE TUTOR ─────────────────────────────
  // Parent/guardian as billing contact, student as service recipient.
  // Package-based billing, session tracking, progress reports.
  tutoring: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Assessment', 'Package Selected', 'Enrolled', 'Active', 'Re-Enrollment'] },
          { id: 'contacts', label: 'Students', view: 'table' },
          { id: 'families', label: 'Families', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Lesson Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Subjects', icon: 'box',
        components: [
          { id: 'packages', label: 'Subjects & Sessions', view: 'cards' },
          { id: 'session_packages', label: 'Session Packages', view: 'cards' },
          { id: 'products', label: 'Study Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Progress', icon: 'chart',
        components: [
          { id: 'assessments', label: 'Assessments', view: 'table' },
          { id: 'progress_notes', label: 'Session Notes', view: 'list' },
        ],
      },
      {
        id: 'tab_6', label: 'Tutors', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Tutors', view: 'cards' },
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

  // ── MUSIC SCHOOL / LESSONS ──────────────────────────────────────
  // Private lessons + group classes. Recital management.
  // Monthly tuition model, instrument tracking, practice logs.
  music_school: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Trial Lesson', 'Enrolled', 'Active', 'Recital Ready', 'Continuing', 'Level Advancement'] },
          { id: 'contacts', label: 'Students', view: 'table' },
          { id: 'families', label: 'Families', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Lesson Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Programs', icon: 'box',
        components: [
          { id: 'private_lessons', label: 'Private Lessons', view: 'cards' },
          { id: 'group_classes', label: 'Group Classes', view: 'cards' },
          { id: 'products', label: 'Instruments & Supplies', view: 'table' },
          { id: 'rentals', label: 'Instrument Rentals', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Performances', icon: 'star',
        components: [
          { id: 'recitals', label: 'Recitals & Events', view: 'calendar' },
          { id: 'practice_log', label: 'Practice Log', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Teachers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Teachers', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Tuition & Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── DAYCARE / CHILDCARE CENTER ──────────────────────────────────
  // Daily attendance, staff-to-child ratios, daily reports to parents.
  // Safety and licensing compliance are critical.
  daycare: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Families', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Tour Scheduled', 'Tour Complete', 'Application', 'Waitlist', 'Enrolled', 'Acclimation', 'Active'] },
          { id: 'contacts', label: 'Children', view: 'table' },
          { id: 'families', label: 'Families', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Daily Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Classrooms', icon: 'box',
        components: [
          { id: 'classrooms', label: 'Classrooms', view: 'cards' },
          { id: 'attendance', label: 'Check-In / Check-Out', view: 'table', _locked: true },
          { id: 'daily_reports', label: 'Daily Reports', view: 'list' },
        ],
      },
      {
        id: 'tab_5', label: 'Compliance', icon: 'shield',
        components: [
          { id: 'immunizations', label: 'Immunizations', view: 'table' },
          { id: 'waivers', label: 'Forms & Waivers', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'meal_tracking', label: 'Meal Tracking', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Teachers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Teachers & Aides', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Tuition & Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── PRESCHOOL ───────────────────────────────────────────────────
  // Similar to daycare but more curriculum-focused. Age 3-5.
  // Developmental milestones, lesson plans, parent conferences.
  preschool: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Families', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Tour Scheduled', 'Tour Complete', 'Application', 'Waitlist', 'Accepted', 'Enrolled', 'Active'] },
          { id: 'contacts', label: 'Children', view: 'table' },
          { id: 'families', label: 'Families', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'School Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Curriculum', icon: 'box',
        components: [
          { id: 'classrooms', label: 'Classrooms', view: 'cards' },
          { id: 'lesson_plans', label: 'Lesson Plans', view: 'list' },
          { id: 'milestones', label: 'Developmental Milestones', view: 'table' },
          { id: 'attendance', label: 'Attendance', view: 'table', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Compliance', icon: 'shield',
        components: [
          { id: 'immunizations', label: 'Immunizations', view: 'table' },
          { id: 'waivers', label: 'Forms & Waivers', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'daily_reports', label: 'Daily Reports', view: 'list' },
        ],
      },
      {
        id: 'tab_6', label: 'Teachers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Teachers & Aides', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Tuition & Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── AFTER SCHOOL PROGRAM ────────────────────────────────────────
  // Structured activities after school hours. Pickup coordination.
  // Homework help, enrichment activities, snacks/meals.
  after_school: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Families', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Registration', 'Enrolled', 'Active', 'Summer Program', 'Re-Enrollment'] },
          { id: 'contacts', label: 'Children', view: 'table' },
          { id: 'families', label: 'Families', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Program Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Programs', icon: 'box',
        components: [
          { id: 'activities', label: 'Activities & Clubs', view: 'cards' },
          { id: 'attendance', label: 'Check-In / Pickup', view: 'table', _locked: true },
          { id: 'daily_reports', label: 'Daily Reports', view: 'list' },
        ],
      },
      {
        id: 'tab_5', label: 'Compliance', icon: 'shield',
        components: [
          { id: 'waivers', label: 'Forms & Waivers', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Signed'] },
          { id: 'medical_info', label: 'Medical & Allergies', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Staff', view: 'cards' },
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

  // ── DRIVING SCHOOL ──────────────────────────────────────────────
  // Behind-the-wheel + classroom. Vehicle fleet management.
  // Certificate generation, DMV compliance, zone-based routing.
  driving_school: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Registration', 'Permit Obtained', 'Classroom', 'Behind-the-Wheel', 'Hours Complete', 'Road Test Prep', 'Certificate Issued'] },
          { id: 'contacts', label: 'Students', view: 'table' },
          { id: 'families', label: 'Families', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Lesson Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Programs', icon: 'box',
        components: [
          { id: 'packages', label: 'Driving Programs', view: 'cards' },
          { id: 'classroom_sessions', label: 'Classroom Sessions', view: 'calendar' },
          { id: 'products', label: 'Study Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Fleet', icon: 'truck',
        components: [
          { id: 'vehicles', label: 'Vehicles', view: 'cards' },
          { id: 'certificates', label: 'Certificates', view: 'table' },
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

  // ── LANGUAGE SCHOOL ─────────────────────────────────────────────
  // CEFR level tracking (A1-C2). Placement testing, course progression.
  // Group + private lessons, certification exam prep.
  language_school: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Placement Test', 'Level Assigned', 'Enrolled', 'Active', 'Mid-Course Assessment', 'Course Complete', 'Next Level'] },
          { id: 'contacts', label: 'Students', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Class Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Courses', icon: 'box',
        components: [
          { id: 'courses', label: 'Course Catalog', view: 'cards' },
          { id: 'assessments', label: 'Assessments & Placement', view: 'table' },
          { id: 'products', label: 'Textbooks & Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Progression', icon: 'chart',
        components: [
          { id: 'level_progression', label: 'Level Progression', view: 'pipeline',
            stages: ['A1 Beginner', 'A2 Elementary', 'B1 Intermediate', 'B2 Upper-Intermediate', 'C1 Advanced', 'C2 Proficient'],
            _auto_progress: true },
          { id: 'attendance', label: 'Attendance', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Teachers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Teachers', view: 'cards' },
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

  // ── SWIM SCHOOL / AQUATICS ──────────────────────────────────────
  // Level-based skill progression (Red Cross Learn-to-Swim).
  // Small class sizes, lane management, safety compliance.
  swim_school: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Swimmers', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Water Assessment', 'Level Assigned', 'Session Enrolled', 'Active', 'Skill Evaluation', 'Level Advancement', 'Next Session'] },
          { id: 'contacts', label: 'Swimmers', view: 'table' },
          { id: 'families', label: 'Families', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Class Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Swim Levels', icon: 'box',
        components: [
          { id: 'level_catalog', label: 'Swim Levels & Classes', view: 'cards' },
          { id: 'private_lessons', label: 'Private Lessons', view: 'cards' },
          { id: 'products', label: 'Swim Gear', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Skill Tracking', icon: 'chart',
        components: [
          { id: 'skill_progression', label: 'Skill Progression', view: 'pipeline', _locked: true,
            stages: ['Parent-Tot', 'Water Exploration', 'Beginner', 'Intermediate', 'Advanced', 'Competitive Prep'],
            _auto_progress: true },
          { id: 'evaluations', label: 'Evaluations', view: 'table' },
          { id: 'attendance', label: 'Attendance', view: 'table' },
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

  // ── TEST PREP CENTER ────────────────────────────────────────────
  // SAT, ACT, GRE, GMAT, LSAT, MCAT preparation.
  // Score tracking, diagnostic tests, timed practice sessions.
  test_prep: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Diagnostic Test', 'Plan Created', 'Enrolled', 'Active Prep', 'Practice Tests', 'Test Day Prep', 'Completed'] },
          { id: 'contacts', label: 'Students', view: 'table' },
          { id: 'families', label: 'Families', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Session Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Programs', icon: 'box',
        components: [
          { id: 'packages', label: 'Test Prep Programs', view: 'cards' },
          { id: 'practice_tests', label: 'Practice Tests', view: 'table' },
          { id: 'products', label: 'Study Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Scores', icon: 'chart',
        components: [
          { id: 'score_tracking', label: 'Score Tracking', view: 'table' },
          { id: 'diagnostics', label: 'Diagnostics', view: 'table' },
          { id: 'progress_notes', label: 'Session Notes', view: 'list' },
        ],
      },
      {
        id: 'tab_6', label: 'Tutors', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Tutors', view: 'cards' },
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

  // ── COOKING CLASS / CULINARY SCHOOL ─────────────────────────────
  // Class-based enrollment, recipe management, ingredient prep.
  // Group classes, private lessons, special event cooking.
  cooking_class: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Trial Class', 'Enrolled', 'Active', 'Series Complete', 'Advanced Classes', 'Re-Enrollment'] },
          { id: 'contacts', label: 'Students', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Class Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Classes', icon: 'box',
        components: [
          { id: 'class_catalog', label: 'Class Catalog', view: 'cards' },
          { id: 'series', label: 'Class Series', view: 'cards' },
          { id: 'private_events', label: 'Private Events', view: 'cards' },
          { id: 'products', label: 'Supplies & Kits', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Recipes', icon: 'book',
        components: [
          { id: 'recipes', label: 'Recipe Library', view: 'cards' },
          { id: 'attendance', label: 'Attendance', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Chefs', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Chefs & Instructors', view: 'cards' },
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

  // ── ART CLASS / ART STUDIO ──────────────────────────────────────
  // Painting, drawing, ceramics, sculpture. Class-based + open studio.
  // Portfolio building, exhibitions, supply management.
  art_class: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Trial Class', 'Enrolled', 'Active', 'Exhibition Ready', 'Continuing', 'Advanced'] },
          { id: 'contacts', label: 'Students', view: 'table' },
          { id: 'families', label: 'Families', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Class Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Classes', icon: 'box',
        components: [
          { id: 'class_catalog', label: 'Class Catalog', view: 'cards' },
          { id: 'workshops', label: 'Workshops & Camps', view: 'cards' },
          { id: 'products', label: 'Art Supplies', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Student Gallery', view: 'cards', _locked: true },
          { id: 'exhibitions', label: 'Exhibitions & Shows', view: 'calendar' },
          { id: 'attendance', label: 'Attendance', view: 'table' },
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

  // ── CODING BOOTCAMP ─────────────────────────────────────────────
  // Intensive programs, cohort-based, project tracking.
  // Curriculum modules, career prep, portfolio building.
  coding_bootcamp: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Students', icon: 'people',
        components: [
          { id: 'clients', label: 'Enrollment', view: 'pipeline', _locked: true,
            stages: ['Application', 'Technical Assessment', 'Interview', 'Accepted', 'Enrolled', 'Active', 'Capstone', 'Job Search', 'Placed'] },
          { id: 'contacts', label: 'Students', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Cohort Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Curriculum', icon: 'box',
        components: [
          { id: 'programs', label: 'Programs', view: 'cards' },
          { id: 'modules', label: 'Modules & Units', view: 'table' },
          { id: 'projects', label: 'Student Projects', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Progress', icon: 'chart',
        components: [
          { id: 'cohort_progress', label: 'Cohort Progress', view: 'pipeline',
            stages: ['Fundamentals', 'Frontend', 'Backend', 'Full Stack', 'Capstone Project', 'Career Prep'],
            _auto_progress: true },
          { id: 'assessments', label: 'Assessments', view: 'table' },
          { id: 'attendance', label: 'Attendance', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Instructors', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Instructors & TAs', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Tuition & Invoices', view: 'table', _locked: true },
          { id: 'payment_plans', label: 'Payment Plans', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },
};

// Generic aliases — clone a sensible default for each
TEMPLATES.education = structuredClone(TEMPLATES.tutoring);
TEMPLATES.childcare = structuredClone(TEMPLATES.daycare);

// ── Public API ────────────────────────────────────────────────────────

/**
 * Get the full template config for an Education & Childcare business type.
 * Returns { template, lockedIds } or null if not found.
 */
export function getEducationChildcareTemplate(businessType: string): TemplateResult | null {
  if (!EDUCATION_CHILDCARE_TYPES.has(businessType)) return null;

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
  const result = getEducationChildcareTemplate(businessType);
  if (!result) return null;
  return JSON.stringify(result.template, null, 2);
}
