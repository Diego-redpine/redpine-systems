// Dummy data organized by COMPONENT ID
// Each component renders the same data regardless of which tab it's in
//
// F1-A Task 7: View-specific data formats
// - Table view: headers + rows
// - Calendar view: events with start_time/end_time
// - Cards view: items with title, subtitle, avatar/image, status, metric
// - Pipeline view: stages array with items per stage
// - List view: items with title, subtitle, status, meta

// Helper to generate dates relative to today (for calendar dummy data)
function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
function daysFromNow(offset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export interface TableData {
  type: 'table';
  headers: string[];
  rows: (string | number)[][];
}

export interface CardData {
  type: 'cards';
  items: {
    id?: string;
    title: string;
    subtitle: string;
    meta?: string;
    avatar?: string;
    image?: string;
    status?: string;
    metric?: string | number;
  }[];
}

export interface ListData {
  type: 'list';
  items: {
    id?: string;
    title: string;
    subtitle?: string;
    status?: string;
    meta?: string;
  }[];
}

export interface StatsData {
  type: 'stats';
  items: { label: string; value: string | number; change?: string }[];
}

export interface CalendarData {
  type: 'calendar';
  events: {
    id?: string;
    title: string;
    start_time: string;
    end_time: string;
    status?: string;
    client?: string;
    recurrence?: string;
    [key: string]: unknown;
  }[];
}

// Pipeline view data - items organized by stage (F1-B)
export interface PipelineData {
  type: 'pipeline';
  stages: {
    id: string;
    name: string;
    color: string;
    items: {
      id: string;
      title: string;
      subtitle?: string;
      value?: number;
      meta?: string;
    }[];
  }[];
}

export interface RouteStop {
  id: string;
  customer_name: string;
  address: string;
  lat: number;
  lon: number;
  service_type?: string;
  estimated_duration?: number; // minutes
  order: number;
}

export interface RouteData {
  type: 'route';
  businessLocation: { lat: number; lon: number; name: string };
  routes: {
    id: string;
    name: string;
    driver: string;
    status: string;
    color: string;
    eta?: string;
    territory: [number, number][];
    stops: RouteStop[];
  }[];
  customers: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
  }[];
}

export type ComponentData = TableData | CardData | ListData | StatsData | CalendarData | PipelineData | RouteData;

