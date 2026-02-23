/**
 * Config validation & transformation functions.
 * Ported from onboarding/app.py lines 164-524.
 *
 * These enforce structural rules on AI-generated configs:
 * - ONE calendar per platform
 * - Tab limit of 8
 * - Gallery injection for visual industries
 * - Pipeline stage color inference (including dual-color belts)
 * - Color validation with industry fallbacks
 * - Locked component re-injection
 * - Internal flag stripping
 */

import { getColorDefaults, BAD_BUTTON_COLORS } from './color-defaults';
import type { PipelineStage } from '@/types/config';

// ── Local types ─────────────────────────────────────────────────────────
// Loose shapes that match AI-generated JSON before it becomes DashboardConfig.
// We use these instead of the strict types because validation runs BEFORE
// the config is fully normalized.

interface RawComponent {
  id: string;
  label: string;
  view?: string;
  stages?: (string | RawStageDict)[];
  pipeline?: RawPipelineConfig;
  _locked?: boolean;
  _removable?: boolean;
  [key: string]: unknown;
}

interface RawStageDict {
  name?: string;
  color?: string;
  color_secondary?: string;
  [key: string]: unknown;
}

interface RawPipelineConfig {
  stages?: (PipelineStage | RawStageDict)[];
  default_stage_id?: string;
  [key: string]: unknown;
}

interface RawTab {
  id: string;
  label: string;
  icon?: string;
  _removable?: boolean;
  components: RawComponent[];
  [key: string]: unknown;
}

export interface RawConfig {
  business_name?: string;
  business_type?: string;
  tabs?: RawTab[];
  colors?: Record<string, string>;
  [key: string]: unknown;
}

// ── Constants ───────────────────────────────────────────────────────────

/** Component IDs that default to calendar view. */
const CALENDAR_COMPONENT_IDS = new Set([
  'calendar', 'appointments', 'schedules', 'shifts', 'classes', 'reservations',
]);

/** Calendar-entity component IDs that are redundant when a calendar-view exists
 *  (the calendar's built-in filter chips already cover these). */
const REDUNDANT_WITH_CALENDAR = new Set([
  'appointments', 'schedules', 'shifts', 'classes', 'reservations',
]);

/** Maximum number of tabs (including Dashboard). */
const MAX_TABS = 8;

/** Industries that MUST have a gallery or portfolio component. */
const GALLERY_REQUIRED_TYPES = new Set([
  'salon', 'barber', 'barbershop', 'nails', 'nail_tech', 'lash', 'brows',
  'tattoo', 'piercing', 'photography', 'photographer', 'creative',
  'landscaping', 'cleaning', 'auto', 'auto_detailing', 'detailing', 'car_wash',
  'restaurant', 'bakery', 'food_truck', 'cafe', 'catering',
  'florist', 'wedding', 'wedding_planner', 'event_planner',
  'interior_design', 'architecture', 'design',
  'spa', 'beauty', 'makeup', 'hair', 'pet_grooming',
]);

/** Component IDs considered to be gallery/portfolio. */
const GALLERY_COMPONENT_IDS = new Set(['galleries', 'images', 'portfolios']);

/** Cycle of fallback colors for pipeline stages. */
const PIPELINE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];

/** Single-color words found in stage names. */
const STAGE_COLOR_WORDS: Record<string, string> = {
  white: '#E5E7EB', yellow: '#FDE047', orange: '#FB923C',
  green: '#22C55E', blue: '#3B82F6', purple: '#8B5CF6',
  brown: '#92400E', red: '#EF4444', black: '#1A1A1A',
  bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700',
  platinum: '#E5E4E2', pink: '#EC4899', teal: '#14B8A6',
  gray: '#6B7280', grey: '#6B7280', coral: '#F97316',
  navy: '#1E3A5F', crimson: '#DC2626', emerald: '#059669',
  ruby: '#E11D48', sapphire: '#2563EB', diamond: '#93C5FD',
  amber: '#F59E0B', jade: '#059669', ivory: '#FFFFF0',
};

/**
 * Dual-color stage patterns (martial arts stripes, poom, etc.).
 * Maps pattern string to [primary, secondary].
 * Checked BEFORE single-color inference so "white stripe" doesn't just return white.
 */
