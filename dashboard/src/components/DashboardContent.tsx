'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { TabComponent, DashboardColors, PipelineConfig } from '@/types/config';
import { componentDummyData, platformDummyData, ComponentData, PipelineData } from '@/lib/dummy-data';
import ViewRenderer from './views/ViewRenderer';
import { getHeadingColor, getTextColor } from '@/lib/view-colors';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import SettingsContent from './SettingsContent';
import SiteView from './SiteView';
import MarketplaceView from './MarketplaceView';
import ComingSoonCard from './ComingSoonCard';
import LiveBoard from './LiveBoard';

interface DashboardContentProps {
  activeTab: string;
  tabLabel: string;
  components: TabComponent[];
  businessType?: string;
  businessName?: string;
  colors?: DashboardColors;
  toolbarSide?: 'left' | 'right';
  onComponentVisible?: (componentId: string) => void;
  websiteData?: any;
}

// Extract pipeline config from PipelineData
function extractPipelineConfig(data: ComponentData): PipelineConfig | undefined {
  if (data.type !== 'pipeline') return undefined;
  const pipelineData = data as PipelineData;
  return {
    stages: pipelineData.stages.map((stage, i) => ({
      id: stage.id,
      name: stage.name,
      color: stage.color,
      order: i,
    })),
    default_stage_id: pipelineData.stages[0]?.id,
  };
}

// Default pipeline stages for components that support pipeline view
const DEFAULT_PIPELINE_STAGES: Record<string, { name: string; color: string }[]> = {
  orders: [
    { name: 'New', color: '#3B82F6' },
    { name: 'Confirmed', color: '#8B5CF6' },
    { name: 'Preparing', color: '#F59E0B' },
    { name: 'Ready', color: '#10B981' },
    { name: 'Completed', color: '#6B7280' },
  ],
  leads: [
    { name: 'New', color: '#3B82F6' },
    { name: 'Contacted', color: '#F59E0B' },
    { name: 'Qualified', color: '#8B5CF6' },
    { name: 'Proposal', color: '#F97316' },
    { name: 'Won', color: '#10B981' },
  ],
  jobs: [
    { name: 'Pending', color: '#3B82F6' },
    { name: 'In Progress', color: '#F59E0B' },
    { name: 'Review', color: '#8B5CF6' },
    { name: 'Complete', color: '#10B981' },
  ],
  tickets: [
    { name: 'New', color: '#3B82F6' },
    { name: 'In Progress', color: '#F59E0B' },
    { name: 'Resolved', color: '#10B981' },
  ],
  cases: [
    { name: 'New', color: '#3B82F6' },
    { name: 'Discovery', color: '#F59E0B' },
    { name: 'Trial', color: '#8B5CF6' },
    { name: 'Closed', color: '#10B981' },
  ],
  workflows: [
    { name: 'Queued', color: '#3B82F6' },
    { name: 'Running', color: '#F59E0B' },
    { name: 'Done', color: '#10B981' },
    { name: 'Failed', color: '#EF4444' },
  ],
  waivers: [
    { name: 'Draft', color: '#3B82F6' },
    { name: 'Sent', color: '#F59E0B' },
    { name: 'Signed', color: '#10B981' },
  ],
  purchase_orders: [
    { name: 'Draft', color: '#3B82F6' },
    { name: 'Sent', color: '#F59E0B' },
    { name: 'Received', color: '#10B981' },
  ],
  memberships: [
    { name: 'Basic', color: '#3B82F6' },
    { name: 'Premium', color: '#8B5CF6' },
    { name: 'VIP', color: '#F59E0B' },
    { name: 'Cancelled', color: '#6B7280' },
  ],
};

function getDefaultPipelineConfig(componentId: string): PipelineConfig | undefined {
  const stages = DEFAULT_PIPELINE_STAGES[componentId];
  if (!stages) return undefined;
  return {
    stages: stages.map((s, i) => ({
      id: `stage_${i + 1}`,
      name: s.name,
      color: s.color,
      order: i,
    })),
    default_stage_id: 'stage_1',
  };
}

// Convert inline component.stages (from AI templates) to PipelineConfig
// Templates store stages as [{id, name}] at the component root — this bridges to PipelineConfig format
const INLINE_STAGE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#F97316', '#EF4444', '#EC4899', '#14B8A6'];
const LOYALTY_TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold: '#FFD700',
  platinum: '#8C9EAF',
};
function buildPipelineFromInlineStages(
  stages: { id?: string; name: string; color?: string }[]
): PipelineConfig {
  return {
    stages: stages.map((s, i) => ({
      id: s.id || `stage_${i + 1}`,
      name: s.name,
      color: s.color || LOYALTY_TIER_COLORS[s.name.toLowerCase()] || INLINE_STAGE_COLORS[i % INLINE_STAGE_COLORS.length],
      order: i,
    })),
    default_stage_id: stages[0]?.id || 'stage_1',
  };
}

// Determine entity type from component ID
function getEntityType(componentId: string): string {
  const entityMap: Record<string, string> = {
    clients: 'clients',
    contacts: 'contacts',
    leads: 'leads',
    regulars: 'clients',
    staff: 'staff',
    vendors: 'clients',
    products: 'products',
    inventory: 'products',
    equipment: 'products',
    assets: 'products',
    calendar: 'appointments',
    appointments: 'appointments',
    schedules: 'appointments',
    shifts: 'appointments',
    classes: 'appointments',
    reservations: 'appointments',
    invoices: 'invoices',
    payments: 'invoices',
    expenses: 'invoices',
    payroll: 'invoices',
    estimates: 'invoices',
    todos: 'tasks',
    jobs: 'tasks',
    projects: 'tasks',
    workflows: 'workflows',
    messages: 'messages',
    notes: 'documents',
    announcements: 'documents',
    reviews: 'reviews',
    documents: 'documents',
    contracts: 'documents',
    images: 'documents',
    uploads: 'documents',
    // AI-generated component IDs → canonical entity types
    nail_sets: 'packages',
    bridal_packages: 'packages',
    gel_nails: 'packages',
    add_ons: 'packages',
    service_menu: 'packages',
    retail_products: 'products',
    loyalty: 'clients',
    loyalty_programs: 'membership_plans',
    vip_clients: 'memberships',
    studio_expenses: 'invoices',
    regular_clients: 'clients',
    new_clients: 'clients',
    appointments_calendar: 'appointments',
    appointment_calendar: 'appointments',
    // Beauty & body template IDs
    custom_tattoos: 'packages',
    flash_designs: 'packages',
    cover_ups: 'packages',
    piercings: 'packages',
    treatments: 'packages',
    injectables: 'packages',
    lash_services: 'packages',
    brow_services: 'packages',
    color_services: 'packages',
    pet_profiles: 'clients',
    flash_gallery: 'galleries',
    portfolios: 'galleries',
    waivers: 'documents',
    deposits: 'invoices',
  };
  return entityMap[componentId] || componentId;
}

// Helper to determine if a color is light or dark
function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// Business-type-specific analytics labels and data
interface AnalyticsTemplate {
  statLabels: [string, string, string, string]; // [revenue, featured, metric3, metric4]
  statValues: [string, string | number, string | number, string | number];
  statChanges: [string, string, string, string];
  topItemsLabel: string;
  topItems: { name: string; count: number; revenue: string }[];
  breakdownLabel: string;
  breakdownItems: { label: string; value: number; color: string }[];
}

