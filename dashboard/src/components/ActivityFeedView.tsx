'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface DashboardColors {
  sidebar_bg?: string;
  sidebar_text?: string;
  sidebar_icons?: string;
  sidebar_buttons?: string;
  background?: string;
  buttons?: string;
  cards?: string;
  text?: string;
  headings?: string;
  borders?: string;
}

interface ActivityLog {
  id: string;
  actor_name: string | null;
  action: 'create' | 'update' | 'delete' | 'move_stage';
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  changes: Record<string, unknown>;
  created_at: string;
}

interface ActivityFeedViewProps {
  colors: DashboardColors;
}

const ACTION_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  create: { label: 'Created', color: '#10B981', bg: '#ECFDF5', icon: '+' },
  update: { label: 'Updated', color: '#3B82F6', bg: '#EFF6FF', icon: '~' },
  delete: { label: 'Deleted', color: '#EF4444', bg: '#FEF2F2', icon: '−' },
  move_stage: { label: 'Moved', color: '#8B5CF6', bg: '#F5F3FF', icon: '→' },
};

const ENTITY_LABELS: Record<string, string> = {
  clients: 'Client',
  appointments: 'Appointment',
  invoices: 'Invoice',
  products: 'Product',
  tasks: 'Task',
  leads: 'Lead',
  team_members: 'Team Member',
  messages: 'Message',
  documents: 'Document',
  reviews: 'Review',
  workflows: 'Workflow',
  projects: 'Project',
  jobs: 'Job',
  expenses: 'Expense',
  estimates: 'Estimate',
  contracts: 'Contract',
  waivers: 'Waiver',
  forms: 'Form',
  notes: 'Note',
};