const DUAL_COLOR_STAGES: Record<string, [string, string]> = {
  // Stripe belts (base color + black stripe)
  'white stripe':  ['#E5E7EB', '#1A1A1A'],
  'yellow stripe': ['#FDE047', '#1A1A1A'],
  'green stripe':  ['#22C55E', '#1A1A1A'],
  'blue stripe':   ['#3B82F6', '#1A1A1A'],
  'red stripe':    ['#EF4444', '#1A1A1A'],
  // Poom (junior black belt) — red/black
  'poom':          ['#EF4444', '#1A1A1A'],
  // Camo belt (some styles)
  'camo':          ['#22C55E', '#92400E'],
  // Tiger stripe
  'tiger':         ['#FB923C', '#1A1A1A'],
};

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Infer color(s) from a stage name.
 * Returns [primary, secondary] — secondary is null for single-color stages.
 * Returns [null, null] if no color word found.
 */
function inferColorFromStageName(name: string): [string | null, string | null] {
  const nameLower = name.toLowerCase();

  // Check dual-color patterns first (more specific)
  for (const pattern of Object.keys(DUAL_COLOR_STAGES)) {
    if (nameLower.includes(pattern)) {
      const [primary, secondary] = DUAL_COLOR_STAGES[pattern];
      return [primary, secondary];
    }
  }

  // Fall back to single-color inference
  for (const colorWord of Object.keys(STAGE_COLOR_WORDS)) {
    if (nameLower.includes(colorWord)) {
      return [STAGE_COLOR_WORDS[colorWord], null];
    }
  }

  return [null, null];
}

// ── 1. consolidateCalendars ─────────────────────────────────────────────

/**
 * Enforce ONE calendar-view component across the ENTIRE config.
 * Dashboard is a platform-managed tab — clear its components.
 * All other tabs: only ONE calendar total. Extras become table view.
 * Strip redundant calendar-entity sub-components from tabs that have a calendar.
 */
export function consolidateCalendars(config: RawConfig): RawConfig {
  const tabs = config.tabs ?? [];

  // PASS 0: Clear Dashboard components — Dashboard is platform-managed (empty for now)
  for (const tab of tabs) {
    const isDashboard =
      tab.label.toLowerCase() === 'dashboard' || tab.id === 'tab_1';
    if (isDashboard) {
      tab.components = [];
    }
  }

  // PASS 1: Enforce ONE calendar-view component (across all tabs)
  let hasNonDashboardCalendar = false;
  for (const tab of tabs) {
    const isDashboard =
      tab.label.toLowerCase() === 'dashboard' || tab.id === 'tab_1';
    const comps = tab.components ?? [];
    let seenCalendarInTab = false;

    for (const comp of comps) {
      const compId = comp.id ?? '';
      const compView = comp.view ?? '';
      const isCalendar =
        compView === 'calendar' ||
        (!compView && CALENDAR_COMPONENT_IDS.has(compId));

      if (isCalendar) {
        if (isDashboard && !seenCalendarInTab) {
          seenCalendarInTab = true;
          if (!compView) {
            comp.view = 'calendar';
          }
        } else if (!isDashboard && !hasNonDashboardCalendar && !seenCalendarInTab) {
          hasNonDashboardCalendar = true;
          seenCalendarInTab = true;
          if (!compView) {
            comp.view = 'calendar';
          }
        } else {
          comp.view = 'table';
        }
      }
    }
  }

  // PASS 2: Strip redundant calendar-entity sub-components from tabs that have a calendar.
  // The calendar's filter chips (All | Appointments | Classes | Shifts) already handle these.
  // Keep non-calendar entities (rooms, equipment, treatments) as valid sub-tabs.
  for (const tab of tabs) {
    const comps = tab.components ?? [];
    const hasCalendarView = comps.some((c) => c.view === 'calendar');
    if (hasCalendarView && comps.length > 1) {
      tab.components = comps.filter(
        (c) => !REDUNDANT_WITH_CALENDAR.has(c.id),
      );
    }
  }

  return config;
}

// ── 2. enforceTabLimit ──────────────────────────────────────────────────

/**
 * Cap tabs at MAX_TABS total. AI orders by importance so we keep the first ones.
 */
export function enforceTabLimit(config: RawConfig): RawConfig {
  const tabs = config.tabs ?? [];
  if (tabs.length <= MAX_TABS) {
    return config;
  }
  config.tabs = tabs.slice(0, MAX_TABS);
  return config;
}

// ── 3. ensureGallery ────────────────────────────────────────────────────

/**
 * Post-processing: inject a galleries component for visual industries
 * that the AI missed. Similar to consolidateCalendars — enforces a rule
 * the AI sometimes ignores.
 */