function getAnalyticsTemplate(businessType?: string): AnalyticsTemplate {
  switch (businessType) {
    case 'restaurant':
    case 'cafe':
    case 'bakery':
    case 'food_truck':
    case 'catering':
      return {
        statLabels: ['Total Revenue', 'Orders Today', 'Avg Ticket', 'Table Turnover'],
        statValues: ['$65.2k', 34, '$28.50', '3.2x'],
        statChanges: ['+18.5%', '+12', '+$2.30', '+0.4'],
        topItemsLabel: 'Top Menu Items',
        topItems: [
          { name: 'Grilled Salmon', count: 145, revenue: '$4,350' },
          { name: 'Pasta Carbonara', count: 128, revenue: '$2,560' },
          { name: 'Caesar Salad', count: 96, revenue: '$1,440' },
          { name: 'Margherita Pizza', count: 84, revenue: '$1,680' },
          { name: 'Tiramisu', count: 67, revenue: '$670' },
        ],
        breakdownLabel: 'Order Status',
        breakdownItems: [
          { label: 'Completed', value: 312, color: '#10B981' },
          { label: 'In Kitchen', value: 8, color: '#F59E0B' },
          { label: 'Cancelled', value: 12, color: '#EF4444' },
        ],
      };
    case 'salon':
    case 'barber':
    case 'spa':
    case 'tattoo':
    case 'grooming':
      return {
        statLabels: ['Total Revenue', 'Bookings', 'Avg Service', 'Client Retention'],
        statValues: ['$13.2k', 284, '$46.50', '78%'],
        statChanges: ['+15.3%', '+22', '+$3.20', '+5%'],
        topItemsLabel: 'Top Services',
        topItems: [
          { name: 'Haircut & Style', count: 85, revenue: '$3,400' },
          { name: 'Color Treatment', count: 42, revenue: '$4,200' },
          { name: 'Beard Trim', count: 38, revenue: '$760' },
          { name: 'Deep Conditioning', count: 28, revenue: '$1,120' },
          { name: 'Highlights', count: 24, revenue: '$3,600' },
        ],
        breakdownLabel: 'Appointment Status',
        breakdownItems: [
          { label: 'Completed', value: 251, color: '#10B981' },
          { label: 'Cancelled', value: 18, color: '#EF4444' },
          { label: 'No-show', value: 15, color: '#F59E0B' },
        ],
      };
    case 'fitness':
    case 'crossfit':
    case 'yoga':
    case 'martial_arts':
    case 'dance':
      return {
        statLabels: ['Monthly Revenue', 'Active Members', 'Classes/Week', 'Retention Rate'],
        statValues: ['$18.4k', 298, 42, '85%'],
        statChanges: ['+12.8%', '+24', '+4', '+3%'],
        topItemsLabel: 'Popular Classes',
        topItems: [
          { name: 'Morning HIIT', count: 156, revenue: '$3,120' },
          { name: 'Yoga Flow', count: 128, revenue: '$2,560' },
          { name: 'Strength Training', count: 96, revenue: '$1,920' },
          { name: 'Spin Class', count: 84, revenue: '$1,680' },
          { name: 'Pilates', count: 72, revenue: '$1,440' },
        ],
        breakdownLabel: 'Membership Status',
        breakdownItems: [
          { label: 'Active', value: 298, color: '#10B981' },
          { label: 'Expiring', value: 18, color: '#F59E0B' },
          { label: 'Cancelled', value: 26, color: '#EF4444' },
        ],
      };
    case 'landscaping':
    case 'plumbing':
    case 'electrical':
    case 'cleaning':
    case 'pest_control':
    case 'moving':
      return {
        statLabels: ['Total Revenue', 'Jobs Completed', 'Avg Job Value', 'Repeat Clients'],
        statValues: ['$42.8k', 86, '$497', '62%'],
        statChanges: ['+22.1%', '+14', '+$38', '+8%'],
        topItemsLabel: 'Top Services',
        topItems: [
          { name: 'Full Service', count: 34, revenue: '$23,800' },
          { name: 'Maintenance', count: 28, revenue: '$5,600' },
          { name: 'Emergency Call', count: 12, revenue: '$4,800' },
          { name: 'Consultation', count: 8, revenue: '$1,200' },
          { name: 'Inspection', count: 4, revenue: '$600' },
        ],
        breakdownLabel: 'Job Status',
        breakdownItems: [
          { label: 'Completed', value: 86, color: '#10B981' },
          { label: 'In Progress', value: 12, color: '#3B82F6' },
          { label: 'Cancelled', value: 4, color: '#EF4444' },
        ],
      };
    case 'real_estate':
    case 'property':
      return {
        statLabels: ['Total Volume', 'Active Listings', 'Avg Days on Market', 'Lead Conversion'],
        statValues: ['$2.4M', 36, 28, '18%'],
        statChanges: ['+35%', '+8', '-5 days', '+3%'],
        topItemsLabel: 'Top Listings',
        topItems: [
          { name: '123 Oak Ave', count: 42, revenue: '$425k' },
          { name: '456 Pine St', count: 38, revenue: '$380k' },
          { name: '789 Elm Blvd', count: 28, revenue: '$520k' },
          { name: '321 Maple Dr', count: 22, revenue: '$290k' },
          { name: '654 Cedar Ln', count: 18, revenue: '$345k' },
        ],
        breakdownLabel: 'Pipeline',
        breakdownItems: [
          { label: 'Closed', value: 18, color: '#10B981' },
          { label: 'Under Contract', value: 8, color: '#3B82F6' },
          { label: 'Lost', value: 6, color: '#EF4444' },
        ],
      };
    case 'legal':
    case 'accounting':
    case 'consulting':
      return {
        statLabels: ['Total Billed', 'Active Cases', 'Billable Hours', 'Collection Rate'],
        statValues: ['$86.4k', 34, 412, '94%'],
        statChanges: ['+18.2%', '+6', '+48h', '+2%'],
        topItemsLabel: 'Top Practice Areas',
        topItems: [
          { name: 'Business Law', count: 12, revenue: '$36,000' },
          { name: 'Real Estate', count: 8, revenue: '$24,000' },
          { name: 'Family Law', count: 6, revenue: '$12,000' },
          { name: 'Estate Planning', count: 5, revenue: '$10,000' },
          { name: 'Litigation', count: 3, revenue: '$4,400' },
        ],
        breakdownLabel: 'Case Status',
        breakdownItems: [
          { label: 'Active', value: 34, color: '#3B82F6' },
          { label: 'Closed', value: 21, color: '#10B981' },
          { label: 'Pending', value: 12, color: '#F59E0B' },
        ],
      };
    case 'retail':
    case 'florist':
    case 'jewelry':
      return {
        statLabels: ['Total Sales', 'Units Sold', 'Avg Order', 'Inventory Turns'],
        statValues: ['$28.6k', 423, '$67.60', '4.2x'],
        statChanges: ['+16.4%', '+58', '+$4.20', '+0.8'],
        topItemsLabel: 'Top Products',
        topItems: [
          { name: 'Premium Package', count: 86, revenue: '$8,600' },
          { name: 'Standard Bundle', count: 124, revenue: '$6,200' },
          { name: 'Seasonal Special', count: 68, revenue: '$4,760' },
          { name: 'Gift Set', count: 92, revenue: '$4,600' },
          { name: 'Accessories', count: 53, revenue: '$2,120' },
        ],
        breakdownLabel: 'Order Fulfillment',
        breakdownItems: [
          { label: 'Delivered', value: 389, color: '#10B981' },
          { label: 'Processing', value: 22, color: '#3B82F6' },
          { label: 'Returned', value: 12, color: '#EF4444' },
        ],
      };
    default:
      return {
        statLabels: ['Total Revenue', 'Total Clients', 'Bookings', 'Returning'],
        statValues: ['$13.2k', 156, 284, 85],
        statChanges: ['+15.3%', '+12 new', '88% completed', '55% retention'],
        topItemsLabel: 'Top Services',
        topItems: [
          { name: 'Service A', count: 45, revenue: '$2,475' },
          { name: 'Service B', count: 32, revenue: '$1,440' },
          { name: 'Service C', count: 28, revenue: '$2,100' },
          { name: 'Service D', count: 19, revenue: '$950' },
          { name: 'Service E', count: 14, revenue: '$630' },
        ],
        breakdownLabel: 'Booking Status',
        breakdownItems: [
          { label: 'Completed', value: 251, color: '#10B981' },
          { label: 'Cancelled', value: 18, color: '#EF4444' },
          { label: 'No-show', value: 15, color: '#F59E0B' },
        ],
      };
  }
}