// Component dummy data - keyed by component ID
export const componentDummyData: Record<string, ComponentData> = {
  // People components
  clients: {
    type: 'pipeline',
    stages: [
      {
        id: 'stage_new',
        name: 'New',
        color: '#3B82F6',
        items: [
          { id: 'client_1', title: 'Emily Chen', subtitle: 'emily@email.com', value: undefined, meta: 'Added 2 days ago' },
          { id: 'client_2', title: 'David Park', subtitle: 'david@email.com', value: undefined, meta: 'Added 1 week ago' },
        ],
      },
      {
        id: 'stage_active',
        name: 'Active',
        color: '#10B981',
        items: [
          { id: 'client_3', title: 'John Smith', subtitle: 'john@email.com', value: undefined, meta: 'Since Jan 2025' },
          { id: 'client_4', title: 'Sarah Johnson', subtitle: 'sarah@email.com', value: undefined, meta: 'Since Mar 2025' },
          { id: 'client_5', title: 'Mike Davis', subtitle: 'mike@email.com', value: undefined, meta: 'Since Jun 2025' },
        ],
      },
      {
        id: 'stage_loyal',
        name: 'Loyal',
        color: '#F59E0B',
        items: [
          { id: 'client_6', title: 'Lisa Wang', subtitle: 'lisa@email.com', value: undefined, meta: 'Since Sep 2024' },
        ],
      },
      {
        id: 'stage_vip',
        name: 'VIP',
        color: '#8B5CF6',
        items: [
          { id: 'client_7', title: 'Robert Kim', subtitle: 'robert@email.com', value: undefined, meta: 'Since Jan 2024' },
        ],
      },
    ]
  },
  contacts: {
    type: 'table',
    headers: ['Name', 'Email', 'Phone', 'Type'],
    rows: [
      ['John Smith', 'john@email.com', '(555) 123-4567', 'Client'],
      ['Sarah Johnson', 'sarah@email.com', '(555) 234-5678', 'VIP'],
      ['Mike Davis', 'mike@email.com', '(555) 345-6789', 'Client'],
      ['Emily Chen', 'emily@email.com', '(555) 456-7890', 'Prospect'],
      ['David Park', 'david@email.com', '(555) 567-8901', 'Lead'],
      ['Lisa Wang', 'lisa@email.com', '(555) 678-9012', 'Client'],
    ]
  },
  leads: {
    type: 'pipeline',
    stages: [
      {
        id: 'stage_1',
        name: 'New',
        color: '#3B82F6',
        items: [
          { id: 'lead_1', title: 'Web Form Lead', subtitle: 'Interested in services', value: 5000, meta: '2 hours ago' },
          { id: 'lead_2', title: 'Referral Lead', subtitle: 'From existing client', value: 7500, meta: '1 day ago' },
        ],
      },
      {
        id: 'stage_2',
        name: 'Contacted',
        color: '#F59E0B',
        items: [
          { id: 'lead_3', title: 'James Wilson', subtitle: 'Sent intro email', value: 3000, meta: '3 days ago' },
        ],
      },
      {
        id: 'stage_3',
        name: 'Qualified',
        color: '#8B5CF6',
        items: [
          { id: 'lead_4', title: 'Acme Corp', subtitle: 'Budget confirmed', value: 15000, meta: '5 days ago' },
        ],
      },
      {
        id: 'stage_4',
        name: 'Proposal',
        color: '#F97316',
        items: [],
      },
      {
        id: 'stage_5',
        name: 'Won',
        color: '#10B981',
        items: [
          { id: 'lead_5', title: 'Tech Solutions', subtitle: 'Signed contract', value: 12000, meta: '1 week ago' },
        ],
      },
    ],
  },
  staff: {
    type: 'cards',
    items: [
      { id: 'staff_1', title: 'Owner', subtitle: 'Manager', meta: '45 clients', avatar: '/avatars/default.png', status: 'active', metric: 45 },
      { id: 'staff_2', title: 'Team Member 1', subtitle: 'Staff', meta: '32 clients', avatar: '/avatars/default.png', status: 'active', metric: 32 },
      { id: 'staff_3', title: 'Team Member 2', subtitle: 'Staff', meta: '28 clients', avatar: '/avatars/default.png', status: 'active', metric: 28 },
    ]
  },
  vendors: {
    type: 'table',
    headers: ['Company', 'Contact', 'Phone', 'Last Order'],
    rows: [
      ['Supply Co.', 'Tom Wilson', '(555) 111-2222', 'Jan 15'],
      ['Equipment Plus', 'Lisa Brown', '(555) 222-3333', 'Jan 10'],
      ['Wholesale Direct', 'Mark Jones', '(555) 333-4444', 'Dec 28'],
    ]
  },

  // Things components
  products: {
    type: 'table',
    headers: ['Name', 'Price', 'SKU', 'Quantity', 'Category'],
    rows: [
      ['Product A', '$19.99', 'SKU-001', 24, 'Supplies'],
      ['Product B', '$29.99', 'SKU-002', 18, 'Equipment'],
      ['Product C', '$14.99', 'SKU-003', 45, 'Supplies'],
      ['Product D', '$39.99', 'SKU-004', 12, 'Premium'],
    ]
  },
  inventory: {
    type: 'list',
    items: [
      { title: 'Low Stock Alert', subtitle: 'Item A - 3 remaining', status: 'warning', meta: 'Reorder point: 10' },
      { title: 'Low Stock Alert', subtitle: 'Item B - 5 remaining', status: 'warning', meta: 'Reorder point: 10' },
      { title: 'Out of Stock', subtitle: 'Item C', status: 'error', meta: 'Last ordered: Jan 10' },
    ]
  },
  equipment: {
    type: 'cards',
    items: [
      { title: 'Equipment 1', subtitle: 'Good condition', meta: 'Last service: Jan 15' },
      { title: 'Equipment 2', subtitle: 'Needs maintenance', meta: 'Last service: Dec 1' },
      { title: 'Equipment 3', subtitle: 'Good condition', meta: 'Last service: Jan 20' },
    ]
  },
  assets: {
    type: 'table',
    headers: ['Asset', 'Category', 'Value', 'Status'],
    rows: [
      ['Vehicle 1', 'Transport', '$25,000', 'Active'],
      ['Computer Setup', 'Office', '$2,500', 'Active'],
      ['Furniture Set', 'Office', '$1,200', 'Active'],
    ]
  },

  // Time components - all include start_time/end_time for calendar view compatibility
  // Dates are relative to today so events always appear on the current calendar
  calendar: {
    type: 'calendar',
    events: [
      // Appointments (blue)
      { id: 'evt_1', title: 'Client Meeting', start_time: todayAt(9), end_time: todayAt(10), status: 'confirmed', client: 'John Smith', event_type: 'appointment', color_primary: '#3B82F6' },
      { id: 'evt_2', title: 'Service Appointment', start_time: todayAt(11), end_time: todayAt(12), status: 'confirmed', client: 'Sarah Johnson', event_type: 'appointment', color_primary: '#3B82F6' },
      // Classes (purple)
      { id: 'evt_3', title: 'Group Training', start_time: todayAt(14), end_time: todayAt(15), status: 'confirmed', instructor: 'Jane Doe', max_capacity: 15, event_type: 'class', color_primary: '#8B5CF6' },
      // Shifts (green)
      { id: 'evt_4', title: 'Morning Shift — Alex', start_time: todayAt(6), end_time: todayAt(14), status: 'confirmed', employee: 'Alex Rivera', role: 'Front Desk', event_type: 'shift', color_primary: '#10B981' },
      { id: 'evt_5', title: 'Afternoon Shift — Kim', start_time: todayAt(14), end_time: todayAt(22), status: 'confirmed', employee: 'Kim Park', role: 'Manager', event_type: 'shift', color_primary: '#10B981' },
      // Backward compat: event without event_type
      { id: 'evt_6', title: 'Team Meeting', start_time: daysFromNow(1, 16), end_time: daysFromNow(1, 17), status: 'confirmed' },
    ]
  },
  appointments: {
    type: 'calendar',
    events: [
      { id: 'appt_1', title: 'John Smith - Service', start_time: todayAt(9), end_time: todayAt(10), status: 'confirmed', client: 'John Smith', recurrence: 'none', event_type: 'appointment', color_primary: '#3B82F6' },
      { id: 'appt_2', title: 'Walk-in Consultation', start_time: todayAt(11, 30), end_time: todayAt(12), status: 'pending', recurrence: 'none', event_type: 'appointment', color_primary: '#3B82F6' },
      { id: 'appt_3', title: 'Sarah Johnson - Follow-up', start_time: daysFromNow(1, 14), end_time: daysFromNow(1, 14, 30), status: 'confirmed', client: 'Sarah Johnson', recurrence: 'weekly', event_type: 'appointment', color_primary: '#3B82F6' },
      { id: 'appt_4', title: 'Mike Davis - New service', start_time: daysFromNow(2, 10), end_time: daysFromNow(2, 11), status: 'confirmed', client: 'Mike Davis', recurrence: 'none', event_type: 'appointment', color_primary: '#3B82F6' },
    ]
  },
  schedules: {
    type: 'calendar',
    events: [
      { id: 'sched_1', title: 'Morning Block', start_time: todayAt(9), end_time: todayAt(12), status: 'open' },
      { id: 'sched_2', title: 'Afternoon Block', start_time: todayAt(13), end_time: todayAt(17), status: 'busy' },
      { id: 'sched_3', title: 'Morning Block', start_time: daysFromNow(1, 9), end_time: daysFromNow(1, 12), status: 'open' },
    ]
  },
  shifts: {
    type: 'calendar',
    events: [
      { id: 'shift_1', title: 'Morning Shift - 3 staff', start_time: todayAt(6), end_time: todayAt(14), status: 'confirmed', employee: 'Alex Rivera', role: 'Front Desk', event_type: 'shift', color_primary: '#10B981' },
      { id: 'shift_2', title: 'Afternoon Shift - 2 staff', start_time: todayAt(14), end_time: todayAt(22), status: 'confirmed', employee: 'Kim Park', role: 'Manager', event_type: 'shift', color_primary: '#10B981' },
      { id: 'shift_3', title: 'Weekend Shift - 2 staff', start_time: daysFromNow(3, 9), end_time: daysFromNow(3, 17), status: 'confirmed', employee: 'Jordan Lee', role: 'Assistant', event_type: 'shift', color_primary: '#10B981' },
    ]
  },

  // Money components
  invoices: {
    type: 'table',
    headers: ['Contact ID', 'Amount', 'Due Date', 'Status'],
    rows: [
      ['John Smith', '$150.00', 'Jan 25', 'Paid'],
      ['Sarah Johnson', '$250.00', 'Feb 1', 'Pending'],
      ['Mike Davis', '$75.00', 'Jan 20', 'Overdue'],
      ['Emily Chen', '$180.00', 'Jan 28', 'Paid'],
    ]
  },
  payments: {
    type: 'table',
    headers: ['Contact ID', 'Amount', 'Due Date', 'Status'],
    rows: [
      ['John Smith', '$150.00', 'Jan 28', 'Paid'],
      ['Emily Chen', '$180.00', 'Jan 27', 'Paid'],
      ['Sarah Johnson', '$250.00', 'Feb 1', 'Pending'],
    ]
  },
  expenses: {
    type: 'table',
    headers: ['Date', 'Description', 'Category', 'Amount'],
    rows: [
      ['Jan 28', 'Office Supplies', 'Operations', '$85.00'],
      ['Jan 25', 'Equipment Repair', 'Maintenance', '$250.00'],
      ['Jan 22', 'Marketing', 'Advertising', '$150.00'],
      ['Jan 20', 'Utilities', 'Operations', '$320.00'],
    ]
  },
  payroll: {
    type: 'cards',
    items: [
      { title: 'Next Payroll', subtitle: 'Feb 1, 2024', meta: '$4,500 total' },
      { title: 'Last Payroll', subtitle: 'Jan 15, 2024', meta: '$4,200 paid' },
      { title: 'YTD Total', subtitle: '2024', meta: '$8,700' },
    ]
  },
  estimates: {
    type: 'table',
    headers: ['Contact ID', 'Amount', 'Due Date', 'Status'],
    rows: [
      ['New Lead', '$500.00', 'Feb 15', 'Sent'],
      ['Walk-in', '$350.00', 'Feb 10', 'Draft'],
      ['Referral', '$800.00', 'Feb 5', 'Approved'],
    ]
  },

  // Task components
  todos: {
    type: 'list',
    items: [
      { title: 'Follow up with client', subtitle: 'John Smith needs callback', status: 'pending', meta: 'High priority' },
      { title: 'Order supplies', subtitle: 'Running low on stock', status: 'pending', meta: 'Medium priority' },
      { title: 'Update pricing', subtitle: 'Review service prices', status: 'in_progress', meta: 'Low priority' },
      { title: 'Clean equipment', subtitle: 'Weekly maintenance', status: 'completed', meta: 'Done' },
    ]
  },
  jobs: {
    type: 'pipeline',
    stages: [
      {
        id: 'stage_1',
        name: 'Pending',
        color: '#3B82F6',
        items: [
          { id: 'job_1', title: 'Job #1234', subtitle: 'John Smith - Service', meta: 'Due Today' },
        ],
      },
      {
        id: 'stage_2',
        name: 'In Progress',
        color: '#F59E0B',
        items: [
          { id: 'job_2', title: 'Job #1235', subtitle: 'Sarah Johnson - Repair', meta: 'Started Jan 28' },
          { id: 'job_3', title: 'Job #1237', subtitle: 'Emily Chen - Maintenance', meta: 'Started Jan 27' },
        ],
      },
      {
        id: 'stage_3',
        name: 'Review',
        color: '#8B5CF6',
        items: [
          { id: 'job_4', title: 'Job #1236', subtitle: 'Mike Davis - Install', meta: 'Awaiting approval' },
        ],
      },
      {
        id: 'stage_4',
        name: 'Complete',
        color: '#10B981',
        items: [
          { id: 'job_5', title: 'Job #1230', subtitle: 'Walk-in - Quick fix', meta: 'Completed Jan 25' },
        ],
      },
    ],
  },
  projects: {
    type: 'cards',
    items: [
      { id: 'proj_1', title: 'Website Redesign', subtitle: '3 tasks remaining', meta: '75% complete', status: 'active', metric: '75%' },
      { id: 'proj_2', title: 'New Service Launch', subtitle: '8 tasks remaining', meta: '40% complete', status: 'active', metric: '40%' },
      { id: 'proj_3', title: 'Equipment Upgrade', subtitle: '1 task remaining', meta: '90% complete', status: 'review', metric: '90%' },
    ]
  },
  workflows: {
    type: 'pipeline',
    stages: [
      {
        id: 'stage_1',
        name: 'Queued',
        color: '#3B82F6',
        items: [
          { id: 'wf_1', title: 'Invoice Follow-up', subtitle: 'Send if unpaid after 7 days', meta: '3 steps' },
        ],
      },
      {
        id: 'stage_2',
        name: 'Running',
        color: '#F59E0B',
        items: [
          { id: 'wf_2', title: 'New Client Onboarding', subtitle: 'Automated welcome sequence', meta: '5 steps' },
          { id: 'wf_3', title: 'Appointment Reminder', subtitle: 'Send 24h before', meta: '2 steps' },
        ],
      },
      {
        id: 'stage_3',
        name: 'Done',
        color: '#10B981',
        items: [
          { id: 'wf_4', title: 'Welcome Email', subtitle: 'Sent to new signups', meta: '1 step' },
        ],
      },
      {
        id: 'stage_4',
        name: 'Failed',
        color: '#EF4444',
        items: [],
      },
    ],
  },

  // Communication components
  messages: {
    type: 'list',
    items: [
      { title: 'John Smith', subtitle: 'Question about appointment', status: 'unread', meta: '2 hours ago' },
      { title: 'Sarah Johnson', subtitle: 'Thanks for the service!', status: 'unread', meta: '5 hours ago' },
      { title: 'New Lead', subtitle: 'Inquiry about services', status: 'read', meta: '1 day ago' },
    ]
  },
  notes: {
    type: 'list',
    items: [
      { title: 'Client Preferences', subtitle: 'John prefers morning appointments', meta: 'Updated Jan 28' },
      { title: 'Service Notes', subtitle: 'Remember to check equipment before...', meta: 'Updated Jan 25' },
      { title: 'Meeting Notes', subtitle: 'Team discussed new pricing...', meta: 'Updated Jan 22' },
    ]
  },
  announcements: {
    type: 'cards',
    items: [
      { title: 'Holiday Hours', subtitle: 'Closed Feb 14', meta: 'Scheduled' },
      { title: 'New Service Available', subtitle: 'Now offering premium package', meta: 'Posted Jan 20' },
      { title: 'Price Update', subtitle: 'Effective Feb 1', meta: 'Draft' },
    ]
  },
  reviews: {
    type: 'table',
    headers: ['Customer', 'Rating', 'Source', 'Status', 'Comment', 'Created At'],
    rows: [
      ['John Smith', '5', 'google', 'published', 'Excellent service! Highly recommend.', '2024-01-28'],
      ['Sarah Johnson', '4', 'yelp', 'replied', 'Very professional and on time.', '2024-01-25'],
      ['Mike Davis', '5', 'facebook', 'new', 'Best experience ever!', '2024-01-22'],
      ['Emily Chen', '3', 'direct', 'published', 'Good overall but could improve wait times.', '2024-01-18'],
    ]
  },

  // File components
  documents: {
    type: 'list',
    items: [
      { title: 'January_Report.pdf', subtitle: '245 KB', status: 'pdf', meta: 'Jan 28' },
      { title: 'Client_List.xlsx', subtitle: '128 KB', status: 'excel', meta: 'Jan 25' },
      { title: 'Service_Guide.docx', subtitle: '89 KB', status: 'doc', meta: 'Jan 20' },
    ]
  },
  contracts: {
    type: 'table',
    headers: ['Contract', 'Client', 'Status', 'Expires'],
    rows: [
      ['Service Agreement', 'John Smith', 'Active', 'Dec 2024'],
      ['Vendor Contract', 'Supply Co.', 'Active', 'Jun 2024'],
      ['Lease Agreement', 'Property LLC', 'Active', 'Mar 2025'],
    ]
  },
  images: {
    type: 'cards',
    items: [
      { title: 'Project Photos', subtitle: '24 images', meta: 'Jan 28' },
      { title: 'Before/After', subtitle: '12 images', meta: 'Jan 25' },
      { title: 'Team Photos', subtitle: '8 images', meta: 'Jan 15' },
    ]
  },
  uploads: {
    type: 'list',
    items: [
      { title: 'receipt_jan28.jpg', subtitle: 'Uploaded by Owner', status: 'complete', meta: '2 hours ago' },
      { title: 'invoice_scan.pdf', subtitle: 'Uploaded by Staff', status: 'complete', meta: '1 day ago' },
      { title: 'document.pdf', subtitle: 'Processing...', status: 'pending', meta: 'Just now' },
    ]
  },

  // Signing & Compliance
  waivers: {
    type: 'table',
    headers: ['Name', 'Client', 'Status', 'Date Signed', 'Expiry'],
    rows: [
      ['Liability Waiver', 'John Smith', 'Signed', 'Jan 28', 'Jan 2026'],
      ['Medical Release', 'Sarah Johnson', 'Signed', 'Jan 25', 'Jan 2026'],
      ['Parental Consent', 'Mike Davis (Parent)', 'Pending', '-', '-'],
      ['Fitness Waiver', 'Emily Chen', 'Signed', 'Jan 20', 'Jan 2026'],
    ]
  },
  forms: {
    type: 'table',
    headers: ['Name', 'Type', 'Submissions', 'Status', 'Created At'],
    rows: [
      ['Client Intake', 'Intake', 156, 'Active', 'Jan 1'],
      ['Feedback Survey', 'Survey', 89, 'Active', 'Jan 10'],
      ['Medical History', 'Medical', 67, 'Active', 'Dec 15'],
      ['Contact Form', 'Lead Capture', 234, 'Active', 'Nov 1'],
    ]
  },
  signatures: {
    type: 'table',
    headers: ['Document', 'Signer', 'Status', 'Signed At', 'Method'],
    rows: [
      ['Service Agreement', 'John Smith', 'Completed', 'Jan 28', 'Digital'],
      ['NDA', 'Acme Corp', 'Completed', 'Jan 25', 'Digital'],
      ['Contract Renewal', 'Sarah Johnson', 'Awaiting', '-', '-'],
      ['Lease Agreement', 'Property LLC', 'Completed', 'Jan 15', 'In Person'],
    ]
  },

  // Hospitality & Food
  reservations: {
    type: 'calendar',
    events: [
      { id: 'res_1', title: 'Smith Party (4)', start_time: todayAt(18), end_time: todayAt(20), status: 'confirmed', client: 'John Smith' },
      { id: 'res_2', title: 'Johnson Party (2)', start_time: todayAt(19), end_time: todayAt(21), status: 'confirmed', client: 'Sarah Johnson' },
      { id: 'res_3', title: 'Corporate Event (12)', start_time: daysFromNow(1, 12), end_time: daysFromNow(1, 14), status: 'pending' },
      { id: 'res_4', title: 'Birthday Dinner (8)', start_time: daysFromNow(1, 18), end_time: daysFromNow(1, 21), status: 'confirmed' },
    ]
  },
  tables: {
    type: 'cards',
    items: [
      { id: 'tbl_1', title: 'Table 1', subtitle: 'Window Section', meta: '4 seats', status: 'occupied', metric: 4 },
      { id: 'tbl_2', title: 'Table 2', subtitle: 'Patio', meta: '6 seats', status: 'available', metric: 6 },
      { id: 'tbl_3', title: 'Table 3', subtitle: 'Main Hall', meta: '8 seats', status: 'reserved', metric: 8 },
      { id: 'tbl_4', title: 'Table 4', subtitle: 'Bar Area', meta: '2 seats', status: 'occupied', metric: 2 },
      { id: 'tbl_5', title: 'Table 5', subtitle: 'Private Room', meta: '12 seats', status: 'available', metric: 12 },
    ]
  },
  menus: {
    type: 'cards',
    items: [
      { id: 'menu_1', title: 'Grilled Salmon', subtitle: 'Entrees', meta: 'GF, DF', status: 'available', metric: '$28' },
      { id: 'menu_2', title: 'Caesar Salad', subtitle: 'Starters', meta: 'Vegetarian', status: 'available', metric: '$14' },
      { id: 'menu_3', title: 'Ribeye Steak', subtitle: 'Entrees', meta: 'GF', status: 'available', metric: '$42' },
      { id: 'menu_4', title: 'Tiramisu', subtitle: 'Desserts', meta: 'Contains nuts', status: 'available', metric: '$12' },
    ]
  },
  orders: {
    type: 'table',
    headers: ['Order Number', 'Customer', 'Total', 'Status', 'Created At'],
    rows: [
      ['#1043', 'John S.', '$89.50', 'New', 'Feb 6, 2:57 PM'],
      ['#1045', 'Mike R.', '$28.00', 'New', 'Feb 6, 2:59 PM'],
      ['#1044', 'Sarah K.', '$67.25', 'Confirmed', 'Feb 6, 2:55 PM'],
      ['#1042', 'Table 3', '$156.00', 'Preparing', 'Feb 6, 2:48 PM'],
      ['#1041', 'Table 1', '$42.00', 'Ready', 'Feb 6, 2:42 PM'],
      ['#1040', 'Takeout', '$234.00', 'Completed', 'Feb 6, 2:25 PM'],
    ],
  },
  rooms: {
    type: 'cards',
    items: [
      { id: 'room_1', title: 'Treatment Room A', subtitle: 'Spa', meta: '$95/hr', status: 'occupied', metric: '$95' },
      { id: 'room_2', title: 'Studio 1', subtitle: 'Photography', meta: '$150/hr', status: 'available', metric: '$150' },
      { id: 'room_3', title: 'Meeting Room', subtitle: 'Conference', meta: '12 capacity', status: 'reserved', metric: 12 },
      { id: 'room_4', title: 'Treatment Room B', subtitle: 'Spa', meta: '$95/hr', status: 'available', metric: '$95' },
    ]
  },
  recipes: {
    type: 'cards',
    items: [
      { id: 'rec_1', title: 'Signature Pasta', subtitle: 'Italian', meta: '25 min prep', status: 'active', metric: '$6.50' },
      { id: 'rec_2', title: 'House Burger', subtitle: 'American', meta: '15 min prep', status: 'active', metric: '$4.20' },
      { id: 'rec_3', title: 'Seasonal Salad', subtitle: 'Healthy', meta: '10 min prep', status: 'seasonal', metric: '$3.80' },
      { id: 'rec_4', title: 'Chocolate Lava Cake', subtitle: 'Dessert', meta: '45 min prep', status: 'active', metric: '$2.90' },
    ]
  },
  waitlist: {
    type: 'list',
    items: [
      { id: 'wl_1', title: 'John Smith', subtitle: 'Party of 4 · (555) 234-5678', status: 'waiting', meta: '12 min' },
      { id: 'wl_2', title: 'Sarah Johnson', subtitle: 'Party of 2 · (555) 345-6789', status: 'waiting', meta: '8 min' },
      { id: 'wl_3', title: 'Mike Chen', subtitle: 'Party of 6 · (555) 456-7890', status: 'notified', meta: '22 min' },
      { id: 'wl_4', title: 'Emily Davis', subtitle: 'Party of 3 · (555) 567-8901', status: 'waiting', meta: '3 min' },
      { id: 'wl_5', title: 'Tom Wilson', subtitle: 'Party of 2 · (555) 678-9012', status: 'seated', meta: 'Seated' },
    ]
  },
  tip_pools: {
    type: 'table',
    headers: ['Date', 'Total Tips', 'Foh Share Percent', 'Boh Share Percent', 'Distributed'],
    rows: [
      ['Feb 6', '$842.50', '80%', '20%', 'Yes'],
      ['Feb 5', '$723.00', '80%', '20%', 'Yes'],
      ['Feb 4', '$915.75', '80%', '20%', 'Yes'],
      ['Feb 3', '$668.25', '80%', '20%', 'No'],
      ['Feb 2', '$1,102.00', '80%', '20%', 'Yes'],
    ]
  },
  waste_log: {
    type: 'table',
    headers: ['Item Name', 'Quantity', 'Unit', 'Reason', 'Estimated Cost', 'Logged By', 'Created At'],
    rows: [
      ['Salmon Fillet', '3', 'portions', 'Expired', '$24.00', 'Chef Mike', 'Feb 6'],
      ['Mixed Greens', '2', 'lbs', 'Damaged', '$6.50', 'Prep Cook', 'Feb 6'],
      ['Bread Rolls', '8', 'pieces', 'Overproduction', '$4.80', 'Baker', 'Feb 5'],
      ['Chicken Breast', '1', 'portions', 'Customer Return', '$8.50', 'Server Anna', 'Feb 5'],
      ['Tomato Sauce', '1', 'quart', 'Expired', '$3.20', 'Chef Mike', 'Feb 4'],
    ]
  },
  suppliers: {
    type: 'table',
    headers: ['Name', 'Contact Name', 'Email', 'Phone', 'Category'],
    rows: [
      ['Fresh Farms Co', 'Lisa Park', 'lisa@freshfarms.com', '(555) 111-2222', 'Produce'],
      ['Ocean Catch Seafood', 'James Rivera', 'james@oceancatch.com', '(555) 222-3333', 'Seafood'],
      ['Valley Meats', 'Bob Martin', 'bob@valleymeats.com', '(555) 333-4444', 'Meat'],
      ['Baker Supply', 'Amy Chen', 'amy@bakersupply.com', '(555) 444-5555', 'Dry Goods'],
    ]
  },
  purchase_orders: {
    type: 'table',
    headers: ['Po Number', 'Supplier', 'Total', 'Status', 'Expected Delivery', 'Created At'],
    rows: [
      ['PO-2024-042', 'Fresh Farms Co', '$485.00', 'Received', 'Feb 5', 'Feb 1'],
      ['PO-2024-043', 'Ocean Catch Seafood', '$1,230.00', 'Sent', 'Feb 8', 'Feb 3'],
      ['PO-2024-044', 'Valley Meats', '$890.00', 'Draft', 'Feb 10', 'Feb 4'],
      ['PO-2024-045', 'Baker Supply', '$245.00', 'Sent', 'Feb 7', 'Feb 3'],
    ]
  },

  // Education & Programs
  classes: {
    type: 'calendar',
    events: [
      { id: 'cls_1', title: 'Beginner Karate', start_time: todayAt(9), end_time: todayAt(10), status: 'confirmed', instructor: 'Sensei Mike', max_capacity: 20, event_type: 'class', color_primary: '#8B5CF6' },
      { id: 'cls_2', title: 'Advanced BJJ', start_time: todayAt(11), end_time: todayAt(12, 30), status: 'confirmed', instructor: 'Coach Sarah', max_capacity: 15, event_type: 'class', color_primary: '#8B5CF6' },
      { id: 'cls_3', title: 'Kids Yoga', start_time: daysFromNow(1, 15), end_time: daysFromNow(1, 16), status: 'confirmed', instructor: 'Maya', max_capacity: 12, event_type: 'class', color_primary: '#8B5CF6' },
      { id: 'cls_4', title: 'HIIT Training', start_time: daysFromNow(2, 7), end_time: daysFromNow(2, 8), status: 'confirmed', instructor: 'Coach Sarah', max_capacity: 25, event_type: 'class', color_primary: '#8B5CF6' },
    ]
  },
  memberships: {
    type: 'pipeline',
    stages: [
      {
        id: 'plan_basic', name: 'Basic — $29/mo', color: '#3B82F6',
        items: [
          { id: 'mm_1', title: 'Sarah Johnson', subtitle: 'Since Feb 1', meta: 'Current' },
          { id: 'mm_2', title: 'Tom Wilson', subtitle: 'Since Jan 15', meta: 'Current' },
          { id: 'mm_3', title: 'Amy Liu', subtitle: 'Since Dec 10', meta: 'Current' },
        ],
      },
      {
        id: 'plan_premium', name: 'Premium — $59/mo', color: '#8B5CF6',
        items: [
          { id: 'mm_4', title: 'Mike Davis', subtitle: 'Since Dec 1', meta: 'Current' },
          { id: 'mm_5', title: 'Emily Chen', subtitle: 'Since Jan 5', meta: 'Past Due' },
        ],
      },
      {
        id: 'plan_vip', name: 'VIP — $99/mo', color: '#F59E0B',
        items: [
          { id: 'mm_6', title: 'John Smith', subtitle: 'Since Jan 1', meta: 'Current' },
          { id: 'mm_7', title: 'Rachel Kim', subtitle: 'Since Feb 10', meta: 'Current' },
        ],
      },
      {
        id: 'plan_cancelled', name: 'Cancelled', color: '#6B7280',
        items: [
          { id: 'mm_8', title: 'David Park', subtitle: 'Was Basic', meta: 'Cancelled Jan 20' },
        ],
      },
    ],
  },
  courses: {
    type: 'cards',
    items: [
      { id: 'crs_1', title: 'Belt Program', subtitle: 'Instructor: Sensei Mike', meta: '24 enrolled', status: 'active', metric: 24 },
      { id: 'crs_2', title: 'Self Defense', subtitle: 'Instructor: Coach Sarah', meta: '18 enrolled', status: 'active', metric: 18 },
      { id: 'crs_3', title: 'Yoga Teacher Training', subtitle: 'Instructor: Maya', meta: '12 enrolled', status: 'active', metric: 12 },
    ]
  },
  attendance: {
    type: 'table',
    headers: ['Member', 'Class', 'Date', 'Time In', 'Checked In'],
    rows: [
      ['John Smith', 'Beginner Karate', 'Jan 29', '9:02 AM', 'Yes'],
      ['Sarah Johnson', 'HIIT Training', 'Jan 29', '7:05 AM', 'Yes'],
      ['Mike Davis', 'Advanced BJJ', 'Jan 29', '10:58 AM', 'Yes'],
      ['Emily Chen', 'Kids Yoga', 'Jan 29', '3:00 PM', 'Pending'],
    ]
  },

  // Field Service
  inspections: {
    type: 'table',
    headers: ['Location', 'Inspector', 'Type', 'Result', 'Date'],
    rows: [
      ['123 Main St', 'Bob Wilson', 'Electrical', 'Pass', 'Jan 28'],
      ['456 Oak Ave', 'Tom Chen', 'Plumbing', 'Pass', 'Jan 27'],
      ['789 Elm Blvd', 'Bob Wilson', 'Safety', 'Fail', 'Jan 25'],
      ['321 Pine St', 'Lisa Park', 'Final', 'Pass', 'Jan 24'],
    ]
  },
  routes: {
    type: 'route',
    businessLocation: { lat: 44.9778, lon: -93.2650, name: 'HQ - 123 Main St, Minneapolis' },
    routes: [
      {
        id: 'route_1', name: 'North Route', driver: 'Tom', status: 'active', color: '#3B82F6', eta: '2:30 PM',
        territory: [[45.02, -93.32], [45.02, -93.20], [44.99, -93.20], [44.99, -93.32]],
        stops: [
          { id: 'stop_1', customer_name: 'Johnson Residence', address: '456 Oak Ave N, Minneapolis', lat: 45.010, lon: -93.28, service_type: 'Lawn Mowing', estimated_duration: 45, order: 0 },
          { id: 'stop_2', customer_name: 'Greenfield Office Park', address: '789 Pine Blvd, Minneapolis', lat: 45.005, lon: -93.24, service_type: 'Landscaping', estimated_duration: 60, order: 1 },
          { id: 'stop_3', customer_name: 'Wilson Home', address: '321 Birch Ln, Minneapolis', lat: 45.000, lon: -93.22, service_type: 'Hedge Trimming', estimated_duration: 30, order: 2 },
        ],
      },
      {
        id: 'route_2', name: 'South Route', driver: 'Mike', status: 'active', color: '#10B981', eta: '3:15 PM',
        territory: [[44.97, -93.30], [44.97, -93.22], [44.94, -93.22], [44.94, -93.30]],
        stops: [
          { id: 'stop_4', customer_name: 'Maple Heights HOA', address: '100 Maple Dr, Bloomington', lat: 44.960, lon: -93.28, service_type: 'Lawn Mowing', estimated_duration: 90, order: 0 },
          { id: 'stop_5', customer_name: 'Rivera Residence', address: '250 Cedar St, Bloomington', lat: 44.955, lon: -93.25, service_type: 'Snow Removal', estimated_duration: 45, order: 1 },
          { id: 'stop_6', customer_name: 'Lakeside Church', address: '400 Lake St, Richfield', lat: 44.948, lon: -93.23, service_type: 'Grounds Maintenance', estimated_duration: 60, order: 2 },
        ],
      },
      {
        id: 'route_3', name: 'Downtown Route', driver: 'Sarah', status: 'completed', color: '#8B5CF6', eta: 'Done 1:00 PM',
        territory: [[44.985, -93.28], [44.985, -93.24], [44.970, -93.24], [44.970, -93.28]],
        stops: [
          { id: 'stop_7', customer_name: 'City Hall Plaza', address: '350 5th St S, Minneapolis', lat: 44.978, lon: -93.27, service_type: 'Flower Beds', estimated_duration: 40, order: 0 },
          { id: 'stop_8', customer_name: 'Metro Dental Clinic', address: '200 Hennepin Ave, Minneapolis', lat: 44.980, lon: -93.26, service_type: 'Lawn Mowing', estimated_duration: 30, order: 1 },
          { id: 'stop_9', customer_name: 'Park Tower Condos', address: '500 Marquette Ave, Minneapolis', lat: 44.975, lon: -93.25, service_type: 'Landscaping', estimated_duration: 75, order: 2 },
        ],
      },
      {
        id: 'route_4', name: 'West Route', driver: 'Bob', status: 'pending', color: '#F59E0B',
        territory: [[44.99, -93.36], [44.99, -93.30], [44.96, -93.30], [44.96, -93.36]],
        stops: [
          { id: 'stop_10', customer_name: 'Westview Apartments', address: '800 Wayzata Blvd, Golden Valley', lat: 44.985, lon: -93.34, service_type: 'Lawn Mowing', estimated_duration: 60, order: 0 },
          { id: 'stop_11', customer_name: 'Birchwood Elementary', address: '600 Xenia Ave, Golden Valley', lat: 44.975, lon: -93.33, service_type: 'Grounds Maintenance', estimated_duration: 90, order: 1 },
          { id: 'stop_12', customer_name: 'Anderson Residence', address: '425 Winnetka Ave, Golden Valley', lat: 44.968, lon: -93.32, service_type: 'Hedge Trimming', estimated_duration: 35, order: 2 },
        ],
      },
    ],
    customers: [
      { id: 'cust_1', name: 'Johnson Residence', address: '456 Oak Ave N', lat: 45.010, lon: -93.28 },
      { id: 'cust_2', name: 'Greenfield Office Park', address: '789 Pine Blvd', lat: 45.005, lon: -93.24 },
      { id: 'cust_3', name: 'Wilson Home', address: '321 Birch Ln', lat: 45.000, lon: -93.22 },
      { id: 'cust_4', name: 'Maple Heights HOA', address: '100 Maple Dr', lat: 44.960, lon: -93.28 },
      { id: 'cust_5', name: 'Rivera Residence', address: '250 Cedar St', lat: 44.955, lon: -93.25 },
      { id: 'cust_6', name: 'Lakeside Church', address: '400 Lake St', lat: 44.948, lon: -93.23 },
      { id: 'cust_7', name: 'City Hall Plaza', address: '350 5th St S', lat: 44.978, lon: -93.27 },
      { id: 'cust_8', name: 'Metro Dental Clinic', address: '200 Hennepin Ave', lat: 44.980, lon: -93.26 },
      { id: 'cust_9', name: 'Park Tower Condos', address: '500 Marquette Ave', lat: 44.975, lon: -93.25 },
      { id: 'cust_10', name: 'Westview Apartments', address: '800 Wayzata Blvd', lat: 44.985, lon: -93.34 },
      { id: 'cust_11', name: 'Birchwood Elementary', address: '600 Xenia Ave', lat: 44.975, lon: -93.33 },
      { id: 'cust_12', name: 'Anderson Residence', address: '425 Winnetka Ave', lat: 44.968, lon: -93.32 },
      // Unassigned customers (visible as pins but not on any route)
      { id: 'cust_13', name: 'Thompson Residence', address: '900 France Ave S', lat: 44.935, lon: -93.33 },
      { id: 'cust_14', name: 'Sunrise Bakery', address: '150 Central Ave NE', lat: 45.002, lon: -93.25 },
      { id: 'cust_15', name: 'Highland Park School', address: '1012 Snelling Ave', lat: 44.942, lon: -93.17 },
    ],
  },
  fleet: {
    type: 'cards',
    items: [
      { id: 'veh_1', title: 'Truck #101', subtitle: '2022 Ford F-150', meta: '45,230 mi', status: 'active', metric: '45k' },
      { id: 'veh_2', title: 'Van #102', subtitle: '2023 Transit', meta: '12,890 mi', status: 'active', metric: '13k' },
      { id: 'veh_3', title: 'Truck #103', subtitle: '2021 Silverado', meta: '67,450 mi', status: 'service', metric: '67k' },
      { id: 'veh_4', title: 'Van #104', subtitle: '2023 Sprinter', meta: '8,920 mi', status: 'active', metric: '9k' },
    ]
  },
  checklists: {
    type: 'list',
    items: [
      { title: 'Daily Opening Checklist', subtitle: 'Assigned: Front Desk', status: 'completed', meta: '100% - 8 items' },
      { title: 'Safety Inspection', subtitle: 'Assigned: Manager', status: 'in_progress', meta: '60% - 10 items' },
      { title: 'Closing Procedures', subtitle: 'Assigned: Shift Lead', status: 'pending', meta: '0% - 6 items' },
      { title: 'Weekly Deep Clean', subtitle: 'Assigned: Cleaning Team', status: 'overdue', meta: '30% - 12 items' },
    ]
  },
  permits: {
    type: 'table',
    headers: ['Permit Type', 'Authority', 'Status', 'Issued', 'Expiry'],
    rows: [
      ['Building Permit', 'City of Austin', 'Active', 'Jan 15', 'Jul 15'],
      ['Electrical License', 'State Board', 'Active', 'Mar 1', 'Mar 2026'],
      ['Fire Safety', 'Fire Dept', 'Renewal', 'Dec 1', 'Feb 28'],
      ['Health Inspection', 'Health Dept', 'Active', 'Jan 10', 'Jan 2026'],
    ]
  },

  // Health & Medical
  prescriptions: {
    type: 'table',
    headers: ['Medication', 'Patient', 'Dosage', 'Frequency', 'Refills'],
    rows: [
      ['Amoxicillin', 'Buddy (Golden Retriever)', '250mg', 'Twice daily', '2'],
      ['Heartgard', 'Max (German Shepherd)', '1 tablet', 'Monthly', '5'],
      ['Prednisone', 'Luna (Cat)', '5mg', 'Once daily', '1'],
      ['Rimadyl', 'Rocky (Bulldog)', '75mg', 'Twice daily', '3'],
    ]
  },
  treatments: {
    type: 'table',
    headers: ['Treatment', 'Patient', 'Provider', 'Date', 'Status'],
    rows: [
      ['Root Canal', 'John Smith', 'Dr. Chen', 'Jan 28', 'Completed'],
      ['Knee Surgery', 'Sarah Johnson', 'Dr. Patel', 'Feb 5', 'Scheduled'],
      ['Physical Therapy', 'Mike Davis', 'Dr. Wilson', 'Jan 25', 'In Progress'],
      ['Annual Checkup', 'Emily Chen', 'Dr. Lee', 'Feb 1', 'Scheduled'],
    ]
  },

  // Creative
  portfolios: {
    type: 'cards',
    items: [
      { id: 'port_1', title: 'Wedding Photography', subtitle: 'Weddings', meta: 'Smith Wedding', status: 'featured', metric: 48 },
      { id: 'port_2', title: 'Corporate Headshots', subtitle: 'Corporate', meta: 'Acme Corp', status: 'active', metric: 24 },
      { id: 'port_3', title: 'Product Shoot', subtitle: 'Commercial', meta: 'Brand X', status: 'active', metric: 36 },
    ]
  },
  galleries: {
    type: 'cards',
    items: [
      { id: 'gal_1', title: 'Smith Wedding', subtitle: 'John & Sarah', meta: '248 photos', status: 'shared', metric: 248 },
      { id: 'gal_2', title: 'Fall Mini Sessions', subtitle: 'Various Clients', meta: '120 photos', status: 'proofing', metric: 120 },
      { id: 'gal_3', title: 'Corporate Event', subtitle: 'Acme Corp', meta: '86 photos', status: 'editing', metric: 86 },
    ]
  },

  // Real Estate
  listings: {
    type: 'cards',
    items: [
      { id: 'list_1', title: '123 Oak Lane', subtitle: '$425,000', meta: '3 bed / 2 bath / 1,800 sqft', status: 'active', metric: '$425k' },
      { id: 'list_2', title: '456 Pine Dr', subtitle: '$675,000', meta: '4 bed / 3 bath / 2,400 sqft', status: 'pending', metric: '$675k' },
      { id: 'list_3', title: '789 Maple Ave', subtitle: '$320,000', meta: '2 bed / 1 bath / 1,200 sqft', status: 'active', metric: '$320k' },
    ]
  },
  properties: {
    type: 'table',
    headers: ['Address', 'Tenant', 'Rent', 'Lease End', 'Status'],
    rows: [
      ['Unit 1A', 'John Smith', '$1,800/mo', 'Dec 2025', 'Occupied'],
      ['Unit 2B', 'Sarah Johnson', '$2,200/mo', 'Jun 2025', 'Occupied'],
      ['Unit 3C', '-', '$1,950/mo', '-', 'Vacant'],
      ['Unit 4D', 'Mike Davis', '$1,600/mo', 'Mar 2025', 'Notice Given'],
    ]
  },

  // Legal
  cases: {
    type: 'pipeline',
    stages: [
      {
        id: 'stage_1', name: 'New', color: '#3B82F6',
        items: [
          { id: 'case_1', title: 'Smith v. Corp', subtitle: 'Personal Injury', meta: 'Filed Jan 28' },
        ],
      },
      {
        id: 'stage_2', name: 'Discovery', color: '#F59E0B',
        items: [
          { id: 'case_2', title: 'Johnson Estate', subtitle: 'Probate', meta: 'Since Jan 15' },
          { id: 'case_3', title: 'Davis Contract', subtitle: 'Contract Dispute', value: 50000, meta: '$50k' },
        ],
      },
      {
        id: 'stage_3', name: 'Trial', color: '#8B5CF6',
        items: [
          { id: 'case_4', title: 'Chen IP Case', subtitle: 'Intellectual Property', value: 150000, meta: '$150k' },
        ],
      },
      {
        id: 'stage_4', name: 'Closed', color: '#10B981',
        items: [
          { id: 'case_5', title: 'Wilson Settlement', subtitle: 'Medical Malpractice', value: 75000, meta: 'Settled' },
        ],
      },
    ],
  },

  // Events
  venues: {
    type: 'cards',
    items: [
      { id: 'ven_1', title: 'Grand Ballroom', subtitle: '500 E Main St', meta: '300 capacity', status: 'available', metric: 300 },
      { id: 'ven_2', title: 'Garden Terrace', subtitle: 'Outdoor', meta: '150 capacity', status: 'booked', metric: 150 },
      { id: 'ven_3', title: 'Conference Center', subtitle: '200 N Oak Ave', meta: '100 capacity', status: 'available', metric: 100 },
    ]
  },
  guests: {
    type: 'table',
    headers: ['Guest', 'Event', 'RSVP', 'Party Size', 'Dietary'],
    rows: [
      ['John & Sarah Smith', 'Gala Dinner', 'Confirmed', '2', 'None'],
      ['Mike Davis + Guest', 'Gala Dinner', 'Confirmed', '2', 'Vegetarian'],
      ['Emily Chen Family', 'Gala Dinner', 'Pending', '4', 'Gluten Free'],
      ['Corporate Group', 'Conference', 'Confirmed', '15', 'Mixed'],
    ]
  },

  // Marketing
  campaigns: {
    type: 'table',
    headers: ['Campaign', 'Channel', 'Status', 'Reach', 'Conversions'],
    rows: [
      ['Summer Sale', 'Email', 'Active', '2,400', '156'],
      ['Social Promo', 'Instagram', 'Active', '5,600', '89'],
      ['Google Ads', 'Search', 'Active', '3,200', '67'],
      ['Newsletter', 'Email', 'Scheduled', '-', '-'],
    ]
  },
  loyalty: {
    type: 'table',
    headers: ['Member', 'Tier', 'Points', 'Join Date', 'Last Activity'],
    rows: [
      ['John Smith', 'Gold', '2,450', 'Jan 2023', 'Jan 28'],
      ['Sarah Johnson', 'Silver', '1,230', 'Mar 2023', 'Jan 25'],
      ['Mike Davis', 'Gold', '3,100', 'Nov 2022', 'Jan 27'],
      ['Emily Chen', 'Bronze', '450', 'Dec 2024', 'Jan 20'],
    ]
  },
  surveys: {
    type: 'table',
    headers: ['Survey', 'Responses', 'Completion Rate', 'Status', 'Created'],
    rows: [
      ['Customer Satisfaction', '234', '82%', 'Active', 'Jan 1'],
      ['Service Feedback', '156', '76%', 'Active', 'Jan 15'],
      ['Employee NPS', '42', '91%', 'Closed', 'Dec 1'],
      ['New Feature Interest', '89', '68%', 'Active', 'Jan 20'],
    ]
  },

  // Support
  tickets: {
    type: 'pipeline',
    stages: [
      {
        id: 'stage_1', name: 'New', color: '#3B82F6',
        items: [
          { id: 'tkt_1', title: 'Login Issues', subtitle: 'john@email.com', meta: 'High priority' },
          { id: 'tkt_2', title: 'Billing Question', subtitle: 'sarah@email.com', meta: 'Medium' },
        ],
      },
      {
        id: 'stage_2', name: 'In Progress', color: '#F59E0B',
        items: [
          { id: 'tkt_3', title: 'Feature Request', subtitle: 'mike@email.com', meta: 'Low priority' },
        ],
      },
      {
        id: 'stage_3', name: 'Resolved', color: '#10B981',
        items: [
          { id: 'tkt_4', title: 'Password Reset', subtitle: 'emily@email.com', meta: 'Resolved today' },
          { id: 'tkt_5', title: 'Setup Help', subtitle: 'alex@email.com', meta: 'Resolved Jan 27' },
        ],
      },
    ],
  },
  knowledge: {
    type: 'list',
    items: [
      { title: 'Getting Started Guide', subtitle: 'Onboarding', status: 'published', meta: '1,234 views' },
      { title: 'How to Book Appointments', subtitle: 'Features', status: 'published', meta: '856 views' },
      { title: 'Payment Methods FAQ', subtitle: 'Billing', status: 'published', meta: '623 views' },
      { title: 'Troubleshooting Tips', subtitle: 'Support', status: 'draft', meta: '0 views' },
    ]
  },

  // Business Operations
  packages: {
    type: 'cards',
    items: [
      { id: 'pkg_1', title: 'Basic Package', subtitle: '3 services included', meta: 'Most Popular', status: 'active', metric: '$99' },
      { id: 'pkg_2', title: 'Premium Package', subtitle: '6 services included', meta: 'Best Value', status: 'active', metric: '$189' },
      { id: 'pkg_3', title: 'VIP Package', subtitle: '10 services included', meta: 'All Access', status: 'active', metric: '$299' },
    ]
  },
  subscriptions: {
    type: 'table',
    headers: ['Subscriber', 'Plan', 'Amount', 'Next Billing', 'Status'],
    rows: [
      ['John Smith', 'Monthly Premium', '$49/mo', 'Feb 1', 'Active'],
      ['Sarah Johnson', 'Annual Basic', '$29/mo', 'Mar 1', 'Active'],
      ['Mike Davis', 'Monthly Premium', '$49/mo', 'Feb 1', 'Past Due'],
      ['Emily Chen', 'Monthly Basic', '$29/mo', 'Feb 15', 'Active'],
    ]
  },
  time_tracking: {
    type: 'table',
    headers: ['Employee', 'Project', 'Hours', 'Date', 'Billable'],
    rows: [
      ['John Smith', 'Website Redesign', '6.5', 'Jan 28', 'Yes'],
      ['Sarah Johnson', 'Tax Preparation', '8.0', 'Jan 28', 'Yes'],
      ['Mike Davis', 'Internal Meeting', '1.5', 'Jan 28', 'No'],
      ['Emily Chen', 'Client Consultation', '3.0', 'Jan 28', 'Yes'],
    ]
  },

  // Digital & Online
  social_media: {
    type: 'cards',
    items: [
      { id: 'sm_1', title: 'New Year Promo', subtitle: 'Instagram', meta: 'Scheduled Jan 30', status: 'scheduled', metric: '2.1k' },
      { id: 'sm_2', title: 'Behind the Scenes', subtitle: 'Facebook', meta: 'Posted Jan 28', status: 'published', metric: '456' },
      { id: 'sm_3', title: 'Client Spotlight', subtitle: 'Twitter/X', meta: 'Draft', status: 'draft', metric: '-' },
      { id: 'sm_4', title: 'Service Highlight', subtitle: 'LinkedIn', meta: 'Scheduled Feb 1', status: 'scheduled', metric: '-' },
    ]
  },
  reputation: {
    type: 'table',
    headers: ['Reviewer', 'Platform', 'Rating', 'Date', 'Replied'],
    rows: [
      ['John Smith', 'Google', '5', 'Jan 28', 'Yes'],
      ['Sarah Johnson', 'Yelp', '4', 'Jan 25', 'Yes'],
      ['Anonymous', 'Facebook', '5', 'Jan 22', 'No'],
      ['Mike Davis', 'Google', '3', 'Jan 20', 'Yes'],
    ]
  },
  portal: {
    type: 'table',
    headers: ['Client', 'Access Level', 'Last Login', 'Status', 'Features'],
    rows: [
      ['John Smith', 'Full', 'Jan 28', 'Active', 'All'],
      ['Sarah Johnson', 'Standard', 'Jan 25', 'Active', 'Appointments, Invoices'],
      ['Mike Davis', 'Basic', 'Jan 15', 'Inactive', 'Appointments'],
      ['Emily Chen', 'Full', 'Jan 27', 'Active', 'All'],
    ]
  },
  community: {
    type: 'list',
    items: [
      { title: 'Welcome to our community!', subtitle: 'Admin', status: 'pinned', meta: '24 replies' },
      { title: 'Tips for beginners', subtitle: 'Coach Mike', status: 'active', meta: '18 replies' },
      { title: 'Weekend workshop photos', subtitle: 'Sarah J.', status: 'active', meta: '12 replies' },
      { title: 'Monthly challenge: February', subtitle: 'Admin', status: 'new', meta: '5 replies' },
    ]
  },
  chat_widget: {
    type: 'list',
    items: [
      { title: 'Visitor from Google', subtitle: 'Pricing page', status: 'active', meta: 'Just now' },
      { title: 'Returning visitor', subtitle: 'Services page', status: 'active', meta: '2 min ago' },
      { title: 'john@email.com', subtitle: 'Booking page', status: 'ended', meta: '15 min ago' },
      { title: 'Anonymous visitor', subtitle: 'Home page', status: 'missed', meta: '1 hour ago' },
    ]
  },
};