export function ensureGallery(config: RawConfig): RawConfig {
  const btype = (config.business_type ?? '').toLowerCase().replace(/ /g, '_');

  // Check if this business type requires a gallery
  let needsGallery = false;
  for (const t of GALLERY_REQUIRED_TYPES) {
    if (btype.includes(t)) {
      needsGallery = true;
      break;
    }
  }
  if (!needsGallery) {
    return config;
  }

  // Check if any gallery/images/portfolios component already exists
  const tabs = config.tabs ?? [];
  for (const tab of tabs) {
    for (const comp of tab.components ?? []) {
      if (GALLERY_COMPONENT_IDS.has(comp.id ?? '')) {
        return config; // Already has one — done
      }
    }
  }

  // Missing gallery — find the best tab to add it to, or create a new tab
  // Prefer a tab with 'portfolio', 'gallery', 'photo', 'work', 'services' in the label
  let bestTab: RawTab | null = null;
  for (const tab of tabs) {
    const label = (tab.label ?? '').toLowerCase();
    if (
      label.includes('portfolio') ||
      label.includes('gallery') ||
      label.includes('photo') ||
      label.includes('work') ||
      label.includes('service')
    ) {
      bestTab = tab;
      break;
    }
  }

  if (bestTab) {
    bestTab.components.push({
      id: 'galleries',
      label: 'Gallery',
      view: 'cards',
    });
  } else {
    // No suitable tab — add a Gallery tab before Settings
    const newTab: RawTab = {
      id: `tab_${tabs.length + 1}`,
      label: 'Gallery',
      icon: 'image',
      components: [
        { id: 'galleries', label: 'Gallery', view: 'cards' },
      ],
    };
    // Insert before last tab (Settings) if it exists
    if (tabs.length > 0 && tabs[tabs.length - 1].label.toLowerCase() === 'settings') {
      tabs.splice(tabs.length - 1, 0, newTab);
    } else {
      tabs.push(newTab);
    }
  }

  return config;
}

// ── 4. transformPipelineStages ──────────────────────────────────────────

/**
 * Convert simple stages arrays to full pipeline objects expected by frontend.
 * Supports both string stages and dict stages with optional color_secondary.
 * Always enforces color inference from stage names containing color words.
 */
export function transformPipelineStages(config: RawConfig): RawConfig {
  const tabs = config.tabs ?? [];

  for (const tab of tabs) {
    for (const comp of tab.components ?? []) {
      // Case 1: AI generated top-level 'stages' array — convert to pipeline object
      if (comp.view === 'pipeline' && comp.stages) {
        const rawStages = comp.stages;
        delete comp.stages;

        if (Array.isArray(rawStages) && rawStages.length > 0) {
          const stages: PipelineStage[] = [];

          for (let i = 0; i < rawStages.length; i++) {
            const item = rawStages[i];

            if (typeof item === 'object' && item !== null) {
              const dict = item as RawStageDict;
              const name = dict.name ?? `Stage ${i + 1}`;
              const [inferredPrimary, inferredSecondary] = inferColorFromStageName(name);

              const stage: PipelineStage = {
                id: `stage_${i + 1}`,
                name,
                color: inferredPrimary ?? dict.color ?? PIPELINE_COLORS[i % PIPELINE_COLORS.length],
                order: i,
              };

              // Dual-color: inferred secondary wins, then AI-provided secondary
              if (inferredSecondary) {
                stage.color_secondary = inferredSecondary;
              } else if (dict.color_secondary) {
                stage.color_secondary = dict.color_secondary;
              }

              stages.push(stage);
            } else {
              // String stage name
              const name = String(item);
              const [inferredPrimary, inferredSecondary] = inferColorFromStageName(name);

              const stage: PipelineStage = {
                id: `stage_${i + 1}`,
                name,
                color: inferredPrimary ?? PIPELINE_COLORS[i % PIPELINE_COLORS.length],
                order: i,
              };

              if (inferredSecondary) {
                stage.color_secondary = inferredSecondary;
              }

              stages.push(stage);
            }
          }

          comp.pipeline = {
            stages,
            default_stage_id: 'stage_1',
          };
        }
      }

      // Case 2: AI generated full pipeline object — enforce color inference on existing stages
      else if (comp.pipeline && typeof comp.pipeline === 'object') {
        const pipeline = comp.pipeline as RawPipelineConfig;
        const existingStages = pipeline.stages;
        if (Array.isArray(existingStages)) {
          for (const stage of existingStages) {
            if (typeof stage === 'object' && stage !== null && stage.name) {
              const [inferredPrimary, inferredSecondary] = inferColorFromStageName(
                stage.name as string,
              );
              if (inferredPrimary) {
                stage.color = inferredPrimary;
              }
              if (inferredSecondary) {
                stage.color_secondary = inferredSecondary;
              }
            }
          }
        }
      }
    }
  }

  return config;
}

