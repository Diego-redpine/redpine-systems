'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';

interface MyGigsProps {
  colors: DashboardColors;
}

interface DemoGig {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'paused' | 'draft';
  basicPrice: number;
  views: number;
  orders: number;
  revenue: number;
  createdAt: string;
}

const DEMO_GIGS: DemoGig[] = [
  { id: 'mg1', title: 'Build custom integrations for your business tools', category: 'Development', status: 'active', basicPrice: 150, views: 1240, orders: 89, revenue: 12500, createdAt: '2024-06-15' },
  { id: 'mg2', title: 'Design a professional brand identity', category: 'Design', status: 'active', basicPrice: 200, views: 890, orders: 67, revenue: 9800, createdAt: '2024-07-20' },
  { id: 'mg3', title: 'Write converting website copy', category: 'Writing', status: 'paused', basicPrice: 80, views: 430, orders: 23, revenue: 2100, createdAt: '2024-10-01' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  paused: { bg: 'bg-amber-50', text: 'text-amber-700' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export default function MyGigs({ colors }: MyGigsProps) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);

  const [gigs, setGigs] = useState<DemoGig[]>(DEMO_GIGS);

  const toggleStatus = (id: string) => {
    setGigs(prev => prev.map(g => {
      if (g.id !== id) return g;
      const nextStatus = g.status === 'active' ? 'paused' : 'active';
      toast.success(`Gig ${nextStatus === 'active' ? 'activated' : 'paused'}`);
      return { ...g, status: nextStatus };
    }));
  };

  const deleteGig = (id: string) => {
    setGigs(prev => prev.filter(g => g.id !== id));
    toast.success('Gig deleted');
  };

  const totalRevenue = gigs.reduce((sum, g) => sum + g.revenue, 0);
  const totalOrders = gigs.reduce((sum, g) => sum + g.orders, 0);
  const totalViews = gigs.reduce((sum, g) => sum + g.views, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
          { label: 'Total Orders', value: totalOrders.toString() },
          { label: 'Total Views', value: totalViews.toLocaleString() },
        ].map(stat => (
          <div key={stat.label} className="p-4 shadow-sm" style={{ backgroundColor: cardBg }}>
            <p className="text-xl font-bold" style={{ color: textMain }}>{stat.value}</p>
            <p className="text-xs" style={{ color: textMuted }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: textMuted }}>{gigs.length} gig{gigs.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => toast.info('Gig creation coming soon')}
          className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: buttonColor, color: buttonText }}
        >
          + Create Gig
        </button>
      </div>

      {/* Gig cards */}
      {gigs.length === 0 ? (
        <div className="p-12 shadow-sm text-center" style={{ backgroundColor: cardBg }}>
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: textMain }}>No gigs yet</h3>
          <p className="text-sm mb-6" style={{ color: textMuted }}>Create your first gig to start receiving orders.</p>
          <button
            onClick={() => toast.info('Gig creation coming soon')}
            className="px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            Create Your First Gig
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {gigs.map(gig => {
            const style = STATUS_STYLES[gig.status];
            return (
              <div key={gig.id} className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h4 className="text-sm font-semibold line-clamp-1" style={{ color: textMain }}>{gig.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: textMuted }}>{gig.category}</span>
                      <span className="text-xs" style={{ color: textMuted }}>From ${gig.basicPrice}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-medium capitalize ${style.bg} ${style.text}`}>
                    {gig.status}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    </svg>
                    <span className="text-xs" style={{ color: textMuted }}>{gig.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="text-xs" style={{ color: textMuted }}>{gig.orders} orders</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs" style={{ color: textMuted }}>${gig.revenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor }}>
                  <button
                    onClick={() => toast.info('Gig editing coming soon')}
                    className="px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100"
                    style={{ color: buttonColor }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(gig.id)}
                    className="px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100"
                    style={{ color: textMuted }}
                  >
                    {gig.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteGig(gig.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
