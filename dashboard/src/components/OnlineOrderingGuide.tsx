'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';

interface OnlineOrderingGuideProps {
  colors: DashboardColors;
  subdomain?: string;
}

export default function OnlineOrderingGuide({ colors, subdomain = 'your-business' }: OnlineOrderingGuideProps) {
  const [avgOrder, setAvgOrder] = useState(35);
  const [monthlyOrders, setMonthlyOrders] = useState(200);
  const [expanded, setExpanded] = useState(false);

  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonBg = colors.buttons || '#3B82F6';

  // ROI calculations
  const monthlyRevenue = avgOrder * monthlyOrders;
  const marketplaceCommission = 0.25; // 25% average
  const marketplaceFees = Math.round(monthlyRevenue * marketplaceCommission);
  const doordashDrivePerDelivery = 9.75;
  const deliveryPercent = 0.3; // assume 30% of orders are delivery
  const deliveryOrders = Math.round(monthlyOrders * deliveryPercent);
  const driveFees = Math.round(doordashDrivePerDelivery * deliveryOrders);
  const monthlySavings = marketplaceFees - driveFees;
  const annualSavings = monthlySavings * 12;

  const formatCurrency = (cents: number) => {
    if (cents >= 100000) return `$${(cents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    return `$${cents.toLocaleString()}`;
  };

  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold" style={{ color: textMain }}>
            Why Direct Ordering Matters
          </h3>
          <p className="text-xs mt-0.5" style={{ color: textMuted }}>
            Keep more of your revenue — skip marketplace commissions
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors hover:bg-gray-50"
          style={{ borderColor, color: textMain }}
        >
          {expanded ? 'Collapse' : 'Learn More'}
        </button>
      </div>

      {/* Always-visible: ROI Calculator */}
      <div className="rounded-xl p-4 border" style={{ borderColor, backgroundColor: '#F9FAFB' }}>
        <p className="text-sm font-medium mb-3" style={{ color: textMain }}>Savings Calculator</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: textMuted }}>Avg Order Value ($)</label>
            <input
              type="number"
              value={avgOrder}
              onChange={(e) => setAvgOrder(Math.max(1, parseInt(e.target.value) || 0))}
              min={1}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
              style={{ borderColor, color: textMain }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: textMuted }}>Monthly Orders</label>
            <input
              type="number"
              value={monthlyOrders}
              onChange={(e) => setMonthlyOrders(Math.max(1, parseInt(e.target.value) || 0))}
              min={1}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
              style={{ borderColor, color: textMain }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3 bg-red-50 text-center">
            <p className="text-xs text-red-600 mb-1">Marketplace Cost</p>
            <p className="text-lg font-bold text-red-700">{formatCurrency(marketplaceFees)}</p>
            <p className="text-xs text-red-500">/month (25%)</p>
          </div>
          <div className="rounded-lg p-3 bg-blue-50 text-center">
            <p className="text-xs text-blue-600 mb-1">Your Delivery Cost</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(driveFees)}</p>
            <p className="text-xs text-blue-500">/month (flat fee)</p>
          </div>
          <div className="rounded-lg p-3 bg-emerald-50 text-center">
            <p className="text-xs text-emerald-600 mb-1">You Save</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(monthlySavings)}</p>
            <p className="text-xs text-emerald-500">/month</p>
          </div>
        </div>

        <div className="mt-3 text-center rounded-lg p-2 bg-emerald-100">
          <p className="text-sm font-semibold text-emerald-800">
            Annual Savings: {formatCurrency(annualSavings)}
          </p>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {/* The Problem */}
          <div className="rounded-xl p-4 border" style={{ borderColor }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: textMain }}>The Problem with Marketplace Apps</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </span>
                <p className="text-sm" style={{ color: textMuted }}>
                  <strong style={{ color: textMain }}>15-30% commission</strong> on every order through DoorDash, UberEats, Grubhub
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </span>
                <p className="text-sm" style={{ color: textMuted }}>
                  <strong style={{ color: textMain }}>You don't own the customer</strong> — marketplace controls the relationship
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </span>
                <p className="text-sm" style={{ color: textMuted }}>
                  <strong style={{ color: textMain }}>No loyalty data</strong> — can't build repeat business
                </p>
              </div>
            </div>
          </div>

          {/* Your Solution */}
          <div className="rounded-xl p-4 border" style={{ borderColor }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: textMain }}>Your Direct Ordering Solution</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                <p className="text-sm" style={{ color: textMuted }}>
                  <strong style={{ color: textMain }}>Keep 100% of revenue</strong> — your ordering page, your payment processor
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                <p className="text-sm" style={{ color: textMuted }}>
                  <strong style={{ color: textMain }}>Own your customers</strong> — collect emails, phones, build loyalty
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                <p className="text-sm" style={{ color: textMuted }}>
                  <strong style={{ color: textMain }}>Flat-fee delivery</strong> — DoorDash Drive at ~$9.75/delivery, not 25% commission
                </p>
              </div>
            </div>
          </div>

          {/* How Delivery Works */}
          <div className="rounded-xl p-4 border" style={{ borderColor }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: textMain }}>How Delivery Works</h4>
            <p className="text-sm mb-3" style={{ color: textMuted }}>
              Customer orders through your page and pays the delivery fee. When the order is ready,
              you request a DoorDash Drive driver at a flat rate — no commission on the food.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3 bg-red-50">
                <p className="text-xs font-medium text-red-700 mb-1">Marketplace Model</p>
                <p className="text-sm text-red-600">$40 order = <strong>$10 fee</strong> (25%)</p>
                <p className="text-xs text-red-500 mt-1">+ you don't get customer info</p>
              </div>
              <div className="rounded-lg p-3 bg-emerald-50">
                <p className="text-xs font-medium text-emerald-700 mb-1">Your Model</p>
                <p className="text-sm text-emerald-600">$40 order = <strong>$9.75 flat</strong></p>
                <p className="text-xs text-emerald-500 mt-1">+ customer is yours forever</p>
              </div>
            </div>
          </div>

          {/* Get Started */}
          <div className="rounded-xl p-4 border-2" style={{ borderColor: buttonBg }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: textMain }}>Get Started in 3 Steps</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: buttonBg }}>1</div>
                <div>
                  <p className="text-sm font-medium" style={{ color: textMain }}>Add your menu items</p>
                  <p className="text-xs" style={{ color: textMuted }}>Set prices, descriptions, categories, and modifiers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: buttonBg }}>2</div>
                <div>
                  <p className="text-sm font-medium" style={{ color: textMain }}>Share your ordering link</p>
                  <p className="text-xs" style={{ color: textMuted }}>
                    {subdomain}.redpine.systems/order — add to your website, social media, Google listing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: buttonBg }}>3</div>
                <div>
                  <p className="text-sm font-medium" style={{ color: textMain }}>Manage orders from your dashboard</p>
                  <p className="text-xs" style={{ color: textMuted }}>Track orders in real-time, print tickets, request delivery drivers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
