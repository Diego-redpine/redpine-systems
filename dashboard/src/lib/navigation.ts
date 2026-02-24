import { NavSection } from '@/types/navigation';

export const defaultNavigation: NavSection[] = [
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'people',
        icon: 'people',
        label: 'People',
        defaultLabel: 'People',
        subItems: ['Clients', 'Leads', 'Staff', 'Vendors'],
      },
      {
        id: 'things',
        icon: 'box',
        label: 'Things',
        defaultLabel: 'Things',
        subItems: ['Products', 'Inventory', 'Equipment', 'Assets'],
      },
      {
        id: 'time',
        icon: 'clock',
        label: 'Time',
        defaultLabel: 'Time',
        subItems: ['Calendar', 'Appointments', 'Schedules', 'Shifts'],
      },
      {
        id: 'money',
        icon: 'dollar',
        label: 'Money',
        defaultLabel: 'Money',
        subItems: ['Invoices', 'Payments', 'Expenses', 'Payroll', 'Estimates'],
      },
      {
        id: 'tasks',
        icon: 'check',
        label: 'Tasks',
        defaultLabel: 'Tasks',
        subItems: ['To-dos', 'Jobs', 'Projects', 'Workflows'],
      },
      {
        id: 'comms',
        icon: 'chat',
        label: 'Comms',
        defaultLabel: 'Comms',
        subItems: ['Messages', 'Notes', 'Announcements'],
      },
      {
        id: 'reviews',
        icon: 'star',
        label: 'Reviews',
        defaultLabel: 'Reviews',
        subItems: ['Inbox', 'Requests', 'Gate', 'Widgets'],
      },
      {
        id: 'files',
        icon: 'folder',
        label: 'Files',
        defaultLabel: 'Files',
        subItems: ['Documents', 'Contracts', 'Images', 'Uploads'],
      },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    showDividerAbove: true,
    items: [
      {
        id: 'site',
        icon: 'globe',
        label: 'Site',
        defaultLabel: 'Site',
        subItems: ['Pages', 'Booking Widget', 'Online Store', 'Domain', 'SEO'],
      },
      {
        id: 'analytics',
        icon: 'chart',
        label: 'Analytics',
        defaultLabel: 'Analytics',
        subItems: ['Overview', 'Revenue', 'Clients', 'Performance'],
      },
      {
        id: 'settings',
        icon: 'settings',
        label: 'Settings',
        defaultLabel: 'Settings',
        subItems: ['Account', 'Billing', 'Integrations', 'Team', 'Customize Nav'],
      },
    ],
  },
];