// Platform tab data (site, analytics, settings)
export const platformDummyData = {
  site: {
    pages: [
      { name: 'Home', status: 'published', views: 1240 },
      { name: 'Services', status: 'published', views: 890 },
      { name: 'Book Now', status: 'published', views: 456 },
      { name: 'About', status: 'draft', views: 0 },
    ],
    bookings: {
      thisWeek: 18,
      lastWeek: 15,
      conversion: '12%',
    },
  },
  analytics: {
    revenue: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [320, 450, 380, 520, 680, 890, 420],
    },
    monthlyRevenue: {
      labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      values: [8200, 9100, 10400, 12800, 11500, 13200],
    },
    topServices: [
      { name: 'Service A', count: 45, revenue: '$2,475' },
      { name: 'Service B', count: 32, revenue: '$1,440' },
      { name: 'Service C', count: 28, revenue: '$2,100' },
      { name: 'Service D', count: 19, revenue: '$950' },
      { name: 'Service E', count: 14, revenue: '$630' },
    ],
    clientStats: {
      total: 156,
      new: 12,
      returning: 85,
    },
    clientGrowth: {
      labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      values: [98, 112, 124, 138, 147, 156],
    },
    bookingStats: {
      total: 284,
      completed: 251,
      cancelled: 18,
      noShow: 15,
      completionRate: '88%',
    },
  },
  settings: {
    business: {
      name: 'Your Business',
      email: 'contact@business.com',
      phone: '(555) 123-4567',
      address: '123 Main St',
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  },
};