// ── 5. validateColors ───────────────────────────────────────────────────

/**
 * Ensure config has industry-appropriate colors, replacing defaults if needed.
 * Uses getColorDefaults from ./color-defaults as fallback.
 */
export function validateColors(config: RawConfig): RawConfig {
  const colors = config.colors ?? {};
  const businessType = config.business_type ?? '';

  // If no colors or buttons look like known defaults, use industry palette
  if (!colors || !colors.buttons || BAD_BUTTON_COLORS.has(colors.buttons)) {
    const industryColors = getColorDefaults(businessType);
    // Merge: keep any non-default AI-generated values, fill in from industry defaults
    const merged: Record<string, string> = { ...industryColors };
    for (const [key, val] of Object.entries(colors)) {
      if (val && !BAD_BUTTON_COLORS.has(val) && key !== 'buttons') {
        merged[key] = val;
      }
    }
    config.colors = merged;
  }

  return config;
}

// ── 6. validateLockedComponents ─────────────────────────────────────────

/**
 * Re-inject any locked components the AI accidentally removed.
 * Compares config output against template and lockedIds set.
 *
 * @param config  - The AI-customized config.
 * @param template - The original template the AI was given.
 * @param lockedIds - Set of component IDs that must exist.
 */
export function validateLockedComponents(
  config: RawConfig,
  template: RawConfig,
  lockedIds: Set<string>,
): RawConfig {
  if (lockedIds.size === 0) {
    return config;
  }

  // Build a set of which locked components exist in the output
  const existingIds = new Set<string>();
  for (const tab of config.tabs ?? []) {
    for (const comp of tab.components ?? []) {
      if (lockedIds.has(comp.id)) {
        existingIds.add(comp.id);
      }
    }
  }

  const missing = new Set<string>();
  for (const id of lockedIds) {
    if (!existingIds.has(id)) {
      missing.add(id);
    }
  }

  if (missing.size === 0) {
    return config;
  }

  // For each missing locked component, find it in the template and re-inject
  for (const templateTab of template.tabs ?? []) {
    for (const templateComp of templateTab.components ?? []) {
      const compId = templateComp.id;
      if (!missing.has(compId)) {
        continue;
      }

      // Find the matching tab in the output config (by label)
      let targetTab: RawTab | null = null;
      for (const tab of config.tabs ?? []) {
        if (tab.label === templateTab.label) {
          targetTab = tab;
          break;
        }
      }

      if (targetTab) {
        // Add to existing tab — deep clone to avoid shared references
        targetTab.components.push(structuredClone(templateComp));
      } else {
        // Tab was removed — create it
        const tabs = config.tabs ?? [];
        const newTab: RawTab = {
          id: `tab_${tabs.length + 1}`,
          label: templateTab.label ?? 'Restored',
          icon: templateTab.icon ?? 'box',
          components: [structuredClone(templateComp)],
        };
        // Insert before last tab (Payments is usually last)
        tabs.splice(Math.max(0, tabs.length - 1), 0, newTab);
      }

      missing.delete(compId);
    }
  }

  return config;
}

// ── 7. stripLockedFlags ─────────────────────────────────────────────────

/**
 * Remove _locked and _removable flags from config before sending to frontend.
 */
export function stripLockedFlags(config: RawConfig): RawConfig {
  for (const tab of config.tabs ?? []) {
    delete tab._removable;
    for (const comp of tab.components ?? []) {
      delete comp._locked;
    }
  }
  return config;
}

// ── Convenience: run all validations ────────────────────────────────────

/**
 * Run the full validation pipeline on a raw config.
 * Call this after AI generates or customizes a config.
 *
 * @param config - The raw AI-generated config.
 * @param template - The original template (needed for locked component re-injection).
 * @param lockedIds - Set of component IDs that must exist.
 */
export function validateConfig(
  config: RawConfig,
  template?: RawConfig,
  lockedIds?: Set<string>,
): RawConfig {
  let result = consolidateCalendars(config);
  result = enforceTabLimit(result);
  result = ensureGallery(result);
  result = transformPipelineStages(result);
  result = validateColors(result);
  if (template && lockedIds) {
    result = validateLockedComponents(result, template, lockedIds);
  }
  result = stripLockedFlags(result);
  return result;
}