// Demo data for when no real data is available
const DEMO_ACTIVITIES: ActivityLog[] = [
  { id: '1', actor_name: 'You', action: 'create', entity_type: 'clients', entity_id: 'c1', entity_name: 'Sarah Johnson', changes: {}, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '2', actor_name: 'You', action: 'update', entity_type: 'appointments', entity_id: 'a1', entity_name: 'Consultation - Sarah Johnson', changes: { status: 'confirmed' }, created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '3', actor_name: 'Maria Garcia', action: 'create', entity_type: 'invoices', entity_id: 'i1', entity_name: 'INV-2024-001', changes: {}, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '4', actor_name: 'You', action: 'move_stage', entity_type: 'leads', entity_id: 'l1', entity_name: 'Mike Thompson', changes: { stage: 'Qualified' }, created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: '5', actor_name: 'Maria Garcia', action: 'update', entity_type: 'products', entity_id: 'p1', entity_name: 'Premium Package', changes: { price: '$199' }, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: '6', actor_name: 'You', action: 'delete', entity_type: 'tasks', entity_id: 't1', entity_name: 'Follow up with old lead', changes: {}, created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: '7', actor_name: 'James Lee', action: 'create', entity_type: 'appointments', entity_id: 'a2', entity_name: 'Haircut - James Lee', changes: {}, created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: '8', actor_name: 'You', action: 'update', entity_type: 'clients', entity_id: 'c2', entity_name: 'David Chen', changes: { phone: '+1 555-0123' }, created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: '9', actor_name: 'Maria Garcia', action: 'create', entity_type: 'tasks', entity_id: 't2', entity_name: 'Order new supplies', changes: {}, created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  { id: '10', actor_name: 'You', action: 'update', entity_type: 'invoices', entity_id: 'i2', entity_name: 'INV-2024-002', changes: { status: 'paid' }, created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
  { id: '11', actor_name: 'James Lee', action: 'move_stage', entity_type: 'leads', entity_id: 'l2', entity_name: 'Rachel Kim', changes: { stage: 'Won' }, created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
  { id: '12', actor_name: 'You', action: 'create', entity_type: 'documents', entity_id: 'd1', entity_name: 'Service Agreement Template', changes: {}, created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString() },
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function ActivityFeedView({ colors }: ActivityFeedViewProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 30;

  const cardBg = colors.cards || '#FFFFFF';
  const textColor = colors.text || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sort_by: 'created_at',
        sort_order: 'desc',
      });
      if (filterAction !== 'all') params.set('action', filterAction);
      if (filterEntity !== 'all') params.set('entity_type', filterEntity);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/data/activity_logs?${params}`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setActivities(json.data);
          setTotalCount(json.count || 0);
          setIsDemoMode(false);
        } else {
          setActivities(DEMO_ACTIVITIES);
          setTotalCount(DEMO_ACTIVITIES.length);
          setIsDemoMode(true);
        }
      } else {
        // Likely no table yet or auth issue — show demo
        setActivities(DEMO_ACTIVITIES);
        setTotalCount(DEMO_ACTIVITIES.length);
        setIsDemoMode(true);
      }
    } catch {
      setActivities(DEMO_ACTIVITIES);
      setTotalCount(DEMO_ACTIVITIES.length);
      setIsDemoMode(true);
    }
    setIsLoading(false);
  }, [page, filterAction, filterEntity, searchQuery]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Filter demo data client-side
  const filteredActivities = useMemo(() => {
    if (!isDemoMode) return activities;
    return activities.filter(a => {
      if (filterAction !== 'all' && a.action !== filterAction) return false;
      if (filterEntity !== 'all' && a.entity_type !== filterEntity) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!(a.entity_name || '').toLowerCase().includes(q) && !(a.actor_name || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activities, isDemoMode, filterAction, filterEntity, searchQuery]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityLog[]> = {};
    for (const activity of filteredActivities) {
      const date = new Date(activity.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(activity);
    }
    return groups;
  }, [filteredActivities]);

  // Stat counts
  const stats = useMemo(() => {
    const all = isDemoMode ? DEMO_ACTIVITIES : activities;
    return {
      total: totalCount,
      creates: all.filter(a => a.action === 'create').length,
      updates: all.filter(a => a.action === 'update').length,
      deletes: all.filter(a => a.action === 'delete').length,
    };
  }, [activities, isDemoMode, totalCount]);

  const getContrastText = (bg: string) => {
    const hex = bg.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Unique entity types in current data
  const entityTypes = useMemo(() => {
    const types = new Set(activities.map(a => a.entity_type));
    return Array.from(types).sort();
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Actions', value: stats.total, color: buttonColor },
          { label: 'Created', value: stats.creates, color: '#10B981' },
          { label: 'Updated', value: stats.updates, color: '#3B82F6' },
          { label: 'Deleted', value: stats.deletes, color: '#EF4444' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <p className="text-sm mb-1" style={{ color: textColor }}>{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          className="px-4 py-2 text-sm flex-1 min-w-[200px]"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            color: colors.headings || '#1A1A1A',
          }}
        />

        {/* Action filter */}
        <select
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            color: colors.headings || '#1A1A1A',
          }}
        >
          <option value="all">All Actions</option>
          <option value="create">Created</option>
          <option value="update">Updated</option>
          <option value="delete">Deleted</option>
          <option value="move_stage">Moved</option>
        </select>

        {/* Entity filter */}
        <select
          value={filterEntity}
          onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            color: colors.headings || '#1A1A1A',
          }}
        >
          <option value="all">All Types</option>
          {entityTypes.map(type => (
            <option key={type} value={type}>{ENTITY_LABELS[type] || type}</option>
          ))}
        </select>
      </div>

      {isDemoMode && (
        <div
          className="px-4 py-3 text-sm"
          style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
        >
          Showing sample activity data. Real activity will appear here as you use the platform.
        </div>
      )}

      {/* Timeline Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: buttonColor, borderTopColor: 'transparent' }} />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div
          className="p-12 text-center"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium mb-1" style={{ color: colors.headings || '#1A1A1A' }}>No activity yet</p>
          <p className="text-sm" style={{ color: textColor }}>Activity will appear here as you create, edit, and manage records.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: textColor }}>
                {dateLabel}
              </h3>
              <div
                className="overflow-hidden divide-y"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  ['--tw-divide-opacity' as string]: 1,
                }}
              >
                {items.map((activity) => {
                  const actionMeta = ACTION_LABELS[activity.action] || ACTION_LABELS.update;
                  const entityLabel = ENTITY_LABELS[activity.entity_type] || activity.entity_type;
                  const changedFields = Object.keys(activity.changes || {}).filter(k => k !== 'updated_at');

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 hover:opacity-90 transition-opacity"
                      style={{ borderColor }}
                    >
                      {/* Action icon */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: actionMeta.bg, color: actionMeta.color }}
                      >
                        {actionMeta.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: colors.headings || '#1A1A1A' }}>
                          <span className="font-semibold">{activity.actor_name || 'System'}</span>
                          {' '}
                          <span style={{ color: actionMeta.color }}>{actionMeta.label.toLowerCase()}</span>
                          {' '}
                          {activity.action === 'move_stage' ? 'a' : (activity.action === 'delete' ? '' : 'a')}
                          {' '}
                          <span style={{ color: textColor }}>{entityLabel.toLowerCase()}</span>
                          {activity.entity_name && (
                            <>
                              {' '}
                              <span className="font-medium">{activity.entity_name}</span>
                            </>
                          )}
                        </p>

                        {/* Changed fields summary */}
                        {changedFields.length > 0 && activity.action === 'update' && (
                          <p className="text-xs mt-1" style={{ color: textColor }}>
                            Changed: {changedFields.slice(0, 4).map(f => f.replace(/_/g, ' ')).join(', ')}
                            {changedFields.length > 4 && ` +${changedFields.length - 4} more`}
                          </p>
                        )}

                        {/* Move stage details */}
                        {activity.action === 'move_stage' && activity.changes?.stage ? (
                          <p className="text-xs mt-1" style={{ color: textColor }}>
                            Moved to stage: <span className="font-medium">{String(activity.changes.stage)}</span>
                          </p>
                        ) : null}
                      </div>

                      {/* Timestamp */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs" style={{ color: textColor }} title={formatFullDate(activity.created_at)}>
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {!isDemoMode && totalCount > pageSize && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-sm disabled:opacity-40"
                style={{
                  backgroundColor: buttonColor,
                  color: getContrastText(buttonColor),
                }}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm" style={{ color: textColor }}>
                Page {page} of {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(totalCount / pageSize)}
                className="px-4 py-2 text-sm disabled:opacity-40"
                style={{
                  backgroundColor: buttonColor,
                  color: getContrastText(buttonColor),
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
