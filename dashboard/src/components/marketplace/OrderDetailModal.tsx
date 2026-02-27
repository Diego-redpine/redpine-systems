'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import type { Order, FreelancerMessage } from '@/types/freelancer';
import OrderChat from './OrderChat';
import ReviewModal from './ReviewModal';
import { toast } from 'sonner';

interface OrderDetailModalProps {
  orderId: string;
  colors: DashboardColors;
  onClose: () => void;
  onStatusChange: () => void;
}

type OrderStatus = 'pending_payment' | 'active' | 'in_progress' | 'delivered' | 'revision' | 'completed' | 'cancelled' | 'disputed';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pending Payment', color: '#92400E', bg: '#FEF3C7' },
  active: { label: 'Active', color: '#1E40AF', bg: '#DBEAFE' },
  in_progress: { label: 'In Progress', color: '#6D28D9', bg: '#EDE9FE' },
  delivered: { label: 'Delivered', color: '#7C3AED', bg: '#F3E8FF' },
  revision: { label: 'Revision Requested', color: '#C2410C', bg: '#FFF7ED' },
  completed: { label: 'Completed', color: '#166534', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6' },
  disputed: { label: 'Disputed', color: '#DC2626', bg: '#FEE2E2' },
};

const TIMELINE_STEPS: OrderStatus[] = ['active', 'in_progress', 'delivered', 'completed'];

type OrderDetail = Omit<Order, 'gig' | 'freelancer'> & {
  messages: FreelancerMessage[];
  role: string;
  gig?: { title: string; category: string; description: string; pricing_tiers: Record<string, unknown> };
  freelancer?: { id: string; display_name: string; avatar_url: string; tagline: string };
};

// Demo data mapped by orderId for realistic demo experience
const DEMO_ORDER_MAP: Record<string, { status: string; gig_title: string; freelancer_name: string; total_cents: number; tier: string; requirements: string }> = {
  'demo-order-1': { status: 'active', gig_title: 'Build custom integrations for your business tools', freelancer_name: 'Alex Rivera', total_cents: 35000, tier: 'standard', requirements: 'Connect CRM with calendar and email. Auto-create events on new client.' },
  'demo-order-2': { status: 'delivered', gig_title: 'Design a professional brand identity', freelancer_name: 'Sarah Chen', total_cents: 20000, tier: 'basic', requirements: 'Need a modern logo and color palette for my salon.' },
  'demo-order-3': { status: 'completed', gig_title: 'Write converting website copy', freelancer_name: 'Emma Williams', total_cents: 20000, tier: 'standard', requirements: 'Website copy for 5 pages — home, about, services, booking, contact.' },
};

function getDemoOrder(orderId: string): OrderDetail {
  const mapped = DEMO_ORDER_MAP[orderId] || DEMO_ORDER_MAP['demo-order-1'];
  const feeCents = Math.round(mapped.total_cents * 0.10);
  return {
    id: orderId,
    buyer_id: 'demo-buyer',
    freelancer_id: 'f1',
    gig_id: 'g1',
    tier: mapped.tier as 'basic' | 'standard' | 'premium',
    requirements: mapped.requirements,
    total_cents: mapped.total_cents,
    platform_fee_cents: feeCents,
    freelancer_payout_cents: mapped.total_cents - feeCents,
    status: mapped.status as OrderDetail['status'],
    max_revisions: 2,
    revision_count: mapped.status === 'completed' ? 1 : 0,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    gig: { title: mapped.gig_title, category: 'development', description: '', pricing_tiers: {} },
    freelancer: { id: 'f1', display_name: mapped.freelancer_name, avatar_url: '', tagline: 'Freelancer' },
    messages: [
      { id: 'm1', order_id: orderId, sender_id: 'f1-user', content: `Thanks for the order! I'll get started right away.`, created_at: new Date(Date.now() - 82800000).toISOString() },
      { id: 'm2', order_id: orderId, sender_id: 'demo-buyer', content: 'Sounds great! Let me know if you need anything.', created_at: new Date(Date.now() - 79200000).toISOString() },
    ],
    role: 'buyer',
  } as OrderDetail;
}