// Tab-specific analytics overrides based on tab label context
function getTabAnalyticsTemplate(tabLabel?: string): AnalyticsTemplate | null {
  if (!tabLabel) return null;
  const label = tabLabel.toLowerCase();

  // Client/Lead/Contact tabs — funnel & acquisition focused
  if (['clients', 'leads', 'contacts', 'customers', 'members', 'patients', 'students'].some(k => label.includes(k))) {
    return {
      statLabels: ['Total Contacts', 'New This Month', 'Conversion Rate', 'Avg Lifetime Value'],
      statValues: ['156', 24, '18.5%', '$1,240'],
      statChanges: ['+12 from last month', '+8 vs last', '+2.3%', '+$180'],
      topItemsLabel: 'Top Lead Sources',
      topItems: [
        { name: 'Website', count: 48, revenue: '$14,400' },
        { name: 'Referrals', count: 36, revenue: '$12,600' },
        { name: 'Social Media', count: 28, revenue: '$5,600' },
        { name: 'Google Ads', count: 24, revenue: '$7,200' },
        { name: 'Walk-ins', count: 20, revenue: '$4,000' },
      ],
      breakdownLabel: 'Pipeline Stages',
      breakdownItems: [
        { label: 'New Inquiry', value: 42, color: '#6366F1' },
        { label: 'In Progress', value: 68, color: '#3B82F6' },
        { label: 'Converted', value: 34, color: '#10B981' },
        { label: 'Lost', value: 12, color: '#EF4444' },
      ],
    };
  }

  // Schedule/Calendar/Appointment tabs — booking volume focused
  if (['schedule', 'calendar', 'appointments', 'bookings', 'sessions', 'classes'].some(k => label.includes(k))) {
    return {
      statLabels: ['Total Bookings', 'This Week', 'No-show Rate', 'Avg Duration'],
      statValues: ['284', 38, '5.2%', '45 min'],
      statChanges: ['+22 from last month', '+6 vs last week', '-1.1%', 'unchanged'],
      topItemsLabel: 'Busiest Days',
      topItems: [
        { name: 'Tuesday', count: 52, revenue: '$2,600' },
        { name: 'Thursday', count: 48, revenue: '$2,400' },
        { name: 'Wednesday', count: 44, revenue: '$2,200' },
        { name: 'Friday', count: 40, revenue: '$2,000' },
        { name: 'Monday', count: 36, revenue: '$1,800' },
      ],
      breakdownLabel: 'Booking Status',
      breakdownItems: [
        { label: 'Completed', value: 251, color: '#10B981' },
        { label: 'Upcoming', value: 26, color: '#3B82F6' },
        { label: 'Cancelled', value: 18, color: '#EF4444' },
        { label: 'No-show', value: 15, color: '#F59E0B' },
      ],
    };
  }

  // Payment/Invoice/Billing tabs — revenue focused
  if (['payments', 'invoices', 'billing', 'finance', 'expenses', 'payroll'].some(k => label.includes(k))) {
    return {
      statLabels: ['Total Revenue', 'Outstanding', 'Collected This Month', 'Avg Invoice'],
      statValues: ['$65.2k', '$8,400', '$12,800', '$285'],
      statChanges: ['+18.5% YoY', '12 pending', '+$3,200 vs last', '+$22'],
      topItemsLabel: 'Payment Methods',
      topItems: [
        { name: 'Credit Card', count: 186, revenue: '$38,400' },
        { name: 'Bank Transfer', count: 64, revenue: '$18,200' },
        { name: 'Cash', count: 28, revenue: '$4,600' },
        { name: 'Check', count: 12, revenue: '$3,200' },
        { name: 'Other', count: 6, revenue: '$800' },
      ],
      breakdownLabel: 'Invoice Aging',
      breakdownItems: [
        { label: 'Current', value: 142, color: '#10B981' },
        { label: '1-30 days', value: 28, color: '#3B82F6' },
        { label: '31-60 days', value: 8, color: '#F59E0B' },
        { label: '60+ days', value: 4, color: '#EF4444' },
      ],
    };
  }

  // Product/Inventory/Items tabs — sales & stock focused
  if (['products', 'inventory', 'items', 'menu', 'services', 'catalog'].some(k => label.includes(k))) {
    return {
      statLabels: ['Total Products', 'Units Sold', 'Top Seller Revenue', 'Low Stock Items'],
      statValues: ['86', 423, '$8,600', 5],
      statChanges: ['+4 new added', '+58 vs last month', '+12%', 'needs reorder'],
      topItemsLabel: 'Best Sellers',
      topItems: [
        { name: 'Premium Package', count: 86, revenue: '$8,600' },
        { name: 'Standard Bundle', count: 124, revenue: '$6,200' },
        { name: 'Seasonal Special', count: 68, revenue: '$4,760' },
        { name: 'Gift Set', count: 92, revenue: '$4,600' },
        { name: 'Accessories', count: 53, revenue: '$2,120' },
      ],
      breakdownLabel: 'Stock Status',
      breakdownItems: [
        { label: 'In Stock', value: 68, color: '#10B981' },
        { label: 'Low Stock', value: 13, color: '#F59E0B' },
        { label: 'Out of Stock', value: 5, color: '#EF4444' },
      ],
    };
  }

  // Tasks/Projects/Jobs tabs — completion focused
  if (['tasks', 'projects', 'jobs', 'workflows', 'orders', 'tickets'].some(k => label.includes(k))) {
    return {
      statLabels: ['Total Tasks', 'Completed', 'Overdue', 'Avg Completion'],
      statValues: ['148', 112, 8, '3.2 days'],
      statChanges: ['+18 this week', '75.7% rate', '-3 vs last week', '-0.4 days'],
      topItemsLabel: 'Team Workload',
      topItems: [
        { name: 'Design Team', count: 38, revenue: '24 completed' },
        { name: 'Development', count: 42, revenue: '31 completed' },
        { name: 'Marketing', count: 28, revenue: '22 completed' },
        { name: 'Sales', count: 24, revenue: '20 completed' },
        { name: 'Support', count: 16, revenue: '15 completed' },
      ],
      breakdownLabel: 'Task Status',
      breakdownItems: [
        { label: 'Completed', value: 112, color: '#10B981' },
        { label: 'In Progress', value: 28, color: '#3B82F6' },
        { label: 'Overdue', value: 8, color: '#EF4444' },
      ],
    };
  }

  return null;
}

