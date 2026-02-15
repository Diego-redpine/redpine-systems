import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient, searchRead } from '@/lib/odoo';

// GET /api/odoo/invoices - Fetch invoices and financial data
export async function GET(request: NextRequest) {
  try {
    const client = await getOdooClient();

    if (!client) {
      // Return dummy data if Odoo is not available
      return NextResponse.json({
        success: true,
        source: 'dummy',
        data: {
          summary: {
            todayRevenue: '$340',
            weekRevenue: '$2,450',
            monthRevenue: '$9,800',
            pendingInvoices: 3,
          },
          recentTransactions: [
            { id: 1, date: 'Jan 28', client: 'Maria Garcia', service: 'Full Set + Design', amount: '$85' },
            { id: 2, date: 'Jan 28', client: 'Walk-in', service: 'Pedicure', amount: '$45' },
            { id: 3, date: 'Jan 27', client: 'Sarah Johnson', service: 'Gel Manicure', amount: '$55' },
          ],
          invoices: [
            { id: 1, number: 'INV-001', client: 'Sarah Johnson', amount: 55, status: 'paid' },
            { id: 2, number: 'INV-002', client: 'Emily Chen', amount: 85, status: 'pending' },
            { id: 3, number: 'INV-003', client: 'Maria Garcia', amount: 120, status: 'pending' },
          ],
        },
      });
    }

    // Get today's date range
    const today = new Date();
    const todayStart = today.toISOString().split('T')[0] + ' 00:00:00';
    const todayEnd = today.toISOString().split('T')[0] + ' 23:59:59';

    // Get week's date range
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0] + ' 00:00:00';

    // Get month's date range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0] + ' 00:00:00';

    // Fetch recent invoices
    const invoices = await searchRead(
      client,
      'account.move',
      [['move_type', '=', 'out_invoice']],
      ['id', 'name', 'partner_id', 'amount_total', 'state', 'invoice_date', 'payment_state'],
      20,
      0,
      'invoice_date desc'
    );

    // Calculate revenue summaries
    const paidInvoices = invoices.filter((inv) => inv.payment_state === 'paid');

    const todayRevenue = paidInvoices
      .filter((inv) => {
        const date = new Date(inv.invoice_date as string);
        return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
      })
      .reduce((sum, inv) => sum + (inv.amount_total as number), 0);

    const weekRevenue = paidInvoices
      .filter((inv) => {
        const date = new Date(inv.invoice_date as string);
        return date >= weekStart;
      })
      .reduce((sum, inv) => sum + (inv.amount_total as number), 0);

    const monthRevenue = paidInvoices
      .filter((inv) => {
        const date = new Date(inv.invoice_date as string);
        return date >= monthStart;
      })
      .reduce((sum, inv) => sum + (inv.amount_total as number), 0);

    const pendingInvoices = invoices.filter(
      (inv) => inv.state === 'posted' && inv.payment_state !== 'paid'
    ).length;

    return NextResponse.json({
      success: true,
      source: 'odoo',
      data: {
        summary: {
          todayRevenue: `$${todayRevenue.toFixed(0)}`,
          weekRevenue: `$${weekRevenue.toLocaleString()}`,
          monthRevenue: `$${monthRevenue.toLocaleString()}`,
          pendingInvoices,
        },
        recentTransactions: invoices.slice(0, 5).map((inv) => ({
          id: inv.id,
          date: new Date(inv.invoice_date as string).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          client: Array.isArray(inv.partner_id) ? inv.partner_id[1] : 'Unknown',
          amount: `$${(inv.amount_total as number).toFixed(0)}`,
          status: inv.payment_state,
        })),
        invoices: invoices.map((inv) => ({
          id: inv.id,
          number: inv.name,
          client: Array.isArray(inv.partner_id) ? inv.partner_id[1] : 'Unknown',
          amount: inv.amount_total,
          status: inv.payment_state === 'paid' ? 'paid' : 'pending',
        })),
      },
    });
  } catch (error) {
    console.error('Odoo invoices error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
