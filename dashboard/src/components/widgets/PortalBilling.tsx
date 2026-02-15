'use client';

import React, { useState, useEffect } from 'react';
import { usePortalSession } from './PortalContext';

interface PortalBillingProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  accentColor?: string;
  showPayButton?: boolean;
  [key: string]: unknown;
}

interface Invoice {
  id: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  due_date: string;
}

const DEMO_INVOICES: Invoice[] = [
  { id: 'inv_1', description: 'Monthly Membership — February', amount: 150, status: 'pending', due_date: 'Feb 15, 2026' },
  { id: 'inv_2', description: 'Belt Test Fee — Blue Belt', amount: 75, status: 'pending', due_date: 'Feb 20, 2026' },
  { id: 'inv_3', description: 'Monthly Membership — January', amount: 150, status: 'paid', due_date: 'Jan 15, 2026' },
  { id: 'inv_4', description: 'Private Lesson Package (4x)', amount: 200, status: 'paid', due_date: 'Jan 10, 2026' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: '#10B98115', text: '#10B981', label: 'Paid' },
  pending: { bg: '#F59E0B15', text: '#F59E0B', label: 'Due' },
  overdue: { bg: '#EF444415', text: '#EF4444', label: 'Overdue' },
};

export const PortalBilling: React.FC<PortalBillingProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Billing & Payments',
  accentColor = '#1A1A1A',
  showPayButton = true,
}) => {
  const session = usePortalSession();
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    if (inBuilder || !session) return;
    const fetchBilling = async () => {
      try {
        const res = await fetch(`/api/portal/data?type=billing&student_id=${session.activeStudentId}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.invoices) setInvoices(data.invoices);
        }
      } catch { /* use demo data */ }
    };
    fetchBilling();
  }, [inBuilder, session, session?.activeStudentId]);

  const balance = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const [payMessage, setPayMessage] = useState<string | null>(null);

  const handlePay = async (invoiceId: string) => {
    if (inBuilder || !session) return;
    setPaying(invoiceId);
    setPayMessage(null);
    try {
      const res = await fetch('/api/portal/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          student_id: session.activeStudentId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
          return;
        }
        // No checkout URL — business hasn't connected Stripe
        setPayMessage(data.message || 'Payment request sent. The business will follow up.');
      } else {
        const err = await res.json().catch(() => ({}));
        setPayMessage(err.error || 'Unable to process payment. Please try again.');
      }
    } catch {
      setPayMessage('Connection error. Please try again.');
    }
    setPaying(null);
  };

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{heading}</h3>

        {/* Balance card */}
        <div style={{
          padding: 20, borderRadius: 12, marginBottom: 20,
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}DD)`,
          color: '#fff',
        }}>
          <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Outstanding Balance</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            ${balance.toFixed(2)}
          </p>
          {balance > 0 && showPayButton && (
            <button
              onClick={() => {
                const firstUnpaid = invoices.find(i => i.status !== 'paid');
                if (firstUnpaid) handlePay(firstUnpaid.id);
              }}
              style={{
                marginTop: 12, padding: '8px 20px', borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff',
                fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
            >
              Pay Now
            </button>
          )}
        </div>

        {/* Payment message */}
        {payMessage && (
          <div style={{
            padding: 12, borderRadius: 10, marginBottom: 16,
            backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD',
            fontSize: 13, color: '#0369A1',
          }}>
            {payMessage}
          </div>
        )}

        {/* Invoice list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {invoices.map(inv => {
            const status = STATUS_STYLES[inv.status];
            return (
              <div
                key={inv.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 14, borderRadius: 12,
                  backgroundColor: '#FAFAFA', border: '1px solid #F3F4F6',
                }}
              >
                {/* Dollar icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: `${status.bg}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: status.text, fontSize: 16, fontWeight: 700,
                }}>
                  $
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{inv.description}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>Due {inv.due_date}</p>
                </div>

                {/* Amount + status */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>${inv.amount.toFixed(2)}</p>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                    backgroundColor: status.bg, color: status.text,
                    fontSize: 11, fontWeight: 600, marginTop: 2,
                  }}>
                    {status.label}
                  </span>
                </div>

                {/* Pay button for unpaid */}
                {inv.status !== 'paid' && showPayButton && (
                  <button
                    onClick={() => handlePay(inv.id)}
                    disabled={paying === inv.id}
                    style={{
                      padding: '6px 14px', borderRadius: 8,
                      backgroundColor: accentColor, color: '#fff',
                      fontSize: 12, fontWeight: 600, border: 'none',
                      cursor: 'pointer', flexShrink: 0,
                      opacity: paying === inv.id ? 0.6 : 1,
                    }}
                  >
                    {paying === inv.id ? '...' : 'Pay'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