// ─── Clients Analytics Layout: Funnel + Donut + Conversion ───
const ClientsAnalytics = memo(function ClientsAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';

  const funnelStages = [
    { name: 'Website Visitors', value: 2400, color: '#E5E7EB' },
    { name: 'Leads Captured', value: 840, color: '#93C5FD' },
    { name: 'Consultations', value: 320, color: '#60A5FA' },
    { name: 'Proposals Sent', value: 180, color: '#3B82F6' },
    { name: 'Converted', value: 96, color: buttonColor },
  ];
  const maxFunnel = funnelStages[0].value;

  const sourceData = [
    { name: 'Referrals', value: 36, color: buttonColor },
    { name: 'Google', value: 28, color: '#3B82F6' },
    { name: 'Social', value: 18, color: '#8B5CF6' },
    { name: 'Direct', value: 14, color: '#F59E0B' },
    { name: 'Other', value: 4, color: '#E5E7EB' },
  ];

  const monthlyLeads = [
    { name: 'Sep', new: 18, converted: 8 },
    { name: 'Oct', new: 22, converted: 12 },
    { name: 'Nov', new: 28, converted: 14 },
    { name: 'Dec', new: 20, converted: 10 },
    { name: 'Jan', new: 32, converted: 18 },
    { name: 'Feb', new: 26, converted: 16 },
  ];

  return (
    <div className="space-y-6">
      {/* Big numbers row — 3 cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: textMuted }}>Total Contacts</p>
          <p className="text-4xl font-bold tracking-tight" style={{ color: textMain }}>156</p>
          <p className="text-xs font-medium mt-2 text-emerald-600">+12 this month</p>
        </div>
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: buttonColor }}>
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: isColorLight(buttonColor) ? '#00000080' : '#FFFFFFB3' }}>Conversion Rate</p>
          <p className="text-4xl font-bold tracking-tight" style={{ color: isColorLight(buttonColor) ? '#000' : '#FFF' }}>18.5%</p>
          <p className="text-xs font-medium mt-2" style={{ color: isColorLight(buttonColor) ? '#059669' : '#34D399' }}>+2.3% vs last month</p>
        </div>
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: textMuted }}>Avg Lifetime Value</p>
          <p className="text-4xl font-bold tracking-tight" style={{ color: textMain }}>$1,240</p>
          <p className="text-xs font-medium mt-2 text-emerald-600">+$180</p>
        </div>
      </div>

      {/* Conversion Funnel — full width */}
      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Conversion Funnel</h3>
        <div className="space-y-3">
          {funnelStages.map((stage, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm font-medium w-36 shrink-0 text-right" style={{ color: textMain }}>{stage.name}</span>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 bg-gray-50 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                    style={{ width: `${(stage.value / maxFunnel) * 100}%`, backgroundColor: stage.color }}
                  >
                    <span className="text-xs font-bold" style={{ color: i === funnelStages.length - 1 ? (isColorLight(buttonColor) ? '#000' : '#FFF') : '#374151' }}>
                      {stage.value.toLocaleString()}
                    </span>
                  </div>
                </div>
                {i > 0 && (
                  <span className="text-xs font-medium shrink-0 w-12 text-right" style={{ color: textMuted }}>
                    {((stage.value / funnelStages[i - 1].value) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two column: Lead Sources Donut + Monthly Leads Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: textMain }}>Lead Sources</h3>
          <div className="flex items-center gap-6">
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    {sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {sourceData.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-sm flex-1" style={{ color: textMain }}>{s.name}</span>
                  <span className="text-sm font-semibold" style={{ color: textMain }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: textMain }}>New vs Converted</h3>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyLeads} barGap={2}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Bar dataKey="new" name="New Leads" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill={buttonColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Schedule Analytics Layout: Booking Volume + Peak Hours + Trends ───
const ScheduleAnalytics = memo(function ScheduleAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';

  const weeklyBookings = [
    { name: 'Mon', bookings: 12 }, { name: 'Tue', bookings: 18 },
    { name: 'Wed', bookings: 15 }, { name: 'Thu', bookings: 20 },
    { name: 'Fri', bookings: 22 }, { name: 'Sat', bookings: 16 },
    { name: 'Sun', bookings: 4 },
  ];

  const hourlyData = [
    { hour: '8am', count: 4 }, { hour: '9am', count: 12 }, { hour: '10am', count: 18 },
    { hour: '11am', count: 22 }, { hour: '12pm', count: 14 }, { hour: '1pm', count: 16 },
    { hour: '2pm', count: 20 }, { hour: '3pm', count: 24 }, { hour: '4pm', count: 18 },
    { hour: '5pm', count: 10 }, { hour: '6pm', count: 6 },
  ];

  const trendData = [
    { name: 'Week 1', booked: 82, capacity: 100 },
    { name: 'Week 2', booked: 91, capacity: 100 },
    { name: 'Week 3', booked: 78, capacity: 100 },
    { name: 'Week 4', booked: 95, capacity: 100 },
  ];

  const statusItems = [
    { label: 'Completed', value: 251, pct: 81, color: '#10B981' },
    { label: 'Upcoming', value: 26, pct: 8, color: '#3B82F6' },
    { label: 'Cancelled', value: 18, pct: 6, color: '#EF4444' },
    { label: 'No-show', value: 15, pct: 5, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat row — 4 compact cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: '284', change: '+22' },
          { label: 'This Week', value: '38', change: '+6', featured: true },
          { label: 'No-show Rate', value: '5.2%', change: '-1.1%' },
          { label: 'Utilization', value: '87%', change: '+4%' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: s.featured ? buttonColor : cardBg }}>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-2" style={{ color: s.featured ? (isColorLight(buttonColor) ? '#00000060' : '#FFFFFF80') : textMuted }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.featured ? (isColorLight(buttonColor) ? '#000' : '#FFF') : textMain }}>{s.value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: s.featured ? (isColorLight(buttonColor) ? '#059669' : '#34D399') : '#10B981' }}>{s.change}</p>
          </div>
        ))}
      </div>

      {/* Peak Hours — full width area chart */}
      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-4" style={{ color: textMain }}>Peak Hours Today</h3>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={buttonColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={buttonColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 11 }} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
              <Area type="monotone" dataKey="count" stroke={buttonColor} strokeWidth={2.5} fill="url(#peakGrad)" dot={{ fill: cardBg, stroke: buttonColor, strokeWidth: 2, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two column: Weekly Bookings + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: textMain }}>Bookings by Day</h3>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBookings}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                  {weeklyBookings.map((d, i) => {
                    const max = Math.max(...weeklyBookings.map(w => w.bookings));
                    return <Cell key={i} fill={d.bookings === max ? buttonColor : '#E5E7EB'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: textMain }}>Booking Status</h3>
          <div className="flex items-center gap-6">
            <div style={{ width: 130, height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusItems} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" stroke="none">
                    {statusItems.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {statusItems.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-sm flex-1" style={{ color: textMain }}>{s.label}</span>
                  <span className="text-sm font-bold" style={{ color: textMain }}>{s.value}</span>
                  <span className="text-xs" style={{ color: textMuted }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Payments Analytics Layout: Revenue Trend + Aging + Methods ───
const PaymentsAnalytics = memo(function PaymentsAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';

  const revenueTrend = [
    { name: 'Sep', revenue: 8200 }, { name: 'Oct', revenue: 9800 },
    { name: 'Nov', revenue: 11400 }, { name: 'Dec', revenue: 10200 },
    { name: 'Jan', revenue: 13600 }, { name: 'Feb', revenue: 12800 },
  ];

  const agingData = [
    { name: 'Current', value: 42800, color: '#10B981' },
    { name: '1-30 days', value: 5600, color: '#3B82F6' },
    { name: '31-60 days', value: 2400, color: '#F59E0B' },
    { name: '60+ days', value: 1200, color: '#EF4444' },
  ];
  const agingTotal = agingData.reduce((sum, d) => sum + d.value, 0);

  const methodData = [
    { name: 'Credit Card', value: 62, color: buttonColor },
    { name: 'Bank Transfer', value: 22, color: '#3B82F6' },
    { name: 'Cash', value: 10, color: '#10B981' },
    { name: 'Other', value: 6, color: '#E5E7EB' },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue hero + two side stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: textMuted }}>Total Revenue</p>
              <p className="text-3xl font-bold mt-1" style={{ color: textMain }}>$65,200</p>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">+18.5% YoY</span>
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={buttonColor} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={buttonColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="revenue" stroke={buttonColor} strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: cardBg, stroke: buttonColor, strokeWidth: 2, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 rounded-2xl p-5 shadow-sm" style={{ backgroundColor: buttonColor }}>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-2" style={{ color: isColorLight(buttonColor) ? '#00000060' : '#FFFFFF80' }}>Outstanding</p>
            <p className="text-2xl font-bold" style={{ color: isColorLight(buttonColor) ? '#000' : '#FFF' }}>$8,400</p>
            <p className="text-xs mt-1" style={{ color: isColorLight(buttonColor) ? '#00000080' : '#FFFFFFB3' }}>12 pending invoices</p>
          </div>
          <div className="flex-1 rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-2" style={{ color: textMuted }}>Avg Invoice</p>
            <p className="text-2xl font-bold" style={{ color: textMain }}>$285</p>
            <p className="text-xs font-medium mt-1 text-emerald-600">+$22 vs last month</p>
          </div>
        </div>
      </div>

      {/* Two column: Invoice Aging + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-5" style={{ color: textMain }}>Invoice Aging</h3>
          {/* Stacked horizontal bar */}
          <div className="flex rounded-full h-6 overflow-hidden mb-5">
            {agingData.map((d, i) => (
              <div key={i} style={{ width: `${(d.value / agingTotal) * 100}%`, backgroundColor: d.color }} />
            ))}
          </div>
          <div className="space-y-3">
            {agingData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-sm" style={{ color: textMain }}>{d.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold" style={{ color: textMain }}>${(d.value / 1000).toFixed(1)}k</span>
                  <span className="text-xs w-10 text-right" style={{ color: textMuted }}>{((d.value / agingTotal) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: textMain }}>Payment Methods</h3>
          <div className="flex items-center gap-6">
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={methodData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" stroke="none">
                    {methodData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {methodData.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-sm flex-1" style={{ color: textMain }}>{m.name}</span>
                  <span className="text-sm font-bold" style={{ color: textMain }}>{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Staff Analytics Layout: Headcount + Utilization + Pay ───
const StaffAnalytics = memo(function StaffAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const buttonColor = colors.buttons || '#1A1A1A';

  const stats = [
    { label: 'Total Staff', value: '12', change: '+2 this month' },
    { label: 'Active Today', value: '8', change: '67% utilization' },
    { label: 'Avg Hours/Week', value: '34.5', change: '+2.1 vs last month' },
    { label: 'Monthly Payroll', value: '$18.4k', change: '+5.2%' },
  ];

  const utilization = [
    { name: 'Mon', hours: 42 }, { name: 'Tue', hours: 38 },
    { name: 'Wed', hours: 45 }, { name: 'Thu', hours: 40 },
    { name: 'Fri', hours: 44 }, { name: 'Sat', hours: 28 },
    { name: 'Sun', hours: 8 },
  ];

  const topPerformers = [
    { name: 'Alex Rivera', appointments: 48, revenue: '$4,200' },
    { name: 'Jordan Kim', appointments: 42, revenue: '$3,800' },
    { name: 'Sam Patel', appointments: 38, revenue: '$3,400' },
    { name: 'Casey Liu', appointments: 35, revenue: '$3,100' },
    { name: 'Morgan Hayes', appointments: 30, revenue: '$2,600' },
  ];

  const breakdown = [
    { label: 'Independent', value: '5', color: '#3B82F6' },
    { label: 'Employee', value: '4', color: '#10B981' },
    { label: 'Instructor', value: '2', color: '#F59E0B' },
    { label: 'On Leave', value: '1', color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const isFeatured = i === 1;
          const bg = isFeatured ? buttonColor : cardBg;
          const mainColor = isFeatured ? (isColorLight(buttonColor) ? '#000000' : '#FFFFFF') : textMain;
          const subColor = isFeatured ? (isColorLight(buttonColor) ? '#00000080' : '#FFFFFFB3') : textMuted;
          return (
            <div key={i} className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: bg }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: subColor }}>{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: mainColor }}>{stat.value}</p>
              <p className="text-xs font-medium mt-2" style={{ color: isFeatured ? (isColorLight(buttonColor) ? '#059669' : '#34D399') : '#10B981' }}>{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Team Hours by Day</h3>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilization}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value} hours`, 'Total']} contentStyle={{ backgroundColor: cardBg, border: `1px solid ${colors.borders || '#E5E7EB'}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {utilization.map((_, index) => (
                    <Cell key={index} fill={index === 4 ? buttonColor : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Top Performers</h3>
          <div className="space-y-4">
            {topPerformers.map((person, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: i === 0 ? buttonColor : '#F5F5F5', color: i === 0 ? (isColorLight(buttonColor) ? '#000' : '#FFF') : '#6B7280' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: textMain }}>{person.name}</span>
                    <span className="text-sm font-semibold shrink-0 ml-2" style={{ color: textMain }}>{person.revenue}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(person.appointments / topPerformers[0].appointments) * 100}%`, backgroundColor: i === 0 ? buttonColor : '#D1D5DB' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Staff by Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {breakdown.map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: textMain }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Products Analytics Layout: Sales + Inventory + Categories ───
const ProductsAnalytics = memo(function ProductsAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const buttonColor = colors.buttons || '#1A1A1A';

  const stats = [
    { label: 'Total Products', value: '86', change: '+12 this month' },
    { label: 'Units Sold', value: '342', change: '+18.4% vs last month' },
    { label: 'Avg Order Value', value: '$47', change: '+$3.20' },
    { label: 'Revenue (MTD)', value: '$16.1k', change: '+22.3%' },
  ];

  const salesTrend = [
    { name: 'Sep', sales: 240 }, { name: 'Oct', sales: 280 },
    { name: 'Nov', sales: 320 }, { name: 'Dec', sales: 410 },
    { name: 'Jan', sales: 360 }, { name: 'Feb', sales: 342 },
  ];

  const topProducts = [
    { name: 'Premium Package', units: 64, revenue: '$5,120' },
    { name: 'Basic Service', units: 58, revenue: '$2,900' },
    { name: 'Add-on Treatment', units: 52, revenue: '$2,080' },
    { name: 'Gift Card', units: 45, revenue: '$2,250' },
    { name: 'Monthly Bundle', units: 38, revenue: '$3,040' },
  ];

  const categories = [
    { label: 'In Stock', value: '62', color: '#10B981' },
    { label: 'Low Stock', value: '14', color: '#F59E0B' },
    { label: 'Out of Stock', value: '6', color: '#EF4444' },
    { label: 'Discontinued', value: '4', color: '#6B7280' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const isFeatured = i === 1;
          const bg = isFeatured ? buttonColor : cardBg;
          const mainColor = isFeatured ? (isColorLight(buttonColor) ? '#000000' : '#FFFFFF') : textMain;
          const subColor = isFeatured ? (isColorLight(buttonColor) ? '#00000080' : '#FFFFFFB3') : textMuted;
          return (
            <div key={i} className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: bg }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: subColor }}>{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: mainColor }}>{stat.value}</p>
              <p className="text-xs font-medium mt-2" style={{ color: isFeatured ? (isColorLight(buttonColor) ? '#059669' : '#34D399') : '#10B981' }}>{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold" style={{ color: textMain }}>Monthly Sales</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">6 months</span>
          </div>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value} units`, 'Sold']} contentStyle={{ backgroundColor: cardBg, border: `1px solid ${colors.borders || '#E5E7EB'}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="sales" stroke={buttonColor} fill={`${buttonColor}20`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: i === 0 ? buttonColor : '#F5F5F5', color: i === 0 ? (isColorLight(buttonColor) ? '#000' : '#FFF') : '#6B7280' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: textMain }}>{product.name}</span>
                    <span className="text-sm font-semibold shrink-0 ml-2" style={{ color: textMain }}>{product.revenue}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(product.units / topProducts[0].units) * 100}%`, backgroundColor: i === 0 ? buttonColor : '#D1D5DB' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Inventory Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: textMain }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Default Analytics Layout (global / business-type) ───
const DefaultAnalytics = memo(function DefaultAnalytics({ colors, businessType }: { colors: DashboardColors; businessType?: string }) {
  const data = platformDummyData.analytics;
  const template = getAnalyticsTemplate(businessType);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {template.statLabels.map((label, i) => {
          const isFeatured = i === 1;
          const bg = isFeatured ? buttonColor : cardBg;
          const mainColor = isFeatured ? (isColorLight(buttonColor) ? '#000000' : '#FFFFFF') : textMain;
          const subColor = isFeatured ? (isColorLight(buttonColor) ? '#00000080' : '#FFFFFFB3') : textMuted;
          return (
            <div key={i} className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: bg }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: subColor }}>{label}</p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: mainColor }}>
                {typeof template.statValues[i] === 'number' ? template.statValues[i].toLocaleString() : template.statValues[i]}
              </p>
              <p className="text-xs font-medium mt-2" style={{ color: isFeatured ? (isColorLight(buttonColor) ? '#059669' : '#34D399') : '#10B981' }}>
                {template.statChanges[i]}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold" style={{ color: textMain }}>Monthly Revenue</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">6 months</span>
          </div>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue.labels.map((l, i) => ({ name: l, value: data.monthlyRevenue.values[i] }))}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip formatter={(value) => [`$${(Number(value) / 1000).toFixed(1)}k`, 'Revenue']} contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.monthlyRevenue.values.map((_, index) => (
                    <Cell key={index} fill={index === data.monthlyRevenue.values.length - 1 ? buttonColor : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>{template.topItemsLabel}</h3>
          <div className="space-y-4">
            {template.topItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: i === 0 ? buttonColor : '#F5F5F5', color: i === 0 ? (isColorLight(buttonColor) ? '#000' : '#FFF') : '#6B7280' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: textMain }}>{item.name}</span>
                    <span className="text-sm font-semibold shrink-0 ml-2" style={{ color: textMain }}>{item.revenue}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(item.count / template.topItems[0].count) * 100}%`, backgroundColor: i === 0 ? buttonColor : '#D1D5DB' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>{template.breakdownLabel}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {template.breakdownItems.map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: textMain }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Tasks Analytics Layout: Completion + Priority + Burndown ───
const TasksAnalytics = memo(function TasksAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const buttonColor = colors.buttons || '#1A1A1A';

  const stats = [
    { label: 'Total Tasks', value: '164', change: '+28 this month' },
    { label: 'Completed', value: '118', change: '72% completion rate' },
    { label: 'In Progress', value: '31', change: '19% of total' },
    { label: 'Overdue', value: '8', change: '-3 vs last month' },
  ];

  const weeklyProgress = [
    { name: 'Mon', completed: 8, created: 5 }, { name: 'Tue', completed: 12, created: 7 },
    { name: 'Wed', completed: 6, created: 9 }, { name: 'Thu', completed: 14, created: 6 },
    { name: 'Fri', completed: 10, created: 8 }, { name: 'Sat', completed: 3, created: 1 },
    { name: 'Sun', completed: 1, created: 0 },
  ];

  const byPriority = [
    { name: 'Alex R.', tasks: 24 }, { name: 'Jordan K.', tasks: 20 },
    { name: 'Sam P.', tasks: 18 }, { name: 'Casey L.', tasks: 15 },
    { name: 'Morgan H.', tasks: 12 },
  ];

  const breakdown = [
    { label: 'Completed', value: '118', color: '#10B981' },
    { label: 'In Progress', value: '31', color: '#3B82F6' },
    { label: 'Pending', value: '7', color: '#F59E0B' },
    { label: 'Overdue', value: '8', color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const isFeatured = i === 1;
          const bg = isFeatured ? buttonColor : cardBg;
          const mainColor = isFeatured ? (isColorLight(buttonColor) ? '#000000' : '#FFFFFF') : textMain;
          const subColor = isFeatured ? (isColorLight(buttonColor) ? '#00000080' : '#FFFFFFB3') : textMuted;
          return (
            <div key={i} className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: bg }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: subColor }}>{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: mainColor }}>{stat.value}</p>
              <p className="text-xs font-medium mt-2" style={{ color: isFeatured ? (isColorLight(buttonColor) ? '#059669' : '#34D399') : '#10B981' }}>{stat.change}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Weekly: Completed vs Created</h3>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: cardBg, border: `1px solid ${colors.borders || '#E5E7EB'}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Bar dataKey="completed" name="Completed" fill={buttonColor} radius={[4, 4, 0, 0]} />
                <Bar dataKey="created" name="Created" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Tasks by Assignee</h3>
          <div className="space-y-4">
            {byPriority.map((person, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: i === 0 ? buttonColor : '#F5F5F5', color: i === 0 ? (isColorLight(buttonColor) ? '#000' : '#FFF') : '#6B7280' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: textMain }}>{person.name}</span>
                    <span className="text-sm font-semibold shrink-0 ml-2" style={{ color: textMain }}>{person.tasks} tasks</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(person.tasks / byPriority[0].tasks) * 100}%`, backgroundColor: i === 0 ? buttonColor : '#D1D5DB' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Task Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {breakdown.map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: textMain }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Marketing Analytics Layout: Campaigns + Reviews + Engagement ───
const MarketingAnalytics = memo(function MarketingAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const buttonColor = colors.buttons || '#1A1A1A';

  const stats = [
    { label: 'Avg Review Score', value: '4.8', change: '+0.2 this quarter' },
    { label: 'Total Reviews', value: '312', change: '+34 this month' },
    { label: 'Email Open Rate', value: '42%', change: '+5.1% vs avg' },
    { label: 'Social Followers', value: '2.4k', change: '+180 this month' },
  ];

  const monthlyReviews = [
    { name: 'Sep', reviews: 28, avg: 4.6 }, { name: 'Oct', reviews: 32, avg: 4.7 },
    { name: 'Nov', reviews: 38, avg: 4.7 }, { name: 'Dec', reviews: 42, avg: 4.8 },
    { name: 'Jan', reviews: 36, avg: 4.9 }, { name: 'Feb', reviews: 34, avg: 4.8 },
  ];

  const topCampaigns = [
    { name: 'Holiday Promo', sent: 1200, opened: 540, clicks: 180 },
    { name: 'New Client Welcome', sent: 800, opened: 480, clicks: 220 },
    { name: 'Loyalty Rewards', sent: 640, opened: 340, clicks: 160 },
    { name: 'Monthly Newsletter', sent: 2400, opened: 960, clicks: 290 },
    { name: 'Re-engagement', sent: 420, opened: 168, clicks: 56 },
  ];

  const breakdown = [
    { label: '5-Star', value: '186', color: '#10B981' },
    { label: '4-Star', value: '94', color: '#3B82F6' },
    { label: '3-Star', value: '22', color: '#F59E0B' },
    { label: '1-2 Star', value: '10', color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const isFeatured = i === 0;
          const bg = isFeatured ? buttonColor : cardBg;
          const mainColor = isFeatured ? (isColorLight(buttonColor) ? '#000000' : '#FFFFFF') : textMain;
          const subColor = isFeatured ? (isColorLight(buttonColor) ? '#00000080' : '#FFFFFFB3') : textMuted;
          return (
            <div key={i} className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: bg }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: subColor }}>{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: mainColor }}>{stat.value}</p>
              <p className="text-xs font-medium mt-2" style={{ color: isFeatured ? (isColorLight(buttonColor) ? '#059669' : '#34D399') : '#10B981' }}>{stat.change}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Reviews Over Time</h3>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReviews}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: cardBg, border: `1px solid ${colors.borders || '#E5E7EB'}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Bar dataKey="reviews" name="Reviews" radius={[6, 6, 0, 0]}>
                  {monthlyReviews.map((_, index) => (
                    <Cell key={index} fill={index === monthlyReviews.length - 1 ? buttonColor : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Top Campaigns</h3>
          <div className="space-y-4">
            {topCampaigns.map((campaign, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: i === 0 ? buttonColor : '#F5F5F5', color: i === 0 ? (isColorLight(buttonColor) ? '#000' : '#FFF') : '#6B7280' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: textMain }}>{campaign.name}</span>
                    <span className="text-sm font-semibold shrink-0 ml-2" style={{ color: textMain }}>{Math.round((campaign.opened / campaign.sent) * 100)}% open</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(campaign.opened / campaign.sent) * 100}%`, backgroundColor: i === 0 ? buttonColor : '#D1D5DB' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Review Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {breakdown.map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: textMain }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Documents Analytics Layout: Status + Signatures + Expiration ───
const DocumentsAnalytics = memo(function DocumentsAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const buttonColor = colors.buttons || '#1A1A1A';

  const stats = [
    { label: 'Total Documents', value: '248', change: '+18 this month' },
    { label: 'Pending Signatures', value: '14', change: '5.6% of total' },
    { label: 'Expiring Soon', value: '6', change: 'Next 30 days' },
    { label: 'Storage Used', value: '2.8 GB', change: '28% of plan' },
  ];

  const monthlyUploads = [
    { name: 'Sep', uploads: 22 }, { name: 'Oct', uploads: 28 },
    { name: 'Nov', uploads: 34 }, { name: 'Dec', uploads: 18 },
    { name: 'Jan', uploads: 42 }, { name: 'Feb', uploads: 30 },
  ];

  const topCategories = [
    { name: 'Contracts', count: 64, pct: '$' },
    { name: 'Waivers', count: 52, pct: '$' },
    { name: 'Invoices (PDF)', count: 48, pct: '$' },
    { name: 'Photos/Media', count: 44, pct: '$' },
    { name: 'Forms', count: 40, pct: '$' },
  ];

  const breakdown = [
    { label: 'Active', value: '198', color: '#10B981' },
    { label: 'Pending Sign', value: '14', color: '#F59E0B' },
    { label: 'Expired', value: '22', color: '#EF4444' },
    { label: 'Archived', value: '14', color: '#6B7280' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const isFeatured = i === 1;
          const bg = isFeatured ? buttonColor : cardBg;
          const mainColor = isFeatured ? (isColorLight(buttonColor) ? '#000000' : '#FFFFFF') : textMain;
          const subColor = isFeatured ? (isColorLight(buttonColor) ? '#00000080' : '#FFFFFFB3') : textMuted;
          return (
            <div key={i} className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: bg }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: subColor }}>{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: mainColor }}>{stat.value}</p>
              <p className="text-xs font-medium mt-2" style={{ color: isFeatured ? (isColorLight(buttonColor) ? '#059669' : '#34D399') : '#10B981' }}>{stat.change}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold" style={{ color: textMain }}>Monthly Uploads</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">6 months</span>
          </div>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyUploads}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value} files`, 'Uploaded']} contentStyle={{ backgroundColor: cardBg, border: `1px solid ${colors.borders || '#E5E7EB'}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="uploads" stroke={buttonColor} fill={`${buttonColor}20`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>By Category</h3>
          <div className="space-y-4">
            {topCategories.map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: i === 0 ? buttonColor : '#F5F5F5', color: i === 0 ? (isColorLight(buttonColor) ? '#000' : '#FFF') : '#6B7280' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: textMain }}>{cat.name}</span>
                    <span className="text-sm font-semibold shrink-0 ml-2" style={{ color: textMain }}>{cat.count} docs</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(cat.count / topCategories[0].count) * 100}%`, backgroundColor: i === 0 ? buttonColor : '#D1D5DB' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Document Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {breakdown.map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: textMain }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Support Analytics Layout: Tickets + Response Time + CSAT ───
const SupportAnalytics = memo(function SupportAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const buttonColor = colors.buttons || '#1A1A1A';

  const stats = [
    { label: 'Open Tickets', value: '23', change: '-4 vs last week' },
    { label: 'Avg Response', value: '2.4h', change: '-18 min improvement' },
    { label: 'Resolution Rate', value: '94%', change: '+2.1% this month' },
    { label: 'CSAT Score', value: '4.6', change: '+0.3 this quarter' },
  ];

  const weeklyTickets = [
    { name: 'Mon', opened: 8, resolved: 10 }, { name: 'Tue', opened: 12, resolved: 11 },
    { name: 'Wed', opened: 6, resolved: 9 }, { name: 'Thu', opened: 10, resolved: 12 },
    { name: 'Fri', opened: 14, resolved: 13 }, { name: 'Sat', opened: 4, resolved: 5 },
    { name: 'Sun', opened: 2, resolved: 3 },
  ];

  const topCategories = [
    { name: 'Billing Questions', count: 42, pct: 28 },
    { name: 'Technical Issues', count: 36, pct: 24 },
    { name: 'Scheduling Help', count: 28, pct: 19 },
    { name: 'Account Changes', count: 24, pct: 16 },
    { name: 'General Inquiry', count: 20, pct: 13 },
  ];

  const breakdown = [
    { label: 'Resolved', value: '128', color: '#10B981' },
    { label: 'In Progress', value: '15', color: '#3B82F6' },
    { label: 'Waiting', value: '8', color: '#F59E0B' },
    { label: 'Escalated', value: '3', color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const isFeatured = i === 2;
          const bg = isFeatured ? buttonColor : cardBg;
          const mainColor = isFeatured ? (isColorLight(buttonColor) ? '#000000' : '#FFFFFF') : textMain;
          const subColor = isFeatured ? (isColorLight(buttonColor) ? '#00000080' : '#FFFFFFB3') : textMuted;
          return (
            <div key={i} className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: bg }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: subColor }}>{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: mainColor }}>{stat.value}</p>
              <p className="text-xs font-medium mt-2" style={{ color: isFeatured ? (isColorLight(buttonColor) ? '#059669' : '#34D399') : '#10B981' }}>{stat.change}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Opened vs Resolved</h3>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTickets}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: textMuted, fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: cardBg, border: `1px solid ${colors.borders || '#E5E7EB'}`, borderRadius: '0.5rem', fontSize: '0.75rem' }} />
                <Bar dataKey="opened" name="Opened" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill={buttonColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>By Category</h3>
          <div className="space-y-4">
            {topCategories.map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: i === 0 ? buttonColor : '#F5F5F5', color: i === 0 ? (isColorLight(buttonColor) ? '#000' : '#FFF') : '#6B7280' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: textMain }}>{cat.name}</span>
                    <span className="text-sm font-semibold shrink-0 ml-2" style={{ color: textMain }}>{cat.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(cat.count / topCategories[0].count) * 100}%`, backgroundColor: i === 0 ? buttonColor : '#D1D5DB' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
        <h3 className="text-base font-semibold mb-6" style={{ color: textMain }}>Ticket Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {breakdown.map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: textMain }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Analytics Router — dispatches to unique layouts per tab ───
// Uses the FIRST component (primary entity) to determine analytics type,
// then falls back to checking all component IDs if the first doesn't match.
// Covers all 70 entity types across 9 analytics layouts + default fallback.
const ANALYTICS_MAPPING: Array<{ keywords: string[]; render: (colors: DashboardColors) => React.ReactElement }> = [
  { keywords: ['clients', 'leads', 'contacts', 'customers', 'members', 'patients', 'students', 'prospects', 'guests', 'community', 'portal', 'loyalty'], render: (c) => <ClientsAnalytics colors={c} /> },
  { keywords: ['schedule', 'calendar', 'appointments', 'bookings', 'sessions', 'classes', 'events', 'courses', 'attendance', 'reservations', 'prescriptions', 'treatments', 'shifts'], render: (c) => <ScheduleAnalytics colors={c} /> },
  { keywords: ['staff', 'team_members', 'groomers', 'artists', 'trainers', 'instructors', 'employees'], render: (c) => <StaffAnalytics colors={c} /> },
  { keywords: ['todos', 'jobs', 'projects', 'workflows', 'cases', 'checklists', 'inspections', 'permits', 'routes'], render: (c) => <TasksAnalytics colors={c} /> },
  { keywords: ['campaigns', 'social_media', 'reputation', 'surveys', 'reviews', 'announcements'], render: (c) => <MarketingAnalytics colors={c} /> },
  { keywords: ['documents', 'contracts', 'waivers', 'forms', 'signatures', 'portfolios', 'galleries', 'images', 'uploads'], render: (c) => <DocumentsAnalytics colors={c} /> },
  { keywords: ['tickets', 'knowledge', 'chat_widget', 'messages', 'notes'], render: (c) => <SupportAnalytics colors={c} /> },
  { keywords: ['products', 'inventory', 'items', 'equipment', 'retail', 'menus', 'services', 'assets', 'recipes', 'packages', 'rooms', 'tables', 'listings', 'properties', 'venues', 'fleet', 'suppliers', 'vendors', 'waste_log'], render: (c) => <ProductsAnalytics colors={c} /> },
  { keywords: ['payments', 'invoices', 'billing', 'finance', 'expenses', 'payroll', 'estimates', 'subscriptions', 'orders', 'purchase_orders', 'tip_pools', 'memberships'], render: (c) => <PaymentsAnalytics colors={c} /> },
];

// Marketing hub — sub-tabs for Social Media, Live Chat, Analytics
function MarketingContent({ colors }: { colors: DashboardColors }) {
  const [subTab, setSubTab] = useState('social_media');
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = isColorLight(buttonColor) ? '#000000' : '#FFFFFF';
  const textMain = colors.headings || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';

  const tabs = [
    { id: 'social_media', label: 'Social Media' },
    { id: 'chat_widget', label: 'Live Chat' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const chatWidgetConfig: TabComponent = { id: 'chat_widget', label: 'Live Chat', view: 'table', availableViews: ['table', 'list'] };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className="px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
            style={{
              backgroundColor: subTab === tab.id ? buttonColor : 'transparent',
              color: subTab === tab.id ? buttonText : textMain,
              border: subTab === tab.id ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'social_media' && (
        <ComingSoonCard
          title="Social Media Manager"
          description="Schedule posts, manage accounts, and track engagement across Instagram, Facebook, X, LinkedIn, and TikTok — all from one place."
          colors={colors}
        />
      )}
      {subTab === 'chat_widget' && (
        <ViewRenderer
          componentId="chat_widget"
          componentConfig={chatWidgetConfig}
          configColors={colors}
          entityType="chat_widget"
        />
      )}
      {subTab === 'analytics' && <MarketingAnalytics colors={colors} />}
    </div>
  );
}

function AnalyticsContent({ colors, businessType, components }: { colors: DashboardColors; businessType?: string; components?: TabComponent[] }) {
  const componentIds = (components || []).map(c => (c.dataSource || c.id).toLowerCase());
  const primaryId = componentIds[0] || '';

  // First: match on the primary (first) component — this is the tab's main entity
  for (const mapping of ANALYTICS_MAPPING) {
    if (mapping.keywords.some(k => primaryId.includes(k))) {
      return mapping.render(colors);
    }
  }
  // Fallback: check ALL component IDs in case the first didn't match
  const allIds = componentIds.join(' ');
  for (const mapping of ANALYTICS_MAPPING) {
    if (mapping.keywords.some(k => allIds.includes(k))) {
      return mapping.render(colors);
    }
  }
  return <DefaultAnalytics colors={colors} businessType={businessType} />;
}

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: 'owner' | 'staff';
  status: 'pending' | 'active' | 'deactivated';
  created_at: string;
}

function TeamManagement({ colors }: { colors: DashboardColors }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');

  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonBg = colors.buttons || '#3B82F6';

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch {
      // Silently fail for demo mode
    }
    setIsLoading(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError('');
    setInviteUrl('');

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, name: inviteName }),
      });
      const data = await res.json();
      if (data.success) {
        setInviteUrl(`${window.location.origin}${data.inviteUrl}`);
        setInviteEmail('');
        setInviteName('');
        fetchTeam();
      } else {
        setInviteError(data.error);
      }
    } catch {
      setInviteError('Failed to send invite');
    }
  }

  async function handleDeactivate(id: string) {
    await fetch('/api/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'deactivated' }),
    });
    fetchTeam();
  }

  async function handleRemove(id: string) {
    await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
    fetchTeam();
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700',
      pending: 'bg-amber-50 text-amber-700',
      deactivated: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold" style={{ color: textMain }}>Team</h3>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors hover:opacity-90"
          style={{ backgroundColor: buttonBg }}
        >
          {showInvite ? 'Cancel' : '+ Invite Member'}
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="mb-6 p-4 rounded-xl border" style={{ borderColor }}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ borderColor, color: textMain }}
            />
            <input
              type="email"
              placeholder="Email *"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ borderColor, color: textMain }}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: buttonBg }}
          >
            Send Invite
          </button>
          {inviteError && (
            <p className="mt-2 text-sm text-red-600">{inviteError}</p>
          )}
          {inviteUrl && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">
              <p className="font-medium mb-1">Invite link created:</p>
              <code className="text-xs break-all">{inviteUrl}</code>
            </div>
          )}
        </form>
      )}

      {isLoading ? (
        <p className="text-sm" style={{ color: textMuted }}>Loading team...</p>
      ) : members.length === 0 ? (
        <p className="text-sm" style={{ color: textMuted }}>No team members yet. Invite your first team member above.</p>
      ) : (
        <div className="space-y-1">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-3 border-b last:border-0"
              style={{ borderColor }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: textMain }}>
                  {member.name || member.email}
                </p>
                {member.name && (
                  <p className="text-xs truncate" style={{ color: textMuted }}>{member.email}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(member.status)}
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100" style={{ color: textMuted }}>
                  {member.role}
                </span>
                {member.status !== 'deactivated' && (
                  <button
                    onClick={() => handleDeactivate(member.id)}
                    className="text-xs text-amber-600 hover:text-amber-700"
                    title="Deactivate"
                  >
                    Deactivate
                  </button>
                )}
                <button
                  onClick={() => handleRemove(member.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                  title="Remove"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardContent({
  activeTab,
  tabLabel,
  components,
  businessType,
  businessName,
  colors = {},
  toolbarSide = 'left',
  websiteData,
}: DashboardContentProps) {
  // Internal sub-tab state — resets when activeTab changes
  const [activeSubTab, setActiveSubTab] = useState<string>('');

  // Reset sub-tab to first component when tab changes
  useEffect(() => {
    if (components.length > 0) {
      setActiveSubTab(components[0].id);
    } else {
      setActiveSubTab('');
    }
  }, [activeTab, components]);

  // Deduplicate calendar-view components and strip redundant calendar-entity sub-tabs
  const CALENDAR_IDS = new Set(['calendar', 'appointments', 'schedules', 'shifts', 'classes', 'reservations']);
  const REDUNDANT_WITH_CALENDAR = new Set(['appointments', 'schedules', 'shifts', 'classes', 'reservations']);
  const dedupedComponents = useMemo(() => {
    const hasCalendarView = components.some(c => c.view === 'calendar');
    let hasCalendar = false;
    return components
      .filter(c => {
        // Strip redundant calendar-entity sub-tabs when tab already has a calendar view
        if (hasCalendarView && REDUNDANT_WITH_CALENDAR.has(c.id) && c.view !== 'calendar') {
          return false;
        }
        return true;
      })
      .map(c => {
        const isCalendarView = c.view === 'calendar' || (!c.view && CALENDAR_IDS.has(c.id));
        if (isCalendarView) {
          if (hasCalendar) {
            return { ...c, view: 'table' as const };
          }
          hasCalendar = true;
        }
        return c;
      });
  }, [components]);

  const bgColor = colors.background || '#F5F5F5';
  const headingColor = getHeadingColor(colors);
  const buttonColor = colors.buttons || '#1A1A1A';
  const textColor = colors.text || '#6B7280';

  const containerStyle: React.CSSProperties = {
    backgroundColor: bgColor,
  };
  if (colors.text) containerStyle.color = colors.text;

  // Only show Live Board sub-tab on tabs that have calendar/appointment components
  const hasCalendarComponent = components.some(c => CALENDAR_IDS.has(c.id) || c.view === 'calendar');

  // Build sub-tabs: dedupedComponents + (live board if calendar tab) + analytics
  const subTabs = dedupedComponents.length > 0
    ? [
        ...dedupedComponents.map(c => ({ id: c.id, label: c.label })),
        ...(hasCalendarComponent ? [{ id: '__board__', label: 'Live Board' }] : []),
        { id: 'analytics', label: 'Analytics' },
      ]
    : [];

  // Check if this is a platform tab (Dashboard detected by label, not ID — tab_1 can be anything in demo mode)
  const isDashboardTab = tabLabel.toLowerCase() === 'dashboard' || activeTab.toLowerCase() === 'dashboard';
  const isSettingsTab = activeTab === 'settings' || activeTab === 'profile';
  const isPlatformTab = isDashboardTab || isSettingsTab || ['site', '__site__', 'analytics', '__marketplace__', '__marketing__'].includes(activeTab);
  const toolbarPadding = toolbarSide === 'right' ? 'lg:pr-16' : 'lg:pl-16';

  if (isPlatformTab) {
    return (
      <div className={`flex-1 min-w-0 ${toolbarPadding} px-4 lg:px-10 py-6 lg:py-8 pb-20 lg:pb-8 overflow-auto`} style={containerStyle}>
        {/* Settings/Profile has no heading — sub-tabs handle it */}
        {!isSettingsTab && (
          <h2 className="text-2xl font-bold mb-8 tracking-tight" style={{ color: headingColor }}>
            {isDashboardTab ? 'Dashboard' : (activeTab === 'site' || activeTab === '__site__') ? 'Website' : activeTab === 'analytics' ? 'Analytics' : activeTab === '__marketplace__' ? 'Marketplace' : activeTab === '__marketing__' ? 'Marketing' : ''}
          </h2>
        )}
        {isDashboardTab && (
          <div className="flex items-center justify-center min-h-[300px]">
            <p className="text-sm" style={{ color: textColor }}>Dashboard coming soon</p>
          </div>
        )}
        {(activeTab === 'site' || activeTab === '__site__') && <SiteView colors={colors} businessName={businessName} businessType={businessType} websiteData={websiteData} />}
        {activeTab === 'analytics' && <AnalyticsContent colors={colors} businessType={businessType} />}
        {isSettingsTab && <SettingsContent colors={colors} defaultTab={activeTab === 'profile' ? 'profile' : 'settings'} />}
        {activeTab === '__marketplace__' && <MarketplaceView colors={colors} />}
        {activeTab === '__marketing__' && <MarketingContent colors={colors} />}
      </div>
    );
  }

  // Determine what to render based on activeSubTab
  const renderContent = () => {
    if (activeSubTab === '__board__') {
      return <LiveBoard colors={colors} businessName={businessName} businessType={businessType} />;
    }

    if (activeSubTab === 'analytics') {
      return <AnalyticsContent colors={colors} businessType={businessType} components={dedupedComponents} />;
    }

    if (activeSubTab === 'client_portal') {
      const PortalContent = require('./PortalContent').default;
      return <PortalContent colors={colors} businessName={businessName} businessType={businessType} />;
    }

    const component = dedupedComponents.find(c => c.id === activeSubTab);
    if (!component) return null;

    const dataKey = component.dataSource || component.id;
    const entityType = getEntityType(dataKey);
    const data = componentDummyData[dataKey];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inlineStages = (component as any).stages;
    const pipelineConfig = component.pipeline
      || (Array.isArray(inlineStages) && inlineStages.length > 0
          ? buildPipelineFromInlineStages(inlineStages)
          : undefined)
      || (data ? extractPipelineConfig(data) : undefined)
      || getDefaultPipelineConfig(dataKey);
    const componentConfig: TabComponent = {
      ...component,
      pipeline: pipelineConfig,
    };

    return (
      <>
        <div>
          <ViewRenderer
            key={component.id}
            componentId={dataKey}
            componentConfig={componentConfig}
            configColors={colors}
            entityType={entityType}
          />
        </div>
      </>
    );
  };

  // Helper to check contrast for pill text
  const getContrastText = (bg: string) => {
    const hex = bg.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#000000' : '#FFFFFF';
  };

  return (
    <div data-tour-id="content-area" className={`flex-1 min-w-0 ${toolbarPadding} px-4 lg:px-10 py-6 lg:py-8 pb-20 lg:pb-8 overflow-auto`} style={containerStyle}>
      {/* Sub-tab pills */}
      {subTabs.length > 1 && (
        <div data-tour-id="sub-tabs" className="flex items-center gap-1.5 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {subTabs.map(sub => {
            const isActive = activeSubTab === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubTab(sub.id)}
                className="px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: isActive ? buttonColor : 'transparent',
                  color: isActive ? getContrastText(buttonColor) : textColor,
                  border: isActive ? 'none' : `1px solid ${colors.borders || '#E5E7EB'}`,
                }}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {renderContent()}
    </div>
  );
}
