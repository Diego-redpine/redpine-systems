/**
 * Auto-detection logic for Live Board sections.
 * Reads business config tabs/components to determine which board cards to show.
 */

export interface BoardSections {
  schedule: boolean;
  orders: boolean;
  classes: boolean;
  queue: boolean;
  pipeline: boolean;
}

interface TabLike {
  components?: Array<{ id: string }>;
}

const SCHEDULE_IDS = new Set(['appointments', 'calendar', 'schedules', 'reservations']);
const ORDER_IDS = new Set(['orders']);
const CLASS_IDS = new Set(['classes', 'courses']);
const QUEUE_IDS = new Set(['waitlist']);
const PIPELINE_IDS = new Set(['leads', 'jobs', 'tickets', 'cases', 'projects', 'workflows']);

/**
 * Detect which board sections to show based on business config tabs.
 * In demo mode (no tabs), returns all sections enabled.
 */
export function detectBoardSections(tabs?: TabLike[]): BoardSections {
  if (!tabs || tabs.length === 0) {
    // Demo mode: show everything
    return { schedule: true, orders: true, classes: true, queue: true, pipeline: true };
  }

  const allIds = new Set<string>();
  for (const tab of tabs) {
    if (tab.components) {
      for (const c of tab.components) {
        allIds.add(c.id);
      }
    }
  }

  return {
    schedule: [...allIds].some(id => SCHEDULE_IDS.has(id)),
    orders: [...allIds].some(id => ORDER_IDS.has(id)),
    classes: [...allIds].some(id => CLASS_IDS.has(id)),
    queue: [...allIds].some(id => QUEUE_IDS.has(id)),
    pipeline: [...allIds].some(id => PIPELINE_IDS.has(id)),
  };
}

/**
 * Merge detected sections with user overrides (saved board_settings).
 * User can toggle individual sections off even if auto-detected.
 */
export function applyBoardOverrides(
  detected: BoardSections,
  overrides?: Partial<BoardSections>,
): BoardSections {
  if (!overrides) return detected;
  return {
    schedule: overrides.schedule ?? detected.schedule,
    orders: overrides.orders ?? detected.orders,
    classes: overrides.classes ?? detected.classes,
    queue: overrides.queue ?? detected.queue,
    pipeline: overrides.pipeline ?? detected.pipeline,
  };
}

/** Count how many sections are active */
export function activeSectionCount(sections: BoardSections): number {
  return Object.values(sections).filter(Boolean).length;
}
