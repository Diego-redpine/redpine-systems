// Component Registry - Single source of truth for all available components

export interface ComponentDefinition {
  id: string;
  defaultLabel: string;
  icon: string;
  category: string;
  description: string;
}

export const componentRegistry: ComponentDefinition[] = [
  // People-related components
  { id: 'clients', defaultLabel: 'Clients', icon: 'people', category: 'people', description: 'Client table with contact info' },
  { id: 'leads', defaultLabel: 'Leads', icon: 'target', category: 'people', description: 'Leads pipeline and tracking' },
  { id: 'staff', defaultLabel: 'Staff', icon: 'users', category: 'people', description: 'Staff cards and management' },
  { id: 'vendors', defaultLabel: 'Vendors', icon: 'truck', category: 'people', description: 'Vendor list and contacts' },

  // Things-related components
  { id: 'products', defaultLabel: 'Products', icon: 'box', category: 'things', description: 'Product table with SKU, stock, price' },
  { id: 'inventory', defaultLabel: 'Inventory', icon: 'clipboard', category: 'things', description: 'Stock levels and low stock alerts' },
  { id: 'equipment', defaultLabel: 'Equipment', icon: 'tool', category: 'things', description: 'Equipment list and tracking' },
  { id: 'assets', defaultLabel: 'Assets', icon: 'archive', category: 'things', description: 'Asset management and tracking' },

  // Time-related components
  { id: 'calendar', defaultLabel: 'Calendar', icon: 'calendar', category: 'time', description: 'Calendar view (day/week/month)' },
  { id: 'appointments', defaultLabel: 'Appointments', icon: 'clock', category: 'time', description: 'Appointment list and scheduling' },
  { id: 'schedules', defaultLabel: 'Schedules', icon: 'grid', category: 'time', description: 'Schedule grid view' },
  { id: 'shifts', defaultLabel: 'Shifts', icon: 'rotate', category: 'time', description: 'Shift scheduler for staff' },

  // Money-related components
  { id: 'invoices', defaultLabel: 'Invoices', icon: 'file-text', category: 'money', description: 'Invoice table and management' },
  { id: 'payments', defaultLabel: 'Payments', icon: 'dollar', category: 'money', description: 'Payment tracker and history' },
  { id: 'expenses', defaultLabel: 'Expenses', icon: 'trending-down', category: 'money', description: 'Expense log and tracking' },
  { id: 'payroll', defaultLabel: 'Payroll', icon: 'wallet', category: 'money', description: 'Payroll management' },
  { id: 'estimates', defaultLabel: 'Estimates', icon: 'calculator', category: 'money', description: 'Quotes and estimates list' },

  // Task-related components
  { id: 'todos', defaultLabel: 'To-dos', icon: 'check', category: 'tasks', description: 'Task checklist' },
  { id: 'jobs', defaultLabel: 'Jobs', icon: 'briefcase', category: 'tasks', description: 'Job cards and tracking' },
  { id: 'projects', defaultLabel: 'Projects', icon: 'layout', category: 'tasks', description: 'Project board view' },
  { id: 'workflows', defaultLabel: 'Workflows', icon: 'git-branch', category: 'tasks', description: 'Workflow automations' },

  // Communication-related components
  { id: 'messages', defaultLabel: 'Messages', icon: 'mail', category: 'comms', description: 'Message inbox' },
  { id: 'notes', defaultLabel: 'Notes', icon: 'edit', category: 'comms', description: 'Notes editor' },
  { id: 'announcements', defaultLabel: 'Announcements', icon: 'megaphone', category: 'comms', description: 'Announcement feed' },
  { id: 'reviews', defaultLabel: 'Reviews', icon: 'star', category: 'comms', description: 'Review feed and management' },

  // File-related components
  { id: 'documents', defaultLabel: 'Documents', icon: 'file', category: 'files', description: 'File manager' },
  { id: 'contracts', defaultLabel: 'Contracts', icon: 'file-check', category: 'files', description: 'Contract list and management' },
  { id: 'images', defaultLabel: 'Images', icon: 'image', category: 'files', description: 'Image gallery' },
  { id: 'uploads', defaultLabel: 'Uploads', icon: 'upload', category: 'files', description: 'Upload manager' },

  // Signing & Compliance
  { id: 'waivers', defaultLabel: 'Waivers', icon: 'clipboard', category: 'signing', description: 'Waiver templates, digital signatures, print copies' },
  { id: 'forms', defaultLabel: 'Forms', icon: 'file-text', category: 'signing', description: 'Custom forms, intake forms, questionnaires' },
  { id: 'signatures', defaultLabel: 'Signatures', icon: 'edit', category: 'signing', description: 'E-signature tracking and signed documents' },

  // Hospitality & Food
  { id: 'reservations', defaultLabel: 'Reservations', icon: 'calendar', category: 'hospitality', description: 'Table/room/resource reservations' },
  { id: 'tables', defaultLabel: 'Table Management', icon: 'grid', category: 'hospitality', description: 'Restaurant table status and seating' },
  { id: 'menus', defaultLabel: 'Menus', icon: 'book', category: 'hospitality', description: 'Menu items, pricing, categories' },
  { id: 'orders', defaultLabel: 'Orders', icon: 'shopping-cart', category: 'hospitality', description: 'Order management and tracking' },
  { id: 'rooms', defaultLabel: 'Rooms', icon: 'home', category: 'hospitality', description: 'Room management for hotels, spas, studios' },
  { id: 'recipes', defaultLabel: 'Recipes', icon: 'book', category: 'hospitality', description: 'Recipe management with ingredients and portions' },
  { id: 'waitlist', defaultLabel: 'Waitlist', icon: 'clock', category: 'hospitality', description: 'Walk-in queue management and wait times' },
  { id: 'tip_pools', defaultLabel: 'Tip Pool', icon: 'dollar', category: 'hospitality', description: 'Daily tip tracking and distribution' },
  { id: 'waste_log', defaultLabel: 'Waste Log', icon: 'trash', category: 'hospitality', description: 'Food waste tracking by reason and cost' },
  { id: 'suppliers', defaultLabel: 'Suppliers', icon: 'truck', category: 'hospitality', description: 'Ingredient suppliers and vendor management' },
  { id: 'purchase_orders', defaultLabel: 'Purchase Orders', icon: 'clipboard', category: 'hospitality', description: 'Orders to suppliers with delivery tracking' },

  // Education & Programs
  { id: 'classes', defaultLabel: 'Classes', icon: 'calendar', category: 'education', description: 'Class schedules, enrollment, instructors' },
  { id: 'memberships', defaultLabel: 'Memberships', icon: 'users', category: 'education', description: 'Membership plans, tracking, renewals' },
  { id: 'membership_plans', defaultLabel: 'Membership Plans', icon: 'credit-card', category: 'education', description: 'Membership tiers, pricing, features' },
  { id: 'membership_members', defaultLabel: 'Members', icon: 'users', category: 'education', description: 'Member subscriptions, status, payment tracking' },
  { id: 'courses', defaultLabel: 'Courses', icon: 'book', category: 'education', description: 'Course catalog, modules, progress' },
  { id: 'attendance', defaultLabel: 'Attendance', icon: 'check', category: 'education', description: 'Check-in logs and participation tracking' },

  // Field Service
  { id: 'inspections', defaultLabel: 'Inspections', icon: 'shield', category: 'service', description: 'Inspection checklists and pass/fail results' },
  { id: 'routes', defaultLabel: 'Routes', icon: 'map', category: 'service', description: 'Service routes, stops, driver assignments' },
  { id: 'fleet', defaultLabel: 'Fleet', icon: 'truck', category: 'service', description: 'Vehicle fleet management and maintenance' },
  { id: 'checklists', defaultLabel: 'Checklists', icon: 'check', category: 'service', description: 'Task checklists with completion tracking' },
  { id: 'permits', defaultLabel: 'Permits', icon: 'file-check', category: 'service', description: 'Building/work permits and status tracking' },

  // Health & Medical
  { id: 'prescriptions', defaultLabel: 'Prescriptions', icon: 'heart', category: 'medical', description: 'Medication prescriptions and refills' },
  { id: 'treatments', defaultLabel: 'Treatments', icon: 'heart', category: 'medical', description: 'Treatment plans and follow-up care' },

  // Creative
  { id: 'portfolios', defaultLabel: 'Portfolio', icon: 'image', category: 'files', description: 'Portfolio showcase and case studies' },
  { id: 'galleries', defaultLabel: 'Galleries', icon: 'image', category: 'files', description: 'Photo galleries with client access' },

  // Real Estate
  { id: 'listings', defaultLabel: 'Listings', icon: 'home', category: 'things', description: 'Property listings with details and status' },
  { id: 'properties', defaultLabel: 'Properties', icon: 'home', category: 'things', description: 'Rental property management and tenants' },

  // Legal
  { id: 'cases', defaultLabel: 'Cases', icon: 'briefcase', category: 'tasks', description: 'Legal case management and tracking' },

  // Events
  { id: 'venues', defaultLabel: 'Venues', icon: 'home', category: 'things', description: 'Venue management with capacity and amenities' },
  { id: 'guests', defaultLabel: 'Guest List', icon: 'people', category: 'people', description: 'Guest list with RSVP and dietary info' },

  // Marketing
  { id: 'campaigns', defaultLabel: 'Campaigns', icon: 'megaphone', category: 'comms', description: 'Marketing campaigns across channels' },
  { id: 'loyalty', defaultLabel: 'Loyalty', icon: 'star', category: 'comms', description: 'Loyalty programs, points, and rewards' },
  { id: 'surveys', defaultLabel: 'Surveys', icon: 'clipboard', category: 'comms', description: 'Customer surveys and feedback collection' },

  // Support
  { id: 'tickets', defaultLabel: 'Tickets', icon: 'mail', category: 'comms', description: 'Support tickets with priority and status' },
  { id: 'knowledge', defaultLabel: 'Knowledge Base', icon: 'book', category: 'comms', description: 'FAQ articles and help documentation' },

  // Business Operations
  { id: 'packages', defaultLabel: 'Packages', icon: 'package', category: 'money', description: 'Service packages and pricing bundles' },
  { id: 'subscriptions', defaultLabel: 'Subscriptions', icon: 'rotate', category: 'money', description: 'Recurring subscription management' },
  { id: 'time_tracking', defaultLabel: 'Time Tracking', icon: 'clock', category: 'time', description: 'Employee hours and billable time' },

  // Digital & Online
  { id: 'social_media', defaultLabel: 'Social Media', icon: 'globe', category: 'comms', description: 'Social media scheduling and analytics' },
  { id: 'reputation', defaultLabel: 'Reputation', icon: 'star', category: 'comms', description: 'Review aggregation from Google, Yelp, Facebook' },
  { id: 'portal', defaultLabel: 'Client Portal', icon: 'globe', category: 'people', description: 'Client-facing portal for appointments, payments, docs' },
  { id: 'community', defaultLabel: 'Community', icon: 'users', category: 'comms', description: 'Member forum and discussions' },
  { id: 'chat_widget', defaultLabel: 'Live Chat', icon: 'chat', category: 'comms', description: 'Website live chat and lead capture' },
];

// Helper functions
export function getComponent(id: string): ComponentDefinition | undefined {
  return componentRegistry.find(c => c.id === id);
}

export function getComponentsByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
  return componentRegistry.filter(c => c.category === category);
}

export function getAllComponentIds(): string[] {
  return componentRegistry.map(c => c.id);
}

// Available icons for tabs (can be used by AI when creating new tabs)
export const availableIcons = [
  'people', 'box', 'clock', 'dollar', 'check', 'chat', 'folder',
  'briefcase', 'star', 'tool', 'calendar', 'mail', 'file', 'target',
  'truck', 'users', 'grid', 'calculator', 'wallet', 'edit', 'megaphone',
  'image', 'upload', 'layout', 'git-branch', 'clipboard', 'archive',
  'rotate', 'trending-down', 'file-text', 'file-check', 'home', 'settings',
  'chart', 'zap', 'heart', 'shield', 'globe', 'package', 'book',
  'shopping-cart', 'map',
];