function formatPrice(cents: number) {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toLocaleString()}`;
}

export default function OrderDetailModal({ orderId, colors, onClose, onStatusChange }: OrderDetailModalProps) {
  const [order, setOrder] = useState<(OrderDetail) | null>(null);
  const [role, setRole] = useState<'buyer' | 'freelancer'>('buyer');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const json = await res.json();
        setOrder(json.data);
        setRole(json.role);
        setIsDemoMode(false);
        return;
      }
    } catch { /* fall through */ }
    // Demo mode
    const demo = getDemoOrder(orderId);
    setOrder(demo);
    setRole('buyer');
    setIsDemoMode(true);
  }, [orderId]);

  useEffect(() => {
    fetchOrder().finally(() => setIsLoading(false));
  }, [fetchOrder]);

  const handleAction = async (action: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const json = await res.json();
        setOrder(prev => prev ? { ...prev, ...json.data } : prev);
        toast.success(`Order ${action === 'deliver' ? 'delivered' : action === 'approve' ? 'completed' : action === 'request_revision' ? 'revision requested' : 'cancelled'}!`);
        onStatusChange();
        return;
      }
    } catch { /* demo fallback */ }

    // Demo mode fallback
    if (order) {
      const statusMap: Record<string, OrderStatus> = {
        deliver: 'delivered',
        approve: 'completed',
        request_revision: 'revision',
        cancel: 'cancelled',
      };
      setOrder({ ...order, status: statusMap[action] || order.status });
      toast.success(`Order updated! (Demo mode)`);
      onStatusChange();
    }
    setIsUpdating(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!order) return;

    // Optimistic add
    const tempMsg: FreelancerMessage = {
      id: `temp-${Date.now()}`,
      order_id: orderId,
      sender_id: isDemoMode ? 'demo-buyer' : 'current-user',
      content,
      created_at: new Date().toISOString(),
    };
    setOrder({ ...order, messages: [...(order.messages || []), tempMsg] });

    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const json = await res.json();
        setOrder(prev => {
          if (!prev) return prev;
          const msgs = prev.messages.filter(m => m.id !== tempMsg.id);
          return { ...prev, messages: [...msgs, json.data] };
        });
      }
    } catch { /* keep optimistic msg */ }
  };

  if (isLoading) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
        <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-8 text-center" style={{ backgroundColor: cardBg }}>
          <p className="text-sm" style={{ color: textMuted }}>Loading order...</p>
        </div>
      </>
    );
  }

  if (!order) return null;

  const status = order.status as OrderStatus;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const currentStepIndex = TIMELINE_STEPS.indexOf(status);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: cardBg }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor }}>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold" style={{ color: textMain }}>
                {order.gig?.title || 'Order Details'}
              </h3>
              <span
                className="px-2.5 py-0.5 text-xs font-medium "
                style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: textMuted }}>
              Order #{orderId.slice(0, 8)} — {role === 'buyer' ? 'You hired' : 'Hired by'}{' '}
              {order.freelancer?.display_name || 'Freelancer'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Timeline */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-1">
              {TIMELINE_STEPS.map((step, i) => {
                const isPast = currentStepIndex >= i;
                const isCurrent = currentStepIndex === i;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: isPast ? buttonColor : borderColor,
                          color: isPast ? buttonText : textMuted,
                          border: isCurrent ? `2px solid ${buttonColor}` : 'none',
                        }}
                      >
                        {isPast && !isCurrent ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className="text-[10px] mt-1" style={{ color: isPast ? textMain : textMuted }}>
                        {STATUS_CONFIG[step].label}
                      </span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className="h-0.5 flex-1 mx-1 rounded"
                        style={{ backgroundColor: currentStepIndex > i ? buttonColor : borderColor }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order details */}
          <div className="px-6 pb-4">
            <div className="border divide-y text-sm" style={{ borderColor }}>
              <div className="flex justify-between p-3">
                <span style={{ color: textMuted }}>Tier</span>
                <span className="capitalize font-medium" style={{ color: textMain }}>{order.tier}</span>
              </div>
              <div className="flex justify-between p-3">
                <span style={{ color: textMuted }}>Total</span>
                <span className="font-bold" style={{ color: textMain }}>{formatPrice(order.total_cents)}</span>
              </div>
              <div className="flex justify-between p-3">
                <span style={{ color: textMuted }}>Platform Fee</span>
                <span style={{ color: textMain }}>{formatPrice(order.platform_fee_cents)}</span>
              </div>
              <div className="flex justify-between p-3">
                <span style={{ color: textMuted }}>Revisions Used</span>
                <span style={{ color: textMain }}>{order.revision_count} / {order.max_revisions}</span>
              </div>
              <div className="flex justify-between p-3">
                <span style={{ color: textMuted }}>Created</span>
                <span style={{ color: textMain }}>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {order.requirements && (
            <div className="px-6 pb-4">
              <h5 className="text-xs font-semibold mb-2" style={{ color: textMuted }}>REQUIREMENTS</h5>
              <p className="text-sm p-3" style={{ color: textMain, backgroundColor: `${borderColor}40` }}>
                {order.requirements}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="px-6 pb-4">
            <div className="flex gap-2">
              {role === 'freelancer' && ['active', 'in_progress', 'revision'].includes(status) && (
                <button
                  onClick={() => handleAction('deliver')}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: buttonColor, color: buttonText }}
                >
                  Mark Delivered
                </button>
              )}
              {role === 'buyer' && status === 'delivered' && (
                <>
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
                  >
                    Approve & Release Payment
                  </button>
                  {order.revision_count < order.max_revisions && (
                    <button
                      onClick={() => handleAction('request_revision')}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm font-medium border disabled:opacity-50"
                      style={{ borderColor, color: textMain }}
                    >
                      Request Revision ({order.max_revisions - order.revision_count} left)
                    </button>
                  )}
                </>
              )}
              {['active', 'in_progress'].includes(status) && (
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium border disabled:opacity-50"
                  style={{ borderColor: '#FCA5A5', color: '#DC2626' }}
                >
                  Cancel Order
                </button>
              )}
              {role === 'buyer' && status === 'completed' && (
                <button
                  onClick={() => setShowReview(true)}
                  className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
                >
                  Leave Review
                </button>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="border-t" style={{ borderColor }}>
            <div className="px-6 py-3">
              <h5 className="text-xs font-semibold" style={{ color: textMuted }}>MESSAGES</h5>
            </div>
            <OrderChat
              orderId={orderId}
              messages={order.messages || []}
              currentUserId={isDemoMode ? 'demo-buyer' : 'current-user'}
              colors={colors}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && order && (
        <ReviewModal
          orderId={orderId}
          freelancerName={order.freelancer?.display_name || 'Freelancer'}
          gigTitle={order.gig?.title || 'Order'}
          colors={colors}
          onClose={() => setShowReview(false)}
          onReviewSubmitted={() => { fetchOrder(); onStatusChange(); }}
        />
      )}
    </>
  );
}
