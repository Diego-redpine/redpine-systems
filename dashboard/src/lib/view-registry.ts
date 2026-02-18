// View Registry - F1-A Task 1
// Maps each component to its available view types

export type ViewType = 'table' | 'calendar' | 'cards' | 'pipeline' | 'list' | 'route';

export interface ViewConfig {
  defaultView: ViewType;
  availableViews: ViewType[];
}

// Registry mapping all 28 components to their view configurations
export const VIEW_REGISTRY: Record<string, ViewConfig> = {
  // People category
  clients: {
    defaultView: 'pipeline',
    availableViews: ['pipeline', 'table', 'cards', 'list'],
  },
  contacts: {
    defaultView: 'list',
    availableViews: ['list', 'table', 'cards'],
  },
  leads: {
    defaultView: 'pipeline',
    availableViews: ['pipeline', 'table', 'list'],
  },
  staff: {
    defaultView: 'cards',
    availableViews: ['cards', 'table', 'list'],
  },
  vendors: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },

  // Things category
  products: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },
  inventory: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },
  equipment: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  assets: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },

  // Time category
  calendar: {
    defaultView: 'calendar',
    availableViews: ['calendar', 'list'],
  },
  appointments: {
    defaultView: 'calendar',
    availableViews: ['calendar', 'table', 'list'],
  },
  schedules: {
    defaultView: 'calendar',
    availableViews: ['calendar', 'table'],
  },
  shifts: {
    defaultView: 'calendar',
    availableViews: ['calendar', 'table'],
  },

  // Money category
  invoices: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  payments: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  expenses: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  payroll: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  estimates: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },

  // Tasks category
  todos: {
    defaultView: 'list',
    availableViews: ['list', 'table'],
  },
  jobs: {
    defaultView: 'pipeline',
    availableViews: ['pipeline', 'table', 'cards'],
  },
  projects: {
    defaultView: 'cards',
    availableViews: ['cards', 'table', 'pipeline'],
  },
  workflows: {
    defaultView: 'pipeline',
    availableViews: ['pipeline', 'table'],
  },

  // Comms category
  messages: {
    defaultView: 'list',
    availableViews: ['list', 'table'],
  },
  notes: {
    defaultView: 'list',
    availableViews: ['list', 'table'],
  },
  announcements: {
    defaultView: 'list',
    availableViews: ['list', 'table'],
  },
  reviews: {
    defaultView: 'cards',
    availableViews: ['cards', 'table', 'list'],
  },

  // Files category
  documents: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },
  contracts: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  images: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  uploads: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },

  // Signing & Compliance
  waivers: {
    defaultView: 'pipeline',
    availableViews: ['pipeline', 'table', 'cards'],
  },
  forms: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },
  signatures: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },

  // Hospitality & Food
  reservations: {
    defaultView: 'calendar',
    availableViews: ['calendar', 'table', 'list'],
  },
  tables: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  menus: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  orders: {
    defaultView: 'table',
    availableViews: ['table', 'pipeline', 'list'],
  },
  rooms: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  recipes: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  waitlist: {
    defaultView: 'list',
    availableViews: ['list', 'table'],
  },
  tip_pools: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  waste_log: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  suppliers: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },
  purchase_orders: {
    defaultView: 'table',
    availableViews: ['table', 'pipeline'],
  },

  // Education & Programs
  classes: {
    defaultView: 'calendar',
    availableViews: ['calendar', 'table', 'cards'],
  },
  membership_plans: {
    defaultView: 'cards',
    availableViews: ['cards', 'table', 'list'],
  },
  memberships: {
    defaultView: 'pipeline',
    availableViews: ['pipeline', 'table', 'cards', 'list'],
  },
  courses: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  attendance: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },

  // Field Service
  inspections: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  routes: {
    defaultView: 'route',
    availableViews: ['route'],
  },
  fleet: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  checklists: {
    defaultView: 'list',
    availableViews: ['list', 'table'],
  },
  permits: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },

  // Health & Medical
  prescriptions: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  treatments: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },

  // Creative
  portfolios: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  galleries: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },

  // Real Estate
  listings: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  properties: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },

  // Legal
  cases: {
    defaultView: 'pipeline',
    availableViews: ['pipeline', 'table', 'list'],
  },

  // Events
  venues: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  guests: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },

  // Marketing
  campaigns: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },
  loyalty: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },
  surveys: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },

  // Support
  tickets: {
    defaultView: 'pipeline',
    availableViews: ['pipeline', 'table', 'list'],
  },
  knowledge: {
    defaultView: 'list',
    availableViews: ['list', 'table'],
  },

  // Business Operations
  packages: {
    defaultView: 'cards',
    availableViews: ['cards', 'table'],
  },
  subscriptions: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },
  time_tracking: {
    defaultView: 'table',
    availableViews: ['table', 'list'],
  },

  // Digital & Online
  social_media: {
    defaultView: 'cards',
    availableViews: ['cards', 'table', 'calendar'],
  },
  reputation: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },
  portal: {
    defaultView: 'table',
    availableViews: ['table', 'cards'],
  },
  community: {
    defaultView: 'list',
    availableViews: ['list', 'cards'],
  },
  chat_widget: {
    defaultView: 'list',
    availableViews: ['list', 'table'],
  },
};

/**
 * Get the default view for a component
 */
export function getDefaultView(componentId: string): ViewType {
  const config = VIEW_REGISTRY[componentId];
  return config?.defaultView || 'table';
}

/**
 * Get all available views for a component
 */
export function getAvailableViews(componentId: string): ViewType[] {
  const config = VIEW_REGISTRY[componentId];
  return config?.availableViews || ['table'];
}

/**
 * Check if a view type is available for a component
 */
export function isViewAvailable(componentId: string, viewType: ViewType): boolean {
  const availableViews = getAvailableViews(componentId);
  return availableViews.includes(viewType);
}

/**
 * Get components that support a specific view type
 */
export function getComponentsWithView(viewType: ViewType): string[] {
  return Object.entries(VIEW_REGISTRY)
    .filter(([, config]) => config.availableViews.includes(viewType))
    .map(([id]) => id);
}

/**
 * Get all components that support pipeline view
 */
export function getPipelineComponents(): string[] {
  return getComponentsWithView('pipeline');
}