// Helper function to get component data
export function getComponentData(componentId: string): ComponentData | undefined {
  return componentDummyData[componentId];
}

// =============================================================================
// LEGACY DATA - Keep for backwards compatibility during migration
// =============================================================================

export const salonData = {
  people: {
    clients: [
      { name: 'Sarah Johnson', email: 'sarah@email.com', visits: 12, lastVisit: 'Jan 25' },
      { name: 'Emily Chen', email: 'emily@email.com', visits: 8, lastVisit: 'Jan 22' },
      { name: 'Maria Garcia', email: 'maria@email.com', visits: 15, lastVisit: 'Jan 28' },
    ],
    staff: [
      { name: 'Jessica (Owner)', role: 'Nail Tech', clients: 45 },
      { name: 'Amanda', role: 'Nail Tech', clients: 32 },
    ],
  },
  time: {
    today: [
      { time: '10:00 AM', client: 'Sarah Johnson', service: 'Gel Manicure' },
      { time: '11:30 AM', client: 'Walk-in', service: 'Pedicure' },
      { time: '2:00 PM', client: 'Emily Chen', service: 'Full Set' },
    ],
  },
  money: {
    todayRevenue: '$340',
    weekRevenue: '$2,450',
    monthRevenue: '$9,800',
    pendingInvoices: 3,
    recentTransactions: [
      { date: 'Jan 28', client: 'Maria Garcia', service: 'Full Set + Design', amount: '$85' },
      { date: 'Jan 28', client: 'Walk-in', service: 'Pedicure', amount: '$45' },
      { date: 'Jan 27', client: 'Sarah Johnson', service: 'Gel Manicure', amount: '$55' },
    ],
  },
  things: {
    products: [
      { name: 'OPI Gel Polish Set', sku: 'OPI-001', stock: 24, price: '$12.99' },
      { name: 'Acetone Remover', sku: 'ACE-002', stock: 18, price: '$8.50' },
      { name: 'Nail Files (Pack of 10)', sku: 'NF-010', stock: 45, price: '$15.00' },
      { name: 'Cuticle Oil', sku: 'CO-003', stock: 32, price: '$6.99' },
    ],
    lowStock: [
      { name: 'Base Coat', stock: 3, reorderPoint: 10 },
      { name: 'Top Coat', stock: 5, reorderPoint: 10 },
    ],
  },
  tasks: {
    todos: [
      { title: 'Order new gel polish colors', priority: 'high', due: 'Today', status: 'pending' },
      { title: 'Schedule staff meeting', priority: 'medium', due: 'Jan 30', status: 'pending' },
      { title: 'Update price list', priority: 'low', due: 'Feb 1', status: 'in_progress' },
      { title: 'Clean UV lamps', priority: 'medium', due: 'Jan 29', status: 'completed' },
    ],
  },
  comms: {
    messages: [
      { from: 'Sarah Johnson', subject: 'Reschedule appointment', time: '2 hours ago', unread: true },
      { from: 'Emily Chen', subject: 'Question about gel options', time: '5 hours ago', unread: true },
      { from: 'Maria Garcia', subject: 'Thanks for the great service!', time: '1 day ago', unread: false },
    ],
    announcements: [
      { title: 'Valentine\'s Day Special', date: 'Feb 1-14', status: 'scheduled' },
      { title: 'Holiday Hours Update', date: 'Jan 15', status: 'sent' },
    ],
  },
  files: {
    recent: [
      { name: 'January_Revenue_Report.pdf', type: 'pdf', size: '245 KB', date: 'Jan 28' },
      { name: 'Staff_Schedule_Feb.xlsx', type: 'excel', size: '128 KB', date: 'Jan 27' },
      { name: 'Client_Consent_Form.pdf', type: 'pdf', size: '89 KB', date: 'Jan 25' },
    ],
    folders: [
      { name: 'Invoices', count: 45 },
      { name: 'Contracts', count: 12 },
      { name: 'Marketing', count: 8 },
    ],
  },
  site: {
    pages: [
      { name: 'Home', status: 'published', views: 1240 },
      { name: 'Services', status: 'published', views: 890 },
      { name: 'Book Now', status: 'published', views: 456 },
      { name: 'About', status: 'draft', views: 0 },
    ],
    bookings: {
      thisWeek: 18,
      lastWeek: 15,
      conversion: '12%',
    },
  },
  analytics: {
    revenue: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [320, 450, 380, 520, 680, 890, 420],
    },
    topServices: [
      { name: 'Gel Manicure', count: 45, revenue: '$2,475' },
      { name: 'Pedicure', count: 32, revenue: '$1,440' },
      { name: 'Full Set', count: 28, revenue: '$2,100' },
    ],
    clientStats: {
      total: 156,
      new: 12,
      returning: 85,
    },
  },
};

export const barberData = salonData; // Use salon as base
export const landscapingData = salonData;
export const cleaningData = salonData;
export const autoData = salonData;
export const fitnessData = salonData;
export const petData = salonData;
export const tattooData = salonData;
export const restaurantData = salonData;
export const genericServiceData = salonData;

export function getDummyData(businessType: string, businessName?: string) {
  // For now, return salon data as a generic fallback
  // The new component-based system uses componentDummyData instead
  return salonData;
}
