// Entity Utilities - Shared helpers for entity name handling

/**
 * Convert entity type to singular form
 * Handles all 9 core entities plus extended component names
 */
export function singularize(entityType: string): string {
  const singularMap: Record<string, string> = {
    // Core 9 entities
    clients: 'client',
    appointments: 'appointment',
    invoices: 'invoice',
    products: 'product',
    tasks: 'task',
    staff: 'team member',
    leads: 'lead',
    messages: 'message',
    documents: 'document',
    // Extended component names
    todos: 'todo',
    contacts: 'contact',
    customers: 'customer',
    orders: 'order',
    projects: 'project',
    jobs: 'job',
    estimates: 'estimate',
    quotes: 'quote',
    payments: 'payment',
    expenses: 'expense',
    reviews: 'review',
    notes: 'note',
    files: 'file',
    events: 'event',
    bookings: 'booking',
    reservations: 'reservation',
    members: 'member',
    students: 'student',
    patients: 'patient',
    properties: 'property',
    listings: 'listing',
    inventory: 'inventory item',
    assets: 'asset',
    tickets: 'ticket',
    cases: 'case',
    workflows: 'workflow',
    campaigns: 'campaign',
    subscribers: 'subscriber',
    // Additional component IDs
    shifts: 'shift',
    schedules: 'schedule',
    classes: 'class',
    menus: 'menu item',
    tables: 'table',
    rooms: 'room',
    contracts: 'contract',
    vendors: 'vendor',
    equipment: 'equipment',
    announcements: 'announcement',
    uploads: 'upload',
    images: 'image',
    waivers: 'waiver',
    forms: 'form',
    signatures: 'signature',
    recipes: 'recipe',
    waitlist: 'waitlist entry',
    galleries: 'gallery',
    portfolios: 'portfolio',
    inspections: 'inspection',
    routes: 'route',
    fleet: 'vehicle',
    checklists: 'checklist',
    permits: 'permit',
    prescriptions: 'prescription',
    treatments: 'treatment',
    attendance: 'check-in',
    memberships: 'member',
    membership_plans: 'membership plan',
    courses: 'course',
    venues: 'venue',
    guests: 'guest',
    surveys: 'survey',
    knowledge: 'article',
    packages: 'package',
    subscriptions: 'subscription',
    time_tracking: 'time entry',
    social_media: 'post',
    reputation: 'review',
    portal: 'portal user',
    community: 'post',
    tip_pools: 'tip pool',
    waste_log: 'waste entry',
    suppliers: 'supplier',
    purchase_orders: 'purchase order',
    calendar: 'event',
    payroll: 'payroll entry',
  };

  return singularMap[entityType.toLowerCase()] || entityType.replace(/s$/, '');
}

/**
 * Convert entity type to display label (capitalized)
 */
export function entityToLabel(entityType: string): string {
  return entityType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert entity type to singular display label
 */
export function entityToSingularLabel(entityType: string): string {
  const singular = singularize(entityType);
  return singular
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
