'use client';

import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  featured?: boolean;
}

interface StatCardsProps {
  entityType: string;
  data: Record<string, unknown>[];
  configColors: DashboardColors;
}

// Demo stat values per entity type - shown in preview/demo mode
const DEMO_STATS: Record<string, StatCard[]> = {
  clients: [
    { label: 'Total Clients', value: 156, change: '+12.5%', changeType: 'positive' },
    { label: 'Active', value: 132, featured: true },
    { label: 'New This Month', value: 18, change: '+8.2%', changeType: 'positive' },
    { label: 'Inactive', value: 24, change: '-2.1%', changeType: 'negative' },
  ],
  invoices: [
    { label: 'Total Invoices', value: 284, change: '+15.3%', changeType: 'positive' },
    { label: 'Paid', value: 231, featured: true },
    { label: 'Pending', value: 38, change: '+59.8%', changeType: 'positive' },
    { label: 'Overdue', value: 15, change: '-5.0%', changeType: 'negative' },
  ],
  appointments: [
    { label: 'Total', value: 89 },
    { label: 'Today', value: 6, featured: true },
    { label: 'This Week', value: 23, change: '+20.0%', changeType: 'positive' },
    { label: 'Cancelled', value: 3 },
  ],
  tasks: [
    { label: 'Total Tasks', value: 47 },
    { label: 'In Progress', value: 12, featured: true },
    { label: 'Completed', value: 28, change: '+30.0%', changeType: 'positive' },
    { label: 'Pending', value: 7 },
  ],
  leads: [
    { label: 'Total Leads', value: 94, change: '+18.5%', changeType: 'positive' },
    { label: 'Qualified', value: 36, featured: true },
    { label: 'New', value: 22 },
    { label: 'Converted', value: 18, change: '+10.2%', changeType: 'positive' },
  ],
  products: [
    { label: 'Total Products', value: 128 },
    { label: 'In Stock', value: 109, featured: true },
    { label: 'Low Stock', value: 14, change: '+3', changeType: 'negative' },
    { label: 'Out of Stock', value: 5 },
  ],
  staff: [
    { label: 'Total Staff', value: 12 },
    { label: 'Active', value: 10, featured: true },
    { label: 'On Leave', value: 1 },
    { label: 'New Hires', value: 2, change: '+2', changeType: 'positive' },
  ],
  payments: [
    { label: 'Total Payments', value: 312, change: '+22.1%', changeType: 'positive' },
    { label: 'Collected', value: '$18.4k', featured: true },
    { label: 'Pending', value: 28, change: '+12', changeType: 'negative' },
    { label: 'Failed', value: 4 },
  ],
  expenses: [
    { label: 'Total Expenses', value: '$6.2k' },
    { label: 'This Month', value: '$1.8k', featured: true },
    { label: 'Pending', value: 5, change: '+2', changeType: 'negative' },
    { label: 'Categories', value: 8 },
  ],
  estimates: [
    { label: 'Total Estimates', value: 67, change: '+14.3%', changeType: 'positive' },
    { label: 'Approved', value: 42, featured: true },
    { label: 'Pending', value: 18 },
    { label: 'Declined', value: 7, change: '-3', changeType: 'negative' },
  ],
  payroll: [
    { label: 'Total Payroll', value: '$24.5k' },
    { label: 'This Period', value: '$12.2k', featured: true },
    { label: 'Employees', value: 10 },
    { label: 'Pending', value: 2 },
  ],
  inventory: [
    { label: 'Total Items', value: 245 },
    { label: 'In Stock', value: 218, featured: true },
    { label: 'Low Stock', value: 19, change: '+5', changeType: 'negative' },
    { label: 'Out of Stock', value: 8 },
  ],
  equipment: [
    { label: 'Total Equipment', value: 34 },
    { label: 'Operational', value: 30, featured: true },
    { label: 'In Maintenance', value: 3, change: '+1', changeType: 'negative' },
    { label: 'Retired', value: 1 },
  ],
  assets: [
    { label: 'Total Assets', value: 56 },
    { label: 'Active', value: 48, featured: true },
    { label: 'Depreciated', value: 6 },
    { label: 'Value', value: '$142k' },
  ],
  vendors: [
    { label: 'Total Vendors', value: 23 },
    { label: 'Active', value: 19, featured: true },
    { label: 'New This Month', value: 3, change: '+3', changeType: 'positive' },
    { label: 'Inactive', value: 4 },
  ],
  schedules: [
    { label: 'Total Slots', value: 120 },
    { label: 'Booked', value: 87, featured: true },
    { label: 'Available', value: 33, change: '-12%', changeType: 'negative' },
    { label: 'Cancelled', value: 5 },
  ],
  shifts: [
    { label: 'Total Shifts', value: 48 },
    { label: 'This Week', value: 24, featured: true },
    { label: 'Open', value: 4 },
    { label: 'Swaps', value: 2 },
  ],
  calendar: [
    { label: 'Events', value: 34 },
    { label: 'Today', value: 4, featured: true },
    { label: 'This Week', value: 12, change: '+3', changeType: 'positive' },
    { label: 'Upcoming', value: 18 },
  ],
  todos: [
    { label: 'Total Tasks', value: 38 },
    { label: 'Due Today', value: 5, featured: true },
    { label: 'Completed', value: 24, change: '+63%', changeType: 'positive' },
    { label: 'Overdue', value: 3, change: '+1', changeType: 'negative' },
  ],
  jobs: [
    { label: 'Total Jobs', value: 28, change: '+10.5%', changeType: 'positive' },
    { label: 'In Progress', value: 12, featured: true },
    { label: 'Scheduled', value: 8 },
    { label: 'Completed', value: 8 },
  ],
  projects: [
    { label: 'Total Projects', value: 15 },
    { label: 'Active', value: 8, featured: true },
    { label: 'On Track', value: 6, change: '+2', changeType: 'positive' },
    { label: 'At Risk', value: 2, change: '+1', changeType: 'negative' },
  ],
  workflows: [
    { label: 'Total Workflows', value: 12 },
    { label: 'Active', value: 9, featured: true },
    { label: 'Completed', value: 45, change: '+18%', changeType: 'positive' },
    { label: 'Paused', value: 3 },
  ],
  messages: [
    { label: 'Total Messages', value: 234 },
    { label: 'Unread', value: 12, featured: true },
    { label: 'Today', value: 8, change: '+3', changeType: 'positive' },
    { label: 'Flagged', value: 5 },
  ],
  notes: [
    { label: 'Total Notes', value: 89 },
    { label: 'Recent', value: 14, featured: true },
    { label: 'This Week', value: 7, change: '+40%', changeType: 'positive' },
    { label: 'Shared', value: 12 },
  ],
  announcements: [
    { label: 'Total', value: 24 },
    { label: 'Active', value: 6, featured: true },
    { label: 'This Month', value: 4, change: '+2', changeType: 'positive' },
    { label: 'Drafts', value: 3 },
  ],
  reviews: [
    { label: 'Total Reviews', value: 167, change: '+25.3%', changeType: 'positive' },
    { label: 'Avg Rating', value: '4.8', featured: true },
    { label: '5 Star', value: 124 },
    { label: 'Needs Reply', value: 8 },
  ],
  documents: [
    { label: 'Total Files', value: 156 },
    { label: 'This Month', value: 12, featured: true },
    { label: 'Shared', value: 34 },
    { label: 'Storage', value: '2.4 GB' },
  ],
  contracts: [
    { label: 'Total Contracts', value: 42 },
    { label: 'Active', value: 28, featured: true },
    { label: 'Expiring Soon', value: 5, change: '+2', changeType: 'negative' },
    { label: 'Expired', value: 9 },
  ],
  images: [
    { label: 'Total Images', value: 312 },
    { label: 'Albums', value: 8, featured: true },
    { label: 'This Month', value: 24, change: '+15%', changeType: 'positive' },
    { label: 'Storage', value: '1.8 GB' },
  ],
  uploads: [
    { label: 'Total Uploads', value: 89 },
    { label: 'This Month', value: 14, featured: true },
    { label: 'Pending', value: 3 },
    { label: 'Storage', value: '856 MB' },
  ],

  // Signing & Compliance
  waivers: [
    { label: 'Total Waivers', value: 245, change: '+18.5%', changeType: 'positive' },
    { label: 'Signed', value: 231, featured: true },
    { label: 'Pending', value: 9 },
    { label: 'Expired', value: 5, change: '-2', changeType: 'negative' },
  ],
  forms: [
    { label: 'Total Forms', value: 18 },
    { label: 'Submissions', value: 342, featured: true },
    { label: 'This Month', value: 56, change: '+23%', changeType: 'positive' },
    { label: 'Completion Rate', value: '87%' },
  ],
  signatures: [
    { label: 'Total Signatures', value: 189, change: '+22%', changeType: 'positive' },
    { label: 'Completed', value: 176, featured: true },
    { label: 'Awaiting', value: 8 },
    { label: 'Declined', value: 5 },
  ],

  // Hospitality & Food
  reservations: [
    { label: 'Total Reservations', value: 156 },
    { label: 'Today', value: 24, featured: true },
    { label: 'This Week', value: 89, change: '+15%', changeType: 'positive' },
    { label: 'No Shows', value: 6, change: '-3', changeType: 'negative' },
  ],
  tables: [
    { label: 'Total Tables', value: 32 },
    { label: 'Occupied', value: 18, featured: true },
    { label: 'Reserved', value: 8 },
    { label: 'Available', value: 6 },
  ],
  menus: [
    { label: 'Total Items', value: 86 },
    { label: 'Active', value: 72, featured: true },
    { label: 'Categories', value: 12 },
    { label: 'Seasonal', value: 14 },
  ],
  orders: [
    { label: 'Total Orders', value: 523, change: '+28%', changeType: 'positive' },
    { label: 'Today', value: 34, featured: true },
    { label: 'Pending', value: 8 },
    { label: 'Revenue', value: '$4.2k' },
  ],
  rooms: [
    { label: 'Total Rooms', value: 24 },
    { label: 'Occupied', value: 18, featured: true },
    { label: 'Available', value: 4 },
    { label: 'Maintenance', value: 2 },
  ],
  recipes: [
    { label: 'Total Recipes', value: 64 },
    { label: 'Active Menu', value: 42, featured: true },
    { label: 'New This Month', value: 5, change: '+3', changeType: 'positive' },
    { label: 'Avg Cost', value: '$8.50' },
  ],
  waitlist: [
    { label: 'In Queue', value: 8 },
    { label: 'Avg Wait', value: '18 min', featured: true },
    { label: 'Seated Today', value: 67, change: '+12%', changeType: 'positive' as const },
    { label: 'No Shows', value: 3 },
  ],
  tip_pools: [
    { label: 'Today\'s Tips', value: '$842', featured: true },
    { label: 'FOH Share', value: '$674' },
    { label: 'BOH Share', value: '$168' },
    { label: 'Weekly Total', value: '$4,251', change: '+8%', changeType: 'positive' as const },
  ],
  waste_log: [
    { label: 'Items Wasted', value: 15 },
    { label: 'Today\'s Cost', value: '$47', featured: true },
    { label: 'Weekly Cost', value: '$312', change: '-15%', changeType: 'positive' as const },
    { label: 'Top Reason', value: 'Expired' },
  ],
  suppliers: [
    { label: 'Total Suppliers', value: 12 },
    { label: 'Active Orders', value: 4, featured: true },
    { label: 'Pending Delivery', value: 2 },
    { label: 'Monthly Spend', value: '$8.5k' },
  ],
  purchase_orders: [
    { label: 'Total POs', value: 45 },
    { label: 'Open Orders', value: 6, featured: true },
    { label: 'This Month', value: '$12.4k', change: '+5%', changeType: 'positive' as const },
    { label: 'Received', value: 38 },
  ],

  // Education & Programs
  classes: [
    { label: 'Total Classes', value: 28 },
    { label: 'This Week', value: 14, featured: true },
    { label: 'Enrolled', value: 186, change: '+12%', changeType: 'positive' },
    { label: 'Waitlisted', value: 8 },
  ],
  membership_plans: [
    { label: 'Active Plans', value: 3 },
    { label: 'Monthly Revenue', value: '$3,640', featured: true },
    { label: 'Avg Price', value: '$62/mo' },
  ],
  memberships: [
    { label: 'Total Members', value: 8, change: '+15.2%', changeType: 'positive' as const },
    { label: 'Active', value: 7, featured: true },
    { label: 'Monthly Revenue', value: '$3,640' },
    { label: 'Cancelled', value: 1 },
  ],
  courses: [
    { label: 'Total Courses', value: 12 },
    { label: 'Active', value: 8, featured: true },
    { label: 'Enrolled', value: 156, change: '+20%', changeType: 'positive' },
    { label: 'Completed', value: 89 },
  ],
  attendance: [
    { label: 'Check-ins Today', value: 34 },
    { label: 'This Week', value: 186, featured: true },
    { label: 'Avg Daily', value: 28, change: '+8%', changeType: 'positive' },
    { label: 'No Shows', value: 5 },
  ],

  // Field Service
  inspections: [
    { label: 'Total Inspections', value: 89 },
    { label: 'Passed', value: 76, featured: true },
    { label: 'Failed', value: 8, change: '-2', changeType: 'negative' },
    { label: 'Pending', value: 5 },
  ],
  routes: [
    { label: 'Active Routes', value: 12 },
    { label: 'Today', value: 8, featured: true },
    { label: 'Total Stops', value: 48, change: '+6', changeType: 'positive' },
    { label: 'Completed', value: 5 },
  ],
  fleet: [
    { label: 'Total Vehicles', value: 18 },
    { label: 'Active', value: 14, featured: true },
    { label: 'In Service', value: 3, change: '+1', changeType: 'negative' },
    { label: 'Total Miles', value: '24.5k' },
  ],
  checklists: [
    { label: 'Total Checklists', value: 34 },
    { label: 'Completed', value: 28, featured: true },
    { label: 'In Progress', value: 4 },
    { label: 'Overdue', value: 2, change: '+1', changeType: 'negative' },
  ],
  permits: [
    { label: 'Total Permits', value: 42 },
    { label: 'Active', value: 36, featured: true },
    { label: 'Pending', value: 4 },
    { label: 'Expired', value: 2, change: '-1', changeType: 'negative' },
  ],

  // Health & Medical
  prescriptions: [
    { label: 'Total Prescriptions', value: 234 },
    { label: 'Active', value: 156, featured: true },
    { label: 'Refills Due', value: 18, change: '+5', changeType: 'negative' },
    { label: 'This Month', value: 42 },
  ],
  treatments: [
    { label: 'Total Treatments', value: 186 },
    { label: 'In Progress', value: 34, featured: true },
    { label: 'Completed', value: 142, change: '+18%', changeType: 'positive' },
    { label: 'Follow-ups', value: 12 },
  ],

  // Creative
  portfolios: [
    { label: 'Total Projects', value: 28 },
    { label: 'Featured', value: 12, featured: true },
    { label: 'Categories', value: 6 },
    { label: 'Views', value: '2.4k' },
  ],
  galleries: [
    { label: 'Total Galleries', value: 18 },
    { label: 'Photos', value: 456, featured: true },
    { label: 'Shared', value: 12, change: '+4', changeType: 'positive' },
    { label: 'Storage', value: '3.2 GB' },
  ],

  // Real Estate
  listings: [
    { label: 'Total Listings', value: 48, change: '+12%', changeType: 'positive' },
    { label: 'Active', value: 36, featured: true },
    { label: 'Under Contract', value: 8 },
    { label: 'Sold', value: 4 },
  ],
  properties: [
    { label: 'Total Properties', value: 24 },
    { label: 'Occupied', value: 21, featured: true },
    { label: 'Vacant', value: 3 },
    { label: 'Monthly Rev', value: '$32k' },
  ],

  // Legal
  cases: [
    { label: 'Total Cases', value: 67, change: '+8.5%', changeType: 'positive' },
    { label: 'Active', value: 34, featured: true },
    { label: 'Pending', value: 12 },
    { label: 'Closed', value: 21 },
  ],

  // Events
  venues: [
    { label: 'Total Venues', value: 8 },
    { label: 'Available', value: 5, featured: true },
    { label: 'Booked This Month', value: 12, change: '+3', changeType: 'positive' },
    { label: 'Revenue', value: '$18k' },
  ],
  guests: [
    { label: 'Total Guests', value: 342 },
    { label: 'Confirmed', value: 256, featured: true },
    { label: 'Pending', value: 56 },
    { label: 'Declined', value: 30 },
  ],

  // Marketing
  campaigns: [
    { label: 'Total Campaigns', value: 24 },
    { label: 'Active', value: 8, featured: true },
    { label: 'Reach', value: '12.4k', change: '+35%', changeType: 'positive' },
    { label: 'Conversions', value: 156 },
  ],
  loyalty: [
    { label: 'Total Members', value: 456, change: '+22%', changeType: 'positive' },
    { label: 'Active', value: 389, featured: true },
    { label: 'Points Issued', value: '24.5k' },
    { label: 'Rewards Redeemed', value: 89 },
  ],
  surveys: [
    { label: 'Total Surveys', value: 12 },
    { label: 'Responses', value: 534, featured: true },
    { label: 'Avg Completion', value: '78%' },
    { label: 'Active', value: 4 },
  ],

  // Support
  tickets: [
    { label: 'Total Tickets', value: 234 },
    { label: 'Open', value: 18, featured: true },
    { label: 'Resolved Today', value: 12, change: '+6', changeType: 'positive' },
    { label: 'Avg Response', value: '2.4h' },
  ],
  knowledge: [
    { label: 'Total Articles', value: 86 },
    { label: 'Published', value: 72, featured: true },
    { label: 'Views This Month', value: '1.2k', change: '+18%', changeType: 'positive' },
    { label: 'Drafts', value: 14 },
  ],

  // Business Operations
  packages: [
    { label: 'Total Services', value: 12 },
    { label: 'Most Booked', value: 'Gel Mani', featured: true },
    { label: 'Avg Price', value: '$38' },
    { label: 'Bookings This Month', value: 86, change: '+15%', changeType: 'positive' },
  ],
  subscriptions: [
    { label: 'Total Subscriptions', value: 186, change: '+25%', changeType: 'positive' },
    { label: 'Active', value: 164, featured: true },
    { label: 'MRR', value: '$4.8k' },
    { label: 'Churned', value: 8, change: '-3', changeType: 'negative' },
  ],
  time_tracking: [
    { label: 'Total Hours', value: '1.2k' },
    { label: 'This Week', value: 42, featured: true },
    { label: 'Billable', value: '86%', change: '+5%', changeType: 'positive' },
    { label: 'Employees', value: 8 },
  ],

  // Digital & Online
  social_media: [
    { label: 'Scheduled Posts', value: 24 },
    { label: 'This Week', value: 8, featured: true },
    { label: 'Engagement', value: '3.2k', change: '+28%', changeType: 'positive' },
    { label: 'Platforms', value: 4 },
  ],
  reputation: [
    { label: 'Total Reviews', value: 234, change: '+15%', changeType: 'positive' },
    { label: 'Avg Rating', value: '4.7', featured: true },
    { label: 'Needs Reply', value: 12 },
    { label: 'Platforms', value: 3 },
  ],
  portal: [
    { label: 'Portal Users', value: 89 },
    { label: 'Active', value: 67, featured: true },
    { label: 'Logins Today', value: 12, change: '+4', changeType: 'positive' },
    { label: 'Pending Setup', value: 8 },
  ],
  community: [
    { label: 'Total Members', value: 234 },
    { label: 'Active', value: 156, featured: true },
    { label: 'Posts This Week', value: 42, change: '+18%', changeType: 'positive' },
    { label: 'Discussions', value: 89 },
  ],
  chat_widget: [
    { label: 'Total Chats', value: 456 },
    { label: 'Active Now', value: 3, featured: true },
    { label: 'Today', value: 18, change: '+5', changeType: 'positive' },
    { label: 'Avg Response', value: '45s' },
  ],
};

