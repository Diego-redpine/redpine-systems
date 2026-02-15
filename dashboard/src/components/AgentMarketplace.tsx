'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from 'sonner';

interface Agent {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description: string;
  category: string;
  icon: string;
  capabilities: string[];
  monthly_price_cents: number;
  is_featured: boolean;
  install_count: number;
  rating_avg: number;
  rating_count: number;
  tags: string[];
  created_at: string;
}

interface Subscription {
  agent_id: string;
  status: string;
  configuration: Record<string, unknown>;
  started_at: string;
}

const DEMO_AGENTS: Agent[] = [
  {
    id: 'agent_1', slug: 'receptionist', name: 'AI Receptionist',
    description: 'Auto-responds to booking requests and manages your schedule 24/7.',
    long_description: 'Never miss a booking again. The AI Receptionist monitors incoming booking requests, checks your availability in real-time, confirms appointments, sends reminders, and handles rescheduling — all without any manual intervention.',
    category: 'communication', icon: 'phone',
    capabilities: ['Auto-book appointments', 'Check availability', 'Send reminders', 'Handle rescheduling', 'After-hours responses'],
    monthly_price_cents: 1500, is_featured: true, install_count: 342, rating_avg: 4.8, rating_count: 89, tags: ['booking', 'scheduling'], created_at: '2025-01-15',
  },
  {
    id: 'agent_2', slug: 'content_writer', name: 'Content Writer',
    description: 'Generates social media posts, blog articles, and marketing copy tailored to your brand.',
    long_description: 'Keep your social media fresh without the effort. The Content Writer learns your brand voice, generates platform-specific posts, writes blog articles, creates email campaigns, and suggests trending hashtags.',
    category: 'marketing', icon: 'edit',
    capabilities: ['Social media posts', 'Blog articles', 'Email campaigns', 'Hashtag suggestions', 'Brand voice learning'],
    monthly_price_cents: 2000, is_featured: true, install_count: 278, rating_avg: 4.6, rating_count: 67, tags: ['marketing', 'social media'], created_at: '2025-02-01',
  },
  {
    id: 'agent_3', slug: 'review_manager', name: 'Review Manager',
    description: 'Monitors reviews across platforms and crafts professional responses automatically.',
    long_description: 'Stay on top of your online reputation. The Review Manager watches Google, Yelp, and Facebook for new reviews, drafts personalized responses, flags critical issues, and tracks sentiment trends over time.',
    category: 'reputation', icon: 'star',
    capabilities: ['Review monitoring', 'Auto-responses', 'Sentiment analysis', 'Platform sync', 'Critical alerts'],
    monthly_price_cents: 1000, is_featured: true, install_count: 195, rating_avg: 4.7, rating_count: 52, tags: ['reviews', 'reputation'], created_at: '2025-01-20',
  },
  {
    id: 'agent_4', slug: 'bookkeeper', name: 'AI Bookkeeper',
    description: 'Categorizes expenses, reconciles invoices, and prepares financial summaries.',
    long_description: 'Stop drowning in receipts. The AI Bookkeeper automatically categorizes transactions, matches invoices to payments, flags discrepancies, generates monthly P&L summaries, and prepares data for tax time.',
    category: 'finance', icon: 'dollar',
    capabilities: ['Expense categorization', 'Invoice matching', 'Monthly reports', 'Tax preparation', 'QuickBooks sync'],
    monthly_price_cents: 2500, is_featured: false, install_count: 156, rating_avg: 4.5, rating_count: 41, tags: ['accounting', 'finance'], created_at: '2025-03-01',
  },
  {
    id: 'agent_5', slug: 'route_planner', name: 'Route Planner',
    description: 'Optimizes delivery routes and service schedules for field teams.',
    long_description: 'Save hours and fuel costs every week. The Route Planner takes your daily appointments, optimizes visit order for minimum travel time, accounts for time windows, and sends directions to your team.',
    category: 'operations', icon: 'map',
    capabilities: ['Route optimization', 'Time windows', 'Team dispatch', 'Real-time re-route', 'Fuel tracking'],
    monthly_price_cents: 3000, is_featured: false, install_count: 98, rating_avg: 4.4, rating_count: 28, tags: ['delivery', 'logistics'], created_at: '2025-03-15',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Agents',
  communication: 'Communication',
  marketing: 'Marketing',
  reputation: 'Reputation',
  finance: 'Finance',
  operations: 'Operations',
};

const AGENT_ICONS: Record<string, string> = {
  phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  dollar: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16',
  bot: 'M12 2a2 2 0 012 2v1h4a2 2 0 012 2v10a4 4 0 01-4 4H8a4 4 0 01-4-4V7a2 2 0 012-2h4V4a2 2 0 012-2zM9 13h.01M15 13h.01',
};

function AgentIcon({ icon, size = 24, color }: { icon: string; size?: number; color: string }) {
  const path = AGENT_ICONS[icon] || AGENT_ICONS.bot;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= Math.round(rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({count})</span>
    </div>
  );
}

export default function AgentMarketplace({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';
  const bgColor = colors.background || '#F5F5F5';

  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const json = await res.json();
        setAgents(json.agents || []);
        setSubscriptions(json.subscriptions || []);
        setIsDemoMode(false);
        return;
      }
    } catch { /* fall through */ }
    setAgents(DEMO_AGENTS);
    setIsDemoMode(true);
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const isSubscribed = (agentId: string) =>
    subscriptions.some(s => s.agent_id === agentId && s.status === 'active');

  const handleSubscribe = async (agent: Agent) => {
    if (isDemoMode) {
      // Optimistic demo subscribe
      setSubscriptions(prev => [...prev, { agent_id: agent.id, status: 'active', configuration: {}, started_at: new Date().toISOString() }]);
      toast.success(`Subscribed to ${agent.name}`);
      return;
    }
    try {
      const res = await fetch(`/api/agents/${agent.id}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe' }),
      });
      if (res.ok) {
        toast.success(`Subscribed to ${agent.name}`);
        fetchAgents();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to subscribe');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleUnsubscribe = async (agent: Agent) => {
    if (isDemoMode) {
      setSubscriptions(prev => prev.filter(s => s.agent_id !== agent.id));
      toast.success(`Unsubscribed from ${agent.name}`);
      return;
    }
    try {
      const res = await fetch(`/api/agents/${agent.id}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsubscribe' }),
      });
      if (res.ok) {
        toast.success(`Unsubscribed from ${agent.name}`);
        fetchAgents();
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const filteredAgents = agents.filter(a => {
    if (category !== 'all' && a.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.tags.some(t => t.includes(q));
    }
    return true;
  });

  const featuredAgents = filteredAgents.filter(a => a.is_featured);
  const otherAgents = filteredAgents.filter(a => !a.is_featured);

  const formatPrice = (cents: number) => cents === 0 ? 'Free' : `$${(cents / 100).toFixed(0)}/mo`;

  return (
    <div className="space-y-6">
      {/* My Active Agents */}
      {subscriptions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: textMuted }}>MY ACTIVE AGENTS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subscriptions.filter(s => s.status === 'active').map(sub => {
              const agent = agents.find(a => a.id === sub.agent_id);
              if (!agent) return null;
              return (
                <div
                  key={sub.agent_id}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-shadow hover:shadow-md"
                  style={{ backgroundColor: cardBg, borderColor: `${buttonColor}40` }}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${buttonColor}15` }}>
                    <AgentIcon icon={agent.icon} size={20} color={buttonColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: textMain }}>{agent.name}</p>
                    <p className="text-xs" style={{ color: textMuted }}>Active since {new Date(sub.started_at).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">Active</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm"
            style={{ borderColor, color: textMain, backgroundColor: cardBg }}
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className="px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
            style={{
              backgroundColor: category === key ? buttonColor : 'transparent',
              color: category === key ? getContrastText(buttonColor) : textMain,
              border: category === key ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Featured Agents */}
      {featuredAgents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: textMuted }}>FEATURED</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="text-left rounded-2xl p-5 transition-shadow hover:shadow-md"
                style={{ backgroundColor: cardBg, border: `2px solid ${buttonColor}30` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${buttonColor}15` }}>
                    <AgentIcon icon={agent.icon} size={24} color={buttonColor} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm truncate" style={{ color: textMain }}>{agent.name}</h4>
                    <StarRating rating={agent.rating_avg} count={agent.rating_count} />
                  </div>
                </div>
                <p className="text-xs mb-3 line-clamp-2" style={{ color: textMuted }}>{agent.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: buttonColor }}>{formatPrice(agent.monthly_price_cents)}</span>
                  <span className="text-xs" style={{ color: textMuted }}>{agent.install_count} active</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Agents */}
      {otherAgents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: textMuted }}>ALL AGENTS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="text-left rounded-2xl p-5 transition-shadow hover:shadow-md"
                style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${buttonColor}10` }}>
                    <AgentIcon icon={agent.icon} size={20} color={buttonColor} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm truncate" style={{ color: textMain }}>{agent.name}</h4>
                    <StarRating rating={agent.rating_avg} count={agent.rating_count} />
                  </div>
                </div>
                <p className="text-xs mb-3 line-clamp-2" style={{ color: textMuted }}>{agent.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: buttonColor }}>{formatPrice(agent.monthly_price_cents)}</span>
                  <span className="text-xs" style={{ color: textMuted }}>{agent.install_count} active</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: textMuted }}>No agents found matching your search.</p>
        </div>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSelectedAgent(null)} />
          <div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            style={{ backgroundColor: cardBg }}
          >
            {/* Header with icon */}
            <div className="p-6 pb-0">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${buttonColor}15` }}>
                  <AgentIcon icon={selectedAgent.icon} size={28} color={buttonColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold" style={{ color: textMain }}>{selectedAgent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={selectedAgent.rating_avg} count={selectedAgent.rating_count} />
                    <span className="text-xs" style={{ color: textMuted }}>{selectedAgent.install_count} active users</span>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: bgColor }}>
                <span className="text-2xl font-bold" style={{ color: buttonColor }}>
                  {formatPrice(selectedAgent.monthly_price_cents)}
                </span>
                {selectedAgent.monthly_price_cents > 0 && (
                  <span className="text-xs" style={{ color: textMuted }}>per agent, billed monthly</span>
                )}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {/* Description */}
              <p className="text-sm mb-4 leading-relaxed" style={{ color: textMain }}>{selectedAgent.long_description}</p>

              {/* Capabilities */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold mb-2" style={{ color: textMuted }}>CAPABILITIES</h4>
                <div className="space-y-1.5">
                  {selectedAgent.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm" style={{ color: textMain }}>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedAgent.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Category */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs" style={{ color: textMuted }}>Category:</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${borderColor}60`, color: textMain }}>
                  {CATEGORY_LABELS[selectedAgent.category] || selectedAgent.category}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t flex gap-3" style={{ borderColor }}>
              <button
                onClick={() => setSelectedAgent(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border"
                style={{ borderColor, color: textMain }}
              >
                Close
              </button>
              {isSubscribed(selectedAgent.id) ? (
                <button
                  onClick={() => { handleUnsubscribe(selectedAgent); setSelectedAgent(null); }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Unsubscribe
                </button>
              ) : (
                <button
                  onClick={() => { handleSubscribe(selectedAgent); setSelectedAgent(null); }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: buttonColor }}
                >
                  Subscribe — {formatPrice(selectedAgent.monthly_price_cents)}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
