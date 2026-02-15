'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import type { Order } from '@/types/freelancer';
import OrderDetailModal from './OrderDetailModal';

type OrderListItem = Omit<Order, 'gig' | 'freelancer'> & {
  gig?: { title: string; category: string };
  freelancer?: { display_name: string; avatar_url: string };
};

interface MyOrdersProps {
  colors: DashboardColors;
  onClose: () => void;
}

type OrderStatus = 'pending_payment' | 'active' | 'in_progress' | 'delivered' | 'revision' | 'completed' | 'cancelled' | 'disputed';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pending Payment', color: '#92400E', bg: '#FEF3C7' },
  active: { label: 'Active', color: '#1E40AF', bg: '#DBEAFE' },
  in_progress: { label: 'In Progress', color: '#6D28D9', bg: '#EDE9FE' },
  delivered: { label: 'Delivered', color: '#7C3AED', bg: '#F3E8FF' },
  revision: { label: 'Revision', color: '#C2410C', bg: '#FFF7ED' },
  completed: { label: 'Completed', color: '#166534', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6' },
  disputed: { label: 'Disputed', color: '#DC2626', bg: '#FEE2E2' },
};

// Demo orders for when API is unavailable
const DEMO_ORDERS: OrderListItem[] = [
  {
    id: 'demo-order-1', buyer_id: 'demo-buyer', freelancer_id: 'f1', gig_id: 'g1',
    tier: 'standard', requirements: 'Connect CRM with calendar and email tools',
    total_cents: 35000, platform_fee_cents: 3500, freelancer_payout_cents: 31500,
    status: 'active', max_revisions: 2, revision_count: 0,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date().toISOString(),
    gig: { title: 'Build custom integrations for your business tools', category: 'development' },
    freelancer: { display_name: 'Alex Rivera', avatar_url: '' },
  },
  {
    id: 'demo-order-2', buyer_id: 'demo-buyer', freelancer_id: 'f2', gig_id: 'g2',
    tier: 'basic', requirements: 'Need a modern logo and color palette for my salon',
    total_cents: 20000, platform_fee_cents: 2000, freelancer_payout_cents: 18000,
    status: 'delivered', max_revisions: 2, revision_count: 0,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    delivered_at: new Date(Date.now() - 86400000).toISOString(),
    gig: { title: 'Design a professional brand identity', category: 'design' },
    freelancer: { display_name: 'Sarah Chen', avatar_url: '' },
  },
  {
    id: 'demo-order-3', buyer_id: 'demo-buyer', freelancer_id: 'f4', gig_id: 'g4',
    tier: 'standard', requirements: 'Website copy for 5 pages — home, about, services, booking, contact',
    total_cents: 20000, platform_fee_cents: 2000, freelancer_payout_cents: 18000,
    status: 'completed', max_revisions: 3, revision_count: 1,
    created_at: new Date(Date.now() - 2592000000).toISOString(),
    updated_at: new Date(Date.now() - 1209600000).toISOString(),
    completed_at: new Date(Date.now() - 1209600000).toISOString(),
    gig: { title: 'Write converting website copy', category: 'writing' },
    freelancer: { display_name: 'Emma Williams', avatar_url: '' },
  },
];

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

function FreelancerAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#F97316', '#14B8A6'];
  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, backgroundColor: colors[colorIndex], fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export default function MyOrders({ colors, onClose }: MyOrdersProps) {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [roleTab, setRoleTab] = useState<'buyer' | 'freelancer'>('buyer');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?role=${roleTab}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setOrders(json.data);
          setIsDemoMode(false);
          return;
        }
      }
    } catch { /* fall through */ }
    setOrders(roleTab === 'buyer' ? DEMO_ORDERS : []);
    setIsDemoMode(true);
  }, [roleTab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        style={{ backgroundColor: cardBg }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor }}>
          <h3 className="text-lg font-bold" style={{ color: textMain }}>My Orders</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 px-6 py-3 border-b" style={{ borderColor }}>
          {(['buyer', 'freelancer'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setRoleTab(tab)}
              className="px-4 py-1.5 text-sm font-medium rounded-full transition-colors"
              style={{
                backgroundColor: roleTab === tab ? buttonColor : 'transparent',
                color: roleTab === tab ? buttonText : textMuted,
                border: roleTab === tab ? 'none' : `1px solid ${borderColor}`,
              }}
            >
              {tab === 'buyer' ? 'As Buyer' : 'As Freelancer'}
            </button>
          ))}
        </div>

        {/* Demo mode banner */}
        {isDemoMode && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-xl text-xs" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
            Showing sample orders. Real orders appear when you place or receive them.
          </div>
        )}

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orders.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="text-sm" style={{ color: textMuted }}>
                {roleTab === 'buyer' ? 'No orders placed yet.' : 'No freelancer orders yet.'}
              </p>
              <p className="text-xs mt-1" style={{ color: textMuted }}>
                {roleTab === 'buyer' ? 'Browse freelancers and hire one to get started.' : 'Set up your freelancer profile to start receiving orders.'}
              </p>
            </div>
          )}

          {orders.map(order => {
            const status = order.status as OrderStatus;
            const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.active;

            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="w-full text-left rounded-xl p-4 border transition-shadow hover:shadow-md"
                style={{ borderColor, backgroundColor: cardBg }}
              >
                <div className="flex items-start gap-3">
                  {order.freelancer && (
                    <FreelancerAvatar name={order.freelancer.display_name} size={40} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold truncate" style={{ color: textMain }}>
                        {order.gig?.title || 'Order'}
                      </h4>
                      <span
                        className="px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0"
                        style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                      {roleTab === 'buyer' ? `Freelancer: ${order.freelancer?.display_name}` : `Buyer order`}
                      {' — '}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold" style={{ color: textMain }}>
                        {formatPrice(order.total_cents)}
                      </span>
                      <span className="text-xs" style={{ color: textMuted }}>
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          colors={colors}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={fetchOrders}
        />
      )}
    </>
  );
}