// Entities that work better with fewer stat cards
const STAT_COUNT_OVERRIDES: Record<string, number> = {
  messages: 3,
  notes: 3,
  documents: 3,
  images: 3,
  uploads: 3,
  announcements: 3,
  rooms: 3,
  tables: 3,
  social_media: 3,
  chat_widget: 3,
};

// Generate demo stat cards based on entity type (fallback for empty data)
function getDemoStats(entityType: string): StatCard[] {
  const stats = DEMO_STATS[entityType] || [
    { label: 'Total Records', value: 64 },
    { label: 'Active', value: 52, featured: true },
    { label: 'This Month', value: 18, change: '+5.0%', changeType: 'positive' },
    { label: 'Archived', value: 3 },
  ];
  const count = STAT_COUNT_OVERRIDES[entityType];
  return count ? stats.slice(0, count) : stats;
}

// Compute real stats from actual data records
function computeStatsFromData(entityType: string, data: Record<string, unknown>[]): StatCard[] {
  const total = data.length;
  const maxCards = STAT_COUNT_OVERRIDES[entityType] || 4;
  const stats: StatCard[] = [];

  // Format entity name for display
  const LABEL_OVERRIDES: Record<string, string> = {
    packages: 'Services',
    membership_plans: 'Membership Plans',
  };
  const entityLabel = LABEL_OVERRIDES[entityType] || entityType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  // Date helpers
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStr = now.toISOString().slice(0, 10);

  const getDateValue = (r: Record<string, unknown>): Date | null => {
    const raw = r.created_at || r.date || r.start_date || r.start_time || r.due_date;
    if (!raw) return null;
    const d = new Date(String(raw));
    return isNaN(d.getTime()) ? null : d;
  };

  const countThisMonth = data.filter(r => {
    const d = getDateValue(r);
    return d && d >= startOfMonth;
  }).length;

  const countToday = data.filter(r => {
    const d = getDateValue(r);
    return d && d.toISOString().slice(0, 10) === todayStr;
  }).length;

  // Detect money fields
  const moneyFields = ['amount', 'total', 'price', 'cost', 'value', 'rate'];
  const moneyField = moneyFields.find(f =>
    data.some(r => r[f] !== undefined && r[f] !== null && !isNaN(Number(r[f])))
  );

  // Detect status field
  const hasStatus = data.some(r => r.status && typeof r.status === 'string');
  const statusCounts: Record<string, number> = {};
  if (hasStatus) {
    data.forEach(r => {
      if (r.status && typeof r.status === 'string') {
        const s = String(r.status).toLowerCase();
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      }
    });
  }

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
    return `$${n.toFixed(0)}`;
  };

  const capitalize = (s: string) =>
    s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // 1. Total count — always first
  stats.push({ label: `Total ${entityLabel}`, value: total });

  // 2. Money sum (featured for financial entities)
  if (moneyField) {
    const sum = data.reduce((s, r) => s + (Number(r[moneyField]) || 0), 0);
    if (sum > 0) {
      stats.push({ label: 'Total Amount', value: formatCurrency(sum), featured: true });
    }
  }

  // 3. Status breakdown — top statuses by count
  if (hasStatus) {
    const sorted = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);
    const positiveStatuses = ['active', 'completed', 'paid', 'confirmed', 'approved', 'passed', 'published', 'signed', 'resolved', 'in_stock', 'operational'];
    const featuredEntry = sorted.find(([s]) => positiveStatuses.includes(s));

    for (const [status, count] of sorted.slice(0, moneyField ? 1 : 2)) {
      const isFeatured = !moneyField && featuredEntry && status === featuredEntry[0];
      stats.push({ label: capitalize(status), value: count, featured: isFeatured || undefined });
    }
  }

  // 4. Date-based stats
  const timeEntities = ['appointments', 'calendar', 'schedules', 'shifts', 'reservations', 'classes', 'attendance', 'routes'];
  if (timeEntities.includes(entityType) && countToday > 0 && stats.length < maxCards) {
    const shouldFeature = !stats.some(s => s.featured);
    stats.push({ label: 'Today', value: countToday, featured: shouldFeature || undefined });
  }
  if (countThisMonth > 0 && stats.length < maxCards) {
    stats.push({ label: 'This Month', value: countThisMonth });
  }
  if (!timeEntities.includes(entityType) && countToday > 0 && stats.length < maxCards) {
    stats.push({ label: 'Today', value: countToday });
  }

  // Ensure at least one featured card
  if (!stats.some(s => s.featured) && stats.length > 1) {
    stats[1].featured = true;
  }

  return stats.slice(0, maxCards);
}

