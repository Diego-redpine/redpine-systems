'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { PortalConfig } from '@/lib/portal-templates';

interface Invoice {
  id: string;
  invoice_number?: string;
  description: string;
  amount: number;
  amount_cents?: number;
  status: string;
  due_date?: string;
  paid_at?: string;
  line_items?: { description: string; quantity: number; unit_price_cents: number }[];
  created_at?: string;
}

interface PortalHistorySectionProps {
  portalConfig: PortalConfig;
  accentColor: string;
  accentTextColor: string;
  portalToken: string;
  onBookAgain?: (invoice: Invoice) => void;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  paid: { bg: '#dcfce7', text: '#166534' },
  overdue: { bg: '#fee2e2', text: '#991b1b' },
  sent: { bg: '#dbeafe', text: '#1e40af' },
  pending: { bg: '#dbeafe', text: '#1e40af' },
  draft: { bg: '#f3f4f6', text: '#6b7280' },
  void: { bg: '#f3f4f6', text: '#6b7280' },
  refunded: { bg: '#fef3c7', text: '#92400e' },
};

export function PortalHistorySection({
  portalConfig,
  accentColor,
  accentTextColor,
  portalToken,
  onBookAgain,
}: PortalHistorySectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/portal/data?type=billing', {
          headers: { 'x-portal-token': portalToken },
        });
        if (res.ok) {
          const data = await res.json();
          setInvoices(data.invoices || []);
        }
      } catch {
        // Silently fail
      }
      setLoading(false);
    }
    load();
  }, [portalToken]);

  const totalSpent = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const thisMonth = invoices.filter(inv => {
    if (!inv.created_at && !inv.paid_at) return false;
    const d = new Date(inv.paid_at || inv.created_at || '');
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Spent</p>
        </div>
        <div className="bg-white p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{thisMonth.length}</p>
          <p className="text-xs text-gray-500 mt-1">This Month</p>
        </div>
        <div className="bg-white p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Invoices</p>
        </div>
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
          </svg>
          <p className="text-gray-500">No payment history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(invoice => {
            const statusStyle = STATUS_STYLES[invoice.status] || STATUS_STYLES.draft;
            const isExpanded = expandedId === invoice.id;

            return (
              <div
                key={invoice.id}
                className="bg-white border border-gray-200 overflow-hidden"
              >
                {/* Invoice Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : invoice.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {invoice.description}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {invoice.due_date
                          ? formatDate(invoice.due_date)
                          : invoice.created_at
                            ? formatDate(invoice.created_at)
                            : 'No date'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <span
                        className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded Receipt */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    {invoice.line_items && invoice.line_items.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Line Items
                        </p>
                        {invoice.line_items.map((li, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {li.description} x{li.quantity}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {formatCurrency((li.unit_price_cents * li.quantity) / 100)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(invoice.amount)}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {invoice.status === 'paid' && (
                      <div className="flex gap-2">
                        {onBookAgain && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onBookAgain(invoice); }}
                            className="flex-1 py-2.5 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                            style={{ backgroundColor: accentColor, color: accentTextColor }}
                          >
                            {portalConfig.primaryActionLabel}
                          </button>
                        )}
                        {(portalConfig.primaryAction === 'reorder' || portalConfig.primaryAction === 'book_again') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onBookAgain?.(invoice); }}
                            className="px-4 py-2.5 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                            </svg>
                            Reorder
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