export default function StatCards({ entityType, data, configColors }: StatCardsProps) {
  const stats = data && data.length > 0
    ? computeStatsFromData(entityType, data)
    : getDemoStats(entityType);
  const buttonColor = configColors.buttons || '#1A1A1A';

  return (
    <div className={`grid grid-cols-2 gap-4 mb-6 ${stats.length === 3 ? 'lg:grid-cols-3' : stats.length <= 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-4'}`}>
      {stats.map((stat, index) => {
        const isFeatured = stat.featured;
        const bg = isFeatured ? buttonColor : (configColors.cards || '#FFFFFF');
        const textMain = isFeatured ? getContrastText(buttonColor) : (configColors.headings || '#1A1A1A');
        const textSub = isFeatured ? `${getContrastText(buttonColor)}B3` : '#6B7280';

        return (
          <div
            key={index}
            className="rounded-2xl p-6 shadow-sm"
            style={{ backgroundColor: bg }}
          >
            <p className="text-xs font-medium uppercase tracking-wide mb-3 min-h-[2rem] leading-4" style={{ color: textSub }}>
              {stat.label}
            </p>
            <p className="text-3xl font-bold tracking-tight" style={{ color: textMain }}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            {stat.change && (
              <p
                className="text-xs font-medium mt-2"
                style={{
                  color: stat.changeType === 'positive' ? '#10B981'
                    : stat.changeType === 'negative' ? '#EF4444'
                    : '#9CA3AF'
                }}
              >
                {stat.changeType === 'positive' ? '\u2191' : stat.changeType === 'negative' ? '\u2193' : ''} {stat.change}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
